module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('Character', 'class', Sequelize.INTEGER, {
        allowNull: false,
      }),
      queryInterface.addColumn('Character', 'race', Sequelize.INTEGER, {
        allowNull: false,
      }),
      queryInterface.addColumn('Character', 'gender', Sequelize.INTEGER, {
        allowNull: false,
      }),
      queryInterface.addColumn('Character', 'achievementPoints', Sequelize.INTEGER, {
        allowNull: false,
      }),
      queryInterface.addColumn('Character', 'thumbnail', Sequelize.STRING, {
        allowNull: false,
      }),
      queryInterface.addColumn('Character', 'faction', Sequelize.INTEGER, {
        allowNull: false,
      }),
      queryInterface.addColumn('Character', 'battlegroup', Sequelize.STRING, {
        allowNull: false,
      }),
      queryInterface.addColumn('Character', 'role', Sequelize.STRING, {
        allowNull: true,
      }),
      queryInterface.addColumn('Character', 'spec', Sequelize.STRING, {
        allowNull: true,
      }),
      queryInterface.addColumn('Character', 'talents', Sequelize.STRING, {
        allowNull: true,
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('Character', 'class'),
      queryInterface.removeColumn('Character', 'race'),
      queryInterface.removeColumn('Character', 'thumbnail'),
      queryInterface.removeColumn('Character', 'faction'),
      queryInterface.removeColumn('Character', 'role'),
      queryInterface.removeColumn('Character', 'spec'),
      queryInterface.removeColumn('Character', 'talents'),
    ]);
  },
};
