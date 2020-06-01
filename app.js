const express = require("express");
const router = express.Router();
const app = express();
const bodyParser = require("body-parser");
const PORT = process.env.PORT || 3001;
const models = require("./database/models");
const morgan = require("morgan")

app.use(morgan("dev"));

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

router.use("/colors", require("./routes/colors")(models));
router.use("/maintenances", require("./routes/maintenances")(models));
router.use("/reports", require("./routes/reports")(models));

app.use("/", router);
app.listen(PORT, () => {
  console.log(`Falconeye Microservice Listening on Port ${PORT}!`);
});
