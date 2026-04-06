const db = require("../../DB/config");
const { Op } = require("sequelize");
const path = require('path');
const fs = require('fs');

const Rew = db.rew;
const NewDevice = db.newdevicelocationdetails;
const SolarCharger = db.solarCharger;

// Helper: check if device is active (within 60 days)
const getDeviceStatus = (recordTime) => {
    if (!recordTime) return 'inactive';

    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    return new Date(recordTime) > sixtyDaysAgo ? 'active' : 'inactive';
};

// Helper: add status to devices
const addStatusToDevices = async (devices) => {
    if (!devices || devices.length === 0) return devices;
    return await Promise.all(
        devices.map(async (device) => {
            const latestSolarRecord = await SolarCharger.findOne({
                where: { UID: device.UID },
                order: [['RecordTime', 'DESC']],
                attributes: ['RecordTime']
            });
            device.status = getDeviceStatus(latestSolarRecord?.RecordTime);
            return device;
        })
    );
};

// Helper: parse photos from DB (stored as JSON string of filenames only)
const parsePhotos = (photos) => {
    if (!photos) return [];
    try {
        if (Array.isArray(photos)) return photos;
        if (typeof photos === 'string') {
            const parsed = JSON.parse(photos);
            return Array.isArray(parsed) ? parsed : [parsed];
        }
    } catch (e) {
        return photos ? [photos] : [];
    }
    return [];
};

// Helper: delete a rew photo file by filename
const deleteRewPhotoFile = (filename) => {
    try {
        // Handle both old format (/files/rew-photos/name.jpg) and new format (name.jpg)
        const cleanFilename = filename.replace(/^.*[\\/]/, ''); // extract just filename
        const fullPath = path.join(process.cwd(), 'files', 'rew-photos', cleanFilename);
        if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
            console.log(`✅ Deleted: ${fullPath}`);
        }
    } catch (err) {
        console.log("Error deleting photo:", err.message);
    }
};

// ============================================================
// CREATE REW WITH MULTIPLE PHOTOS (MAX 5)
// ============================================================
const createRew = async (req, res) => {
    try {
        const { rew_name, rew_phone } = req.body;

        const cleanName = rew_name ? rew_name.replace(/^"|"$/g, '') : '';
        const cleanPhone = rew_phone ? rew_phone.replace(/^"|"$/g, '') : '';

        if (!cleanName) {
            return res.status(400).json({ status: 400, message: "rew_name is required" });
        }

        // Store ONLY filenames (not full paths)
        let rew_photos = [];
        if (req.files && req.files.length > 0) {
            const filesToUpload = req.files.slice(0, 5);
            rew_photos = filesToUpload.map(file => file.filename); // ✅ filename only
            if (req.files.length > 5) {
                console.log(`⚠️ Received ${req.files.length} photos, only first 5 saved`);
            }
        }

        const newRew = await Rew.create({
            rew_name: cleanName,
            rew_phone: cleanPhone,
            rew_photos: rew_photos.length > 0 ? JSON.stringify(rew_photos) : null
        });

        const rewJson = newRew.toJSON();
        rewJson.rew_photos = parsePhotos(rewJson.rew_photos);

        res.status(201).json({
            status: 201,
            message: "REW created successfully",
            data: {
                id: rewJson.id,
                rew_name: rewJson.rew_name,
                rew_phone: rewJson.rew_phone,
                rew_photos: rewJson.rew_photos, // returns ["filename.jpg", ...]
                created_at: rewJson.created_at
            }
        });
    } catch (error) {
        console.error("Create Rew Error:", error);
        res.status(500).json({ status: 500, message: "Internal Server Error", error: error.message });
    }
};

