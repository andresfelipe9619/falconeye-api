"use strict";
module.exports = (sequelize, DataTypes) => {
  const sg_layers_ranges = sequelize.define(
    "sg_layers_ranges",
    {
      layersId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "sg_layers",
          field: "id",
        },
      },
      rangesId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "sg_numRanges",
          field: "id",
        },
      },
      markersId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "sg_markers",
          field: "id",
        },
      },
    },
    {
      tableName: "sg_layers_ranges",
    }
  );
  sg_layers_ranges.associate = function (models) {
    // associations can be defined here
    models.sg_numRanges.belongsToMany(models.sg_layers, {
      otherKey: "layersId",
      foreignKey: "rangesId",
      through: sg_layers_ranges,
    });
    models.sg_layers.belongsToMany(models.sg_numRanges, {
      otherKey: "rangesId",
      foreignKey: "layersId",
      through: sg_layers_ranges,
    });
    models.sg_numRanges.belongsToMany(models.sg_markers, {
      otherKey: "markersId",
      foreignKey: "rangesId",
      through: sg_layers_ranges,
    });
    models.sg_markers.belongsToMany(models.sg_numRanges, {
      otherKey: "rangesId",
      foreignKey: "markersId",
      through: sg_layers_ranges,
    });
  };
  return sg_layers_ranges;
};
