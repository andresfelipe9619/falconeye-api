const Sequelize = require("sequelize");
const { DateTime } = require("luxon");
const { QueryTypes } = Sequelize;

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
  { name: "Correctivo", color: "#ef5350" },
  { name: "Preventivo", color: "#66bb6a" },
  { name: "Ingenieria", color: "#ffee58" }
];

const totalActivityType = { name: "Total", color: "#42a5f5" };

const activitiesTypesNames = [...activitiesTypes, totalActivityType].map(({ name }) => name);

const selectType = {
  type: QueryTypes.SELECT
};

const capitalize = (s) => {
  if (typeof s !== "string") return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
};

const withType = (type, and = true) =>
  `${and ? "AND" : "WHERE"} a.ActivityType = '${type}'`;

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

const betweenOldDates = "DATE_FORMAT(IFNULL(startdate,creationDate), '%Y-%m') <= DATE_FORMAT(DATE_SUB(NOW(),INTERVAL 1 MONTH), '%Y-%m')";

const betweenCurrentMonth = `MONTH(IFNULL(startdate,creationDate)) = MONTH(CURRENT_DATE()) 
  AND YEAR(IFNULL(startdate,creationDate)) = YEAR(CURRENT_DATE())`;

const queryResultToLineData = (queryResult) => {
  const last12MonthsData = completeMissingMonths(queryResult)
  const data = last12MonthsData.map((r) => ({
    y: r.count,
    x: formatDate(r.date)
  }));
  return data;
};

const queryResultToBarData = (queryResult) => {
  const last12MonthsData = completeMissingMonths(queryResult)
  const data = last12MonthsData.map((r) => ({
    value: r.count,
    date: formatDate(r.date)
  }));
  return data;
};

const getAverage = values => {
  const count = values.length;
  values = values.reduce((acc, current) => acc + current);
  values /= count;
  return +values.toFixed(2);
}

const completeMissingMonths = (queryResult) => {
  const last12Months = getLast12Months();
  const last12MonthsData = last12Months
    .map((prevMonth) => {
      const found = queryResult.find(({ date }) => date === prevMonth);
      if (found) {
        return { ...found, count: +found.count.toFixed(2) };
      }
      return { count: 0, date: prevMonth };
    })
    .reverse();
  return last12MonthsData
}

const calcPercentage = (x, count) => +((x * 100) / count).toFixed(2);

const reduceToPieObject = (array) => {
  if (!Array.isArray(array)) {
    return null;
  }
  return array.reduce((acc, item, index) => {
    let obj = {};
    if (!item.label && !item.status) return obj;
    const isStatusRed =
      item.status.includes("Espera") ||
      activitiesTypesNames.includes(item.status) ||
      item.status.includes("Pendiente");
    if (isStatusRed) {
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
    } else if (obj.conCount === 0 && obj.proCount >= 0 && index > 0) {
      obj.proCount = obj.proCount || 1;
      obj.conPercentage = 0;
      obj.proPercentage = 100;
    } else if (obj.proCount === 0 && obj.conCount >= 0 && index > 0) {
      obj.conCount = obj.conCount || 1;
      obj.proPercentage = 0;
      obj.conPercentage = 100;
    }
    return obj;
  }, {});
};

const getLast12Months = () => {
  const monthsNumbers = Array.from(Array(12), (_, i) => i + 1);
  const last12Months = monthsNumbers.map((number) => {
    const dt = DateTime.local().setLocale("es")
      .set({ day: 1 })
      .plus({ months: 1 })
      .minus({ months: number })
      .toISODate();
    return dt;
  });
  return last12Months;
};

module.exports = {
  withType,
  statuses,
  localDate,
  capitalize,
  selectType,
  getAverage,
  formatDate,
  formatToUnits,
  activitiesTypesNames,
  totalActivityType,
  calcPercentage,
  activitiesTypes,
  betweenOldDates,
  reduceToPieObject,
  betweenCurrentMonth,
  queryResultToBarData,
  queryResultToLineData
};
