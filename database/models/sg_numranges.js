"use strict";
module.exports = (sequelize, DataTypes) => {
  const sg_numranges = sequelize.define(
    "sg_numranges",
    {
      name: DataTypes.STRING,
      displayName: DataTypes.STRING
    },
    {
      tableName: "sg_numranges"
    }
  );
  sg_numranges.associate = function (models) {
    // associations can be defined here
  };
  return sg_numranges;
};
