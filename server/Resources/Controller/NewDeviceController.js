
const db = require("../../DB/config");
const { Op } = require("sequelize");
const carbonCreditService = require("../carbonCreditService");

const NewDevice = db.newdevicelocationdetails;
const SolarCharger = db.solarCharger;
const Rew = db.rew;
const Donor = db.donorSchema;

// Helper function to check if device is active based on RecordTime (60 days period)
const getDeviceStatus = (recordTime) => {
    if (!recordTime) return 'inactive';
    
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    
    const lastRecordTime = new Date(recordTime);
    return lastRecordTime > sixtyDaysAgo ? 'active' : 'inactive';
};

// Helper function to get devices with their latest RecordTime and status
const getDevicesWithStatus = async (devices) => {
    const devicesWithStatus = await Promise.all(
        devices.map(async (device) => {
            const deviceJson = device.toJSON ? device.toJSON() : device;
            
            // Find the latest solar charger record for this UID
            const latestSolarRecord = await SolarCharger.findOne({
                where: { UID: device.UID },
                order: [['RecordTime', 'DESC']],
                attributes: ['RecordTime']
            });
            
            // Add status field based on 30 days period
            deviceJson.status = getDeviceStatus(latestSolarRecord?.RecordTime);
            
            return deviceJson;
        })
    );
    
    return devicesWithStatus;
};
// Helper function to detect device type
const getDeviceType = (uid, location) => {
    if (!uid || !location) return "offlineDevice";

    return uid.trim().toUpperCase() === location.trim().toUpperCase()
        ? "offlineDevice"
        : "onlineDevice";
};


// ============================================================
// CREATE DEVICE (with donor_id and rew_id)
// ============================================================
const createNewDevice = async (req, res) => {
    const transaction = await db.sequelize.transaction();
    
    try {
        const {
            UID,
            Country,
            State,
            District,
            Block,
            VillageName,
            NameOfBeneficiary,
            BeneficiaryPno,
            Location,
            CLocation,
            SolarEngineerName,
            SolarEngineerPno,
            GCName,
            GCPhoneNumber,
            InstallationDate,
            PanchayatSamiti,
            rew_id,
            donor_id  // Changed from DonarName to donor_id
        } = req.body;

        // Validate required fields
        if (!UID) {
            await transaction.rollback();
            return res.status(400).json({ status: 400, message: "UID is required" });
        }

        // Check for duplicate UID
        const existingDevice = await NewDevice.findOne({ where: { UID: UID } });
        if (existingDevice) {
            await transaction.rollback();
            return res.status(409).json({
                status: 409,
                message: "Duplicate UID: A device with this UID already exists",
                existingDevice
            });
        }

        // If rew_id is provided, check if REW exists
        if (rew_id) {
            const rewExists = await Rew.findByPk(rew_id, { transaction });
            if (!rewExists) {
                await transaction.rollback();
                return res.status(404).json({
                    status: 404,
                    message: "REW entry not found with the provided ID"
                });
            }
        }

        // If donor_id is provided, check if Donor exists
        if (donor_id) {
            const donorExists = await Donor.findByPk(donor_id, { transaction });
            if (!donorExists) {
                await transaction.rollback();
                return res.status(404).json({
                    status: 404,
                    message: "Donor not found with the provided ID"
                });
            }
        }

        // Create new device with donor_id and rew_id
        const newDevice = await NewDevice.create({
            UID,
            Country,
            State,
            District,
            Block,
            VillageName,
            NameOfBeneficiary,
            BeneficiaryPno,
            Location,
            CLocation,
            SolarEngineerName,
            SolarEngineerPno,
            GCName,
            GCPhoneNumber,
            InstallationDate,
            PanchayatSamiti,
            rew_id: rew_id || null,
            donor_id: donor_id || null  // Using donor_id instead of DonarName
        }, { transaction });

        await transaction.commit();

        // Fetch the complete device with its REW and DONOR
        const deviceWithAssociations = await NewDevice.findByPk(newDevice.ID, {
            include: [
                {
                    model: Rew,
                    as: 'rew',
                    attributes: ['id', 'rew_name', 'rew_phone', 'rew_photos']
                },
                {
                    model: Donor,
                    as: 'donor',  // Using the association name from config
                    attributes: ['ID', 'DonarOrganisation',  'Website']
                }
            ]
        });

        const deviceJson = deviceWithAssociations.toJSON();
        
        // Parse REW photos if they exist
        if (deviceJson.rew && deviceJson.rew.rew_photos) {
            try {
                deviceJson.rew.rew_photos = JSON.parse(deviceJson.rew.rew_photos);
            } catch (e) {}
        }
        
        // Get device status
        const latestSolarRecord = await SolarCharger.findOne({
            where: { UID: deviceJson.UID },
            order: [['RecordTime', 'DESC']],
            attributes: ['RecordTime']
        });
        deviceJson.status = getDeviceStatus(latestSolarRecord?.RecordTime);

        // Update donor device count if donor_id exists
        if (donor_id) {
            await updateDonorDeviceCount(donor_id, true);
        }

        res.status(200).json({
            status: 200,
            message: "Device created successfully",
            info: deviceJson
        });

    } catch (error) {
        await transaction.rollback();
        console.error("Create New Device Error:", error);
        res.status(500).json({
            status: 500,
            message: "Internal Server Error",
            error: error.message
        });
    }
};




