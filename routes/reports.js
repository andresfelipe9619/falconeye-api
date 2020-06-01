const Sequelize = require("sequelize");
const express = require("express");
const { DateTime } = require("luxon");
const { QueryTypes } = Sequelize;
const router = express.Router();

module.exports = (models) => {
  router.get("/technical", technicalReport(models));
  router.get("/technical-detail", technicalDetailReport(models));
  router.get("/economic", economicReport(models));
  router.get("/economic-detail", economicDetailReport(models));
  return router;
};
const capitalize = (s) => {
  if (typeof s !== "string") return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
};

const formatDate = (date) =>
  capitalize(DateTime.fromISO(date).setLocale("es").toFormat("LLL yy"));

const localDate = capitalize(
  DateTime.local().setLocale("es").toFormat("MMMM yyyy")
);
const betweenOldDates = "CreationDate BETWEEN '2019-01-01' AND '2020-04-30'";
const betweenCurrentMonth =
  "CreationDate BETWEEN '2020-05-01' AND '2020-05-30'";
const countStatus = (status, date) =>
  `SELECT COUNT(*) as conteo FROM fs_maintenance WHERE Status='${status}' AND ${date}`;

const selectType = {
  type: QueryTypes.SELECT
};
const statuses = [
  "Aprobada",
  "Ejecutada",
  "Autorizada",
  "No Aprobada",
  "No Autorizada",
  "Espera de Ejecución",
  "Pendiente de Aprobación"
];

const activitiesTypes = [
  { name: "Correctivo", color: "#4caf50" },
  { name: "Preventivo", color: "#f44336" },
  { name: "Ingenieria", color: "#3f51b5" }
];
// -----------------ECONOMIC REPORT------------------------
const economicReport = (models) => async (req, res) => {
  try {
    const result = {};
    return res.json(result);
  } catch (error) {
    console.log("Error", error);
    return res.status(500).send(error);
  }
};

const economicDetailReport = (models) => async (req, res) => {
  try {
    const result = {};
    return res.json(result);
  } catch (error) {
    console.log("Error", error);
    return res.status(500).send(error);
  }
};

// -----------------TECHNICAL REPORT------------------------
const technicalDetailReport = (models) => async (req, res) => {
  try {
    const pieData = await getPieData(models);
    const lineData = await geLineData(models);
    const rankingData = await getTechnicalRankingData(models)

    return res.json({ pieData, lineData, rankingData });
  } catch (error) {
    console.log("Error", error);
    return res.status(500).send(error);
  }
};

const technicalReport = (models) => async (req, res) => {
  try {
    const visitsData = await getVisitsData(models);
    const visitsStatusesData = await getVisitsStatusesData(models)(
      statuses,
      visitsData.currentValue
    );
    const mostVisited = await getMostVisitedData(models);
    const lineData = await geLineData(models);
    return res.json({
      mostVisited,
      lineData,
      kpi: [visitsData, ...visitsStatusesData]
    });
  } catch (error) {
    console.log("Error", error);
    return res.status(500).send(error);
  }
};

const geLineData = async (models) => {
  const action = getTotalMaintenancesByType(models);
  const data = await Promise.all(
    activitiesTypes.map(({ name, color }) => action({ name, color }))
  );
  const total = await action({ name: "Total", color: "#ffa21a" }, "Aprobada", true)
  return [...data, total];
};

const getPieData = async (models) => {
  const action = queryByCoAttributes(models);
  const first = await action("DB_TECH_ST1_GR1", "DB_TECH_ST2_GR1");
  const second = await action("DB_TECH_ST1_GR2", "DB_TECH_ST2_GR2");
  const third = await action("DB_TECH_ST1_GR3", "DB_TECH_ST2_GR3");
  const data = [first, second, third].map(reduceToPieObject);
  return data;
};

const getTechnicalRankingData = async models => {
  const action = getRankingByType(models);
  const data = await Promise.all(
    activitiesTypes.map(({ name, color }) => action({ name, color }))
  );
  return data;
}

const reduceToPieObject = (array) =>
  !Array.isArray(array)
    ? null
    : array.reduce((acc, item) => {
      let obj = {};
      if (
        item.status.includes("Espera") ||
          item.status.includes("Pendiente")
      ) {
        obj = {
          ...acc,
          conlabelId: "con",
          conName: item.status,
          conCount: item.count,
          pendingName: item.status,
          pendingValue: item.count
        };
      } else {
        obj = {
          ...acc,
          prolabelId: "pro",
          proCount: item.count,
          proName: item.status
        };
      }
      obj.total = (acc.total || 0) + item.count;
      if (obj.conCount && obj.proCount) {
        obj.conPercentage = calcPercentage(obj.conCount, obj.total);
        obj.proPercentage = calcPercentage(obj.proCount, obj.total);
      }
      return obj;
    }, {});

