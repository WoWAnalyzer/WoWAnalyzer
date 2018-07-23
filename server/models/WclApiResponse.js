module.exports = (sequelize, DataTypes) => {
  return sequelize.define('WclApiResponse', {
    url: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    content: {
      type: DataTypes.TEXT('long'),
      allowNull: false,
    },
    wclResponseTime: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    numAccesses: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    createdAt: {
      type: DataTypes.DATE, // this is actually DATETIME
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    lastAccessedAt: {
      type: DataTypes.DATE, // this is actually DATETIME
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
  });
};
