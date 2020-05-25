const Sequelize = require("sequelize");
const express = require("express");
const { DateTime } = require("luxon");
const { QueryTypes } = Sequelize;
const router = express.Router();

module.exports = (models) => {
  router.get("/tecnic", tecnicReport(models));
  router.get("/economic", economicReport(models));
  return router;
};
const capitalize = (s) => {
  if (typeof s !== "string") return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
};

const localDate = capitalize(
  DateTime.local().setLocale("es").toFormat("MMMM yyyy")
);
const betweenOldDates = "CreationDate BETWEEN '2019-01-01' AND '2020-04-30'";
const betweenCurrentMonth =
  "CreationDate BETWEEN '2020-05-01' AND '2020-05-30'";
const countStatus = (status, date) =>
  `SELECT COUNT(*) as conteo FROM fs_maintenance WHERE Status='${status}' AND ${date}`;

const selectType = {
  type: QueryTypes.SELECT,
};
const statuses = [
  "Aprobada",
  "Ejecutada",
  "Autorizada",
  "No Aprobada",
  "No Autorizada",
  "Espera de Ejecución",
  "Pendiente de Aprobación",
];

const economicReport = (models) => async (req, res) => {
  try {
    const result = {};
    return res.json(result);
  } catch (error) {
    console.log("Error", error);
    return res.status(500).send(error);
  }
};

const tecnicReport = (models) => async (req, res) => {
  try {
    const visitsData = await getVisitsData(models);
    const visitsStatusesData = await getVisitsStatusesData(models)(
      statuses,
      visitsData.currentValue
    );
    const mostVisited = await getMostVisitedData(models);
    return res.json({
      mostVisited,
      kpi: [visitsData, ...visitsStatusesData],
    });
  } catch (error) {
    console.log("Error", error);
    return res.status(500).send(error);
  }
};

const getMostVisitedData = async (models) => {
  let [firstYear] = await models.sequelize.query(
    `SELECT intersectionId, count(intersectionId) total from fs_maintenance
    WHERE CreationDate BETWEEN '2019-01-01' AND '2019-12-31'
    group by intersectionId
    order by total desc
    limit 1`,
    selectType
  );
  let [secondYear] = await models.sequelize.query(
    `SELECT intersectionId, count(intersectionId) total from fs_maintenance
    WHERE CreationDate BETWEEN '2020-01-01' AND '2020-12-31'
    group by intersectionId
    order by total desc
    limit 1`,
    selectType
  );
  let [firstLocation = {}] = await models.sequelize.query(
    `SELECT * FROM gs_maintenance_cost
     WHERE internalID = ${firstYear.intersectionId}`,
    selectType
  );
  let [secondLocation = {}] = await models.sequelize.query(
    `SELECT * FROM gs_maintenance_cost
     WHERE internalID = ${secondYear.intersectionId}`,
    selectType
  );

  const result = [
    {
      ...firstYear,
      location: firstLocation.mainStreet
        ? `${firstYear.intersectionId} - ${firstLocation.mainStreet}/${firstLocation.secondStreet}`
        : "",
      year: 2019,
    },
    {
      ...secondYear,
      location: secondLocation.mainStreet
        ? `${secondYear.intersectionId} - ${secondLocation.mainStreet} / ${secondLocation.secondStreet}`
        : "",
      year: 2020,
    },
  ];
  console.log("result", result);
  return result;
};

const getVisitsStatusesData = (models) => async (statuses, totalVisits) => {
  let statusesData = statuses.map(async (status) => {
    let [accResult] = await models.sequelize.query(
      countStatus(status, betweenOldDates),
      selectType
    );
    let [currentResult] = await models.sequelize.query(
      countStatus(status, betweenCurrentMonth),
      selectType
    );
    let currentValue = currentResult.conteo;
    let percentage = +((currentValue * 100) / totalVisits).toFixed(2);
    return {
      title: status,
      currentValue,
      percentage,
      accumulated: accResult.conteo,
      currentDate: localDate,
    };
  });
  statusesData = await Promise.all(statusesData);
  return statusesData;
};

const getVisitsData = async (models) => {
  const [oldVisits] = await models.sequelize.query(
    `SELECT COUNT(*) as conteo FROM falconeye.fs_maintenance
          WHERE ${betweenOldDates}
         `,
    selectType
  );
  const [currentVisits] = await models.sequelize.query(
    `SELECT COUNT(*) as conteo FROM falconeye.fs_maintenance
            WHERE ${betweenCurrentMonth}
           `,
    selectType
  );
  const result = {
    title: "Visitas",
    accumulated: oldVisits.conteo,
    currentDate: localDate,
    currentValue: currentVisits.conteo,
  };
  return result;
};
