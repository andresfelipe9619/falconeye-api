'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('sg_layers_ranges', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      layersId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "sg_layers",
          field: "id",
        },
      },
      rangesId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "sg_numranges",
          field: "id",
        },
      },
      markersId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "sg_markers",
          field: "id",
        }
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('sg_layers_ranges');
  }
};