module.exports = {
  up: async (queryInterface) => {
    console.log("=========Inserting SG_LAYERS=========");
    await queryInterface.bulkInsert("sg_layers", SG_LAYERS, {});
    console.log("=========Inserting SG_LAYERS_ATTRIBUTES=========");
    await queryInterface.bulkInsert(
      "sg_layers_attributes",
      SG_LAYERS_ATTRIBUTES,
      {}
    );
    console.log("=========Inserting SG_NUMRANGES=========");
    await queryInterface.bulkInsert("sg_numranges", SG_NUMRANGES, {});
    console.log("=========Inserting SG_LAYERS_RANGES=========");
    return queryInterface.bulkInsert("sg_layers_ranges", SG_LAYERS_RANGES, {});
  },

  down: () => Promise.resolve(1)
};
const SG_LAYERS =
[
  {
    id: 4,
    property: "default-tech",
    createdAt: new Date(),
    updatedAt: new Date(),
    state: "Y",
    name: "General",
    description: ""
  },
  {
    id: 5,
    property: "exec-range-tech",
    createdAt: new Date(),
    updatedAt: new Date(),
    state: "Y",
    name: "Espera de Ejecución",
    description: ""
  },
  {
    id: 6,
    property: "auth-range-tech",
    createdAt: new Date(),
    updatedAt: new Date(),
    state: "Y",
    name: "Pendiente de Autorización",
    description: ""
  },
  {
    id: 7,
    property: "appr-range-tech",
    createdAt: new Date(),
    updatedAt: new Date(),
    state: "Y",
    name: "Pendiente de Aprobación",
    description: ""
  }
];

const SG_LAYERS_ATTRIBUTES = [
  {
    createdAt: new Date(),
    updatedAt: new Date(),
    layersId: 4,
    attributesId: 1,
    color: "#3D3D3D"
  },
  {
    createdAt: new Date(),
    updatedAt: new Date(),
    layersId: 4,
    attributesId: 2,
    color: "#CB2B3E"
  },
  {
    createdAt: new Date(),
    updatedAt: new Date(),
    layersId: 4,
    attributesId: 3,
    color: "#FFD326"
  },
  {
    createdAt: new Date(),
    updatedAt: new Date(),
    layersId: 4,
    attributesId: 4,
    color: "#2AAD27"
  },
  {
    createdAt: new Date(),
    updatedAt: new Date(),
    layersId: 4,
    attributesId: 5,
    color: "#2A81CB"
  },
  {
    createdAt: new Date(),
    updatedAt: new Date(),
    layersId: 4,
    attributesId: 6,
    color: "#7B7B7B"
  },
  {
    createdAt: new Date(),
    updatedAt: new Date(),
    layersId: 4,
    attributesId: 7,
    color: "#9C2BCB"
  },
  {
    createdAt: new Date(),
    updatedAt: new Date(),
    layersId: 5,
    attributesId: 1,
    color: "#3D3D3D"
  },
  {
    createdAt: new Date(),
    updatedAt: new Date(),
    layersId: 5,
    attributesId: 2,
    color: "#CB2B3E"
  },
  {
    createdAt: new Date(),
    updatedAt: new Date(),
    layersId: 5,
    attributesId: 3,
    color: "#FFD326"
  },
  {
    createdAt: new Date(),
    updatedAt: new Date(),
    layersId: 5,
    attributesId: 4,
    color: "#2AAD27"
  },
  {
    createdAt: new Date(),
    updatedAt: new Date(),
    layersId: 5,
    attributesId: 5,
    color: "#2A81CB"
  },
  {
    createdAt: new Date(),
    updatedAt: new Date(),
    layersId: 5,
    attributesId: 6,
    color: "#7B7B7B"
  },
  {
    createdAt: new Date(),
    updatedAt: new Date(),
    layersId: 5,
    attributesId: 7,
    color: "#9C2BCB"
  },
  {
    createdAt: new Date(),
    updatedAt: new Date(),
    layersId: 6,
    attributesId: 1,
    color: "#3D3D3D"
  },
  {
    createdAt: new Date(),
    updatedAt: new Date(),
    layersId: 6,
    attributesId: 2,
    color: "#CB2B3E"
  },
  {
    createdAt: new Date(),
    updatedAt: new Date(),
    layersId: 6,
    attributesId: 3,
    color: "#FFD326"
  },
  {
    createdAt: new Date(),
    updatedAt: new Date(),
    layersId: 6,
    attributesId: 4,
    color: "#2AAD27"
  },
  {
    createdAt: new Date(),
    updatedAt: new Date(),
    layersId: 6,
    attributesId: 5,
    color: "#2A81CB"
  },
  {
    createdAt: new Date(),
    updatedAt: new Date(),
    layersId: 6,
    attributesId: 6,
    color: "#7B7B7B"
  },
  {
    createdAt: new Date(),
    updatedAt: new Date(),
    layersId: 6,
    attributesId: 7,
    color: "#9C2BCB"
  },
  {
    createdAt: new Date(),
    updatedAt: new Date(),
    layersId: 7,
    attributesId: 1,
    color: "#3D3D3D"
  },
  {
    createdAt: new Date(),
    updatedAt: new Date(),
    layersId: 7,
    attributesId: 2,
    color: "#CB2B3E"
  },
  {
    createdAt: new Date(),
    updatedAt: new Date(),
    layersId: 7,
    attributesId: 3,
    color: "#FFD326"
  },
  {
    createdAt: new Date(),
    updatedAt: new Date(),
    layersId: 7,
    attributesId: 4,
    color: "#2AAD27"
  },
  {
    createdAt: new Date(),
    updatedAt: new Date(),
    layersId: 7,
    attributesId: 5,
    color: "#2A81CB"
  },
  {
    createdAt: new Date(),
    updatedAt: new Date(),
    layersId: 7,
    attributesId: 6,
    color: "#7B7B7B"
  },
  {
    createdAt: new Date(),
    updatedAt: new Date(),
    layersId: 7,
    attributesId: 7,
    color: "#9C2BCB"
  }
];

const SG_NUMRANGES = [
  {
    id: 5,
    createdAt: new Date(),
    updatedAt: new Date(),
    name: "RangoTech1",
    displayName: "Without status"
  },
  {
    id: 6,
    createdAt: new Date(),
    updatedAt: new Date(),
    name: "RangoTech1",
    displayName: "With status"
  }
];

const SG_LAYERS_RANGES = [
  {
    createdAt: new Date(),
    updatedAt: new Date(),
    layersId: 4,
    rangesId: 5,
    markersId: 1
  },
  {
    createdAt: new Date(),
    updatedAt: new Date(),
    layersId: 4,
    rangesId: 6,
    markersId: 3
  },
  {
    createdAt: new Date(),
    updatedAt: new Date(),
    layersId: 5,
    rangesId: 5,
    markersId: 1
  },
  {
    createdAt: new Date(),
    updatedAt: new Date(),
    layersId: 5,
    rangesId: 6,
    markersId: 3
  },
  {
    createdAt: new Date(),
    updatedAt: new Date(),
    layersId: 6,
    rangesId: 5,
    markersId: 1
  },
  {
    createdAt: new Date(),
    updatedAt: new Date(),
    layersId: 6,
    rangesId: 6,
    markersId: 3
  },
  {
    createdAt: new Date(),
    updatedAt: new Date(),
    layersId: 7,
    rangesId: 5,
    markersId: 1
  },
  {
    createdAt: new Date(),
    updatedAt: new Date(),
    layersId: 7,
    rangesId: 6,
    markersId: 3
  }
];
