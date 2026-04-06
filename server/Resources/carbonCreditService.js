const db = require("../DB/config");
const { Op } = require("sequelize");

const SolarCharger = db.solarCharger;
const NewDevice = db.newdevicelocationdetails;

// Carbon credit conversion factors
const CARBON_FACTORS = {
    CO2_PER_KWH: 0.5, // kg CO2 saved per kWh
    KG_PER_CREDIT: 1000, // 1 carbon credit = 1000 kg CO2
    CO2_PER_TREE_PER_YEAR: 22 // 1 tree absorbs 22kg CO2 per year
};

const calculateCarbonCredits = (pvKWh) => {
    if (!pvKWh || pvKWh <= 0) {
        return {
            totalPVKWh: 0,
            totalCO2Saved: 0,
            totalCarbonCredits: 0,
            equivalentTrees: 0
        };
    }
    
    const totalCO2Saved = pvKWh * CARBON_FACTORS.CO2_PER_KWH;
    const totalCarbonCredits = totalCO2Saved / CARBON_FACTORS.KG_PER_CREDIT;
    const equivalentTrees = totalCO2Saved / CARBON_FACTORS.CO2_PER_TREE_PER_YEAR;
    
    return {
        totalPVKWh: parseFloat(pvKWh.toFixed(2)),
        totalCO2Saved: parseFloat(totalCO2Saved.toFixed(2)),
        totalCarbonCredits: parseFloat(totalCarbonCredits.toFixed(4)),
        equivalentTrees: parseFloat(equivalentTrees.toFixed(2))
    };
};

/**
 * Get total PVKWh for all devices (CUMULATIVE DATA FIX)
 * For cumulative data, we need the LATEST value for each device, then sum them
 */
const getTotalPVKWhForAllDevices = async () => {
    // Get latest PVKWh for each unique UID
    const latestRecords = await SolarCharger.findAll({
        attributes: [
            'UID',
            [db.sequelize.fn('MAX', db.sequelize.col('RecordTime')), 'latestTime']
        ],
        group: ['UID']
    });
    
    let total = 0;
    for (const record of latestRecords) {
        const latestValue = await SolarCharger.findOne({
            where: { 
                UID: record.UID,
                RecordTime: record.dataValues.latestTime
            },
            attributes: ['PVKWh']
        });
        total += latestValue?.PVKWh || 0;
    }
    
    return total;
};

/**
 * Get total PVKWh for specific donor (CUMULATIVE DATA FIX)
 */
const getTotalPVKWhByDonor = async (donorId) => {
    const devices = await NewDevice.findAll({
        where: { donor_id: donorId },
        attributes: ['UID']
    });
    
    const uids = devices.map(d => d.UID);
    if (uids.length === 0) return 0;
    
    // Get latest PVKWh for each device
    let total = 0;
    for (const uid of uids) {
        const latestRecord = await SolarCharger.findOne({
            where: { UID: uid },
            order: [['RecordTime', 'DESC']],
            attributes: ['PVKWh']
        });
        total += latestRecord?.PVKWh || 0;
    }
    
    return total;
};

/**
 * Get total PVKWh for specific REW (CUMULATIVE DATA FIX)
 */
const getTotalPVKWhByREW = async (rewId) => {
    const devices = await NewDevice.findAll({
        where: { rew_id: rewId },
        attributes: ['UID']
    });
    
    const uids = devices.map(d => d.UID);
    if (uids.length === 0) return 0;
    
    // Get latest PVKWh for each device
    let total = 0;
    for (const uid of uids) {
        const latestRecord = await SolarCharger.findOne({
            where: { UID: uid },
            order: [['RecordTime', 'DESC']],
            attributes: ['PVKWh']
        });
        total += latestRecord?.PVKWh || 0;
    }
    
    return total;
};

/**
 * Get total PVKWh for specific device (CUMULATIVE DATA FIX)
 * For cumulative data: Total = Latest value (not sum)
 */
const getTotalPVKWhByDevice = async (uid) => {
    const latestRecord = await SolarCharger.findOne({
        where: { UID: uid },
        order: [['RecordTime', 'DESC']],
        attributes: ['PVKWh']
    });
    
    return latestRecord?.PVKWh || 0;
};

/**
 * Get PVKWh for date range (CUMULATIVE DATA FIX)
 * For cumulative data, we need first and last value in date range
 */
const getPVKWhByDateRange = async (startDate, endDate, uid = null) => {
    const whereCondition = {
        RecordTime: {
            [Op.between]: [startDate, endDate]
        }
    };
    
    if (uid) {
        whereCondition.UID = uid;
    }
    
    // Get first and last record in date range
    const firstRecord = await SolarCharger.findOne({
        where: whereCondition,
        order: [['RecordTime', 'ASC']],
        attributes: ['PVKWh', 'RecordTime']
    });
    
    const lastRecord = await SolarCharger.findOne({
        where: whereCondition,
        order: [['RecordTime', 'DESC']],
        attributes: ['PVKWh', 'RecordTime']
    });
    
    if (!firstRecord || !lastRecord) return 0;
    
    // Calculate generation = last - first
    const generated = (lastRecord.PVKWh || 0) - (firstRecord.PVKWh || 0);
    return Math.max(0, generated);
};

