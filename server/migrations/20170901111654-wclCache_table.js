module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.createTable(
        'WclApiResponse',
        {
          url: {
            type: Sequelize.STRING,
            primaryKey: true,
          },
          content: {
            type: Sequelize.TEXT('long'),
            allowNull: false,
          },
          wclResponseTime: {
            type: Sequelize.INTEGER,
            allowNull: false,
          },
          numAccesses: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 1,
          },
          lastAccessedAt: {
            type: Sequelize.DATE, // this is actually DATETIME
            defaultValue: Sequelize.NOW,
            allowNull: false,
          },
          createdAt: {
            type: Sequelize.DATE, // this is actually DATETIME
            defaultValue: Sequelize.NOW,
            allowNull: false,
          },
        },
      ),
      queryInterface.addIndex('WclApiResponse', ['createdAt']),
    ]);
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('WclApiResponse');
  },
};
