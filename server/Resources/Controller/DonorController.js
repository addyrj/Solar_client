const db = require("../../DB/config");
const { Validator } = require("../Helper/Validator");
const path = require('path');
const fs = require('fs');
const { Op } = require("sequelize");

const Donor = db.donorSchema;
const NewDeviceLocationDetail = db.newdevicelocationdetails;

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../files/donor-logos');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

/**
 * Create a new donor with optional logo
 */
const createDonor = async (req, res, next) => {
    try {
        const { country, organisation, mobile, email, website } = req.body;
        
        // Handle file upload - get filename if file exists
        let logoPath = null;
        
        if (req.file) {
            // Store only the relative path that matches your image serving endpoint
            logoPath = `/images/donor-logos/${req.file.filename}`; // Changed from /files/donor-logos/
        }

        // Validate other fields
        const errorResponse = await Validator(req.body);
        
        if (errorResponse.length !== 0) {
            // If validation fails and file was uploaded, delete it
            if (logoPath && req.file) {
                const fullPath = path.join(__dirname, '../../files/donor-logos', req.file.filename);
                if (fs.existsSync(fullPath)) {
                    fs.unlinkSync(fullPath);
                }
            }
            
            return res.status(300).json({
                status: 300,
                message: errorResponse
            });
        }

        const info = {
            Country: country,
            DonarOrganisation: organisation,
            Mobile: mobile,
            Email: email,
            Website: website,
            Logo: logoPath, // Now stores "/images/donor-logos/filename.jpg"
            DonorDevice: 0
        };

        await Donor.create(info)
            .then((result) => {
                // Convert to JSON and add full URL for logo
                const donorData = result.toJSON();
                if (donorData.Logo) {
                    // If you want to send full URL in API response
                    donorData.Logo = `${req.protocol}://${req.get('host')}/api${donorData.Logo}`;
                }
                
                res.status(200).json({
                    status: 200,
                    message: "Donor is created successfully",
                    info: donorData
                });
            })
            .catch((error) => {
                // If error occurs, delete uploaded file
                if (logoPath && req.file) {
                    const fullPath = path.join(__dirname, '../../files/donor-logos', req.file.filename);
                    if (fs.existsSync(fullPath)) {
                        fs.unlinkSync(fullPath);
                    }
                }

                // Handle unique constraint errors
                if (error.name === 'SequelizeUniqueConstraintError') {
                    const field = error.errors[0].path;
                    let fieldName = field;
                    if (field === 'DonarOrganisation') fieldName = 'Organisation name';
                    if (field === 'Website') fieldName = 'Website';
                    
                    return res.status(300).json({
                        status: 300,
                        message: `Failed! ${fieldName} already exists`
                    });
                }
                
                res.status(300).json({
                    status: 300,
                    message: "Failed! Donor is not created",
                    info: error.message
                });
            });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            error: true,
            message: error.message || error
        });
    }
};

/**
 * Update an existing donor with optional new logo
 */
const updateDonor = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { country, organisation, mobile, email, website } = req.body;

        // Check if donor exists
        const donor = await Donor.findByPk(id);
        
        if (!donor) {
            return res.status(404).json({
                status: 404,
                message: "Donor not found"
            });
        }

        // Handle file upload if new logo is provided
        let logoPath = donor.Logo;
        let oldLogoPath = null;

        if (req.file) {
            // Store new logo path in the correct format
            logoPath = `/images/donor-logos/${req.file.filename}`; // Changed from /files/donor-logos/
            oldLogoPath = donor.Logo;
        }

        // ... rest of validation code ...

        // Update donor information
        const updateInfo = {
            Country: country || donor.Country,
            DonarOrganisation: organisation || donor.DonarOrganisation,
            Mobile: mobile || donor.Mobile,
            Email: email || donor.Email,
            Website: website || donor.Website,
            Logo: logoPath // Now stores "/images/donor-logos/filename.jpg"
        };

        await donor.update(updateInfo)
            .then(async (result) => {
                // Delete old logo file if new one was uploaded
                if (req.file && oldLogoPath) {
                    // Extract filename from old path
                    const oldFilename = oldLogoPath.split('/').pop();
                    const fullOldPath = path.join(__dirname, '../../files/donor-logos', oldFilename);
                    if (fs.existsSync(fullOldPath)) {
                        fs.unlinkSync(fullOldPath);
                    }
                }

                // Get updated device count
                const deviceCount = await NewDeviceLocationDetail.count({
                    where: { donor_id: result.ID } // Using donor_id instead of DonarName
                });

                // Convert to JSON and add full URL for logo
                const donorData = result.toJSON();
                donorData.DonorDevice = deviceCount;
                
                if (donorData.Logo) {
                    donorData.Logo = `${req.protocol}://${req.get('host')}/api${donorData.Logo}`;
                }

                res.status(200).json({
                    status: 200,
                    message: "Donor updated successfully",
                    info: donorData
                });
            })
            .catch((error) => {
                // If error occurs and new file was uploaded, delete it
                if (req.file && logoPath) {
                    const filename = req.file.filename;
                    const fullPath = path.join(__dirname, '../../files/donor-logos', filename);
                    if (fs.existsSync(fullPath)) {
                        fs.unlinkSync(fullPath);
                    }
                }
                
                res.status(300).json({
                    status: 300,
                    message: "Failed! Donor update failed",
                    info: error.message
                });
            });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            error: true,
            message: error.message || error
        });
    }
};

/**
 * Delete a donor and its logo file
 */
