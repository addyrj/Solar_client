module.exports = (sequelize, DataTypes) => {
  const UnregisteredDevice = sequelize.define("unregistered_devices", {
    ID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    UID: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    Location: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    firstSeen: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    lastSeen: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
  }, {
    tableName: "unregistered_devices",
    timestamps: false,
  });

  return UnregisteredDevice;
};
