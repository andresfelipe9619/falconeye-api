require("dotenv").config()

module.exports = {
  development: {
    url: process.env.DEV_DATABASE_URL,
    logging: false,
    dialect: "mysql",
    seederStorage: "sequelize"
  },
  test: {
    url: process.env.TEST_DATABASE_URL,
    dialect: "mysql",
    seederStorage: "sequelize"
  },
  production: {
    url: process.env.DATABASE_URL,
    dialect: "mysql",
    seederStorage: "sequelize"
  }
}