// ============================================================
// GET ALL REW WITH ASSOCIATED DEVICES
// ============================================================
const getAllRew = async (req, res) => {
    try {
        const rews = await Rew.findAll({
            include: [{
                model: NewDevice,
                as: 'devices',
                attributes: [
                    'ID', 'UID', 'Location', 'CLocation', 'VillageName',
                    'DonarName', 'InstallationDate', 'NameOfBeneficiary',
                    'BeneficiaryPno', 'SolarEngineerName', 'SolarEngineerPno',
                    'GCName', 'GCPhoneNumber', 'Country', 'State',
                    'District', 'Block', 'PanchayatSamiti', 'createdAt', 'updatedAt'
                ],
                required: false
            }],
            order: [['created_at', 'DESC']]
        });

        if (rews.length === 0) {
            return res.status(404).json({ status: 404, message: "No rew entries found" });
        }

        const rewsWithDetails = await Promise.all(
            rews.map(async (rew) => {
                const rewJson = rew.toJSON();
                rewJson.rew_photos = parsePhotos(rewJson.rew_photos);
                if (rewJson.devices && rewJson.devices.length > 0) {
                    rewJson.devices = await addStatusToDevices(rewJson.devices);
                }
                return rewJson;
            })
        );

        res.status(200).json({
            status: 200,
            message: "REW entries fetched successfully with associated devices",
            count: rewsWithDetails.length,
            data: rewsWithDetails
        });
    } catch (error) {
        console.error("Get All Rew Error:", error);
        res.status(500).json({ status: 500, message: "Internal Server Error", error: error.message });
    }
};

// ============================================================
// GET REW BY ID WITH ASSOCIATED DEVICES
// ============================================================
const getRewById = async (req, res) => {
    try {
        const { id } = req.params;

        const rew = await Rew.findByPk(id, {
            include: [{
                model: NewDevice,
                as: 'devices',
                attributes: [
                    'ID', 'UID', 'Location', 'CLocation', 'VillageName',
                    'DonarName', 'InstallationDate', 'NameOfBeneficiary',
                    'BeneficiaryPno', 'SolarEngineerName', 'SolarEngineerPno',
                    'GCName', 'GCPhoneNumber', 'Country', 'State',
                    'District', 'Block', 'PanchayatSamiti', 'createdAt', 'updatedAt'
                ]
            }]
        });

        if (!rew) {
            return res.status(404).json({ status: 404, message: "REW entry not found" });
        }

        const rewJson = rew.toJSON();
        rewJson.rew_photos = parsePhotos(rewJson.rew_photos);

        if (rewJson.devices && rewJson.devices.length > 0) {
            rewJson.devices = await addStatusToDevices(rewJson.devices);
        }

        res.status(200).json({
            status: 200,
            message: "REW entry fetched successfully with associated devices",
            data: rewJson
        });
    } catch (error) {
        console.error("Get Rew By ID Error:", error);
        res.status(500).json({ status: 500, message: "Internal Server Error", error: error.message });
    }
};

// ============================================================
// UPDATE REW (WITH PHOTO REPLACEMENT)
// ============================================================
const updateRew = async (req, res) => {
    try {
        const { id } = req.params;
        const { rew_name, rew_phone } = req.body;

        const rew = await Rew.findByPk(id);
        if (!rew) {
            return res.status(404).json({ status: 404, message: "REW not found" });
        }

        const updateData = {};
        if (rew_name) updateData.rew_name = rew_name.replace(/^"|"$/g, '');
        if (rew_phone) updateData.rew_phone = rew_phone.replace(/^"|"$/g, '');

        if (req.files && req.files.length > 0) {
            // Delete old photo files
            const oldPhotos = parsePhotos(rew.rew_photos);
            oldPhotos.forEach(filename => deleteRewPhotoFile(filename));

            // Store only filenames for new photos
            const filesToUpload = req.files.slice(0, 5);
            const newPhotos = filesToUpload.map(file => file.filename); // ✅ filename only
            updateData.rew_photos = JSON.stringify(newPhotos);
        }

        await rew.update(updateData);

        const updatedRew = rew.toJSON();
        updatedRew.rew_photos = parsePhotos(updatedRew.rew_photos);

        res.status(200).json({
            status: 200,
            message: "REW updated successfully",
            data: {
                id: updatedRew.id,
                rew_name: updatedRew.rew_name,
                rew_phone: updatedRew.rew_phone,
                rew_photos: updatedRew.rew_photos,
                updated_at: updatedRew.updated_at
            }
        });
    } catch (error) {
        console.error("Update Rew Error:", error);
        res.status(500).json({ status: 500, message: "Internal Server Error", error: error.message });
    }
};

