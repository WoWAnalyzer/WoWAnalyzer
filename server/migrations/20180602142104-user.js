module.exports = {
  up: (queryInterface, DataTypes) => {
    return Promise.all([
      queryInterface.createTable('User', {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        gitHubId: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        patreonId: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        authKey: {
          type: DataTypes.CHAR(32),
          allowNull: false,
          unique: true,
        },
        data: {
          type: DataTypes.TEXT('long'),
          allowNull: false,
        },
        createdAt: {
          type: DataTypes.DATE, // this is actually DATETIME
          defaultValue: DataTypes.NOW,
          allowNull: false,
        },
        lastSeenAt: {
          type: DataTypes.DATE, // this is actually DATETIME
          defaultValue: DataTypes.NOW,
          allowNull: false,
        },
      }),
      queryInterface.addIndex('User', ['gitHubId']),
      queryInterface.addIndex('User', ['patreonId']),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('User');
  },
};
