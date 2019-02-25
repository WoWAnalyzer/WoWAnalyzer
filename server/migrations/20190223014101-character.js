module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('Character', 'heartOfAzeroth', Sequelize.JSON, {
        allowNull: true,
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('Character', 'heartOfAzeroth'),
    ]);
  },
};
