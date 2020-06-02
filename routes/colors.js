const express = require('express')
const Sequelize = require('sequelize')
const router = express.Router()
module.exports = (models) => {
  router.get('/', async (req, res) => {
    try {
      const defaultAttributes = { exclude: ['createdAt', 'updatedAt'] }
      let layers = await models.sg_layers.findAll({
        where: Sequelize.where(
          Sequelize.col('sg_layers.id'),
          Sequelize.col('sg_numRanges->sg_markers->sg_layers_ranges.layersId')
        ),
        attributes: defaultAttributes,
        include: [
          {
            required: true,
            model: models.sg_attributes,
            attributes: defaultAttributes,
            through: { attributes: defaultAttributes }
          },
          {
            required: true,
            model: models.sg_numRanges,
            attributes: defaultAttributes,
            through: { attributes: [] },
            include: [
              {
                required: true,
                model: models.sg_markers,
                attributes: defaultAttributes,
                through: { attributes: [] }
              }
            ]
          }
        ]
      })
      layers = layers.map((l) => l.toJSON())
      return res.status(200).json(layers)
    } catch (error) {
      console.log('error', error)
      return res.status(500).send(error.message)
    }
  })
  return router
}
