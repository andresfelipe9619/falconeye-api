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

const formatToUnits = (number, decimals = 2) => {
  let totalStr = "";
  const numStr = String(Number(number).toFixed(decimals));
  const parts = numStr.split(".");
  const numLen = parts[0].length;
  for (let i = 0; i < numLen; i++) {
    const y = numLen - i;
    if (i > 0 && y % 3 === 0) {
      totalStr += y >= 6 ? "'" : ",";
    }
    totalStr += parts[0].charAt(i);
  }
  const decimalPart = decimals ? `.${parts[1] || ""}` : "";
  return `$${totalStr}${decimalPart}`;
};

const formatDate = (date) =>
  capitalize(DateTime.fromISO(date).setLocale("es").toFormat("LLL yy"));

const localDate = capitalize(
  DateTime.local().setLocale("es").toFormat("MMMM yyyy")
);
const betweenOldDates = "CreationDate BETWEEN '2019-01-01' AND '2020-05-30'";
const betweenCurrentMonth =
  "MONTH(CreationDate) = MONTH(CURRENT_DATE()) AND YEAR(CreationDate) = YEAR(CURRENT_DATE())";

const countStatus = (status, date) =>
  `SELECT COUNT(*) as conteo FROM fs_maintenance WHERE Status='${status}' AND ${date}`;
const selectEconomicalSum = () =>
  `SELECT SUM( IFNULL(a.price*ma.quantity , 0.00) ) valor FROM fs_maintenance 
INNER JOIN fs_maintenance_activities ma ON ma.maintenanceId = internalid 
INNER JOIN fs_activity a ON ma.activityId = a.InternalID`
const sumEconomicStatus = (status, date) =>
  `${selectEconomicalSum()} WHERE a.ActivityType ='${status}' ${date ? "AND " : ""} ${date || ""}`;

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
  { name: "Ingenieria", color: "#42a5f5" },
  { name: "Preventivo", color: "#ef5350" },
  { name: "Correctivo", color: "#66bb6a" }
];
// -----------------ECONOMIC REPORT------------------------
const economicReport = (models) => async (req, res) => {
  try {
    const visitsData = await getEconomicVisitsData(models);
    console.log("visitsData", visitsData)
    const visitsStatusesData = await getEconomicVisitsStatusesData(models)(
      [...activitiesTypes.map(({ name }) => name), "Centro de control"],
      visitsData.currentValue
    );
    // const mostExpensive = await getMostExpensiveData(models);
    const lineData = await geEconomicLineData(models);
    return res.json({
      // mostExpensive,
      lineData,
      kpi: visitsStatusesData
    });
  } catch (error) {
    console.log("Error", error);
    return res.status(500).send(error);
  }
};

const economicDetailReport = (models) => async (req, res) => {
  try {
    const pieData = await getEconomicPieData(models);
    const rankingData = await getEconomicRankingData(models);
    return res.json({ pieData, rankingData });
  } catch (error) {
    console.log("Error", error);
    return res.status(500).send(error);
  }
};

const getEconomicVisitsData = async (models) => {
  const [oldVisits] = await models.sequelize.query(
    `${selectEconomicalSum()} WHERE ${betweenOldDates}`,
    selectType
  );
  const [currentVisits] = await models.sequelize.query(
    `${selectEconomicalSum()} WHERE ${betweenCurrentMonth}`,
    selectType
  );
  const result = {
    title: "Visitas",
    accumulated: oldVisits.valor || 0,
    currentDate: localDate,
    currentValue: currentVisits.valor || 0
  };
  return result;
};

const getEconomicVisitsStatusesData = (models) => async (statuses, totalMoney) => {
  let statusesData = statuses.map(async (status) => {
    const [accResult] = await models.sequelize.query(
      sumEconomicStatus(status, betweenOldDates),
      selectType
    );
    const [currentResult] = await models.sequelize.query(
      sumEconomicStatus(status, betweenCurrentMonth),
      selectType
    );
    const currentValue = currentResult.valor || 0;
    const percentage = +((currentValue * 100) / totalMoney).toFixed(2);
    return {
      title: status,
      currentValue,
      percentage: percentage || 0,
      accumulated: accResult.valor || 0,
      currentDate: localDate
    };
  });
  statusesData = await Promise.all(statusesData);
  return statusesData;
};

const getMostExpensiveData = async (models) => {
  const action = mostExpensiveByStatus(models);
  let statusesData = statuses.map(async status => {
    const [statusData] = await action(status);
    const [location] = await models.sequelize.query(
      `SELECT * FROM gs_maintenance_cost
         WHERE internalID = ${statusData.intersectionId}`,
      selectType
    );
    return {
      ...statusData,
      location: location.mainStreet
        ? `${statusData.intersectionId} - ${location.mainStreet}/${location.secondStreet}`
        : ""
    }
  }
  )
  statusesData = await Promise.all(statusesData);

  return statusesData;
};

