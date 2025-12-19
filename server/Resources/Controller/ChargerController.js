const db = require("../../DB/config");
const { Op } = require("sequelize");
const mqttService = require("../mqttService");

const solarcharger = db.solarCharger;
const NewDevice = db.newdevicelocationdetails;

// Initialize MQTT when controller loads
console.log("Initializing MQTT Service...");
mqttService.initialize();

// ===================== HELPER FUNCTIONS =====================

const roundToSecond = (date) =>
  new Date(Math.floor(new Date(date).getTime() / 1000) * 1000);

const validateValue = (val) => {
  const num = parseFloat(val);
  return !isNaN(num) && num <= 30 ? num : 0;
};

// Check if device exists in newdevicelocationdetails
const checkDeviceExists = async (UID) => {
  const device = await NewDevice.findOne({ where: { UID } });
  return device !== null;
};

// ===================== MANUAL DATA UPLOAD =====================

/**
 * Create Solar Charger Data (Manual Upload)
 * This endpoint allows manual data upload for registered devices
 */
const createSolarCharger = async (req, res) => {
  try {
    console.log('Received manual upload payload:', JSON.stringify(req.body, null, 2));

    const { UID, data = [] } = req.body;

    // Validation
    if (!UID || !Array.isArray(data) || data.length === 0) {
      return res.status(400).json({
        status: 400,
        message: "UID and data array are required",
      });
    }

    // Check if device is registered
    const deviceExists = await checkDeviceExists(UID);
    if (!deviceExists) {
      return res.status(404).json({
        status: 404,
        message: "Device not found. Please register the device first using /createNewDevice endpoint",
        hint: "Register device at POST /api/createNewDevice with device details"
      });
    }

    // Prepare data array
    const dataArray = data.map((item) => ({
      Location: UID,
      UID,
      PvVolt: item.PvVolt ? validateValue(item.PvVolt) : null,
      PvCur: item.PvCur ? validateValue(item.PvCur) : null,
      BatVoltage: item.BatVoltage ? validateValue(item.BatVoltage) : null,
      BatCurrent: item.BatCurrent ? validateValue(item.BatCurrent) : null,
      LoadVoltage: item.LoadVoltage ? validateValue(item.LoadVoltage) : null,
      LoadCurrent: item.LoadCurrent ? validateValue(item.LoadCurrent) : null,
      BatKWh: item.BatKWh ? validateValue(item.BatKWh) : null,
      PVKWh: item.PVKWh ? validateValue(item.PVKWh) : null,
      Temperature: item.Temperature ? parseFloat(item.Temperature) : null,
      RecordTime: roundToSecond(item.RecordTime),
      Time: new Date(),
      IP: item.IP || req.ip || "Manual Upload",
    }));

    // Avoid duplicate RecordTime
    const recordTimesToCheck = dataArray.map(d => d.RecordTime);
    const existingRecords = await solarcharger.findAll({
      where: {
        UID,
        RecordTime: { [Op.in]: recordTimesToCheck }
      },
      attributes: ["RecordTime"]
    });

    const existingTimes = new Set(
      existingRecords.map(r => roundToSecond(r.RecordTime).toISOString())
    );

    const filteredDataArray = dataArray.filter(
      d => !existingTimes.has(roundToSecond(d.RecordTime).toISOString())
    );

    if (filteredDataArray.length === 0) {
      return res.status(200).json({
        status: 200,
        message: "No new records to insert. All entries already exist.",
        inserted: 0,
        data: [],
      });
    }

    const insertedData = await solarcharger.bulkCreate(filteredDataArray, { returning: true });

    return res.status(200).json({
      status: 200,
      message: "Solar charger data inserted successfully (Manual Upload)",
      source: "manual",
      inserted: insertedData.length,
      data: insertedData,
    });

  } catch (error) {
    console.error("Error inserting solar charger data:", error);
    return res.status(500).json({
      status: 500,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// ===================== GET DATA ENDPOINTS =====================

/**
 * Get All Solar Charger Data
 * Returns all data with MQTT status
 */
const getAllSolarCharger = async (req, res) => {
  try {
    const allChargerData = await solarcharger.findAll({
      order: [['RecordTime', 'DESC']]
    });

    if (!allChargerData || allChargerData.length === 0) {
      return res.status(404).json({
        status: 404,
        message: 'No solar charger data found'
      });
    }

    res.status(200).json({
      status: 200,
      message: 'Solar charger data fetched successfully',
      count: allChargerData.length,
      mqttStatus: mqttService.getStatus(),
      info: allChargerData.map(item => ({
        ID: item.ID,
        Location: item.Location,
        UID: item.UID,
        BatVoltage: item.BatVoltage,
        BatCurrent: item.BatCurrent,
        PvVolt: item.PvVolt,
        PvCur: item.PvCur,
        LoadVoltage: item.LoadVoltage,
        LoadCurrent: item.LoadCurrent,
        BatKWh: item.BatKWh,
        PVKWh: item.PVKWh,
        Temperature: item.Temperature,
        Time: item.Time,
        RecordTime: item.RecordTime,
        IP: item.IP
      }))
    });

  } catch (error) {
    console.error("Error fetching solar charger data:", error);
    return res.status(500).json({
      status: 500,
      error: true,
      message: error.message || 'Internal Server Error'
    });
  }
};


const getSolarChargerById = async (req, res) => {
  try {
    const { id } = req.params;

    const chargerData = await solarcharger.findOne({ where: { ID: id } });

    if (!chargerData) {
      return res.status(404).json({
        status: 404,
        message: "Device not found",
      });
    }

    res.status(200).json({
      status: 200,
      message: "Solar charger data fetched successfully",
      data: {
        ID: chargerData.ID,
        UID: chargerData.UID,
        Location: chargerData.Location,
        PvVolt: chargerData.PvVolt,
        PvCur: chargerData.PvCur,
        BatVoltage: chargerData.BatVoltage,
        BatCurrent: chargerData.BatCurrent,
        LoadVoltage: chargerData.LoadVoltage,
        LoadCurrent: chargerData.LoadCurrent,
        BatKWh: chargerData.BatKWh,
        PVKWh: chargerData.PVKWh,
        Temperature: chargerData.Temperature,
        Time: chargerData.Time,
        RecordTime: chargerData.RecordTime,
        IP: chargerData.IP
      }
    });
  } catch (error) {
    console.error("Error fetching solar charger by ID:", error);
    return res.status(500).json({
      status: 500,
      message: error.message || "Internal Server Error",
    });
  }
};

const getLatestSolarCharger = async (req, res) => {
  try {
    const { limit = 100, page = 1, deviceId } = req.query; // ✅ Add pagination
    
    const offset = (page - 1) * limit;
    
    let whereCondition = {};
    if (deviceId) {
      whereCondition.UID = deviceId;
    }

    const { count, rows: latestData } = await solarcharger.findAndCountAll({
      where: whereCondition,
      order: [['RecordTime', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.status(200).json({
      status: 200,
      message: 'Latest solar charger data fetched successfully',
      mqttStatus: mqttService.getStatus(),
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      },
      data: latestData
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      status: 500,
      message: error.message
    });
  }
};


const getRealtimeData = async (req, res) => {
  try {
    const { deviceId, minutes = 60 } = req.query;
    
    let whereCondition = {};
    
    if (deviceId) {
      whereCondition.UID = deviceId;
    }

    // Get data from last X minutes
    const timeThreshold = new Date(Date.now() - minutes * 60 * 1000);
    whereCondition.RecordTime = { [Op.gte]: timeThreshold };

    const realtimeData = await solarcharger.findAll({
      where: whereCondition,
      order: [['RecordTime', 'DESC']],
      limit: 100
    });

    res.status(200).json({
      status: 200,
      message: 'Real-time data fetched successfully',
      mqttStatus: mqttService.getStatus(),
      timeRange: `Last ${minutes} minutes`,
      count: realtimeData.length,
      data: realtimeData
    });
  } catch (error) {
    console.error("Error fetching real-time data:", error);
    return res.status(500).json({
      status: 500,
      message: error.message || "Internal Server Error",
    });
  }
};


const getDataByUID = async (req, res) => {
  try {
    const { uid } = req.params;
    const { startDate, endDate, limit = 100 } = req.query;

    let whereCondition = { UID: uid };

    // Add date filtering if provided
    if (startDate || endDate) {
      whereCondition.RecordTime = {};
      if (startDate) {
        whereCondition.RecordTime[Op.gte] = new Date(startDate);
      }
      if (endDate) {
        whereCondition.RecordTime[Op.lte] = new Date(endDate);
      }
    }

    const deviceData = await solarcharger.findAll({
      where: whereCondition,
      order: [['RecordTime', 'DESC']],
      limit: parseInt(limit)
    });

    if (deviceData.length === 0) {
      return res.status(404).json({
        status: 404,
        message: 'No data found for this device'
      });
    }

    // Get device details
    const deviceInfo = await NewDevice.findOne({ where: { UID: uid } });

    res.status(200).json({
      status: 200,
      message: 'Device data fetched successfully',
      deviceInfo: deviceInfo || null,
      count: deviceData.length,
      data: deviceData
    });

  } catch (error) {
    console.error("Error fetching data by UID:", error);
    return res.status(500).json({
      status: 500,
      message: error.message || "Internal Server Error",
    });
  }
};


const getMQTTStatus = async (req, res) => {
  try {
    const status = mqttService.getStatus();
    
    // Get count of devices receiving MQTT data (last hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const activeDevices = await solarcharger.findAll({
      where: {
        RecordTime: { [Op.gte]: oneHourAgo },
        IP: "MQTT"
      },
      attributes: ['UID'],
      group: ['UID']
    });

    res.status(200).json({
      status: 200,
      message: 'MQTT status fetched successfully',
      mqttConnection: status,
      activeDevicesLastHour: activeDevices.length,
      devices: activeDevices.map(d => d.UID)
    });
  } catch (error) {
    console.error("Error fetching MQTT status:", error);
    return res.status(500).json({
      status: 500,
      message: error.message || "Internal Server Error",
    });
  }
};


const getDataStatistics = async (req, res) => {
  try {
    const totalRecords = await solarcharger.count();
    const mqttRecords = await solarcharger.count({ where: { IP: "MQTT" } });
    const manualRecords = totalRecords - mqttRecords;

    const uniqueDevices = await solarcharger.findAll({
      attributes: ['UID'],
      group: ['UID']
    });

    const latestRecord = await solarcharger.findOne({
      order: [['RecordTime', 'DESC']]
    });

    res.status(200).json({
      status: 200,
      message: 'Statistics fetched successfully',
      statistics: {
        totalRecords,
        mqttRecords,
        manualRecords,
        uniqueDevices: uniqueDevices.length,
        latestRecordTime: latestRecord ? latestRecord.RecordTime : null,
        mqttStatus: mqttService.getStatus()
      }
    });
  } catch (error) {
    console.error("Error fetching statistics:", error);
    return res.status(500).json({
      status: 500,
      message: error.message || "Internal Server Error",
    });
  }
};

module.exports = { 
  createSolarCharger, 
  getAllSolarCharger, 
  getSolarChargerById,
  getLatestSolarCharger,
  getMQTTStatus,
  getRealtimeData,
  getDataByUID,
  getDataStatistics
};












// const db = require("../../DB/config");
// const solarcharger = db.solarCharger;
// const { Op } = require("sequelize");

// // --------------------- Create Solar Charger ---------------------
// const createSolarCharger = async (req, res) => {
//   try {
//     console.log('Received payload:', JSON.stringify(req.body, null, 2));

//     const { UID, data = [] } = req.body;

//     if (!UID || !Array.isArray(data) || data.length === 0) {
//       return res.status(400).json({
//         status: 400,
//         message: "UID and data array are required",
//       });
//     }

//     const roundToSecond = (date) =>
//       new Date(Math.floor(new Date(date).getTime() / 1000) * 1000);

//     const validateValue = (val) => {
//       const num = parseFloat(val);
//       return !isNaN(num) && num <= 30 ? num : 0;
//     };

//     const dataArray = data.map((item) => ({
//       Location: UID,
//       UID,
//       PvVolt: item.PvVolt ? validateValue(item.PvVolt) : null,
//       PvCur: item.PvCur ? validateValue(item.PvCur) : null,
//       BatVoltage: item.BatVoltage ? validateValue(item.BatVoltage) : null,
//       BatCurrent: item.BatCurrent ? validateValue(item.BatCurrent) : null,
//       LoadVoltage: item.LoadVoltage ? validateValue(item.LoadVoltage) : null,
//       LoadCurrent: item.LoadCurrent ? validateValue(item.LoadCurrent) : null,
//       BatKWh: item.BatKWh ? validateValue(item.BatKWh) : null,
//       PVKWh: item.PVKWh ? validateValue(item.PVKWh) : null,
//       Temperature: item.Temperature ? parseFloat(item.Temperature) : null,
//       RecordTime: roundToSecond(item.RecordTime),
//       Time: new Date(),
//       IP: item.IP || req.ip || "Not Set",
//     }));

//     // Avoid duplicate RecordTime
//     const recordTimesToCheck = dataArray.map(d => d.RecordTime);
//     const existingRecords = await solarcharger.findAll({
//       where: {
//         UID,
//         RecordTime: { [Op.in]: recordTimesToCheck }
//       },
//       attributes: ["RecordTime"]
//     });

//     const existingTimes = new Set(
//       existingRecords.map(r => roundToSecond(r.RecordTime).toISOString())
//     );

//     const filteredDataArray = dataArray.filter(
//       d => !existingTimes.has(roundToSecond(d.RecordTime).toISOString())
//     );

//     if (filteredDataArray.length === 0) {
//       return res.status(200).json({
//         status: 200,
//         message: "No new records to insert. All entries already exist.",
//         inserted: 0,
//         data: [],
//       });
//     }

//     const insertedData = await solarcharger.bulkCreate(filteredDataArray, { returning: true });

//     return res.status(200).json({
//       status: 200,
//       message: "Solar charger data inserted successfully",
//       inserted: insertedData.length,
//       data: insertedData,
//     });

//   } catch (error) {
//     console.error("Error inserting solar charger data:", error);
//     return res.status(500).json({
//       status: 500,
//       message: "Internal Server Error",
//       error: error.message,
//     });
//   }
// };

// // --------------------- Get All Solar Charger ---------------------
// const getAllSolarCharger = async (req, res) => {
//   try {
//     const allChargerData = await solarcharger.findAll();

//     if (!allChargerData || allChargerData.length === 0) {
//       return res.status(404).json({
//         status: 404,
//         message: 'No solar charger data found'
//       });
//     }

//     res.status(200).json({
//       status: 200,
//       message: 'Solar charger data fetched successfully',
//       count: allChargerData.length,
//       info: allChargerData.map(item => ({
//         ID: item.ID,
//         Location: item.Location,
//         UID: item.UID,
//         BatVoltage: item.BatVoltage,
//         BatCurrent: item.BatCurrent,
//         PvVolt: item.PvVolt,
//         PvCur: item.PvCur,
//         LoadVoltage: item.LoadVoltage,
//         LoadCurrent: item.LoadCurrent,
//         BatKWh: item.BatKWh,
//         PVKWh: item.PVKWh,
//         Temperature: item.Temperature,
//         Time: item.Time,
//         RecordTime: item.RecordTime,
//         IP: item.IP
//       }))
//     });

//   } catch (error) {
//     console.error("Error fetching solar charger data:", error);
//     return res.status(500).json({
//       status: 500,
//       error: true,
//       message: error.message || 'Internal Server Error'
//     });
//   }
// };

// // --------------------- Get Solar Charger By ID ---------------------
// const getSolarChargerById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const chargerData = await solarcharger.findOne({ where: { ID: id } });

//     if (!chargerData) {
//       return res.status(404).json({
//         status: 404,
//         message: "Device not found",
//       });
//     }

//     res.status(200).json({
//       status: 200,
//       message: "Solar charger data fetched successfully",
//       data: {
//         ID: chargerData.ID,
//         UID: chargerData.UID,
//         Location: chargerData.Location,
//         PvVolt: chargerData.PvVolt,
//         PvCur: chargerData.PvCur,
//         BatVoltage: chargerData.BatVoltage,
//         BatCurrent: chargerData.BatCurrent,
//         LoadVoltage: chargerData.LoadVoltage,
//         LoadCurrent: chargerData.LoadCurrent,
//         BatKWh: chargerData.BatKWh,
//         PVKWh: chargerData.PVKWh,
//         Temperature: chargerData.Temperature,
//         Time: chargerData.Time,
//         RecordTime: chargerData.RecordTime,
//         IP: chargerData.IP
//       }
//     });
//   } catch (error) {
//     console.error("Error fetching solar charger by ID:", error);
//     return res.status(500).json({
//       status: 500,
//       message: error.message || "Internal Server Error",
//     });
//   }
// };

// module.exports = { createSolarCharger, getAllSolarCharger, getSolarChargerById };