const calcPercentage = (x, count) => +((x * 100) / count).toFixed(2);

const queryByCoAttributes = (models) => (first, second) =>
  models.sequelize.query(
    `SELECT m.status, count(m.status) count from fs_maintenance as m 
  WHERE m.status in (
  SELECT ca.value from co_attributes ca where ca.attribute_name in ('${first}', '${second}')
  )
  GROUP BY m.status
  `,
    selectType
  );

const mostVisitedByYear = (models) => (year) =>
  models.sequelize.query(
    `SELECT intersectionId, count(intersectionId) total from fs_maintenance
  WHERE CreationDate BETWEEN '${year}-01-01' AND '${year}-12-31'
  and IntersectionID not in (8, 901, 902)   
  group by intersectionId
  order by total desc
  limit 1`,
    selectType
  );

const getRankingByType = (models) => async (
  { name: type, color },
  status = "Aprobada"
) => {
  const result = {
    title: type,
    color: [color],
    indexes: []
  };
  console.log("result", result)

  const queryResult = await models.sequelize.query(
      `SELECT m.IntersectionID locationId, count(m.internalid) quantity
      from fs_maintenance m
      INNER JOIN fs_maintenance_activities ma ON ma.maintenanceId = m.internalid
      INNER JOIN fs_activity a ON ma.activityId = a.InternalID
      where m.status = '${status}'
      and a.ActivityType = '${type}' 
        and m.IntersectionID not in (8, 901, 902)
        group by m.IntersectionID
        order by quantity desc
        limit 10;`,
      selectType
  );
  if (queryResult.length) {
    result.indexes = queryResult.map((r) => ({
      id: r.locationId,
      value: r.quantity
    }));
  }
  return result;
};

const getTotalMaintenancesByType = (models) => async (
  { name: type, color },
  status = "Aprobada",
  all
) => {
  const result = {
    id: type,
    color,
    data: null
  };
  const withType = type => `AND a.ActivityType = '${type}'`

  const queryResult = await models.sequelize.query(
    `SELECT count(*) count, DATE_FORMAT(creationDate, "%Y-%m-01") date 
    FROM fs_maintenance m
    INNER JOIN fs_maintenance_activities ma ON ma.maintenanceId = m.internalid 
    INNER JOIN fs_activity a ON ma.activityId = a.InternalID 
    WHERE m.status = '${status}' 
    ${!all ? withType(type) : ""}
    AND m.IntersectionID not in (8, 901, 902)   
    GROUP BY DATE_FORMAT(creationDate, "%Y-%m-01")
    ORDER BY date ASC`,
    selectType
  );
  if (queryResult.length) {
    result.data = queryResult.map((r) => ({
      y: r.count,
      x: formatDate(r.date)
    }));
  }
  return result;
};

const getMostVisitedData = async (models) => {
  const action = mostVisitedByYear(models);
  const [firstYear] = await action(2019);
  const [secondYear] = await action(2020);

  const [firstLocation = {}] = await models.sequelize.query(
    `SELECT * FROM gs_maintenance_cost
     WHERE internalID = ${firstYear.intersectionId}`,
    selectType
  );
  const [secondLocation = {}] = await models.sequelize.query(
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
      year: 2019
    },
    {
      ...secondYear,
      location: secondLocation.mainStreet
        ? `${secondYear.intersectionId} - ${secondLocation.mainStreet} / ${secondLocation.secondStreet}`
        : "",
      year: 2020
    }
  ];
  return result;
};

const getVisitsStatusesData = (models) => async (statuses, totalVisits) => {
  let statusesData = statuses.map(async (status) => {
    const [accResult] = await models.sequelize.query(
      countStatus(status, betweenOldDates),
      selectType
    );
    const [currentResult] = await models.sequelize.query(
      countStatus(status, betweenCurrentMonth),
      selectType
    );
    const currentValue = currentResult.conteo;
    const percentage = +((currentValue * 100) / totalVisits).toFixed(2);
    return {
      title: status,
      currentValue,
      percentage,
      accumulated: accResult.conteo,
      currentDate: localDate
    };
  });
  statusesData = await Promise.all(statusesData);
  return statusesData;
};

const getVisitsData = async (models) => {
  const [oldVisits] = await models.sequelize.query(
    `SELECT COUNT(*) as conteo FROM fs_maintenance
          WHERE ${betweenOldDates}
         `,
    selectType
  );
  const [currentVisits] = await models.sequelize.query(
    `SELECT COUNT(*) as conteo FROM fs_maintenance
            WHERE ${betweenCurrentMonth}
           `,
    selectType
  );
  const result = {
    title: "Visitas",
    accumulated: oldVisits.conteo,
    currentDate: "Mayo 2020",
    currentValue: currentVisits.conteo
  };
  return result;
};
