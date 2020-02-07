'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('ServerMessages', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      msgType: {
        type: Sequelize.ENUM,
        values: ['danger', 'warning', 'success', 'info', 'default'],
        allowNull: false
      },
      type: {
        type: Sequelize.ENUM,
        values: ['full', 'group', 'superGroup', 'es', 'rh', 'candidate'],
        allowNull: false
      },
      fromDate: {
        type: Sequelize.DATE
      },
      untilDate: {
        type: Sequelize.DATE
      },
      enable: {
        type: Sequelize.BOOLEAN
      },
      author: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('ServerMessages');
  }
};