const geEconomicLineData = async (models) => {
  const action = getEconomicTotalMaintenancesByType(models);
  const data = await Promise.all(
    activitiesTypes.map(({ name, color }) => action({ name, color }))
  );
  const total = await action(
    { name: "Total", color: "#ffee58" },
    "Aprobada",
    true
  );
  return [total, ...data];
};

const mostExpensiveByStatus = (models) => (status) =>
  models.sequelize.query(
    `${sumEconomicStatus(status)}
  AND intersectionId not in (8, 901, 902)   
  GROUP BY intersectionId 
  ORDER BY valor desc
  LIMIT 1`,
    selectType
  );
const withType = (type) => `AND a.ActivityType = '${type}'`;

const getEconomicTotalMaintenancesByType = (models) => async (
  { name: type, color },
  status = "Aprobada",
  all
) => {
  const result = {
    id: type,
    color,
    data: null
  };

  const queryResult = await models.sequelize.query(
    `SELECT SUM( IFNULL(a.price*ma.quantity , 0.00) ) count, DATE_FORMAT(m.startdate, "%Y-%m-01") date 
      FROM fs_maintenance m
      INNER JOIN fs_maintenance_activities ma ON ma.maintenanceId = m.internalid 
      INNER JOIN fs_activity a ON ma.activityId = a.InternalID
      WHERE m.status = '${status}' 
      ${!all ? withType(type) : "AND a.ActivityType NOT IN('Centro de Control')"}
      AND m.IntersectionID NOT IN (8, 901, 902)
      AND m.startdate <= NOW() and m.startdate >= Date_add(Now(),interval - 12 month)
      GROUP BY DATE_FORMAT(m.startdate, "%Y-%m-01")
      ORDER BY date ASC
      LIMIT 12;
      `,
    selectType
  );
  if (queryResult.length) {
    result.data = queryResultToLineData(queryResult)
  }
  return result;
};

const getEconomicPieData = async (models) => {
  const action = queryByBudget(models);
  const first = await action("DB_TECH_ST1_GR1", "DB_TECH_ST2_GR1");
  const second = await action("DB_TECH_ST1_GR2", "DB_TECH_ST2_GR2");
  const third = await action("DB_TECH_ST1_GR3", "DB_TECH_ST2_GR3");
  const forth = await action("DB_TECH_ST1_GR3", "DB_TECH_ST2_GR3");
  const data = [first, second, third, forth].map(reduceToPieObject);
  return data;
};

const queryByBudget = (models) => (budget, executed) =>
  models.sequelize.query(
    `SELECT 'Ejecutado' Total, SUM( IFNULL(a.price*ma.quantity , 0.00) )  valor
    FROM  fs_maintenance m
    INNER JOIN  fs_maintenance_activities ma ON ma.maintenanceId = m.internalid
    INNER JOIN  fs_activity a ON ma.activityId = a.InternalID
    WHERE m.status = 'Aprobada'
    UNION
    SELECT 'Presupuesto' Total, SUM( IFNULL(a.price*pa.quantity , 0.00) ) valor
    FROM  fs_project_activities pa
    INNER JOIN  fs_activity a ON pa.activityId = a.InternalID`,
    selectType
  );

const getEconomicRankingData = async (models) => {
  const action = getEconomicRankingByType(models);
  const data = await Promise.all(
    activitiesTypes.map(({ name, color }) => action({ name, color }))
  );
  return data;
};

const getEconomicRankingByType = (models) => async (
  { name: type, color },
  status = "Aprobada"
) => {
  const result = {
    title: type,
    color: [color],
    indexes: []
  };
  console.log("result", result);

  const queryResult = await models.sequelize.query(
    `SELECT m.IntersectionID locationId, SUM( IFNULL(a.price*ma.quantity , 0.00) ) valor
      FROM fs_maintenance m
      INNER JOIN fs_maintenance_activities ma ON ma.maintenanceId = m.internalid
      INNER JOIN fs_activity a ON ma.activityId = a.InternalID
      WHERE m.status = '${status}'
      AND a.ActivityType = '${type}' 
      AND m.IntersectionID NOT IN (8, 901, 902)
      GROUP BY m.IntersectionID
      ORDER BY valor desc
      LIMIT 10`,
    selectType
  );
  if (queryResult.length) {
    result.indexes = queryResult.map((r) => ({
      id: String(r.locationId),
      value: +r.valor.toFixed(2)
    }));
  }
  return result;
};