// ============================================================
// DELETE REW
// ============================================================
const deleteRew = async (req, res) => {
    try {
        const { id } = req.params;
        const rew = await Rew.findByPk(id);

        if (!rew) {
            return res.status(404).json({ status: 404, message: "REW not found" });
        }

        // Delete all associated photo files
        const photos = parsePhotos(rew.rew_photos);
        photos.forEach(filename => deleteRewPhotoFile(filename));

        await rew.destroy();

        res.status(200).json({ status: 200, message: "REW deleted successfully" });
    } catch (error) {
        console.error("Delete Rew Error:", error);
        res.status(500).json({ status: 500, message: "Internal Server Error", error: error.message });
    }
};

// ============================================================
// ADD MORE PHOTOS (APPEND)
// ============================================================
const addPhotosToRew = async (req, res) => {
    try {
        const { id } = req.params;
        const rew = await Rew.findByPk(id);

        if (!rew) {
            return res.status(404).json({ status: 404, message: "REW not found" });
        }

        const existingPhotos = parsePhotos(rew.rew_photos);

        if (req.files && req.files.length > 0) {
            if (existingPhotos.length + req.files.length > 5) {
                return res.status(400).json({
                    status: 400,
                    message: `Cannot add ${req.files.length} photos. Maximum 5 allowed. Current: ${existingPhotos.length}`
                });
            }

            const newPhotos = req.files.map(file => file.filename); // ✅ filename only
            const allPhotos = [...existingPhotos, ...newPhotos];
            await rew.update({ rew_photos: JSON.stringify(allPhotos) });
        }

        const updatedRew = (await Rew.findByPk(id)).toJSON();
        updatedRew.rew_photos = parsePhotos(updatedRew.rew_photos);

        res.status(200).json({
            status: 200,
            message: "Photos added successfully",
            data: updatedRew.rew_photos
        });
    } catch (error) {
        console.error("Add Photos Error:", error);
        res.status(500).json({ status: 500, message: "Internal Server Error", error: error.message });
    }
};

// ============================================================
// REMOVE SPECIFIC PHOTOS
// ============================================================
const removePhotosFromRew = async (req, res) => {
    try {
        const { id } = req.params;
        const { photo_paths } = req.body; // expects array of filenames e.g. ["filename.jpg"]

        const rew = await Rew.findByPk(id);
        if (!rew) {
            return res.status(404).json({ status: 404, message: "REW not found" });
        }

        if (!photo_paths || !Array.isArray(photo_paths)) {
            return res.status(400).json({ status: 400, message: "photo_paths must be an array of filenames" });
        }

        const existingPhotos = parsePhotos(rew.rew_photos);

        // Delete the files
        photo_paths.forEach(filename => deleteRewPhotoFile(filename));

        // Keep photos not in remove list
        const photosToKeep = existingPhotos.filter(photo => !photo_paths.includes(photo));

        await rew.update({
            rew_photos: photosToKeep.length > 0 ? JSON.stringify(photosToKeep) : null
        });

        res.status(200).json({
            status: 200,
            message: `${photo_paths.length} photo(s) removed successfully`,
            remaining_photos: photosToKeep
        });
    } catch (error) {
        console.error("Remove Photos Error:", error);
        res.status(500).json({ status: 500, message: "Internal Server Error", error: error.message });
    }
};

module.exports = {
    createRew,
    getAllRew,
    getRewById,
    updateRew,
    deleteRew,
    addPhotosToRew,
    removePhotosFromRew
};