const getAllNewDevices = async (req, res) => {
    try {
        const devices = await NewDevice.findAll({
            include: [
                {
                    model: Rew,
                    as: "rew",
                    attributes: ["id", "rew_name", "rew_phone", "rew_photos"]
                },
                {
                    model: Donor,
                    as: "donor",
                    attributes: ["ID", "DonarOrganisation", "Country", "Logo"]
                }
            ],
            order: [["createdAt", "DESC"]]
        });

        if (!devices.length) {
            return res.status(404).json({
                status: 404,
                message: "No devices found"
            });
        }

        const uids = devices.map(device => device.UID);
        
        // Get latest record for each device (for cumulative total)
        const latestRecords = await SolarCharger.findAll({
            where: { UID: { [Op.in]: uids } },
            attributes: ['UID', 'PVKWh', 'RecordTime'],
            order: [['RecordTime', 'DESC']]
        });
        
        // Create map for latest records (only first occurrence per UID)
        const latestRecordMap = new Map();
        latestRecords.forEach(record => {
            if (!latestRecordMap.has(record.UID)) {
                latestRecordMap.set(record.UID, {
                    PVKWh: record.PVKWh,
                    RecordTime: record.RecordTime
                });
            }
        });

        const devicesWithStatus = await Promise.all(
            devices.map(async (device) => {
                const deviceJson = device.toJSON();
                const uid = deviceJson.UID;
                
                // Get latest record (this IS the total for cumulative data)
                const latestRecord = latestRecordMap.get(uid);
                const totalPVKWh = latestRecord?.PVKWh || 0; // For cumulative data, latest = total
                
                // Calculate carbon credits
                const carbonData = carbonCreditService.calculateCarbonCredits(totalPVKWh);

                deviceJson.status = getDeviceStatus(latestRecord?.RecordTime);
                deviceJson.latestPVKWh = latestRecord?.PVKWh || 0;
                deviceJson.lastPVKWhUpdate = latestRecord?.RecordTime || null;
                deviceJson.totalPVKWh = totalPVKWh;
                deviceJson.carbonCredits = carbonData;
                deviceJson.deviceType = getDeviceType(deviceJson.UID, deviceJson.Location);

                if (deviceJson.rew && deviceJson.rew.rew_photos) {
                    try {
                        deviceJson.rew.rew_photos = JSON.parse(deviceJson.rew.rew_photos);
                    } catch (e) {}
                }

                return deviceJson;
            })
        );

        return res.status(200).json({
            status: 200,
            message: "Devices fetched successfully",
            count: devicesWithStatus.length,
            info: devicesWithStatus
        });
    } catch (error) {
        console.error("Get All Devices Error:", error);
        return res.status(500).json({
            status: 500,
            message: "Internal Server Error",
            error: error.message
        });
    }
};

