const getDsLayers = (models) => async (req, res) => {
  try {
    const layers = await models.ds_layers.findAll({
      where: { state: true },
      raw: true
    });

    return res.json(layers);
  } catch (error) {
    console.log("Error", error);
    return res.status(500).send(error);
  }
};
module.exports = {
  getDsLayers
};
