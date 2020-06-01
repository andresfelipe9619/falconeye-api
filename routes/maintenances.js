const express = require("express");
const router = express.Router();
module.exports = (models) => {
  router.get("/", async (req, res) => {
    try {
      let maintenances = await models.gs_maintenance_cost.findAll({
        order: [["internalID", "ASC"]]
      });
      maintenances = maintenances.map((m) => {
        m = m.toJSON();
        return {
          ...m,
          totalCosts: m.equipments + m.materials + m.services
        };
      });

      const maintenancesOrders = maintenances.map((m) => m.orders);
      const maxOrder = Math.max(...maintenancesOrders);
      const minOrder = Math.min(...maintenancesOrders);
      const rangeCountOrder = 4;
      const rangeValueOrder = Math.ceil(
        (maxOrder - minOrder) / rangeCountOrder
      );
      const rangesOrder = new Array(rangeCountOrder + 1).fill(0).map((_, i) => {
        if (i === 0) return minOrder;
        return Math.ceil(rangeValueOrder * i + minOrder);
      });
      const log10 = (n) => Math.floor((100 * Math.log(n)) / Math.log(10) / 100);
      const maintenancesCosts = maintenances.map((m) => m.totalCosts);
      const maxCost = Math.max(...maintenancesCosts);
      const minCost = Math.min(...maintenancesCosts);
      const rangeCount = 4;
      const difference = Math.ceil((maxCost - minCost) / rangeCount);
      const pow = Math.pow(10, log10(difference) - 1);
      const rangeValue = Math.round(difference / pow) * pow;
      const ranges = new Array(rangeCount + 1).fill(0).map((_, i) => {
        if (i === 0) return minCost;
        return Math.ceil(rangeValue * i + minCost);
      });
      const sum = (list, prop) =>
        list.reduce((acc, item) => acc + item[prop], 0);

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
        totalEngineering
      });
    } catch (error) {
      console.log("error", error);
      return res.status(500).send(error.message);
    }
  });
  return router;
};
