module.exports = {
  up: (queryInterface, DataTypes) => {
    return Promise.all([
      queryInterface.sequelize.query('ALTER TABLE `WclApiResponse` CHANGE COLUMN `content` `content` LONGTEXT NOT NULL COLLATE \'utf8_general_ci\''),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.sequelize.query('ALTER TABLE `WclApiResponse` CHANGE COLUMN `content` `content` LONGTEXT NOT NULL COLLATE \'latin1_general_cs\''),
    ]);
  },
};