/**
 * Get detailed carbon credit report for all devices (CUMULATIVE DATA FIX)
 */
const getCarbonCreditReport = async () => {
    // Get total PVKWh using cumulative logic
    const totalPVKWh = await getTotalPVKWhForAllDevices();
    
    const deviceCount = await NewDevice.count();
    
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    
    const activeDevices = await SolarCharger.findAll({
        where: {
            RecordTime: { [Op.gte]: sixtyDaysAgo }
        },
        attributes: ['UID'],
        group: ['UID']
    });
    
    const monthlyData = await getMonthlyPVKWhBreakdown();
    const carbonData = calculateCarbonCredits(totalPVKWh);
    
    return {
        summary: {
            ...carbonData,
            totalDevices: deviceCount,
            activeDevices: activeDevices.length,
            inactiveDevices: deviceCount - activeDevices.length
        },
        monthlyBreakdown: monthlyData,
        conversionFactors: CARBON_FACTORS,
        lastUpdated: new Date()
    };
};

/**
 * Get monthly PVKWh breakdown (CUMULATIVE DATA FIX)
 */
const getMonthlyPVKWhBreakdown = async (year = null) => {
    const targetYear = year || new Date().getFullYear();
    const startOfYear = new Date(targetYear, 0, 1);
    const endOfYear = new Date(targetYear, 11, 31);
    
    // Get all records for the year
    const allRecords = await SolarCharger.findAll({
        where: {
            RecordTime: {
                [Op.between]: [startOfYear, endOfYear]
            }
        },
        attributes: ['UID', 'PVKWh', 'RecordTime'],
        order: [['RecordTime', 'ASC']]
    });
    
    // Group by UID and calculate monthly generation
    const monthlyMap = new Map();
    
    // Group records by UID
    const deviceRecords = new Map();
    for (const record of allRecords) {
        if (!deviceRecords.has(record.UID)) {
            deviceRecords.set(record.UID, []);
        }
        deviceRecords.get(record.UID).push(record);
    }
    
    // Calculate generation per month per device
    for (const [uid, records] of deviceRecords) {
        let previousRecord = null;
        for (const record of records) {
            if (previousRecord) {
                const month = record.RecordTime.toISOString().slice(0, 7);
                const generation = (record.PVKWh || 0) - (previousRecord.PVKWh || 0);
                
                if (generation > 0) {
                    if (!monthlyMap.has(month)) {
                        monthlyMap.set(month, 0);
                    }
                    monthlyMap.set(month, monthlyMap.get(month) + generation);
                }
            }
            previousRecord = record;
        }
    }
    
    // Convert to array and sort
    const monthlyData = Array.from(monthlyMap.entries())
        .map(([month, totalPVKWh]) => ({
            month,
            totalPVKWh: parseFloat(totalPVKWh.toFixed(2)),
            carbonCredits: calculateCarbonCredits(totalPVKWh).totalCarbonCredits
        }))
        .sort((a, b) => a.month.localeCompare(b.month));
    
    return monthlyData;
};

/**
 * Get top performing devices by PVKWh (CUMULATIVE DATA FIX)
 */
const getTopDevicesByPVKWh = async (limit = 10) => {
    // Get latest PVKWh for each device
    const devices = await SolarCharger.findAll({
        attributes: ['UID'],
        group: ['UID']
    });
    
    const deviceTotals = [];
    for (const device of devices) {
        const latestRecord = await SolarCharger.findOne({
            where: { UID: device.UID },
            order: [['RecordTime', 'DESC']],
            attributes: ['PVKWh']
        });
        
        if (latestRecord && latestRecord.PVKWh > 0) {
            deviceTotals.push({
                uid: device.UID,
                totalPVKWh: latestRecord.PVKWh
            });
        }
    }
    
    // Sort by totalPVKWh descending
    deviceTotals.sort((a, b) => b.totalPVKWh - a.totalPVKWh);
    const topDevices = deviceTotals.slice(0, parseInt(limit));
    
    // Get device details
    const devicesWithDetails = await Promise.all(
        topDevices.map(async (device) => {
            const deviceInfo = await NewDevice.findOne({
                where: { UID: device.uid },
                attributes: ['ID', 'NameOfBeneficiary', 'Location', 'VillageName', 'donor_id']
            });
            
            const carbonData = calculateCarbonCredits(device.totalPVKWh);
            
            return {
                uid: device.uid,
                deviceInfo: deviceInfo || {},
                totalPVKWh: parseFloat(device.totalPVKWh.toFixed(2)),
                ...carbonData
            };
        })
    );
    
    return devicesWithDetails;
};

module.exports = {
    calculateCarbonCredits,
    getTotalPVKWhForAllDevices,
    getTotalPVKWhByDonor,
    getTotalPVKWhByREW,
    getTotalPVKWhByDevice,
    getPVKWhByDateRange,
    getCarbonCreditReport,
    getMonthlyPVKWhBreakdown,
    getTopDevicesByPVKWh,
    CARBON_FACTORS
};