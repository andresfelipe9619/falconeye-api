"use strict";
module.exports = (sequelize, DataTypes) => {
  const sg_layers_attributes = sequelize.define(
    "sg_layers_attributes",
    {
      color: DataTypes.STRING,
      layersId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "sg_layers",
          field: "id",
        },
      },
      attributesId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "sg_attributes",
          field: "id",
        },
      },
    },
    {}
  );
  sg_layers_attributes.associate = function (models) {
    // associations can be defined here
    models.sg_attributes.belongsToMany(models.sg_layers, {
      otherKey: "attributesId",
      foreignKey: "layersId",
      through: sg_layers_attributes,
    });
    models.sg_layers.belongsToMany(models.sg_attributes, {
      otherKey: "attributesId",
      foreignKey: "layersId",
      through: sg_layers_attributes,
    });
  };
  return sg_layers_attributes;
};
