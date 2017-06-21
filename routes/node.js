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
        'time': 'integer',
        'position': 'integer',
        'value': 'text',
    },
    unique_col: 'node_id',
});

const generateUniqueId = () => Date.now();//[TEMP]
const encodeId = (id) => id.toString(16);
const decodeId = (id) => parseInt("0x" + id, 16);

router.post('/', (req, res, next) => {
    let data = Object.assign(req.body, {
                $node_id: generateUniqueId(),
            });
    db.insert(data,
            () => {
                res.send({node_id: encodeId(data['$node_id'])});
            }, next);
});
router.get('/', (req, res, next) => {
    db.loadAll(function(data){
        if(data !== undefined) {
            data.forEach(
                (val, i) => {data[i].node_id = encodeId(data[i].node_id)}
            );
            res.send(data);
        } else {
            res.sendStatus(204);
        }
    }, next);
});

router.post('/:id', (req, res) => {
    let id = decodeId(req.params.id);
    let data = Object.assign(req.body, {
                $node_id: id,
            });
    db.update(id, data, () => {
        res.sendStatus('200');
    });
});
router.get('/:id', (req, res, next) => {
    let id = decodeId(req.params.id);
    db.load(id, function(data){
        if(data !== undefined) {
            data.forEach(
                (val, i) => {data[i].node_id = encodeId(data[i].node_id)}
            );
            res.send(data);
        } else {
            res.sendStatus('204');
        }
    }, next);
});
router.delete('/:id', (req, res, next) => {
    let id = decodeId(req.params.id);
    db.del(id, function(data){
        res.sendStatus('200');
    }, next);
});

module.exports = router;

