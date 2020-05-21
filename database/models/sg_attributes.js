"use strict";
module.exports = (sequelize, DataTypes) => {
  const sg_attributes = sequelize.define(
    "sg_attributes",
    {
      name: DataTypes.STRING,
      property: DataTypes.STRING,
    },
    {
      tableName: "sg_attributes"
    }
  );
  sg_attributes.associate = function (models) {
    // associations can be defined here
  };
  return sg_attributes;
};
