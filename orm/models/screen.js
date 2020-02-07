'use strict';
module.exports = (sequelize, DataTypes) => {
  const Screen = sequelize.define('Screen', {
    title: DataTypes.STRING,
    savedAsImg: DataTypes.BOOLEAN,
    base64: DataTypes.STRING,
    shareKey: DataTypes.STRING,
    path: DataTypes.STRING,
    uploadBy: DataTypes.INTEGER,
    size: DataTypes.BIGINT,
    private: DataTypes.BOOLEAN,
    views: DataTypes.INTEGER,
    deletedAt: DataTypes.DATE
  }, {});
  Screen.associate = function (models) {
    // associations can be defined here
  };
  return Screen;
};