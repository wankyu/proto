const path = require('path');
const fs = require('fs');
const express = require('express');
const router = express.Router();
const sqlite = require('../lib/sqlite/sqlite.js');

if(!fs.existsSync('.local')) {
    fs.mkdirSync('.local');
}
const db = new sqlite({
    db_path: path.join('.local', 'db.splite'),
    table: 'proto',
    cols: {
        'node_id': 'integer',
        'node_parent': 'integer',
        'node_links': 'text',
        'time': 'integer',
        'position': 'integer',
        'value': 'text',
    },
    unique_col: 'node_id',
});

const generateUniqueId = () => Date.now();//[TEMP]
const encodeId = (id) => id.toString(16);
const decodeId = (id) => parseInt("0x" + id, 16);
const checkCredentials = (req, res, cb) => {
    if(req.session.isLoggedIn) {
        cb();
    } else {
        res.sendStatus('403');
    }
};

router.post('/', (req, res, next) => {
    checkCredentials(req, res, () => {
        let data = Object.assign(req.body, {
                $node_id: generateUniqueId(),
            });
        db.insert(data,
            () => {
                res.send({
                    node_id: encodeId(data['$node_id']),
                    node_parent: data['$node_parent'],
                    node_links: data['$node_links'],
                    time: data['$time'],
                    position: data['$position'],
                    value: data['$value'],
                });
            }, next);
    });
});
router.get('/', (req, res, next) => {
    let is_logged_in = req.session.isLoggedIn;
    db.loadAll(function(data){
        if(data !== undefined) {
            data.forEach(
                (val, i) => {
                    data[i].node_id = encodeId(data[i].node_id);
                    data[i].node_parent = encodeId(data[i].node_parent);
                    data[i].node_links = (data[i].node_links)?data[i].node_links.split(','):[];
                }
            );
            data.push(is_logged_in);//[TODO] more explicitly
            res.send(data);
        } else {
            res.sendStatus('204');
        }
    }, next);
});

router.post('/:id', (req, res) => {
    checkCredentials(req, res, () => {
        let id = decodeId(req.params.id);
        let data = Object.assign(req.body, {
                $node_id: id,
                $node_parent: decodeId(req.body['$node_parent']),
                $node_links: req.body['$node_links'].toString(),
            });
        db.update(id, data, () => {
            res.sendStatus('200');
        });
    });
});
router.get('/:id', (req, res, next) => {
    let id = decodeId(req.params.id);
    db.load(id, function(data){
        if(data !== undefined) {
            data.forEach(
                (val, i) => {
                    data[i].node_id = encodeId(data[i].node_id);
                    data[i].node_parent = encodeId(data[i].node_parent);
                    data[i].node_links = (data[i].node_links)?data[i].node_links.split(','):[];
                }
            );
            res.send(data);
        } else {
            res.sendStatus('204');
        }
    }, next);
});
router.delete('/:id', (req, res, next) => {
    checkCredentials(req, res, () => {
        let id = decodeId(req.params.id);
        db.del(id, function(data){
            res.status(204).send('deleted');
        }, next);
    });
});

module.exports = router;
