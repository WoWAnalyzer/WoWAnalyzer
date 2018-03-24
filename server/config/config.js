function config() {
  const env = process.env.NODE_ENV || 'development';

  return {
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT || 3306,
    dialect: 'mysql',
    username: 'root',
    password: process.env.MYSQL_ROOT_PASSWORD,
    database: env === 'test' ? 'wowanalyzer_test' : 'wowanalyzer',

    // Sequelize defaults
    define: {
      timestamps: false, // I prefer manual control
      freezeTableName: true, // naming pattern: table name should reflect 1 entry (so it matches 1 instance of a model)
    },
    logging: false, // I prefer to do my own logging
    operatorsAliases: false, // this disables a deprecated feature that we're not using anymore
  };
}

module.exports = config();
