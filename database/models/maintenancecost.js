'use strict';
module.exports = (sequelize, DataTypes) => {
  const MaintenanceCosts = sequelize.define('MaintenanceCosts', {
    mainStreet: DataTypes.STRING,
    secondStreet: DataTypes.STRING,
    orders: DataTypes.INTEGER,
    internalId: DataTypes.INTEGER,
    intersectionId: DataTypes.INTEGER,
    center: DataTypes.DOUBLE,
    corrective: DataTypes.DOUBLE,
    engineering: DataTypes.DOUBLE,
    preventive: DataTypes.DOUBLE,
    equipments: DataTypes.DOUBLE,
    materials: DataTypes.DOUBLE,
    services: DataTypes.DOUBLE
  }, {});
  MaintenanceCosts.associate = function (models) {
    // associations can be defined here
    MaintenanceCosts.hasOne(models.Coordinates, {
      foreignKey: 'internalId',
      otherKey: "internalId",
      as: "coordinates"
    });
  };
  return MaintenanceCosts;
};