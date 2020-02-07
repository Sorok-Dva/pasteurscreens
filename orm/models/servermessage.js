'use strict';
module.exports = (sequelize, DataTypes) => {
  const ServerMessage = sequelize.define('ServerMessage', {
    name: DataTypes.STRING,
    message: DataTypes.TEXT,
    msgType: {
      type: DataTypes.ENUM,
      values: ['danger', 'warning', 'success', 'info', 'default']
    },
    type: {
      type: DataTypes.ENUM,
      values: ['full', 'group', 'superGroup', 'es', 'rh', 'candidate']
    },
    fromDate: DataTypes.DATE,
    untilDate: DataTypes.DATE,
    enable: DataTypes.BOOLEAN,
    author: DataTypes.INTEGER
  }, {});
  ServerMessage.associate = (models) => {
    ServerMessage.hasOne(models.User, {
      foreignKey: 'id',
      sourceKey: 'author'
    });
  };
  return ServerMessage;
};