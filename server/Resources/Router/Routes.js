const uploadFiles = require("../Middleware/uploadfiles.js");
const { roleAuth } = require("../Middleware/RoleAuth.js");
const express = require("express");

// Import controllers
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
  deleteNewDevice
} = require("../Controller/NewDeviceController.js");

const { 
  getAllLocalDevice, 
  createLocalDevice, 
  updateLocalDevice, 
  deleteLocalDevice, 
  getLocalDeviceById 
} = require("../Controller/BFootDeviceController.js");

const { eventHandler } = require("../Helper/Event.js");
const { getAllPartner, createPartner } = require("../Controller/InternatinalPartnerController.js");
const { getAllDonor, createDonor } = require("../Controller/InternationalDonorController.js");
const { getMobileDevice, createMobileDevice } = require("../Controller/MobileDeviceController.js");
const { getAdministrator, createAdmininstartor, updateAdmin, deleteAdmin } = require("../Controller/AdminUserController.js");
const { loginAdmin, adminProfile, rememberMe, checkApi } = require("../Controller/LoginController.js");
const { AdminAuth } = require("../Middleware/Auth.js");

// Initiate router    
const router = express.Router();

// ============================================================
// ADMIN MANAGEMENT ROUTES - Only for superadmin
// ============================================================
router.get("/getAdmins", AdminAuth, roleAuth(['superadmin']), uploadFiles.none(), getAdministrator);
router.post("/createAdmin", AdminAuth, roleAuth(['superadmin']), uploadFiles.none(), createAdmininstartor);
router.put("/updateAdmin/:id", AdminAuth, uploadFiles.none(), updateAdmin);
router.delete("/deleteAdmin/:id", AdminAuth, roleAuth(['superadmin']), uploadFiles.none(), deleteAdmin);

// ============================================================
// DEVICE REGISTRATION ROUTES (Step 1: Register Device)
// ============================================================
router.get("/getNewDeviceList", uploadFiles.none(), getAllNewDevices);
router.post("/createNewDevice", AdminAuth, uploadFiles.none(), createNewDevice);
router.get("/getNewDevice/:id", AdminAuth, uploadFiles.none(), getNewDeviceById);
router.put("/updateNewDevice/:id", AdminAuth, roleAuth(['superadmin']), uploadFiles.none(), updateNewDevice);
router.delete("/deleteNewDevice/:id", AdminAuth, roleAuth(['superadmin']), uploadFiles.none(), deleteNewDevice);

// ============================================================
// SOLAR CHARGER DATA ROUTES (Step 2: Add Data - Manual or MQTT)
// ============================================================

// Manual Data Upload - requires registered device
router.post("/createSolarCharger", AdminAuth, uploadFiles.none(), createSolarCharger);

// Get all solar charger data
router.get("/getSolarCharger", uploadFiles.none(), getAllSolarCharger);

// Get solar charger by record ID
router.get('/getSolarChargerById/:id', AdminAuth, uploadFiles.none(), getSolarChargerById);

// Get data by Device UID (all data for a specific device)
router.get('/getSolarChargerByUID/:uid', uploadFiles.none(), getDataByUID);

// Get latest solar charger data (most recent records)
router.get('/getLatestSolarCharger', uploadFiles.none(), getLatestSolarCharger);

// Get real-time MQTT data (filtered by time range)
router.get('/getRealtimeData', uploadFiles.none(), getRealtimeData);

// ============================================================
// MQTT STATUS & STATISTICS ROUTES
// ============================================================

// Get MQTT connection status
router.get('/getMQTTStatus', uploadFiles.none(), getMQTTStatus);

// Get data statistics (manual vs MQTT)
router.get('/getDataStatistics', uploadFiles.none(), getDataStatistics);

// ============================================================
// LOCAL DEVICE ROUTES
// ============================================================
router.get("/getLocalDevDetail", AdminAuth, uploadFiles.none(), getAllLocalDevice);
router.post("/createLocalDevice", AdminAuth, uploadFiles.none(), createLocalDevice);
router.get("/getLocalDevice/:id", AdminAuth, uploadFiles.none(), getLocalDeviceById);
router.put("/updateLocalDevice/:id", AdminAuth, uploadFiles.none(), updateLocalDevice);
router.delete("/deleteLocalDevice/:id", AdminAuth, uploadFiles.none(), deleteLocalDevice);

// ============================================================
// PARTNER ROUTES
// ============================================================
router.get("/getInternationPartner", AdminAuth, uploadFiles.none(), getAllPartner);
router.post("/createInternationalPartner", AdminAuth, uploadFiles.none(), createPartner);

// ============================================================
// DONOR ROUTES
// ============================================================
router.get("/getInternationDonor", AdminAuth, uploadFiles.none(), getAllDonor);
router.post("/createInternationalDonor", AdminAuth, uploadFiles.none(), createDonor);

// ============================================================
// MOBILE DEVICE ROUTES
// ============================================================
router.get("/getMobileDevice", AdminAuth, uploadFiles.none(), getMobileDevice);
router.post("/createMobileDevice", AdminAuth, uploadFiles.none(), createMobileDevice);

// ============================================================
// ADMINISTRATOR ROUTES
// ============================================================
router.get("/getUserDevice", AdminAuth, uploadFiles.none(), getAdministrator);
router.post("/createAdmininstartor", AdminAuth, uploadFiles.none(), createAdmininstartor);

