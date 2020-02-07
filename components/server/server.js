const __ = process.cwd();
const _ = require('lodash');
const Models = require(`${__}/orm/models/index`);
const { Op } = require('sequelize');

const Server = {};

Server.verifyMaintenance = callback => {
  Models.ServerParameter.findOne({ where: { param: 'maintenance' } }).then(param => {
    if (_.isNil(param)) return callback('live');
    if (_.isNil(param.value)) return callback('live');
    return callback(param.value);
  });
};

Server.getActualMessages = callback => {
  Models.ServerMessage.findAll({
    where: {
      enable: true,
      fromDate: { [Op.lte]: new Date() },
      untilDate: { [Op.gte]: new Date() }
    }
  }).then(messages => callback(messages));
};

module.exports = Server;