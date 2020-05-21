"use strict";
module.exports = (sequelize, DataTypes) => {
  const sg_layers = sequelize.define(
    "sg_layers",
    {
      name: DataTypes.STRING,
      property: DataTypes.STRING,
      description: DataTypes.TEXT,
      state: DataTypes.STRING,
    },
    {
      tableName: "sg_layers",
    }
  );
  sg_layers.associate = function (models) {
    // associations can be defined here
  };
  return sg_layers;
};