// ============================================================
// AUTHENTICATION ROUTES
// ============================================================
router.post("/loginAdmin", uploadFiles.none(), loginAdmin);
router.get("/adminProfile", AdminAuth, uploadFiles.none(), adminProfile);
router.get("/rememberMe", AdminAuth, uploadFiles.none(), rememberMe);

// ============================================================
// OTHER ROUTES
// ============================================================
router.get("/event/:id/:count", uploadFiles.none(), eventHandler);
router.get("/checkApi", uploadFiles.none(), checkApi);

// Static files route
router.use('/images', express.static(process.cwd() + '/files'));

module.exports = router;




// const uploadFiles = require("../Middleware/uploadfiles.js");
// const { roleAuth } = require("../Middleware/RoleAuth.js");

// const express = require("express");
// const { getAllSolarCharger, createSolarCharger, getSolarChargerById } = require("../Controller/ChargerController.js");
// const {
//     createNewDevice,
//     getAllNewDevices,
//     getNewDeviceById,
//     updateNewDevice,
//     deleteNewDevice
// } = require("../Controller/NewDeviceController.js");
// const { getAllLocalDevice, createLocalDevice, updateLocalDevice, deleteLocalDevice, getLocalDeviceById } = require("../Controller/BFootDeviceController.js");
// const { eventHandler } = require("../Helper/Event.js");
// const { getAllPartner, createPartner } = require("../Controller/InternatinalPartnerController.js");
// const { getAllDonor, createDonor } = require("../Controller/InternationalDonorController.js");
// const { getMobileDevice, createMobileDevice } = require("../Controller/MobileDeviceController.js");
// const { getAdministrator, createAdmininstartor, updateAdmin, deleteAdmin } = require("../Controller/AdminUserController.js");
// const { loginAdmin, adminProfile, rememberMe, checkApi } = require("../Controller/LoginController.js");
// const { AdminAuth } = require("../Middleware/Auth.js");

// //////   initiate router    
// const router = express.Router();

// // Admin management routes - only for superadmin
// router.get("/getAdmins", AdminAuth, roleAuth(['superadmin']), uploadFiles.none(), getAdministrator);
// router.post("/createAdmin", AdminAuth, roleAuth(['superadmin']), uploadFiles.none(), createAdmininstartor);
// router.put("/updateAdmin/:id", AdminAuth, uploadFiles.none(), updateAdmin);
// router.delete("/deleteAdmin/:id", AdminAuth, roleAuth(['superadmin']), uploadFiles.none(), deleteAdmin);

// // Protect sensitive routes with role-based authentication
// router.get("/getNewDeviceList",  uploadFiles.none(), getAllNewDevices);
// router.post("/createNewDevice", AdminAuth, uploadFiles.none(), createNewDevice);
// router.put("/updateNewDevice/:id", AdminAuth,roleAuth(['superadmin']), uploadFiles.none(), updateNewDevice);
// router.delete("/deleteNewDevice/:id", AdminAuth, roleAuth(['superadmin']), uploadFiles.none(), deleteNewDevice);

// // Get new device by ID (remove duplicate)
// router.get("/getNewDevice/:id", AdminAuth, uploadFiles.none(), getNewDeviceById);

// // Solar charger routes
// router.get("/getSolarCharger", AdminAuth, uploadFiles.none(), getAllSolarCharger);
// router.post("/createSolarCharger", AdminAuth, uploadFiles.none(), createSolarCharger);
// router.get('/getSolarChargerById/:id', AdminAuth, uploadFiles.none(), getSolarChargerById);

// // Local device routes
// router.put("/updateLocalDevice/:id", AdminAuth, uploadFiles.none(), updateLocalDevice);
// router.delete("/deleteLocalDevice/:id", AdminAuth, uploadFiles.none(), deleteLocalDevice);
// router.get("/getLocalDevice/:id", AdminAuth, uploadFiles.none(), getLocalDeviceById);
// router.get("/getLocalDevDetail", AdminAuth, uploadFiles.none(), getAllLocalDevice);
// router.post("/createLocalDevice", AdminAuth, uploadFiles.none(), createLocalDevice);

// // Partner routes
// router.get("/getInternationPartner", AdminAuth, uploadFiles.none(), getAllPartner);
// router.post("/createInternationalPartner", AdminAuth, uploadFiles.none(), createPartner);

// // Donor routes
// router.get("/getInternationDonor", AdminAuth, uploadFiles.none(), getAllDonor);
// router.post("/createInternationalDonor", AdminAuth, uploadFiles.none(), createDonor);

// // Mobile device routes
// router.get("/getMobileDevice", AdminAuth, uploadFiles.none(), getMobileDevice);
// router.post("/createMobileDevice", AdminAuth, uploadFiles.none(), createMobileDevice);

// // Administrator routes (remove duplicate)
// router.get("/getUserDevice", AdminAuth, uploadFiles.none(), getAdministrator);
// router.post("/createAdmininstartor", AdminAuth, uploadFiles.none(), createAdmininstartor);

// // Auth routes
// router.post("/loginAdmin", uploadFiles.none(), loginAdmin);
// router.get("/adminProfile", AdminAuth, uploadFiles.none(), adminProfile);
// router.get("/rememberMe", AdminAuth, uploadFiles.none(), rememberMe);

// // Other routes
// router.get("/event/:id/:count", uploadFiles.none(), eventHandler);
// router.get("/checkApi", uploadFiles.none(), checkApi);

// //////   get image router
// router.use('/images', express.static(process.cwd() + '/files'));

// module.exports = router;
