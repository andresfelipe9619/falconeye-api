const express = require("express");
const router = express.Router();
module.exports = (models) => {
  router.get("/economic", getEconomicLayer);
  router.get("/technical", getTechnicalLayer);

  const getMaintenances = () => models.gs_maintenance_cost.findAll({
    include: [{ model: models.fs_maintenance }],
    order: [["internalID", "ASC"]]
  });

  const getLayerRanges = (values, log) => {
    const max = Math.max(...values);
    const min = Math.min(...values);
    const rangeCount = 4;
    const difference = Math.ceil(
      (max - min) / rangeCount
    );
    let rangeValue = difference;
    if (log) {
      const pow = Math.pow(10, log10(difference) - 1);
      rangeValue = Math.round(difference / pow) * pow;
    }
    const ranges = new Array(rangeCount + 1).fill(0).map((_, i) => {
      if (i === 0) return min;
      return Math.ceil(rangeValue * i + min);
    });
    return ranges;
  }

  const log10 = (n) => Math.floor((100 * Math.log(n)) / Math.log(10) / 100);

  const sum = (list, prop) =>
    list.reduce((acc, item) => acc + item[prop], 0);

  const setTotalCosts = (m) => {
    m = m.toJSON();
    return {
      ...m,
      totalCosts: m.equipments + m.materials + m.services
    };
  }

  async function getTechnicalLayer (req, res) {

  }

  async function getEconomicLayer (req, res) {
    try {
      let maintenances = await getMaintenances()
      maintenances = maintenances.map(setTotalCosts);

      const maintenancesOrders = maintenances.map((m) => m.orders);
      const rangesOrder = getLayerRanges(maintenancesOrders);

      const maintenancesCosts = maintenances.map((m) => m.totalCosts);
      const ranges = getLayerRanges(maintenancesCosts, true)

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
  }
  return router;
};
