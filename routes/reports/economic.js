const {
  withType,
  localDate,
  selectType,
  getAverage,
  totalActivityType,
  activitiesTypes,
  betweenOldDates,
  reduceToPieObject,
  betweenCurrentMonth,
  queryResultToBarData,
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
    const mostExpensive = await getMostExpensiveData(models);
    const lineData = await geEconomicLineData(models);
    const barData = await getEconomicBarData(models);

    return res.json({
      mostExpensive,
      lineData,
      barData,
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
    const barData = await getEconomicDetailBarData(models);
    return res.json({ pieData, barData, rankingData });
  } catch (error) {
    console.log("Error", error);
    return res.status(500).send(error);
  }
};

const selectEconomicalSum = (intersection) =>
  `SELECT ${intersection ? "intersectionId," : ""} SUM( IFNULL(a.price*ma.quantity , 0.00) ) value FROM fs_maintenance 
INNER JOIN fs_maintenance_activities ma ON ma.maintenanceId = internalid 
INNER JOIN fs_activity a ON ma.activityId = a.InternalID`

const sumEconomicStatus = ({ status, date, intersection }) =>
  `${selectEconomicalSum(intersection)} WHERE a.ActivityType ='${status}' ${date ? "AND " : ""} ${date || ""}`;

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
    accumulated: oldVisits.value || 0,
    currentDate: localDate,
    currentValue: currentVisits.value || 0
  };
  return result;
};

const getEconomicVisitsStatusesData = (models) => async (statuses, totalMoney) => {
  let statusesData = statuses.map(async (status) => {
    const [accResult] = await models.sequelize.query(
      sumEconomicStatus({ status, date: betweenOldDates }),
      selectType
    );
    const [currentResult] = await models.sequelize.query(
      sumEconomicStatus({ status, date: betweenCurrentMonth }),
      selectType
    );
    const currentValue = currentResult.value || 0;
    const percentage = +((currentValue * 100) / totalMoney).toFixed(2);
    return {
      title: status,
      currentValue,
      percentage: percentage || 0,
      accumulated: accResult.value || 0,
      currentDate: localDate
    };
  });
  statusesData = await Promise.all(statusesData);
  return statusesData;
};

const getMostExpensiveData = async (models) => {
  const action = mostExpensiveByStatus(models);
  let activitiesData = activitiesTypes.map(({ name }) => name).map(async activityName => {
    const [activityData] = await action(activityName);
    if (!activityData) return null;
    const [location] = await models.sequelize.query(
        `SELECT * FROM gs_maintenance_cost
           WHERE internalID = ${activityData.intersectionId}`,
        selectType
    );
    return {
      ...activityData,
      value: +(activityData.value).toFixed(2),
      title: activityName,
      location: location.mainStreet
        ? `${activityData.intersectionId} - ${location.mainStreet}/${location.secondStreet}`
        : ""
    }
  }
  )
  activitiesData = await Promise.all(activitiesData);

  return activitiesData;
};
const getEconomicBarData = async models => {
  const pieData = await getEconomicPieData(models, false);
  const barData = pieData.map(item => {
    return {
      assistanceType: item.conName,
      contratado: item.conCount,
      contratadoColor: "#4caf50",
      ejecutado: item.proCount,
      ejecutadoColor: "#f44336"
    }
  })
  return barData
}

const getEconomicDetailBarData = async models => {
  const action = getEconomicDetailBarDataByType(models);
  const data = await Promise.all(
    activitiesTypes.map(({ name, color }) => action({ name, color }))
  );
  return data
}

const geEconomicLineData = async (models) => {
  const action = getEconomicTotalMaintenancesByType(models);
  const data = await Promise.all(
    activitiesTypes.map(({ name, color }) => action({ name, color }))
  );
  const total = await action(
    totalActivityType,
    "Aprobada",
    true
  );
  return [total, ...data];
};

const mostExpensiveByStatus = (models) => (status) =>
  models.sequelize.query(
      `${sumEconomicStatus({ status, intersection: true })}
    AND intersectionId not in (8, 901, 902)   
    GROUP BY intersectionId 
    ORDER BY value desc
    LIMIT 1`,
      selectType
  );

const getEconomicDetailBarDataByType = (models) => async (
  { name: type, color },
  status = "Aprobada",
  all
) => {
  const result = {
    id: type,
    color,
    data: null,
    media: 0
  };

  const queryResult = await models.sequelize.query(
      `
        SELECT DATE_FORMAT(m.startdate, "%Y-%m-01") date, SUM( IFNULL(a.price*ma.quantity , 0.00) )  count
        FROM fs_maintenance m
        INNER JOIN fs_maintenance_activities ma ON ma.maintenanceId = m.internalid
        INNER JOIN fs_activity a ON ma.activityId = a.InternalID
        WHERE m.status = '${status}' 
        AND m.IntersectionID NOT IN (8, 901, 902)
        ${!all ? withType(type) : "AND a.ActivityType NOT IN('Centro de Control')"}
        GROUP BY date
        ORDER BY date ASC
        LIMIT 12
        `,
      selectType
  );
  if (queryResult.length) {
    const barData = queryResultToBarData(queryResult)
    result.data = barData;
    result.media = getAverage(barData.map(({ value }) => value))
  }
  return result;
};

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

const getEconomicPieData = async (models, all = true) => {
  const action = queryByBudget(models);
  const allType = all ? [totalActivityType] : []
  const promises = [...allType, ...activitiesTypes].map(async ({ name }) => {
    const isAll = name => name === "Total"
    const all = isAll(name)
    const activityResult = await action(name, all);
    if (!activityResult) return null;
    return activityResult.map(({ name: activityName, count }) =>
      ({ status: activityName, label: isAll(activityName) ? "Presupuesto" : activityName, count: +count.toFixed(2) })
    )
  })
  const activityData = await Promise.all(promises);
  const data = activityData.map(reduceToPieObject);
  return data;
};

const queryByBudget = (models) => (activity, all) =>
  models.sequelize.query(
      `SELECT 'Ejecutado' name, SUM( IFNULL(a.price*ma.quantity , 0.00) )  count
      FROM  fs_maintenance m
      INNER JOIN  fs_maintenance_activities ma ON ma.maintenanceId = m.internalid
      INNER JOIN  fs_activity a ON ma.activityId = a.InternalID
      WHERE m.status = 'Aprobada'
      ${!all ? withType(activity) : "AND a.ActivityType NOT IN('Centro de Control')"}
      UNION
      SELECT '${activity}' name, SUM( IFNULL(a.price*pa.quantity , 0.00) ) count
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

  const queryResult = await models.sequelize.query(
      `SELECT m.IntersectionID locationId, SUM( IFNULL(a.price*ma.quantity , 0.00) ) value
        FROM fs_maintenance m
        INNER JOIN fs_maintenance_activities ma ON ma.maintenanceId = m.internalid
        INNER JOIN fs_activity a ON ma.activityId = a.InternalID
        WHERE m.status = '${status}'
        AND a.ActivityType = '${type}' 
        AND m.IntersectionID NOT IN (8, 901, 902)
        GROUP BY m.IntersectionID
        ORDER BY value desc
        LIMIT 10`,
      selectType
  );
  if (queryResult.length) {
    result.indexes = queryResult.map((r) => ({
      id: String(r.locationId),
      value: +r.value.toFixed(2)
    }));
  }
  return result;
};

module.exports = {
  economicReport,
  economicDetailReport
}
