"use strict";
module.exports = (sequelize, DataTypes) => {
  const gs_maintenance_cost = sequelize.define(
    "gs_maintenance_cost",
    {
      mainStreet: DataTypes.STRING,
      secondStreet: DataTypes.STRING,
      reliability: DataTypes.STRING,
      orders: DataTypes.INTEGER,
      internalID: DataTypes.INTEGER,
      intersectionID: DataTypes.INTEGER,
      center: DataTypes.DOUBLE,
      items: DataTypes.DOUBLE,
      latitude: DataTypes.DOUBLE,
      longitude: DataTypes.DOUBLE,
      corrective: DataTypes.DOUBLE,
      engineering: DataTypes.DOUBLE,
      preventive: DataTypes.DOUBLE,
      equipments: DataTypes.DOUBLE,
      materials: DataTypes.DOUBLE,
      services: DataTypes.DOUBLE
    },
    {
      tableName: "gs_maintenance_cost"
    }
  );
  gs_maintenance_cost.associate = function (models) {
    // associations can be defined here
    gs_maintenance_cost.hasOne(models.fs_maintenance, {
      foreignKey: "internalID",
      otherKey: "internalID"
    })
  };
  return gs_maintenance_cost;
};
