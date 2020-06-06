"use strict";
module.exports = (sequelize, DataTypes) => {
  const ds_layers = sequelize.define("ds_layers", {
    property: DataTypes.STRING,
    name: DataTypes.STRING,
    description: DataTypes.STRING,
    state: DataTypes.BOOLEAN
  }, {
    tableName: "ds_layers"
  });
  ds_layers.associate = function (models) {
    // associations can be defined here
  };
  return ds_layers;
};