// -----------------TECHNICAL REPORT------------------------
const technicalDetailReport = (models) => async (req, res) => {
  try {
    const pieData = await getTechnicalPieData(models);
    const lineData = await geLineData(models);
    const rankingData = await getTechnicalRankingData(models);

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
  const total = await action(
    { name: "Total", color: "#ffee58" },
    "Aprobada",
    true
  );
  return [total, ...data];
};

const getTechnicalPieData = async (models) => {
  const action = queryByCoAttributes(models);
  const first = await action("DB_TECH_ST1_GR1", "DB_TECH_ST2_GR1");
  const second = await action("DB_TECH_ST1_GR2", "DB_TECH_ST2_GR2");
  const third = await action("DB_TECH_ST1_GR3", "DB_TECH_ST2_GR3");
  const data = [first, second, third].map(reduceToPieObject);
  return data;
};

const getTechnicalRankingData = async (models) => {
  const action = getRankingByType(models);
  const data = await Promise.all(
    activitiesTypes.map(({ name, color }) => action({ name, color }))
  );
  return data;
};

const reduceToPieObject = (array) =>
  !Array.isArray(array)
    ? null
    : array.reduce((acc, item, index) => {
      console.log("item", item)
      let obj = {};
      if (!item.label) return obj
      if (
        item.label.includes("Espera") ||
        item.label.includes("Pendiente")
      ) {
        obj = {
          ...acc,
          conlabelId: "con",
          conName: item.label,
          conCount: item.count,
          pendingName: item.label,
          pendingValue: item.count
        };
      } else {
        obj = {
          ...acc,
          prolabelId: "pro",
          proCount: item.count,
          proName: item.label
        };
      }
      obj.total = (acc.total || 0) + item.count;
      if (obj.conCount && obj.proCount) {
        obj.conPercentage = calcPercentage(obj.conCount, obj.total);
        obj.proPercentage = calcPercentage(obj.proCount, obj.total);
      } else if (obj.conCount === 0 && obj.proCount === 0 && index > 0) {
        obj.proCount = 1;
        obj.conPercentage = 0;
        obj.proPercentage = 100;
      }
      return obj;
    }, {});

const calcPercentage = (x, count) => +((x * 100) / count).toFixed(2);

const queryByCoAttributes = (models) => (first, second) =>
  models.sequelize.query(
    `Select ca.value status, ca.Description label, count( m.id ) count
    from co_attributes ca
    LEFT OUTER JOIN fs_maintenance m ON m.status = ca.value
    where ca.attribute_name in  ('${first}', '${second}')
    group by ca.value, ca.Description`,
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
  console.log("result", result);

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
      id: String(r.locationId),
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

  const queryResult = await models.sequelize.query(
    `
    SELECT COUNT(*) count, DATE_FORMAT(m.startdate, "%Y-%m-01") date 
    FROM fs_maintenance m
    INNER JOIN fs_maintenance_activities ma ON ma.maintenanceId = m.internalid 
    INNER JOIN fs_activity a ON ma.activityId = a.InternalID 
    WHERE m.status = '${status}' 
    ${!all ? withType(type) : "AND a.ActivityType NOT IN('Centro de Control')"}
    AND m.IntersectionID NOT IN (8, 901, 902)
    AND m.startdate <= NOW() and m.startdate >= Date_add(Now(),interval - 12 month)
    GROUP BY DATE_FORMAT(m.startdate, "%Y-%m-01")
    ORDER BY date ASC
    LIMIT 12;
    `,
    selectType
  );

  if (queryResult.length) {
    result.data = queryResultToLineData(queryResult)
  }
  return result;
};

const queryResultToLineData = (queryResult) => {
  const last12Months = getLast12Months()
  const last12MonthsData = last12Months.map(prevMonth => {
    const found = queryResult.find(({ date }) => date === prevMonth)
    if (found) { return { ...found, count: +found.count.toFixed(2) } }
    return { count: 0, date: prevMonth }
  }).reverse()
  const data = last12MonthsData.map((r) => ({
    y: r.count,
    x: formatDate(r.date)
  }));
  return data;
}

const getLast12Months = () => {
  const monthsNumbers = Array.from(Array(12), (_, i) => i + 1)
  const last12Months = monthsNumbers.map(number => {
    const dt = DateTime.local().set({ day: 1 }).minus({ months: number }).toISODate();
    return dt
  })
  return last12Months;
}

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
    const currentValue = currentResult.conteo || 0;
    const percentage = +((currentValue * 100) / totalVisits).toFixed(2);
    return {
      title: status,
      currentValue,
      percentage: percentage || 0,
      accumulated: accResult.conteo || 0,
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
    currentDate: localDate,
    currentValue: currentVisits.conteo
  };
  return result;
};
