module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.STRING
    },
    key: {
      type: DataTypes.STRING
    },
    registerIp: {
      type: DataTypes.STRING
    },
    validated: {
      type: DataTypes.BOOLEAN,
      defaultValue: 0,
      allowNull: false
    },
    validatedAt: {
      type: DataTypes.DATE
    },
    opts: {
      type: DataTypes.JSON,
      get () {
        const opts = this.getDataValue('opts') === undefined ? [] : this.getDataValue('opts');
        return typeof opts === 'string' ? JSON.parse(opts) : opts;
      },
      set (data) {
        this.setDataValue('opts', data);
      }
    },
    last_login: {
      type: DataTypes.DATE
    }
  });
  User.associate = function (models) {

  };
  return User;
};
