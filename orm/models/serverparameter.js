'use strict';
module.exports = (sequelize, DataTypes) => {
  const ServerParameter = sequelize.define('ServerParameter', {
    param: DataTypes.STRING,
    value: DataTypes.STRING,
    edit_by: DataTypes.INTEGER
  }, {});
  ServerParameter.associate = function (models) {
    // associations can be defined here
  };
  return ServerParameter;
};