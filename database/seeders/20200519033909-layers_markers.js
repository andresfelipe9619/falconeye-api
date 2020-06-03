module.exports = {
	up: async (queryInterface) => {
		await queryInterface.bulkInsert('sg_layers', SG_LAYERS, {});
		await queryInterface.bulkInsert('sg_attributes', SG_ATTRIBUTES, {});
		await queryInterface.bulkInsert(
			'sg_layers_attributes',
			SG_LAYERS_ATTRIBUTES,
			{}
		);
		await queryInterface.bulkInsert('sg_numRanges', SG_NUMRANGES, {});
		await queryInterface.bulkInsert('sg_markers', SG_MARKERS, {});
		return queryInterface.bulkInsert('sg_layers_ranges', SG_LAYERS_RANGES, {});
	},

	down: (queryInterface) => {
		queryInterface.bulkDelete('sg_layers', null, {});
		queryInterface.bulkDelete('sg_attributes', null, {});
		queryInterface.bulkDelete('sg_layers_attributes', null, {});
		queryInterface.bulkDelete('sg_numRanges', null, {});
		queryInterface.bulkDelete('sg_markers', null, {});
		return queryInterface.bulkDelete('sg_layers_ranges', null, {});
	},
};
const SG_LAYERS = [
	{
		name: 'General',
		property: 'default',
		createdAt: new Date(),
		updatedAt: new Date(),
		state: 'Y',
		description: 'Muestra por categorias',
	},
	{
		name: 'Rango monetario',
		property: 'monetary-range',
		createdAt: new Date(),
		updatedAt: new Date(),
		state: 'Y',
		description: 'Muestra por Rangos monetario',
	},
	{
		name: 'Cantidad de órdenes',
		property: 'orders-range',
		createdAt: new Date(),
		updatedAt: new Date(),
		state: 'Y',
		description: 'Muestra por Rangos de cantidad de órdenes',
	},
];

const SG_ATTRIBUTES = [
	{
		name: 'Centro',
		property: 'center',
		createdAt: new Date(),
		updatedAt: new Date(),
	},
	{
		name: 'Correctivo',
		property: 'corrective',
		createdAt: new Date(),
		updatedAt: new Date(),
	},
	{
		name: 'Ingeniería',
		property: 'engineering',
		createdAt: new Date(),
		updatedAt: new Date(),
	},
	{
		name: 'Preventivo',
		property: 'preventive',
		createdAt: new Date(),
		updatedAt: new Date(),
	},
	{
		name: 'Equipos',
		property: 'equipment',
		createdAt: new Date(),
		updatedAt: new Date(),
	},
	{
		name: 'Materiales',
		property: 'materials',
		createdAt: new Date(),
		updatedAt: new Date(),
	},
	{
		name: 'Servicios',
		property: 'services',
		createdAt: new Date(),
		updatedAt: new Date(),
	},
];

const SG_LAYERS_ATTRIBUTES = [
	{
		createdAt: new Date(),
		updatedAt: new Date(),
		layersId: 1,
		attributesId: 1,
		color: '#3D3D3D',
	},
	{
		createdAt: new Date(),
		updatedAt: new Date(),
		layersId: 1,
		attributesId: 2,
		color: '#CB2B3E',
	},
	{
		createdAt: new Date(),
		updatedAt: new Date(),
		layersId: 1,
		attributesId: 3,
		color: '#FFD326',
	},
	{
		createdAt: new Date(),
		updatedAt: new Date(),
		layersId: 1,
		attributesId: 4,
		color: '#2AAD27',
	},
	{
		createdAt: new Date(),
		updatedAt: new Date(),
		layersId: 1,
		attributesId: 5,
		color: '#2A81CB',
	},
	{
		createdAt: new Date(),
		updatedAt: new Date(),
		layersId: 1,
		attributesId: 6,
		color: '#7B7B7B',
	},
	{
		createdAt: new Date(),
		updatedAt: new Date(),
		layersId: 1,
		attributesId: 7,
		color: '#9C2BCB',
	},
	{
		createdAt: new Date(),
		updatedAt: new Date(),
		layersId: 2,
		attributesId: 1,
		color: '#3D3D3D',
	},
	{
		createdAt: new Date(),
		updatedAt: new Date(),
		layersId: 2,
		attributesId: 2,
		color: '#CB2B3E',
	},
	{
		createdAt: new Date(),
		updatedAt: new Date(),
		layersId: 2,
		attributesId: 3,
		color: '#FFD326',
	},
	{
		createdAt: new Date(),
		updatedAt: new Date(),
		layersId: 2,
		attributesId: 4,
		color: '#2AAD27',
	},
	{
		createdAt: new Date(),
		updatedAt: new Date(),
		layersId: 2,
		attributesId: 5,
		color: '#2A81CB',
	},
	{
		createdAt: new Date(),
		updatedAt: new Date(),
		layersId: 2,
		attributesId: 6,
		color: '#7B7B7B',
	},
	{
		createdAt: new Date(),
		updatedAt: new Date(),
		layersId: 2,
		attributesId: 7,
		color: '#9C2BCB',
	},
	{
		createdAt: new Date(),
		updatedAt: new Date(),
		layersId: 3,
		attributesId: 1,
		color: '#3D3D3D',
	},
	{
		createdAt: new Date(),
		updatedAt: new Date(),
		layersId: 3,
		attributesId: 2,
		color: '#CB2B3E',
	},
	{
		createdAt: new Date(),
		updatedAt: new Date(),
		layersId: 3,
		attributesId: 3,
		color: '#FFD326',
	},
	{
		createdAt: new Date(),
		updatedAt: new Date(),
		layersId: 3,
		attributesId: 4,
		color: '#2AAD27',
	},
	{
		createdAt: new Date(),
		updatedAt: new Date(),
		layersId: 3,
		attributesId: 5,
		color: '#2A81CB',
	},
	{
		createdAt: new Date(),
		updatedAt: new Date(),
		layersId: 3,
		attributesId: 6,
		color: '#7B7B7B',
	},
	{
		createdAt: new Date(),
		updatedAt: new Date(),
		layersId: 3,
		attributesId: 7,
		color: '#9C2BCB',
	},
];