// Update getNewDeviceById function:
const getNewDeviceById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                status: 400,
                message: "Device ID is required"
            });
        }

        const device = await NewDevice.findByPk(id, {
            include: [
                {
                    model: Rew,
                    as: "rew",
                    attributes: ["id", "rew_name", "rew_phone", "rew_photos"]
                },
                {
                    model: Donor,
                    as: "donor",
                    attributes: ["ID", "DonarOrganisation", "Website"]
                }
            ]
        });

        if (!device) {
            return res.status(404).json({
                status: 404,
                message: "Device not found"
            });
        }

        const deviceJson = device.toJSON();

        // Parse REW photos
        if (deviceJson.rew && deviceJson.rew.rew_photos) {
            try {
                deviceJson.rew.rew_photos = JSON.parse(deviceJson.rew.rew_photos);
            } catch (e) {}
        }

        // Get latest PVKWh value
        const latestSolarRecord = await SolarCharger.findOne({
            where: { UID: deviceJson.UID },
            order: [["RecordTime", "DESC"]],
            attributes: ['PVKWh', 'RecordTime']
        });

        // Get TOTAL PVKWh for carbon credit calculation
        const totalPVKWh = await carbonCreditService.getTotalPVKWhByDevice(deviceJson.UID);
        const carbonData = carbonCreditService.calculateCarbonCredits(totalPVKWh);

        // Status (active/inactive)
        deviceJson.status = getDeviceStatus(latestSolarRecord?.RecordTime);
        
        // Add PVKWh and carbon credit info
        deviceJson.latestPVKWh = latestSolarRecord?.PVKWh || 0;
        deviceJson.lastPVKWhUpdate = latestSolarRecord?.RecordTime || null;
        deviceJson.totalPVKWh = totalPVKWh;
        deviceJson.carbonCredits = carbonData;

        // Device type (online/offline)
        deviceJson.deviceType = getDeviceType(
            deviceJson.UID,
            deviceJson.Location
        );

        return res.status(200).json({
            status: 200,
            message: "Device fetched successfully",
            info: deviceJson
        });
    } catch (error) {
        console.error("Get Device By ID Error:", error);

        return res.status(500).json({
            status: 500,
            message: "Internal Server Error",
            error: error.message
        });
    }
};

// ============================================================
// UPDATE DEVICE
// ============================================================
const updateNewDevice = async (req, res) => {
    const transaction = await db.sequelize.transaction();
    
    try {
        const { id } = req.params;
        const updateData = req.body;

        if (!id) {
            await transaction.rollback();
            return res.status(400).json({ status: 400, message: "Device ID is required" });
        }

        // Find the device
        const device = await NewDevice.findByPk(id);
        if (!device) {
            await transaction.rollback();
            return res.status(404).json({ status: 404, message: "Device not found" });
        }

        // Store old donor_id for count update
        const oldDonorId = device.donor_id;

        // Check for duplicate UID if UID is being updated
        if (updateData.UID && updateData.UID !== device.UID) {
            const existingDevice = await NewDevice.findOne({
                where: {
                    UID: updateData.UID,
                    ID: { [Op.ne]: id }
                }
            });

            if (existingDevice) {
                await transaction.rollback();
                return res.status(409).json({
                    status: 409,
                    message: "Duplicate UID: A device with this UID already exists"
                });
            }
        }

        // If rew_id is being updated, check if REW exists
        if (updateData.rew_id) {
            const rewExists = await Rew.findByPk(updateData.rew_id, { transaction });
            if (!rewExists) {
                await transaction.rollback();
                return res.status(404).json({
                    status: 404,
                    message: "REW entry not found with the provided ID"
                });
            }
        }

        // If donor_id is being updated, check if Donor exists
        if (updateData.donor_id) {
            const donorExists = await Donor.findByPk(updateData.donor_id, { transaction });
            if (!donorExists) {
                await transaction.rollback();
                return res.status(404).json({
                    status: 404,
                    message: "Donor not found with the provided ID"
                });
            }
        }

        // Update device
        await device.update({
            UID: updateData.UID || device.UID,
            Country: updateData.Country || device.Country,
            State: updateData.State || device.State,
            District: updateData.District || device.District,
            Block: updateData.Block || device.Block,
            VillageName: updateData.VillageName || device.VillageName,
            NameOfBeneficiary: updateData.NameOfBeneficiary || device.NameOfBeneficiary,
            BeneficiaryPno: updateData.BeneficiaryPno || device.BeneficiaryPno,
            Location: updateData.Location || device.Location,
            CLocation: updateData.CLocation || device.CLocation,
            SolarEngineerName: updateData.SolarEngineerName || device.SolarEngineerName,
            SolarEngineerPno: updateData.SolarEngineerPno || device.SolarEngineerPno,
            GCName: updateData.GCName || device.GCName,
            GCPhoneNumber: updateData.GCPhoneNumber || device.GCPhoneNumber,
            InstallationDate: updateData.InstallationDate || device.InstallationDate,
            PanchayatSamiti: updateData.PanchayatSamiti || device.PanchayatSamiti,
            rew_id: updateData.rew_id !== undefined ? updateData.rew_id : device.rew_id,
            donor_id: updateData.donor_id !== undefined ? updateData.donor_id : device.donor_id  // Updated
        }, { transaction });

        await transaction.commit();

        // Update donor counts if donor_id changed
        if (oldDonorId !== device.donor_id) {
            if (oldDonorId) {
                await updateDonorDeviceCount(oldDonorId, false);
            }
            if (device.donor_id) {
                await updateDonorDeviceCount(device.donor_id, true);
            }
        }

        // Fetch updated device with its associations
        const updatedDevice = await NewDevice.findByPk(id, {
            include: [
                {
                    model: Rew,
                    as: 'rew',
                    attributes: ['id', 'rew_name', 'rew_phone', 'rew_photos']
                },
                {
                    model: Donor,
                    as: 'donor',
                    attributes: ['ID', 'DonarOrganisation', ]
                }
            ]
        });

        const deviceJson = updatedDevice.toJSON();
        
        // Parse REW photos
        if (deviceJson.rew && deviceJson.rew.rew_photos) {
            try {
                deviceJson.rew.rew_photos = JSON.parse(deviceJson.rew.rew_photos);
            } catch (e) {}
        }
        
        // Get latest status
        const latestSolarRecord = await SolarCharger.findOne({
            where: { UID: updatedDevice.UID },
            order: [['RecordTime', 'DESC']],
            attributes: ['RecordTime']
        });
        deviceJson.status = getDeviceStatus(latestSolarRecord?.RecordTime);

        return res.status(200).json({
            status: 200,
            message: "Device updated successfully",
            info: deviceJson
        });
    } catch (error) {
        await transaction.rollback();
        console.error("Update Device Error:", error);
        return res.status(500).json({
            status: 500,
            message: "Internal Server Error",
            error: error.message
        });
    }
};

