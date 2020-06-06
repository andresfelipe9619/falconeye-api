const express = require("express");
const {
  technicalReport,
  technicalDetailReport
} = require("./technical")
const {
  economicReport,
  economicDetailReport
} = require("./economic")

const router = express.Router();

module.exports = (models) => {
  router.get("/technical", technicalReport(models));
  router.get("/technical-detail", technicalDetailReport(models));
  router.get("/economic", economicReport(models));
  router.get("/economic-detail", economicDetailReport(models));
  return router;
};