const SG_NUMRANGES = [
	{
		createdAt: new Date(),
		updatedAt: new Date(),
		name: 'Rango1',
		displayName: '0 - 25%',
	},
	{
		createdAt: new Date(),
		updatedAt: new Date(),
		name: 'Rango2',
		displayName: '25 - 50%',
	},
	{
		createdAt: new Date(),
		updatedAt: new Date(),
		name: 'Rango3',
		displayName: '50 - 75%',
	},
	{
		createdAt: new Date(),
		updatedAt: new Date(),
		name: 'Rango4',
		displayName: '75 - 100%',
	},
];

const SG_MARKERS = [
	{
		createdAt: new Date(),
		updatedAt: new Date(),
		name: 'Mark1',
		colorName: 'Blue',
		color: '#2A81CB',
	},
	{
		createdAt: new Date(),
		updatedAt: new Date(),
		name: 'Mark2',
		colorName: 'Gold',
		color: '#FFD326',
	},
	{
		createdAt: new Date(),
		updatedAt: new Date(),
		name: 'Mark3',
		colorName: 'Red',
		color: '#CB2B3E',
	},
	{
		createdAt: new Date(),
		updatedAt: new Date(),
		name: 'Mark4',
		colorName: 'Green',
		color: '#2AAD27',
	},
	{
		createdAt: new Date(),
		updatedAt: new Date(),
		name: 'Mark5',
		colorName: 'Orange',
		color: '#CB8427',
	},
	{
		createdAt: new Date(),
		updatedAt: new Date(),
		name: 'Mark6',
		colorName: 'Yellow',
		color: '#CAC428',
	},
	{
		createdAt: new Date(),
		updatedAt: new Date(),
		name: 'Mark7',
		colorName: 'Violet',
		color: '#9C2BCB',
	},
	{
		createdAt: new Date(),
		updatedAt: new Date(),
		name: 'Mark8',
		colorName: 'Grey',
		color: '#7B7B7B',
	},
	{
		createdAt: new Date(),
		updatedAt: new Date(),
		name: 'Mark9',
		colorName: 'Black',
		color: '#3D3D3D',
	},
];

const SG_LAYERS_RANGES = [
	{
		createdAt: new Date(),
		updatedAt: new Date(),
		layersId: 1,
		rangesId: 1,
		markersId: 4,
	},
	{
		createdAt: new Date(),
		updatedAt: new Date(),
		layersId: 1,
		rangesId: 2,
		markersId: 2,
	},
	{
		createdAt: new Date(),
		updatedAt: new Date(),
		layersId: 1,
		rangesId: 3,
		markersId: 5,
	},
	{
		createdAt: new Date(),
		updatedAt: new Date(),
		layersId: 1,
		rangesId: 4,
		markersId: 3,
	},
	{
		createdAt: new Date(),
		updatedAt: new Date(),
		layersId: 2,
		rangesId: 1,
		markersId: 4,
	},
	{
		createdAt: new Date(),
		updatedAt: new Date(),
		layersId: 2,
		rangesId: 2,
		markersId: 2,
	},
	{
		createdAt: new Date(),
		updatedAt: new Date(),
		layersId: 2,
		rangesId: 3,
		markersId: 5,
	},
	{
		createdAt: new Date(),
		updatedAt: new Date(),
		layersId: 2,
		rangesId: 4,
		markersId: 3,
	},
	{
		createdAt: new Date(),
		updatedAt: new Date(),
		layersId: 3,
		rangesId: 1,
		markersId: 4,
	},
	{
		createdAt: new Date(),
		updatedAt: new Date(),
		layersId: 3,
		rangesId: 2,
		markersId: 2,
	},
	{
		createdAt: new Date(),
		updatedAt: new Date(),
		layersId: 3,
		rangesId: 3,
		markersId: 5,
	},
	{
		createdAt: new Date(),
		updatedAt: new Date(),
		layersId: 3,
		rangesId: 4,
		markersId: 3,
	},
];