// ============================================================
// DELETE DEVICE
// ============================================================
const deleteNewDevice = async (req, res) => {
    const transaction = await db.sequelize.transaction();

    try {
        const { id } = req.params;

        if (!id) {
            await transaction.rollback();
            return res.status(400).json({ status: 400, message: "Device ID is required" });
        }

        // Find device first
        const device = await NewDevice.findByPk(id);

        if (!device) {
            await transaction.rollback();
            return res.status(404).json({ status: 404, message: "Device not found" });
        }

        const deviceUID = device.UID;
        const donorId = device.donor_id; // Store donor_id for count update

        // Delete all solar charger data with same UID
        await SolarCharger.destroy({
            where: { UID: deviceUID },
            transaction
        });

        // Delete device
        await NewDevice.destroy({
            where: { ID: id },
            transaction
        });

        await transaction.commit();

        // Update donor device count if donor was associated
        if (donorId) {
            await updateDonorDeviceCount(donorId, false);
        }

        return res.status(200).json({
            status: 200,
            message: "Device and related solar charger data deleted successfully."
        });

    } catch (error) {
        await transaction.rollback();
        console.error("Delete Device Error:", error);
        return res.status(500).json({
            status: 500,
            message: "Internal Server Error",
            error: error.message
        });
    }
};

