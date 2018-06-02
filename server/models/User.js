import nanoid from 'nanoid';

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
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
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      defaultValue: () => nanoid(32),
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
  });

  return User;
};
