const express = require("express");
const router = express.Router();
const app = express();
const bodyParser = require("body-parser");
const PORT = process.env.PORT || 3001;
const models = require("./database/models");

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }
  next();
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get("/maintenances", async (req, res) => {
  try {
    const maintenances = await models.MaintenanceCosts.findAll({
      include: [
        {
          model: models.Coordinates,
          required: true,
          as: "coordinates",
        },
      ],
      order: [["internalId", "ASC"]],
    });
    return res.status(200).json({ data: maintenances });
  } catch (error) {
    return res.status(500).send(error.message);
  }
});

app.use(router);
app.listen(PORT, () => {
  console.log(`Falconeye Microservice Listening on Port ${PORT}!`);
});

module.exports = router;
