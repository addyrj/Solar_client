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
  // Handle NaN, null, undefined, empty string
  if (val === null || val === undefined || val === '' || val === 'NaN' || isNaN(val)) {
    return null;
  }
  const num = parseFloat(val);
  return !isNaN(num) && num <= 30 ? num : null; // Return null for invalid values
};

// Check if device exists in newdevicelocationdetails
const checkDeviceExists = async (UID) => {
  const device = await NewDevice.findOne({ where: { UID } });
  return device !== null;
};

// Helper function to check if year is valid (between 2000-2100)
const isValidYear = (year) => {
  return year >= 2000 && year <= 2100;
};

// Helper function to fix invalid dates
const fixInvalidDate = (dateString) => {
  try {
    const recordDate = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(recordDate.getTime())) {
      console.log(`⚠️ Invalid date format: ${dateString}, using current date`);
      return new Date();
    }
    
    const year = recordDate.getFullYear();
    
    // If year is invalid (before 2000), fix it to the current year
    if (!isValidYear(year)) {
      console.log(`⚠️ Invalid year ${year} detected for date: ${dateString}, fixing to current year`);
      
      // Parse the original date components
      const timePart = dateString.split(' ')[0]; // HH:MM:SS
      const datePart = dateString.split(' ')[1]; // DD/MM/YYYY
      
      if (datePart) {
        const [day, month] = datePart.split('/');
        const currentYear = new Date().getFullYear();
        
        // Create new date with current year but same month/day/time
        const fixedDateStr = `${timePart} ${day}/${month}/${currentYear}`;
        const fixedDate = new Date(fixedDateStr);
        
        if (!isNaN(fixedDate.getTime())) {
          console.log(`✅ Fixed date: ${dateString} -> ${fixedDateStr}`);
          return fixedDate;
        }
      }
      
      // If parsing fails, use current date but preserve time
      const currentDate = new Date();
      currentDate.setHours(recordDate.getHours());
      currentDate.setMinutes(recordDate.getMinutes());
      currentDate.setSeconds(recordDate.getSeconds());
      return currentDate;
    }
    
    // Year is valid, return original date
    return recordDate;
    
  } catch (error) {
    console.error(`❌ Error fixing date ${dateString}:`, error);
    return new Date(); // Return current date as fallback
  }
};

// Function to compare two data objects (ignoring time)
const isSameData = (data1, data2) => {
  // Compare all values, treating null/NaN as equal
  const normalizeValue = (val) => {
    if (val === null || val === undefined || val === 'NaN' || isNaN(val)) {
      return null;
    }
    return val;
  };

  return (
    normalizeValue(data1.PvVolt) === normalizeValue(data2.PvVolt) &&
    normalizeValue(data1.PvCur) === normalizeValue(data2.PvCur) &&
    normalizeValue(data1.BatVoltage) === normalizeValue(data2.BatVoltage) &&
    normalizeValue(data1.BatCurrent) === normalizeValue(data2.BatCurrent) &&
    normalizeValue(data1.LoadVoltage) === normalizeValue(data2.LoadVoltage) &&
    normalizeValue(data1.LoadCurrent) === normalizeValue(data2.LoadCurrent) &&
    normalizeValue(data1.BatKWh) === normalizeValue(data2.BatKWh) &&
    normalizeValue(data1.PVKWh) === normalizeValue(data2.PVKWh) &&
    normalizeValue(data1.Temperature) === normalizeValue(data2.Temperature)
  );
};

// ===================== MANUAL DATA UPLOAD =====================

/**
 * Create Solar Charger Data (Manual Upload)
 * This endpoint allows manual data upload for registered devices
 */
