"use strict";
module.exports = (sequelize, DataTypes) => {
  const sg_markers = sequelize.define(
    "sg_markers",
    {
      name: DataTypes.STRING,
      colorName: DataTypes.STRING,
      color: DataTypes.STRING
    },
    {
      tableName: "sg_markers",
    }
  );
  sg_markers.associate = function (models) {};
  return sg_markers;
};
