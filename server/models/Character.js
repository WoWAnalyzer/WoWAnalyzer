module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Character', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    region: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    realm: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    battlegroup: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    faction: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    class: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    race: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    gender: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    achievementPoints: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    thumbnail: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    spec: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    talents: {
      type: DataTypes.STRING,
      allowNull: true,
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
};