// ============================================================
// GET DEVICES BY DONOR ID
// ============================================================
const getDevicesByDonorId = async (req, res) => {
    try {
        const { donorId } = req.params;

        const devices = await NewDevice.findAll({
            where: { donor_id: donorId },
            include: [
                {
                    model: Donor,
                    as: 'donor',
                    attributes: ['ID', 'DonarOrganisation']
                },
                {
                    model: Rew,
                    as: 'rew',
                    attributes: ['id', 'rew_name']
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        const devicesWithStatus = await getDevicesWithStatus(devices);

        res.status(200).json({
            status: 200,
            message: "Devices fetched successfully for the donor",
            count: devicesWithStatus.length,
            info: devicesWithStatus
        });
    } catch (error) {
        console.error("Get Devices By Donor ID Error:", error);
        res.status(500).json({
            status: 500,
            message: "Internal Server Error",
            error: error.message
        });
    }
};

// ============================================================
// HELPER FUNCTION: Update donor device count
// ============================================================
const updateDonorDeviceCount = async (donorId, increment = true) => {
    try {
        if (!donorId) return;

        const donor = await Donor.findByPk(donorId);

        if (donor) {
            const currentCount = donor.DonorDevice || 0;
            const newCount = increment ? currentCount + 1 : Math.max(0, currentCount - 1);
            
            await donor.update({ DonorDevice: newCount });
            
            console.log(`Donor device count updated for donor ID ${donorId}: ${newCount}`);
        }
    } catch (error) {
        console.error('Error updating donor device count:', error);
    }
};



// ============================================================
// GET DEVICES BY REW ID
// ============================================================
const getDevicesByRewId = async (req, res) => {
    try {
        const { rewId } = req.params;

        const devices = await NewDevice.findAll({
            where: { rew_id: rewId },
            include: [{
                model: Rew,
                as: 'rew',
                attributes: ['id', 'rew_name']
            }],
            order: [['createdAt', 'DESC']]
        });

        const devicesWithStatus = await getDevicesWithStatus(devices);

        res.status(200).json({
            status: 200,
            message: "Devices fetched successfully for the REW",
            count: devicesWithStatus.length,
            info: devicesWithStatus
        });
    } catch (error) {
        console.error("Get Devices By Rew ID Error:", error);
        res.status(500).json({
            status: 500,
            message: "Internal Server Error",
            error: error.message
        });
    }
};
/**
 * Get carbon credit summary for dashboard
 * This is the only carbon credit endpoint you need
 */
const getCarbonCreditSummary = async (req, res) => {
    try {
        // Get the complete carbon credit report
        const report = await carbonCreditService.getCarbonCreditReport();
        
        // Get top 5 performing devices for leaderboard
        const topDevices = await carbonCreditService.getTopDevicesByPVKWh(5);
        
        // Return simplified dashboard data
        res.status(200).json({
            status: 200,
            success: true,
            message: "Carbon credit summary fetched successfully",
            data: {
                summary: report.summary,
                topDevices: topDevices,
                monthlyTrend: report.monthlyBreakdown.slice(-6), // Last 6 months only
                lastUpdated: report.lastUpdated
            }
        });
        
    } catch (error) {
        console.error("Error fetching carbon credit summary:", error);
        res.status(500).json({
            status: 500,
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
};

/**
 * Get carbon credit dashboard statistics
 */
const getCarbonCreditDashboard = async (req, res) => {
    try {
        // Get overall summary
        const summary = await carbonCreditService.getCarbonCreditReport();
        
        // Get top 5 devices
        const topDevices = await carbonCreditService.getTopDevicesByPVKWh(5);
        
        // Get top donors by carbon credits
        const donors = await db.donorSchema.findAll({
            where: { DonorDevice: { [db.Sequelize.Op.gt]: 0 } },
            attributes: ['ID', 'DonarOrganisation', 'DonorDevice']
        });
        
        const donorCarbonData = await Promise.all(
            donors.map(async (donor) => {
                const totalPVKWh = await carbonCreditService.getTotalPVKWhByDonor(donor.ID);
                const carbonData = carbonCreditService.calculateCarbonCredits(totalPVKWh);
                return {
                    donorId: donor.ID,
                    donorName: donor.DonarOrganisation,
                    deviceCount: donor.DonorDevice || 0,
                    ...carbonData
                };
            })
        );
        
        // Sort by carbon credits
        donorCarbonData.sort((a, b) => b.totalCarbonCredits - a.totalCarbonCredits);
        
        res.status(200).json({
            status: 200,
            success: true,
            message: "Carbon credit dashboard data fetched successfully",
            data: {
                summary: summary.summary,
                topDevices: topDevices.slice(0, 5),
                topDonors: donorCarbonData.slice(0, 5),
                monthlyTrend: summary.monthlyBreakdown,
                lastUpdated: new Date()
            }
        });
    } catch (error) {
        console.error("Error fetching carbon credit dashboard:", error);
        res.status(500).json({
            status: 500,
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
};
/**
 * Get carbon credits for a specific donor
 */
const getCarbonCreditsByDonor = async (req, res) => {
    try {
        const { donorId } = req.params;
        
        if (!donorId) {
            return res.status(400).json({
                status: 400,
                success: false,
                message: "Donor ID is required"
            });
        }
        
        const totalPVKWh = await carbonCreditService.getTotalPVKWhByDonor(donorId);
        const carbonData = carbonCreditService.calculateCarbonCredits(totalPVKWh);
        
        // Get donor details
        const donor = await db.donorSchema.findByPk(donorId, {
            attributes: ['ID', 'DonarOrganisation', 'Country']
        });
        
        res.status(200).json({
            status: 200,
            success: true,
            message: "Carbon credits for donor fetched successfully",
            data: {
                donor: donor || {},
                ...carbonData,
                lastUpdated: new Date()
            }
        });
    } catch (error) {
        console.error("Error fetching carbon credits by donor:", error);
        res.status(500).json({
            status: 500,
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
};

module.exports = {
    createNewDevice,
    getAllNewDevices,
    getNewDeviceById,
    updateNewDevice,
    deleteNewDevice,
    getDevicesByDonorId,
    getDevicesByRewId,
    getCarbonCreditSummary,
    getCarbonCreditDashboard,
    getCarbonCreditsByDonor

};
