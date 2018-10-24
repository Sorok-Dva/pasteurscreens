const mysql = require('./../bin/mysql');

const Visit = {};

Visit.newVisit = (ip, referrer) => {
  mysql.get('site', (err, con) => {
    con.query('SELECT * FROM visits WHERE ?', {ip}, (err, result) => {
      if (result.length === 0) {
        let data = {
          ip,
          date: new Date(),
          hits: 1,
          referrer
        };
        con.query('INSERT INTO visits SET ?', data, (err, result) => {
          con.release();
        });
      } else {
        let data = {
          hits: result[0].hits + 1,
          last_visit: new Date()
        };
        con.query(`UPDATE visits SET ? WHERE ip = "${ip}"`, data, (err, result) => {
          con.release();
        });
      }
    });
  });
};

Visit.getVisitorsCount = (callback) => {
  mysql.get('site', (err, con) => {
    con.query('SELECT COUNT(*) FROM visits', (err, result) => {
      con.release();
      return callback(result[0]['COUNT(*)']);
    });
  });
};

module.exports = Visit;