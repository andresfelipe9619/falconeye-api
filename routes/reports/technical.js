const {
  statuses,
  withType,
  localDate,
  selectType,
  activitiesTypes,
  betweenOldDates,
  reduceToPieObject,
  betweenCurrentMonth,
  queryResultToLineData
} = require("../utils");

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

const countStatus = (status, date) =>
`SELECT COUNT(*) as conteo FROM fs_maintenance WHERE Status='${status}' AND ${date}`;

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

module.exports = {
  technicalReport,
  technicalDetailReport
}
