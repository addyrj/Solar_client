const { Sequelize, DataTypes } = require("sequelize");
const info = require("./info");

const sequelize = new Sequelize(info.DB, info.USER, info.PASSWORD, {
  host: info.HOST,
  dialect: info.DIALECT,
  freezeTableName: true,
  logging: false,
  operatorsAliases: false,
  pool: {
    max: info.pool.max,
    min: info.pool.min,
    acquire: info.pool.acquire,
    idle: info.pool.idle,
  },
});

sequelize
  .authenticate()
  .then(() => {
    console.log("✅ DB Connection Successful");
  })
  .catch((error) => {
    console.log("❌ Connection Failed:", error);
  });

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Load all schemas
db.loginSchema = require("../Resources/Schema/LoginSchema.js")(
  sequelize,
  DataTypes,
);
db.userDevice = require("../Resources/Schema/UserDeviceSchema.js")(
  sequelize,
  DataTypes,
);

db.solarCharger = require("../Resources/Schema/SolarChargerSchema.js")(
  sequelize,
  DataTypes,
);
db.setting = require("../Resources/Schema/SettingSchema.js")(
  sequelize,
  DataTypes,
);

db.donorSchema = require("../Resources/Schema/DonorSchema.js")(
  sequelize,
  DataTypes,
);

db.bFootSetting = require("../Resources/Schema/BFootSetting.js")(
  sequelize,
  DataTypes,
);
db.bFootLogin = require("../Resources/Schema/BFootLogin.js")(
  sequelize,
  DataTypes,
);

db.newdevicelocationdetails =
  require("../Resources/Schema/NewDeviceLocationDetail.js")(
    sequelize,
    DataTypes,
  );
db.unregisteredDevices = require("../Resources/Schema/UnregisteredDevice.js")(
  sequelize,
  DataTypes,
);

// ✅ Load the Rew model
db.rew = require("../Resources/Schema/RewSchema.js")(
  sequelize,
  DataTypes,
);


// In your DB config file, update the associations
const defineAssociations = () => {
    // Donor associations (using donor_id)
    db.donorSchema.hasMany(db.newdevicelocationdetails, {
        foreignKey: 'donor_id',
        as: 'devices',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
    });

    db.newdevicelocationdetails.belongsTo(db.donorSchema, {
        foreignKey: 'donor_id',
        as: 'donor',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
    });

    // REW associations
    db.rew.hasMany(db.newdevicelocationdetails, {
        foreignKey: 'rew_id',
        as: 'devices',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
    });

    db.newdevicelocationdetails.belongsTo(db.rew, {
        foreignKey: 'rew_id',
        as: 'rew',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
    });
};

// Call the association function
defineAssociations();

db.sequelize
  .sync({ force: false })
  .then(() => {
    console.log("🔁 Resync done.");
  })
  .catch((error) => {
    console.log("❌ Resync error:", error);
  });

module.exports = db;