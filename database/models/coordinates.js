"use strict";
module.exports = (sequelize, DataTypes) => {
  const Coordinates = sequelize.define(
    "Coordinates",
    {
      mainStreet: DataTypes.STRING,
      secondStreet: DataTypes.STRING,
      locationId: DataTypes.INTEGER,
      internalId: DataTypes.INTEGER,
      detail: DataTypes.TEXT,
      latitude: DataTypes.DOUBLE,
      longitude: DataTypes.DOUBLE,
    },
    {}
  );
  Coordinates.associate = function (models) {
    // associations can be defined here
    Coordinates.belongsTo(models.MaintenanceCosts, {
      foreignKey: "internalId",
      otherKey: "internalId",
      as: "coordinates",
    });
  };
  return Coordinates;
};
