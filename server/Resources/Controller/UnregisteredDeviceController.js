const db = require("../../DB/config");
const { Op } = require("sequelize");

// Models
const UnregisteredDevice = db.unregisteredDevices;
const NewDevice = db.newdevicelocationdetails;

// ✅ Get Unregistered Devices (excluding those that are now registered)
const getUnregisteredDevices = async (req, res) => {
    try {
        // First, get all UIDs from the registered devices table
        const registeredDevices = await NewDevice.findAll({
            attributes: ['UID'],
            raw: true
        });
        
        // Extract the UIDs into an array
        const registeredUIDs = registeredDevices.map(device => device.UID);
        
        // Define the where condition - if there are registered UIDs, exclude them
        let whereCondition = {};
        if (registeredUIDs.length > 0) {
            whereCondition = {
                UID: {
                    [Op.notIn]: registeredUIDs
                }
            };
        }
        
        // Get unregistered devices that are not in the registered devices list
        const devices = await UnregisteredDevice.findAll({
            where: whereCondition,
            order: [["lastSeen", "DESC"]],
        });

        // If no devices found (all are registered or no unregistered devices exist)
        if (devices.length === 0) {
            return res.status(200).json({
                status: 200,
                message: "No unregistered devices found or all devices are registered",
                count: 0,
                devices: [],
            });
        }

        return res.status(200).json({
            status: 200,
            message: "Unregistered devices fetched successfully",
            count: devices.length,
            devices,
        });
    } catch (error) {
        console.error("Get Unregistered Devices Error:", error);
        return res.status(500).json({
            status: 500,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};

module.exports = {
    getUnregisteredDevices
};