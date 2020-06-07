const express = require("express");
const { technicalReport, technicalDetailReport } = require("./technical");
const { economicReport, economicDetailReport } = require("./economic");
const { getDsLayers } = require("./ds_layers");

const router = express.Router();

module.exports = (models) => {
  router.get("/technical", technicalReport(models));
  router.get("/technical-detail", technicalDetailReport(models));
  router.get("/economic", economicReport(models));
  router.get("/economic-detail", economicDetailReport(models));
  router.get("/ds-layers", getDsLayers(models));
  return router;
};
