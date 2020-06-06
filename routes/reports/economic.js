const {
  statuses,
  withType,
  localDate,
  selectType,
  totalActivity,
  activitiesTypes,
  betweenOldDates,
  reduceToPieObject,
  betweenCurrentMonth,
  queryResultToLineData
} = require("../utils")

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

const selectEconomicalSum = () =>
  `SELECT SUM( IFNULL(a.price*ma.quantity , 0.00) ) valor FROM fs_maintenance 
INNER JOIN fs_maintenance_activities ma ON ma.maintenanceId = internalid 
INNER JOIN fs_activity a ON ma.activityId = a.InternalID`

const sumEconomicStatus = (status, date) =>
  `${selectEconomicalSum()} WHERE a.ActivityType ='${status}' ${date ? "AND " : ""} ${date || ""}`;

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
    totalActivity,
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
  const promises = activitiesTypes.map(async ({ name }) => {
    const activityResult = await action(name);
    console.log("activityResult", activityResult)
    if (!activityResult) return null;
    return activityResult.map(({ name, count }) =>
      ({ status: name, label: name, count })
    )
  })
  const activityData = await Promise.all(promises);
  const data = activityData.map(reduceToPieObject);
  return data;
};

const queryByBudget = (models) => (activity, all) =>
  models.sequelize.query(
      `SELECT 'ejecutado' name, SUM( IFNULL(a.price*ma.quantity , 0.00) )  count
      FROM  fs_maintenance m
      INNER JOIN  fs_maintenance_activities ma ON ma.maintenanceId = m.internalid
      INNER JOIN  fs_activity a ON ma.activityId = a.InternalID
      WHERE m.status = 'Aprobada'
      ${!all ? withType(activity) : "AND a.ActivityType NOT IN('Centro de Control')"}
      UNION
      SELECT '${activity || "presupuesto"}' label, SUM( IFNULL(a.price*pa.quantity , 0.00) ) count
      FROM  fs_project_activities pa
      INNER JOIN  fs_activity a ON pa.activityId = a.InternalID
      ${!all ? withType(activity, false) : ""}
      `,
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

module.exports = {
  economicReport,
  economicDetailReport
}
