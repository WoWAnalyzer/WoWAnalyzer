module.exports = {
  up: async function (queryInterface, Sequelize) {
    // changeColumn doesn't provide the option to specify an alternative collation, so we have to use a SQL query
    return queryInterface.sequelize.query("ALTER TABLE `WclApiResponse` CHANGE COLUMN `url` `url` VARCHAR(1024) NOT NULL COLLATE 'latin1_general_cs'");
  },
  down: function (queryInterface, Sequelize) {
    return queryInterface.sequelize.query("ALTER TABLE `WclApiResponse` CHANGE COLUMN `url` `url` VARCHAR(1024) NOT NULL COLLATE 'latin1_general_cs'");
  },
};