const createSolarCharger = async (req, res) => {
  try {
    console.log('📤 Received manual upload payload:', JSON.stringify(req.body, null, 2));

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

    // Get the latest KWh value for this device to ensure progression
    const latestRecord = await solarcharger.findOne({
      where: { UID },
      order: [['RecordTime', 'DESC']]
    });
    
    const lastKWh = latestRecord ? parseFloat(latestRecord.BatKWh) || 0 : 0;
    console.log(`📊 Last KWh value for device ${UID}: ${lastKWh}`);

    // Get the most recent record to check for consecutive duplicates
    const mostRecentRecord = await solarcharger.findOne({
      where: { UID },
      order: [['RecordTime', 'DESC']]
    });

    // Prepare data array with fixed dates and validated values
    const dataArray = data.map((item) => {
      // Fix invalid dates (like 1970, 1972, 1980, etc.)
      const recordTime = fixInvalidDate(item.RecordTime);
      
      // Parse and validate all values (returns null for NaN/invalid)
      const pvVolt = validateValue(item.PvVolt);
      const pvCur = validateValue(item.PvCur);
      const batVoltage = validateValue(item.BatVoltage);
      const batCurrent = validateValue(item.BatCurrent);
      const loadVoltage = validateValue(item.LoadVoltage);
      const loadCurrent = validateValue(item.LoadCurrent);
      let batKWh = item.BatKWh ? parseFloat(item.BatKWh) : null;
      const pvKWh = validateValue(item.PVKWh);
      const temperature = validateValue(item.Temperature);

      // Only use the KWh value if it's greater than or equal to the last known value
      if (batKWh !== null && !isNaN(batKWh)) {
        if (batKWh < lastKWh) {
          console.log(`⚠️ Skipping KWh value ${batKWh} as it's less than last value ${lastKWh}`);
          batKWh = null;
        }
      }

      return {
        Location: UID,
        UID,
        PvVolt: pvVolt,
        PvCur: pvCur,
        BatVoltage: batVoltage,
        BatCurrent: batCurrent,
        LoadVoltage: loadVoltage,
        LoadCurrent: loadCurrent,
        BatKWh: batKWh,
        PVKWh: pvKWh,
        Temperature: temperature,
        RecordTime: roundToSecond(recordTime),
        Time: new Date(),
        IP: item.IP || req.ip || "Manual Upload",
      };
    });

    // Sort by RecordTime to process in chronological order
    dataArray.sort((a, b) => new Date(a.RecordTime) - new Date(b.RecordTime));

    // Fix KWh progression and filter out consecutive duplicates
    let currentKWh = lastKWh;
    let lastValidRecord = mostRecentRecord ? {
      PvVolt: mostRecentRecord.PvVolt,
      PvCur: mostRecentRecord.PvCur,
      BatVoltage: mostRecentRecord.BatVoltage,
      BatCurrent: mostRecentRecord.BatCurrent,
      LoadVoltage: mostRecentRecord.LoadVoltage,
      LoadCurrent: mostRecentRecord.LoadCurrent,
      BatKWh: mostRecentRecord.BatKWh,
      PVKWh: mostRecentRecord.PVKWh,
      Temperature: mostRecentRecord.Temperature
    } : null;

    const uniqueDataArray = [];
    const skippedDuplicates = [];

    for (const item of dataArray) {
      // Fix KWh progression
      if (item.BatKWh === null) {
        item.BatKWh = currentKWh;
      } else {
        currentKWh = item.BatKWh;
      }

      // Check if this record is identical to the last valid record
      if (lastValidRecord && isSameData(item, lastValidRecord)) {
        console.log(`⚠️ Skipping duplicate consecutive data at ${item.RecordTime} - all values same as previous record`);
        skippedDuplicates.push({
          time: item.RecordTime,
          reason: 'consecutive_duplicate',
          values: {
            PvVolt: item.PvVolt,
            PvCur: item.PvCur,
            BatVoltage: item.BatVoltage,
            BatCurrent: item.BatCurrent,
            BatKWh: item.BatKWh
          }
        });
        continue;
      }

      // Check KWh progression
      if (item.BatKWh < lastKWh) {
        console.log(`⚠️ Skipping record with KWh ${item.BatKWh} which is less than last known ${lastKWh}`);
        skippedDuplicates.push({
          time: item.RecordTime,
          reason: 'kwh_decreased'
        });
        continue;
      }

      // If we reach here, this is a valid record
      uniqueDataArray.push(item);
      lastValidRecord = {
        PvVolt: item.PvVolt,
        PvCur: item.PvCur,
        BatVoltage: item.BatVoltage,
        BatCurrent: item.BatCurrent,
        LoadVoltage: item.LoadVoltage,
        LoadCurrent: item.LoadCurrent,
        BatKWh: item.BatKWh,
        PVKWh: item.PVKWh,
        Temperature: item.Temperature
      };
    }

    // Check for existing timestamps in database
    const recordTimesToCheck = uniqueDataArray.map(d => d.RecordTime);
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

    // Final filter - remove any records with existing timestamps
    const finalDataArray = uniqueDataArray.filter(d => {
      const timeKey = roundToSecond(d.RecordTime).toISOString();
      if (existingTimes.has(timeKey)) {
        console.log(`⚠️ Skipping duplicate timestamp: ${d.RecordTime}`);
        skippedDuplicates.push({
          time: d.RecordTime,
          reason: 'duplicate_timestamp'
        });
        return false;
      }
      return true;
    });

    if (finalDataArray.length === 0) {
      return res.status(200).json({
        status: 200,
        message: "No new records to insert. All entries are duplicates.",
        inserted: 0,
        skipped: skippedDuplicates.length,
        skippedDetails: skippedDuplicates,
        lastKWhValue: currentKWh,
        data: [],
      });
    }

    const insertedData = await solarcharger.bulkCreate(finalDataArray, { returning: true });

    return res.status(200).json({
      status: 200,
      message: "✅ Solar charger data inserted successfully (Manual Upload)",
      source: "manual",
      inserted: insertedData.length,
      skipped: skippedDuplicates.length,
      skippedDetails: skippedDuplicates,
      lastKWhValue: currentKWh,
      data: insertedData,
    });

  } catch (error) {
    console.error("❌ Error inserting solar charger data:", error);
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
    const { limit = 100, page = 1, deviceId } = req.query;
    
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