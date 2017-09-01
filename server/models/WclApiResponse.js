module.exports = (sequelize, DataTypes) => {
  const WclApiResponse = sequelize.define('WclApiResponse', {
    url: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    wclResponseTime: {
      type: DataTypes.INTEGER,
      allowNull: false,
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

  return WclApiResponse;
};
