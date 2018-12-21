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
      queryInterface.changeColumn('Character', 'class', Sequelize.INTEGER, {
        allowNull: false,
      }),
      queryInterface.changeColumn('Character', 'race', Sequelize.INTEGER, {
        allowNull: false,
      }),
      queryInterface.changeColumn('Character', 'gender', Sequelize.INTEGER, {
        allowNull: false,
      }),
      queryInterface.changeColumn('Character', 'achievementPoints', Sequelize.INTEGER, {
        allowNull: false,
      }),
      queryInterface.changeColumn('Character', 'thumbnail', Sequelize.STRING, {
        allowNull: false,
      }),
      queryInterface.changeColumn('Character', 'faction', Sequelize.INTEGER, {
        allowNull: false,
      }),
      queryInterface.changeColumn('Character', 'battlegroup', Sequelize.STRING, {
        allowNull: false,
      }),
    ]);
  },
};
