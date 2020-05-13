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
    let maintenances = await models.gs_maintenance_cost.findAll({
      order: [["internalID", "ASC"]],
    });
    maintenances = maintenances.map((m) => {
      m = m.toJSON();
      return {
        ...m,
        totalCosts: m.equipments + m.materials + m.services,
      };
    });

    const maintenancesOrders = maintenances.map((m) => m.orders);
    const maxOrder = Math.max(...maintenancesOrders);
    const minOrder = Math.min(...maintenancesOrders);
    const rangeCountOrder = 5;
    const rangeValueOrder = +((maxOrder - minOrder) / rangeCountOrder);
    const rangesOrder = new Array(rangeCountOrder).fill(0).map((_, i) => {
      if (i === 0) return minOrder;
      if (i === rangeCountOrder - 1) return maxOrder;
      return +(rangeValueOrder * i).toFixed(2);
    });

    const maintenancesCosts = maintenances.map((m) => m.totalCosts);
    const maxCost = Math.max(...maintenancesCosts);
    const minCost = Math.min(...maintenancesCosts);
    const rangeCount = 5;
    const rangeValue = +((maxCost - minCost) / rangeCount);
    const ranges = new Array(rangeCount).fill(0).map((_, i) => {
      if (i === 0) return minCost;
      if (i === rangeCount - 1) return maxCost;
      return +(rangeValue * i).toFixed(2);
    });
    const sum = (list, prop) => list.reduce((acc, item) => acc + item[prop], 0);

    const totalOrders = sum(maintenances, "orders");
    const totalCosts = sum(maintenances, "totalCosts");
    const totalPreventive = sum(maintenances, "preventive");
    const totalEngineering = sum(maintenances, "engineering");
    const totalCorrective = sum(maintenances, "corrective");
    const totalMaterials = sum(maintenances, "materials");
    const totalServices = sum(maintenances, "services");
    const totalEquipments = sum(maintenances, "equipments");

    return res.status(200).json({
      ranges,
      minCost,
      maxCost,
      maxOrder,
      minOrder,
      totalCosts,
      totalOrders,
      rangesOrder,
      maintenances,
      totalServices,
      totalMaterials,
      totalEquipments,
      totalCorrective,
      totalPreventive,
      totalEngineering,
    });
  } catch (error) {
    console.log("error", error);
    return res.status(500).send(error.message);
  }
});

app.use(router);
app.listen(PORT, () => {
  console.log(`Falconeye Microservice Listening on Port ${PORT}!`);
});

module.exports = router;
