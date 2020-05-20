"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("sg_layers_attributes", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      layersId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "sg_layers",
          field: "id",
        },
      },
      attributesId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "sg_attributes",
          field: "id",
        },
      },
      color: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("sg_layers_attributes");
  },
};