const deleteDonor = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Check if donor exists and get logo path
        const donor = await Donor.findByPk(id);
        
        if (!donor) {
            return res.status(404).json({
                status: 404,
                message: "Donor not found"
            });
        }

        // Check if donor has associated devices
        const deviceCount = await NewDeviceLocationDetail.count({
            where: { DonarName: donor.DonarOrganisation }
        });

        if (deviceCount > 0) {
            return res.status(400).json({
                status: 400,
                message: `Cannot delete donor. This donor is associated with ${deviceCount} device(s). Please reassign or delete the devices first.`
            });
        }

        // Store logo path for deletion
        const logoPath = donor.Logo;

        // Delete the donor
        await donor.destroy();

        // Delete logo file if exists
        if (logoPath) {
            const fullPath = path.join(__dirname, '../..', logoPath);
            if (fs.existsSync(fullPath)) {
                fs.unlinkSync(fullPath);
            }
        }

        res.status(200).json({
            status: 200,
            message: "Donor deleted successfully"
        });

    } catch (error) {
        return res.status(500).json({
            status: 500,
            error: true,
            message: error.message || error
        });
    }
};

/**
 * Get all donors with device counts
 */
/**
 * Get all donors with device counts and associated device details
 */
const getAllDonor = async (req, res, next) => {
    try {
        const donors = await Donor.findAll({
            order: [
                ['DonorDevice', 'DESC']
            ]
        });
        
        if (donors.length !== 0) {
            // Get device counts and device details for each donor
            const donorsWithDetails = await Promise.all(donors.map(async (donor) => {
                const donorData = donor.toJSON();
                
                // Get actual device count using donor_id
                const deviceCount = await NewDeviceLocationDetail.count({
                    where: { donor_id: donor.ID }
                });
                
                // Get associated devices with only the specified fields
                const devices = await NewDeviceLocationDetail.findAll({
                    where: { donor_id: donor.ID },
                    attributes: [
                        'ID',
                        'UID',
                        'Location',
                        'CLocation',
                        'VillageName',
                        'District',
                        'Block',
                        'NameOfBeneficiary',
                        'InstallationDate'
                    ],
                    order: [['createdAt', 'DESC']]
                });
                
                donorData.DonorDevice = deviceCount;
                donorData.devices = devices; // Add devices array to response
                
                // Convert stored path to full URL for logo
                if (donorData.Logo) {
                    donorData.Logo = `${req.protocol}://${req.get('host')}/api${donorData.Logo}`;
                }
                
                return donorData;
            }));

            res.status(200).json({
                status: 200,
                message: 'International Donor data fetched successfully with associated devices',
                count: donors.length,
                info: donorsWithDetails
            });
        } else {
            return res.status(404).json({
                status: 404,
                message: 'No donors found'
            });
        }
    } catch (error) {
        return res.status(500).json({
            status: 500,
            error: true,
            message: error.message || error
        });
    }
};

/**
 * Get a single donor by ID with device count and associated devices
 */
const getDonorById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const donor = await Donor.findByPk(id);
        
        if (donor) {
            // Get actual device count using donor_id
            const deviceCount = await NewDeviceLocationDetail.count({
                where: { donor_id: donor.ID }
            });

            // Get all devices associated with this donor
            const devices = await NewDeviceLocationDetail.findAll({
                where: { donor_id: donor.ID },
                attributes: [
                    'ID', 
                    'UID', 
                    'Location', 
                    'CLocation', 
                    'VillageName',
                  
                    'District',
                    'Block',
                    'NameOfBeneficiary',
                    'InstallationDate',
                    
                ],
                order: [['createdAt', 'DESC']]
            });

            const donorData = donor.toJSON();
            donorData.DonorDevice = deviceCount;
            donorData.devices = devices; // Add devices array to response
            
            if (donorData.Logo) {
                donorData.Logo = `${req.protocol}://${req.get('host')}/api${donorData.Logo}`;
            }
            
            res.status(200).json({
                status: 200,
                message: 'Donor data fetched successfully with associated devices',
                info: donorData
            });
        } else {
            return res.status(404).json({
                status: 404,
                message: 'Donor not found'
            });
        }
    } catch (error) {
        return res.status(500).json({
            status: 500,
            error: true,
            message: error.message || error
        });
    }
};
const updateDonorDeviceCount = async (donorName, increment = true) => {
    try {
        if (!donorName) return;

        const donor = await Donor.findOne({
            where: { DonarOrganisation: donorName }
        });

        if (donor) {
            const currentCount = donor.DonorDevice || 0;
            const newCount = increment ? currentCount + 1 : Math.max(0, currentCount - 1);
            
            await donor.update({ DonorDevice: newCount });
            
            console.log(`Donor device count updated for ${donorName}: ${newCount}`);
        }
    } catch (error) {
        console.error('Error updating donor device count:', error);
    }
};


// Update syncDonorDeviceCounts
const syncDonorDeviceCounts = async (req, res) => {
    try {
        const donors = await Donor.findAll();
        
        for (const donor of donors) {
            const deviceCount = await NewDeviceLocationDetail.count({
                where: { donor_id: donor.ID }  // Changed from DonarName
            });
            
            await donor.update({ DonorDevice: deviceCount });
        }
        
        res.status(200).json({
            status: 200,
            message: 'Donor device counts synced successfully',
            count: donors.length
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            error: true,
            message: error.message || error
        });
    }
};

module.exports = { 
    getAllDonor, 
    createDonor, 
    updateDonor,
    deleteDonor,
    getDonorById,
    updateDonorDeviceCount,
    syncDonorDeviceCounts
};