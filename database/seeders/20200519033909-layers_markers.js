module.exports = {
  up: (queryInterface) => {
    queryInterface.bulkInsert("sg_layers", SG_LAYERS, {});
    queryInterface.bulkInsert("sg_attributes", SG_ATTRIBUTES, {});
    queryInterface.bulkInsert("sg_layers_attributes", SG_LAYERS_ATTRIBUTES, {});
    queryInterface.bulkInsert("sg_numRanges", SG_NUMRANGES, {});
    queryInterface.bulkInsert("sg_markers", SG_MARKERS, {});
    return queryInterface.bulkInsert("sg_layers_ranges", SG_LAYERS_RANGES, {});
  },

  down: (queryInterface) => {
    queryInterface.bulkDelete("sg_layers", null, {});
    queryInterface.bulkDelete("sg_attributes", null, {});
    queryInterface.bulkDelete("sg_layers_attributes", null, {});
    queryInterface.bulkDelete("sg_numRanges", null, {});
    queryInterface.bulkDelete("sg_markers", null, {});
    return queryInterface.bulkDelete("sg_layers_ranges", null, {});
  },
};
const SG_LAYERS = [
  { name: "General", state: "Y", description: "Muestra por categorias" },
  {
    name: "Rango monetario",
    state: "Y",
    description: "Muestra por Rangos monetario",
  },
  {
    name: "Cantidad de órdenes",
    state: "Y",
    description: "Muestra por Rangos de cantidad de órdenes",
  },
];

const SG_ATTRIBUTES = [
  { name: "Centro" },
  { name: "Correctivo" },
  { name: "Ingeniería" },
  { name: "Preventivo" },
  { name: "Equipos" },
  { name: "Materiales" },
  { name: "Servicios" },
];

const SG_LAYERS_ATTRIBUTES = [
  { layersId: 1, attributesId: 1, color: "#3D3D3D" },
  { layersId: 1, attributesId: 2, color: "#CB2B3E" },
  { layersId: 1, attributesId: 3, color: "#FFD326" },
  { layersId: 1, attributesId: 4, color: "#2AAD27" },
  { layersId: 1, attributesId: 5, color: "#2A81CB" },
  { layersId: 1, attributesId: 6, color: "#7B7B7B" },
  { layersId: 1, attributesId: 7, color: "##9C2BCB" },
  { layersId: 2, attributesId: 1, color: "#3D3D3D" },
  { layersId: 2, attributesId: 2, color: "#CB2B3E" },
  { layersId: 2, attributesId: 3, color: "#FFD326" },
  { layersId: 2, attributesId: 4, color: "#2AAD27" },
  { layersId: 2, attributesId: 5, color: "#2A81CB" },
  { layersId: 2, attributesId: 6, color: "#7B7B7B" },
  { layersId: 2, attributesId: 7, color: "##9C2BCB" },
  { layersId: 3, attributesId: 1, color: "#3D3D3D" },
  { layersId: 3, attributesId: 2, color: "#CB2B3E" },
  { layersId: 3, attributesId: 3, color: "#FFD326" },
  { layersId: 3, attributesId: 4, color: "#2AAD27" },
  { layersId: 3, attributesId: 5, color: "#2A81CB" },
  { layersId: 3, attributesId: 6, color: "#7B7B7B" },
  { layersId: 3, attributesId: 7, color: "##9C2BCB" },
];

const SG_NUMRANGES = [
  { name: "Rango1" },
  { name: "Rango2" },
  { name: "Rango3" },
  { name: "Rango4" },
];

const SG_MARKERS = [
  { name: "Mark1", color: "Blue" },
  { name: "Mark2", color: "Gold" },
  { name: "Mark3", color: "Red" },
  { name: "Mark4", color: "Green" },
  { name: "Mark5", color: "Orange" },
  { name: "Mark6", color: "Yellow" },
  { name: "Mark7", color: "Violet" },
  { name: "Mark8", color: "Grey" },
  { name: "Mark9", color: "Black" },
];

const SG_LAYERS_RANGES = [
  { layersId: 1, rangesId: 1, markersId: 4 },
  { layersId: 1, rangesId: 2, markersId: 2 },
  { layersId: 1, rangesId: 3, markersId: 5 },
  { layersId: 1, rangesId: 4, markersId: 3 },
  { layersId: 2, rangesId: 1, markersId: 4 },
  { layersId: 2, rangesId: 2, markersId: 2 },
  { layersId: 2, rangesId: 3, markersId: 5 },
  { layersId: 2, rangesId: 4, markersId: 3 },
  { layersId: 3, rangesId: 1, markersId: 4 },
  { layersId: 3, rangesId: 2, markersId: 2 },
  { layersId: 3, rangesId: 3, markersId: 5 },
  { layersId: 3, rangesId: 4, markersId: 3 },
];
