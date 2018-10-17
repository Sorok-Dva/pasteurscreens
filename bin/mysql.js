const conf = require('dotenv').config().parsed;
const config = require('../config/main');
const mysql = require('mysql');

let connection;

exports.connect = done => {
    connection = mysql.createConnection({
        host: conf.MYSQL_DATABASE_URL,
        user: conf.MYSQL_DATABASE_USER,
        password: conf.MYSQL_DATABASE_PASS,
        database: conf.MYSQL_DATABASE_NAME
    });
    connection.connect(err => {
        done(err);
    })
};

exports.use = () => {
    if (!connection) return null;
    return connection;
};

exports.select = query => new Promise((resolve, reject) => {
    if (!query || !query.select || !query.from) throw new Error('Invalid request');

    let request = [
        `SELECT ${query.select} FROM \`${query.from}\` `,
        query.as ? `AS ${query.as} ` : '',
        query.join ? `JOIN ${query.join.table} ON ${query.join.on} ` : '',
        query.where ? `WHERE ${query.where} ` : '',
        query.groupBy ? `GROUP BY \`${query.groupBy}\` ` : '',
        query.orderByDesc ? `ORDER BY \`${query.orderBy}\` DESC ` : '',
        query.orderByAsc ? `ORDER BY \`${query.orderBy}\` ASC ` : ''
    ].filter(Boolean).join('');

    exports.use().query(request, (error, rows) => {
        config.__l(request);
        if (error) return reject(error);
        return resolve(rows)
    });
});

exports.insert = query => new Promise((resolve, reject) => {
    if (!query || !query.into || !query.data) throw new Error('Invalid request');
    let request = `INSERT INTO ${query.into} SET ?`;

    exports.use().query(request, query.data, (error, result) => {
        config.__l(`${request} ${JSON.stringify(query.data)}`);
        if (error) return reject(error);
        return resolve(result)
    });
});

exports.update = query => new Promise((resolve, reject) => {
    if (!query || !query.update || !query.data) throw new Error('Invalid request');
    let request;
    if (query.where) {
        request = `UPDATE ${query.update} SET ? WHERE ${query.where}`;
    } else {
        request = `UPDATE ${query.update} SET ?`;
    }

    exports.use().query(request, query.data, (error, rows) => {
        config.__l(`${request} ${JSON.stringify(query.data)}`);
        if (error) return reject(error);
        return resolve(rows)
    });
});

exports.delete = query => new Promise((resolve, reject) => {
    //
});