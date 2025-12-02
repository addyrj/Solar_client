const { Sequelize, DataTypes } = require("sequelize");
const info = require("./info");

const sequelize = new Sequelize(
    info.DB,
    info.USER,
    info.PASSWORD,
    {
        host: info.HOST,
        dialect: info.DIALECT,
        freezeTableName: true,
        logging: false, 
        operatorsAliases: false,
        pool: {
            max: info.pool.max,
            min: info.pool.min,
            acquire: info.pool.acquire,
            idle: info.pool.idle
        }
    }
);

sequelize.authenticate()
    .then(() => {
        console.log('✅ Connection Successful');
    })
    .catch((error) => {
        console.log('❌ Connection Failed:', error);
    });

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Load all schemas
db.loginSchema = require("../Resources/Schema/LoginSchema.js")(sequelize, DataTypes);
db.userDevice = require("../Resources/Schema/UserDeviceSchema.js")(sequelize, DataTypes);
db.uidipSchema = require("../Resources/Schema/UidipSchema.js")(sequelize, DataTypes);
db.solarCharger = require("../Resources/Schema/SolarChargerSchema.js")(sequelize, DataTypes);
db.setting = require("../Resources/Schema/SettingSchema.js")(sequelize, DataTypes);
db.solarLastMd5 = require("../Resources/Schema/SchrgrLastMd5.js")(sequelize, DataTypes);
db.partnerSchema = require("../Resources/Schema/PartnerSchema.js")(sequelize, DataTypes);
db.mobileDevice = require("../Resources/Schema/MobileDeviceSchema.js")(sequelize, DataTypes);
db.donorSchema = require("../Resources/Schema/DonorSchema.js")(sequelize, DataTypes);
db.deviceLaction = require("../Resources/Schema/DeviceLocDetail.js")(sequelize, DataTypes);
db.bFootUserDevice = require("../Resources/Schema/BFootUserDevice.js")(sequelize, DataTypes);
db.bFootSetting = require("../Resources/Schema/BFootSetting.js")(sequelize, DataTypes);
db.bFootPartner = require("../Resources/Schema/BFootPartner.js")(sequelize, DataTypes);
db.bFootLogin = require("../Resources/Schema/BFootLogin.js")(sequelize, DataTypes);
db.bFootDeviceLocaDetail = require("../Resources/Schema/BFootDeviceLocationDetail.js")(sequelize, DataTypes);
db.newdevicelocationdetails = require("../Resources/Schema/NewDeviceLocationDetail.js")(sequelize, DataTypes);

// Define associations AFTER all models are loaded
const defineAssociations = () => {
    db.donorSchema.hasMany(db.newdevicelocationdetails, {
        foreignKey: 'DonarName',
        sourceKey: 'DonarOrganisation',
        as: 'devices'
    });

    db.newdevicelocationdetails.belongsTo(db.donorSchema, {
        foreignKey: 'DonarName',
        targetKey: 'DonarOrganisation',
        as: 'donor'
    });
};

// Call the association function
defineAssociations();

db.sequelize.sync({ force: false })
    .then(() => {
        console.log("🔁 Resync done.");
    })
    .catch((error) => {
        console.log("❌ Resync error:", error);
    });

module.exports = db;