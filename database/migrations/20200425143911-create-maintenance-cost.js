"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("gs_maintenance_cost", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      mainStreet: {
        type: Sequelize.STRING,
      },
      reliability: {
        type: Sequelize.STRING,
      },
      secondStreet: {
        type: Sequelize.STRING,
      },
      orders: {
        type: Sequelize.INTEGER,
      },
      internalID: {
        type: Sequelize.INTEGER,
      },
      latitude: {
        type: Sequelize.DOUBLE,
      },
      longitude: {
        type: Sequelize.DOUBLE,
      },
      intersectionID: {
        type: Sequelize.INTEGER,
      },
      center: {
        type: Sequelize.DOUBLE,
      },
      corrective: {
        type: Sequelize.DOUBLE,
      },
      items: {
        type: Sequelize.DOUBLE,
      },
      engineering: {
        type: Sequelize.DOUBLE,
      },
      preventive: {
        type: Sequelize.DOUBLE,
      },
      equipments: {
        type: Sequelize.DOUBLE,
      },
      materials: {
        type: Sequelize.DOUBLE,
      },
      services: {
        type: Sequelize.DOUBLE,
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
    return queryInterface.dropTable("gs_maintenance_cost");
  },
};
