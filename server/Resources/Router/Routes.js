const upload = require("../Middleware/uploadfiles.js");
const { roleAuth } = require("../Middleware/RoleAuth.js");
const express = require("express");

const { 
  getAllSolarCharger, 
  createSolarCharger, 
  getSolarChargerById,
  getLatestSolarCharger,
  getMQTTStatus,
  getRealtimeData,
  getDataByUID,
  getDataStatistics
} = require("../Controller/ChargerController.js");

const {
     createNewDevice,
    getAllNewDevices,
    getNewDeviceById,
    updateNewDevice,
    deleteNewDevice,
    getDevicesByDonorId,  // Import this
    getDevicesByRewId,
      getCarbonCreditSummary,
    getCarbonCreditDashboard,
    getCarbonCreditsByDonor


} = require("../Controller/NewDeviceController.js");

const { getUnregisteredDevices } = require("../Controller/UnregisteredDeviceController");
const { eventHandler } = require("../Helper/Event.js");

const {  
    getAllDonor, 
    createDonor, 
    updateDonor,
    deleteDonor,
    getDonorById,
    updateDonorDeviceCount,
    syncDonorDeviceCounts
} = require("../Controller/DonorController.js");

const {
    createRew,
    getAllRew,
    getRewById,
    updateRew,
    deleteRew,
    addPhotosToRew,
    removePhotosFromRew
} = require("../Controller/RewController.js");

const { getAdministrator, createAdmininstartor, updateAdmin, deleteAdmin } = require("../Controller/AdminUserController.js");
const { loginAdmin, adminProfile, rememberMe, checkApi } = require("../Controller/LoginController.js");
const { AdminAuth } = require("../Middleware/Auth.js");

const router = express.Router();

// ============================================================
// STATIC FILES - serves all image folders
// http://localhost:5000/api/images/rew-photos/filename.jpg
// http://localhost:5000/api/images/donor-logos/filename.jpg
// http://localhost:5000/api/images/device-images/filename.jpg
// ============================================================
router.use('/images', express.static(process.cwd() + '/files'));

// ============================================================
// ADMIN MANAGEMENT ROUTES
// ============================================================
router.get("/getAdmins", AdminAuth, roleAuth(['superadmin']), upload.none(), getAdministrator);
router.post("/createAdmin", AdminAuth, roleAuth(['superadmin']), upload.none(), createAdmininstartor);
router.put("/updateAdmin/:id", AdminAuth, upload.none(), updateAdmin);
router.delete("/deleteAdmin/:id", AdminAuth, roleAuth(['superadmin']), upload.none(), deleteAdmin);

// ============================================================
// UNREGISTERED DEVICE ROUTES
// ============================================================
router.get("/getUnregisteredDevices", upload.none(), getUnregisteredDevices);

// ============================================================
// REW ROUTES
// ============================================================
router.post("/createRew", AdminAuth, upload.array('rew_photos', 5), createRew);
router.get("/getAllRew", getAllRew);
router.get("/getRew/:id", AdminAuth, getRewById);
router.put("/updateRew/:id", AdminAuth, upload.array('rew_photos', 5), updateRew);
router.delete("/deleteRew/:id", AdminAuth, deleteRew);
router.post("/rew/:id/add-photos", AdminAuth, upload.array('rew_photos', 5), addPhotosToRew);
router.delete("/rew/:id/remove-photos", AdminAuth, removePhotosFromRew);

// ============================================================
// DEVICE REGISTRATION ROUTES
// ============================================================
router.get("/getNewDeviceList", upload.none(), getAllNewDevices);
router.post("/createNewDevice", AdminAuth, upload.none(), createNewDevice);
router.get("/getNewDevice/:id", AdminAuth, upload.none(), getNewDeviceById);
router.put("/updateNewDevice/:id", AdminAuth, roleAuth(['superadmin']), upload.none(), updateNewDevice);
router.delete("/deleteNewDevice/:id", AdminAuth, roleAuth(['superadmin']), upload.none(), deleteNewDevice);
// New route to get devices by donor
router.get("/getDevicesByDonor/:donorId", AdminAuth, upload.none(), getDevicesByDonorId);
router.get("/getCarbonCreditSummary", getCarbonCreditSummary);
router.get("/getCarbonCreditDashboard", getCarbonCreditDashboard);
router.get("/getCarbonCreditsByDonor/:donorId", getCarbonCreditsByDonor);
// ============================================================
// SOLAR CHARGER DATA ROUTES
// ============================================================
router.post("/createSolarCharger", AdminAuth, upload.none(), createSolarCharger);
router.get("/getSolarCharger", upload.none(), getAllSolarCharger);
router.get('/getSolarChargerById/:id', AdminAuth, upload.none(), getSolarChargerById);
router.get('/getSolarChargerByUID/:uid', upload.none(), getDataByUID);
router.get('/getLatestSolarCharger', upload.none(), getLatestSolarCharger);
router.get('/getRealtimeData', upload.none(), getRealtimeData);

// ============================================================
// MQTT STATUS & STATISTICS ROUTES
// ============================================================
router.get('/getMQTTStatus', upload.none(), getMQTTStatus);
router.get('/getDataStatistics', upload.none(), getDataStatistics);

// ============================================================
// DONOR ROUTES
// ============================================================
router.get("/getDonor", upload.none(), getAllDonor);
router.get("/getDonor/:id", AdminAuth, upload.none(), getDonorById);
router.post("/createInternationalDonor", AdminAuth, upload.single('logo'), createDonor);
router.put("/updateDonor/:id", AdminAuth, upload.single('logo'), updateDonor);
router.delete("/deleteDonor/:id", AdminAuth, upload.none(), deleteDonor);
router.post("/syncDonorDeviceCounts", AdminAuth, upload.none(), syncDonorDeviceCounts);

// ============================================================
// AUTHENTICATION ROUTES
// ============================================================
router.post("/loginAdmin", upload.none(), loginAdmin);
router.get("/adminProfile", AdminAuth, upload.none(), adminProfile);
router.get("/rememberMe", AdminAuth, upload.none(), rememberMe);

// ============================================================
// OTHER ROUTES
// ============================================================
router.get("/event/:id/:count", upload.none(), eventHandler);
router.get("/checkApi", upload.none(), checkApi);

module.exports = router;