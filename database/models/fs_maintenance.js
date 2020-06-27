"use strict";
module.exports = (sequelize, DataTypes) => {
  const fs_maintenance = sequelize.define(
    "fs_maintenance",
    {
      startTime: DataTypes.DATE,
      endTime: DataTypes.DATE,
      status: DataTypes.STRING,
      type: DataTypes.STRING,
      creationDate: DataTypes.DATE,
      internalID: DataTypes.INTEGER,
      intersectionID: DataTypes.INTEGER
    },
    {
      tableName: "fs_maintenance",
      timestamps: false
    }
  );
  fs_maintenance.associate = function (models) {
    // associations can be defined here
    fs_maintenance.belongsTo(models.gs_maintenance_cost, {
      foreignKey: "intersectionID",
      otherKey: "intersectionID"
    })
  };
  return fs_maintenance;
};
