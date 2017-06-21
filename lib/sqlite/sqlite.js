const sqlite3 = require('sqlite3').verbose();

const sqlite = function(){
    this.init(...arguments);
};
sqlite.prototype = {
    insert: function(data, callback, next) {
        let SQL = `INSERT INTO ${this.__table} (
                        ${this.__cols}
                    ) VALUES (
                        ${this.__eachCols(col => `\$${col}`)}
                    )`;
        this.db.run(SQL, data, function(err) {
                if(err !== null) {
                    console.error(err);
                    next(err);
                } else {
                    //console.log('saved');
                    //callback(this.lastID);
                    callback();
                }
            });
    },
    update: function(id, data, next) {
        let SQL = `UPDATE ${this.__table}
                    SET ${this.__eachCols(col => `${col} = \$${col}`)}
                    WHERE ${this.__unique_col} = $id`;
        this.db.run(SQL, Object.assign(data, {$id: id}), (err) => {
                if(err !== null) {
                    console.error(err);
                    next(err);
                } else {
                    //console.log('updated');
                    next();
                }
            });
    },
    load: function(id, callback, next) {
        let SQL = `SELECT * FROM ${this.__table} WHERE ${this.__unique_col} = $id`;
        this.db.all(SQL, {$id: id}, (err, rows) => {
                if(err !== null) {
                    console.error(err);
                    next(err);
                } else {
                    //console.log('loaded');
                    callback(rows);
                }
            });
    },
    loadAll: function(callback, next) {
        let SQL = `SELECT * FROM ${this.__table}`;
        this.db.all(SQL, {}, (err, rows) => {
            if(err !== null) {
                console.error(err);
                next(err);
            } else {
                //console.log('loaded');
                callback(rows);
            }
        });
    },
    del: function(id, callback, next) {
        let SQL = `DELETE FROM ${this.__table} WHERE ${this.__unique_col} = $id`;
        this.db.run(SQL, {$id: id}, (err) => {
            if(err !== null) {
                next(err);
            } else {
                callback();
            }
        });
    },
    /*
    __list: function() {
        this.db.each(`SELECT id, value FROM ${this.__table}`, (err, row) => {
            console.log(row.id + ": " + row.value);
        });
        //this.__close();
    },
    */
    __setDB: function() {
        let SQL = `CREATE TABLE IF NOT EXISTS ${this.__table} (
                ${this.__eachCols(col => `${col} ${this.structure.cols[col].toUpperCase()}`)}
            )`;
        this.db = new sqlite3.Database(this.structure['db_path']);
        this.db.run(SQL);
    },
    __close: function() {
        this.db.close();
    },
    __eachCols: function(cb) {
        let result = [];
        for (col in this.structure.cols) {
            result.push(cb(col));
        }
        return result.join(',');
    },
    init: function(args) {
        this.structure = {
            db_path: ':memory:',
            table: 'temp_table',
            cols: {
                'id': 'integer',
                'value': 'text',
            },
            unique_col: 'id',
        };
        this.structure = args;
        this.__table = this.structure['table'];
        this.__cols = Object.keys(this.structure.cols).join(',');
        this.__unique_col = this.structure['unique_col'];
        this.__setDB();
    }
};

module.exports = sqlite;

