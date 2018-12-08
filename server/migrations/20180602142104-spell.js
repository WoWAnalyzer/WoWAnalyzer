module.exports = {
  up: (queryInterface, DataTypes) => {
    return Promise.all([
      queryInterface.createTable('Spell', {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        icon: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        createdAt: {
          type: DataTypes.DATE, // this is actually DATETIME
          defaultValue: DataTypes.NOW,
          allowNull: false,
        },
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Spell');
  },
};
