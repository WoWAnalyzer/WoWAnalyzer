module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.changeColumn('Character', 'class', Sequelize.INTEGER, {
        allowNull: true,
      }),
      queryInterface.changeColumn('Character', 'race', Sequelize.INTEGER, {
        allowNull: true,
      }),
      queryInterface.changeColumn('Character', 'gender', Sequelize.INTEGER, {
        allowNull: true,
      }),
      queryInterface.changeColumn('Character', 'achievementPoints', Sequelize.INTEGER, {
        allowNull: true,
      }),
      queryInterface.changeColumn('Character', 'thumbnail', Sequelize.STRING, {
        allowNull: true,
      }),
      queryInterface.changeColumn('Character', 'faction', Sequelize.INTEGER, {
        allowNull: true,
      }),
      queryInterface.changeColumn('Character', 'battlegroup', Sequelize.STRING, {
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
