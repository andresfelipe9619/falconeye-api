"use strict";
module.exports = (sequelize, DataTypes) => {
  const sg_numRanges = sequelize.define(
    "sg_numRanges",
    {
      name: DataTypes.STRING,
      displayName: DataTypes.STRING,
    },
    {
      tableName: "sg_numRanges",
    }
  );
  sg_numRanges.associate = function (models) {
    // associations can be defined here
  };
  return sg_numRanges;
};
