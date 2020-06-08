module.exports = {
  up: async (queryInterface) => {
    return queryInterface.bulkInsert("ds_layers", DS_LAYERS, {});
  },

  down: (queryInterface) => {
    return queryInterface.bulkDelete("ds_layers", null, {});
  }
};

const DS_LAYERS = [
  {
    name: "Técnico",
    property: "Technical",
    state: true,
    description: "Muestra indicadores técnicos",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Económico",
    property: "Economic",
    state: true,
    description: "Muestra indicadores económicos",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Técnico Anterior",
    property: "Technical_v0",
    state: false,
    description: "Muestra indicadores técnicos",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Económico Anterior",
    property: "Economic_v0",
    state: false,
    description: "Muestra indicadores económicos",
    createdAt: new Date(),
    updatedAt: new Date()
  }
]
