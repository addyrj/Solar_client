// import React, { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   FiSun,
//   FiZap,
//   FiTrendingUp,
//   FiHome,
//   FiDroplet,
//   FiWind,
//   FiBarChart2,
//   FiLogIn,
//   FiMap,
//   FiX,
//   FiUser,
//   FiLock,
//   FiArrowRight,
//   FiRefreshCw,
//   FiAlertCircle,
//   FiCheckCircle,
// } from "react-icons/fi";
// import { RiLeafLine, RiPlantLine, RiEarthLine } from "react-icons/ri";
// import Chart from "react-apexcharts";
// import toast from "react-hot-toast";
// import isEmpty from "lodash.isempty";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import { useDispatch } from "react-redux";
// import { setLoader } from "../../Database/Action/ConstantAction";
// import { postHeaderWithoutToken } from "../../Database/Utils";
// import Cookies from "universal-cookie";
// import DeviceMapComponent from "../Components/DeviceMapComponent";
// import "./SolarDashboard.css";

// // API Configuration
// const API_BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:5000/api/";

// const apiEndpoints = {
//   devices: `${API_BASE_URL}getNewDeviceList`,
//   carbonSummary: `${API_BASE_URL}getCarbonCreditSummary`,
//   carbonDashboard: `${API_BASE_URL}getCarbonCreditDashboard`,
//   singleDevice: (id) => `${API_BASE_URL}getNewDevice/${id}`,
// };

// // Login Modal Component
// const LoginModal = ({ isOpen, onClose, onLoginSuccess }) => {
//   const dispatch = useDispatch();
//   const cookies = new Cookies();
//   const navigate = useNavigate();

//   const [loginInfo, setLoginInfo] = useState({
//     userName: "",
//     password: "",
//     rememberMe: false,
//   });
//   const [isLoading, setIsLoading] = useState(false);

//   const handleLogin = () => {
//     if (isEmpty(loginInfo.userName)) {
//       toast.error("Failed! Please Enter UserName");
//       return;
//     }
//     if (isEmpty(loginInfo.password)) {
//       toast.error("Failed! Please Enter Password");
//       return;
//     }

//     setIsLoading(true);
//     dispatch(setLoader(true));

//     let formData = new FormData();
//     formData.append("userId", loginInfo.userName);
//     formData.append("pass", loginInfo.password);

//     axios
//       .post(
//         process.env.REACT_APP_BASE_URL + "loginAdmin",
//         formData,
//         postHeaderWithoutToken
//       )
//       .then((res) => {
//         dispatch(setLoader(false));
//         setIsLoading(false);

//         const rememberMe = {
//           rememberToken: res?.data?.token,
//           checkState: loginInfo.rememberMe,
//         };

//         cookies.remove("adminToken");
//         cookies.remove("rememberMe");

//         cookies.set("adminToken", res?.data?.token, {
//           path: "/",
//           maxAge: loginInfo.rememberMe ? 30 * 24 * 60 * 60 : undefined,
//         });

//         if (loginInfo.rememberMe) {
//           cookies.set("rememberMe", JSON.stringify(rememberMe), {
//             path: "/",
//             maxAge: 30 * 24 * 60 * 60,
//           });
//         }
//         toast.success(res.data.message);
//         onLoginSuccess(loginInfo.userName);
//         navigate("/dashboard");
//       })
//       .catch((error) => {
//         dispatch(setLoader(false));
//         setIsLoading(false);
//         toast.error(error?.response?.data?.message || error.message);
//       });
//   };

//   if (!isOpen) return null;

//   return (
//     <motion.div
//       className="modal-overlay"
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//       onClick={onClose}
//     >
//       <motion.div
//         className="login-modal"
//         initial={{ scale: 0.9, y: 50 }}
//         animate={{ scale: 1, y: 0 }}
//         exit={{ scale: 0.9, y: 50 }}
//         onClick={(e) => e.stopPropagation()}
//       >
//         <button className="modal-close" onClick={onClose}>
//           <FiX />
//         </button>

//         <div className="login-modal-header">
//           <div className="login-modal-icon">
//             <FiSun />
//           </div>
//           <h2>Welcome Back</h2>
//           <p>Sign in to access your solar dashboard</p>
//         </div>

//         <div className="login-modal-form">
//           <div className="form-group">
//             <label>Username</label>
//             <div className="input-group">
//               <FiUser className="input-icon" />
//               <input
//                 type="text"
//                 placeholder="Enter your username"
//                 value={loginInfo.userName}
//                 onChange={(e) =>
//                   setLoginInfo({ ...loginInfo, userName: e.target.value })
//                 }
//                 onKeyPress={(e) => e.key === "Enter" && handleLogin()}
//               />
//             </div>
//           </div>

//           <div className="form-group">
//             <label>Password</label>
//             <div className="input-group">
//               <FiLock className="input-icon" />
//               <input
//                 type="password"
//                 placeholder="Enter your password"
//                 value={loginInfo.password}
//                 onChange={(e) =>
//                   setLoginInfo({ ...loginInfo, password: e.target.value })
//                 }
//                 onKeyPress={(e) => e.key === "Enter" && handleLogin()}
//               />
//             </div>
//           </div>

//           <div className="form-options">
//             <label className="remember-me">
//               <input
//                 type="checkbox"
//                 checked={loginInfo.rememberMe}
//                 onChange={(e) =>
//                   setLoginInfo({ ...loginInfo, rememberMe: e.target.checked })
//                 }
//               />
//               <span>Remember Me</span>
//             </label>
//           </div>

//           <motion.button
//             className="login-submit-btn"
//             whileHover={{ scale: 1.02 }}
//             whileTap={{ scale: 0.98 }}
//             onClick={handleLogin}
//             disabled={isLoading}
//           >
//             {isLoading ? "Signing in..." : "Sign In"}
//           </motion.button>
//         </div>

//         <div className="login-modal-footer">
//           <p>
//             Need help? <a href="#">Contact support</a>
//           </p>
//         </div>
//       </motion.div>
//     </motion.div>
//   );
// };

// // Map Modal Component
// const MapModal = ({ isOpen, onClose }) => {
//   if (!isOpen) return null;

//   return (
//     <motion.div
//       className="modal-overlay"
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//       onClick={onClose}
//     >
//       <motion.div
//         className="map-modal"
//         initial={{ scale: 0.9, y: 50 }}
//         animate={{ scale: 1, y: 0 }}
//         exit={{ scale: 0.9, y: 50 }}
//         onClick={(e) => e.stopPropagation()}
//       >
//         <div className="map-modal-header">
//           <h2>Solar Installation Map</h2>
//           <button className="modal-close" onClick={onClose}>
//             <FiX />
//           </button>
//         </div>
//         <div className="map-modal-content">
//           <DeviceMapComponent
//             showHeader={false}
//             showFilters={false}
//             customHeight="100%"
//           />
//         </div>
//       </motion.div>
//     </motion.div>
//   );
// };

// // Enhanced Metric Card Component
// const MetricCard = ({ icon, title, value, subtitle, color, trend, unit }) => (
//   <motion.div
//     className={`metric-card metric-${color}`}
//     whileHover={{ y: -12, boxShadow: "0 20px 40px rgba(16, 185, 129, 0.25)" }}
//     transition={{ duration: 0.3 }}
//   >
//     <motion.div
//       className="metric-icon"
//       whileHover={{ scale: 1.15, rotate: -15 }}
//       transition={{ duration: 0.3 }}
//     >
//       {icon}
//     </motion.div>
//     <div className="metric-content">
//       <h3>{title}</h3>
//       <motion.div className="metric-value" layoutId={`metric-${title}`}>
//         {typeof value === "number" ? value.toFixed(2) : value}
//         {unit && <span className="metric-unit">{unit}</span>}
//       </motion.div>
//       <div className="metric-footer">
//         <span className="metric-subtitle">{subtitle}</span>
//         {trend && <span className="metric-trend">{trend}</span>}
//       </div>
//     </div>
//   </motion.div>
// );

// // Status Item Component
// const StatusItem = ({ icon, label, value, color }) => (
//   <motion.div
//     className={`status-item status-${color}`}
//     whileHover={{ y: -6, backgroundColor: "rgba(16, 185, 129, 0.1)" }}
//     transition={{ duration: 0.2 }}
//   >
//     <motion.div
//       className="status-icon"
//       whileHover={{ scale: 1.2, rotate: 10 }}
//       transition={{ duration: 0.2 }}
//     >
//       {icon}
//     </motion.div>
//     <div className="status-text">
//       <span className="status-label">{label}</span>
//       <span className="status-value">{value}</span>
//     </div>
//   </motion.div>
// );

// // Impact Stat Component
// const ImpactStat = ({ value, label, icon }) => (
//   <motion.div
//     className="impact-stat"
//     whileHover={{ y: -8, backgroundColor: "rgba(16, 185, 129, 0.2)" }}
//     transition={{ duration: 0.2 }}
//   >
//     <motion.div
//       className="impact-stat-icon"
//       whileHover={{ scale: 1.2, rotate: -15 }}
//       transition={{ duration: 0.2 }}
//     >
//       {icon}
//     </motion.div>
//     <div>
//       <div className="impact-stat-value">{value}</div>
//       <div className="impact-stat-label">{label}</div>
//     </div>
//   </motion.div>
// );

// // Top Devices Component
// const TopDevicesWidget = ({ devices, loading }) => (
//   <motion.div
//     className="top-devices-widget"
//     initial={{ opacity: 0, y: 20 }}
//     whileInView={{ opacity: 1, y: 0 }}
//     viewport={{ once: true }}
//     transition={{ duration: 0.6 }}
//   >
//     <div className="widget-header">
//       <h3>Top Performing Devices</h3>
//       <span className="device-count">{devices?.length || 0} devices</span>
//     </div>
//     <div className="devices-list">
//       {loading ? (
//         <div className="loading-state">
//           <FiRefreshCw className="spin-icon" />
//           <p>Loading devices...</p>
//         </div>
//       ) : devices && devices.length > 0 ? (
//         devices.map((device, idx) => (
//           <motion.div
//             key={idx}
//             className="device-item"
//             initial={{ opacity: 0, x: -20 }}
//             whileInView={{ opacity: 1, x: 0 }}
//             transition={{ delay: idx * 0.1 }}
//             viewport={{ once: true }}
//           >
//             <div className="device-rank">#{idx + 1}</div>
//             <div className="device-info">
//               <h4>{device.deviceInfo?.NameOfBeneficiary || device.uid}</h4>
//               <p className="device-location">
//                 {device.deviceInfo?.Location || "Location N/A"}
//               </p>
//             </div>
//             <div className="device-stats">
//               <div className="stat">
//                 <span className="label">kWh</span>
//                 <span className="value">
//                   {device.totalPVKWh?.toFixed(2) || 0}
//                 </span>
//               </div>
//               <div className="stat">
//                 <span className="label">CO2</span>
//                 <span className="value">
//                   {device.totalCO2Saved?.toFixed(2) || 0}T
//                 </span>
//               </div>
//               <div className="stat highlight">
//                 <span className="label">Credits</span>
//                 <span className="value">
//                   {device.totalCarbonCredits?.toFixed(4) || 0}
//                 </span>
//               </div>
//             </div>
//           </motion.div>
//         ))
//       ) : (
//         <div className="empty-state">
//           <FiAlertCircle />
//           <p>No devices available</p>
//         </div>
//       )}
//     </div>
//   </motion.div>
// );

// // Main Solar Dashboard Component
// const SolarDashboardRegister = () => {
//   const cookies = new Cookies();
//   const [scrollProgress, setScrollProgress] = useState(0);
//   const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
//   const [isMapModalOpen, setIsMapModalOpen] = useState(false);
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [userName, setUserName] = useState("");

//   // API Data States
//   const [dashboardData, setDashboardData] = useState(null);
//   const [devices, setDevices] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [lastUpdated, setLastUpdated] = useState(null);

//   // Fetch Dashboard Data
//   const fetchDashboardData = async () => {
//     try {
//       setLoading(true);
//       setError(null);

//       // Fetch carbon dashboard and devices in parallel
//       const [dashboardRes, devicesRes] = await Promise.all([
//         axios.get(apiEndpoints.carbonDashboard),
//         axios.get(apiEndpoints.devices),
//       ]);

//       setDashboardData(dashboardRes.data?.data);
//       setDevices(devicesRes.data?.info);
//       setLastUpdated(new Date());

//       if (!isLoggedIn) {
//         toast.success("Data updated successfully!");
//       }
//     } catch (err) {
//       setError(
//         err.response?.data?.message ||
//           "Failed to fetch dashboard data. Please try again."
//       );
//       toast.error("Error loading dashboard data");
//       console.error("API Error:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Initial load
//   useEffect(() => {
//     fetchDashboardData();

//     const rememberMeCookie = cookies.get("rememberMe");
//     if (rememberMeCookie !== undefined) {
//       const rememberMe =
//         typeof rememberMeCookie === "string"
//           ? JSON.parse(rememberMeCookie)
//           : rememberMeCookie;
//       if (rememberMe?.checkState === true) {
//         const adminToken = cookies.get("adminToken");
//         if (adminToken) {
//           setIsLoggedIn(true);
//           setUserName("Admin");
//         }
//       }
//     }
//   }, []);

//   // Auto-refresh data every 30 seconds
//   useEffect(() => {
//     const refreshInterval = setInterval(() => {
//       fetchDashboardData();
//     }, 30000);

//     return () => clearInterval(refreshInterval);
//   }, [isLoggedIn]);

//   // Scroll progress handler
//   useEffect(() => {
//     const handleScroll = () => {
//       const scrollTop = window.scrollY;
//       const docHeight =
//         document.documentElement.scrollHeight - window.innerHeight;
//       const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
//       setScrollProgress(scrollPercent);
//     };

//     window.addEventListener("scroll", handleScroll);
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);

//   const scrollToTop = () => {
//     window.scrollTo({
//       top: 0,
//       behavior: "smooth",
//     });
//   };

//   const handleLoginSuccess = (username) => {
//     setIsLoggedIn(true);
//     setUserName(username);
//   };

//   const handleLogout = () => {
//     cookies.remove("adminToken");
//     cookies.remove("rememberMe");
//     setIsLoggedIn(false);
//     setUserName("");
//     toast.success("Logged out successfully");
//   };

//   const handleManualRefresh = () => {
//     fetchDashboardData();
//     toast.success("Data refreshing...");
//   };

//   // Extract data from API response
//   const summary = dashboardData?.summary || {};
//   const topDevices = dashboardData?.topDevices || [];
//   const monthlyTrend = dashboardData?.monthlyTrend || [];
//   const topDonors = dashboardData?.topDonors || [];

//   // Prepare chart data from monthly trend
//   const chartData = {
//     series: [
//       {
//         name: "Power Generation (kWh)",
//         data: monthlyTrend.map((m) => m.totalPVKWh || 0),
//       },
//     ],
//     categories: monthlyTrend.map((m) => {
//       const [year, month] = m.month.split("-");
//       const monthNames = [
//         "Jan",
//         "Feb",
//         "Mar",
//         "Apr",
//         "May",
//         "Jun",
//         "Jul",
//         "Aug",
//         "Sep",
//         "Oct",
//         "Nov",
//         "Dec",
//       ];
//       return monthNames[parseInt(month) - 1];
//     }),
//   };

//   // Environmental chart data
//   const environmentalChart = {
//     series: [
//       summary.totalCO2Saved || 0,
//       summary.equivalentTrees || 0,
//       summary.totalCarbonCredits || 0,
//     ],
//     labels: ["CO2 Saved (Tons)", "Trees Equivalent", "Carbon Credits"],
//   };

//   // Animation variants
//   const containerVariants = {
//     hidden: { opacity: 0 },
//     visible: {
//       opacity: 1,
//       transition: {
//         staggerChildren: 0.12,
//         delayChildren: 0.2,
//       },
//     },
//   };

//   const itemVariants = {
//     hidden: { opacity: 0, y: 20 },
//     visible: {
//       opacity: 1,
//       y: 0,
//       transition: {
//         duration: 0.6,
//         ease: "easeOut",
//       },
//     },
//   };

//   return (
//     <div className="solar-dashboard">
//       {/* Scroll Progress Bar */}
//       <motion.div
//         className="scroll-progress-bar"
//         style={{ scaleX: scrollProgress / 100 }}
//         initial={{ scaleX: 0 }}
//         transition={{ duration: 0.2 }}
//       />

//       {/* Error Banner */}
//       <AnimatePresence>
//         {error && (
//           <motion.div
//             className="error-banner"
//             initial={{ opacity: 0, y: -20 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: -20 }}
//           >
//             <FiAlertCircle />
//             <span>{error}</span>
//             <button onClick={fetchDashboardData}>Retry</button>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* Header */}
//       <motion.header
//         className="dashboard-header"
//         initial={{ opacity: 0, y: -20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.6 }}
//       >
//         <div className="header-content">
//           <div className="header-info">
//             <div className="logo-section">
//               <motion.div
//                 className="logo-icon"
//                 whileHover={{ scale: 1.1, rotate: 10 }}
//                 whileTap={{ scale: 0.95 }}
//               >
//                 <FiSun />
//               </motion.div>
//               <motion.div
//                 initial={{ opacity: 0, x: -20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 transition={{ delay: 0.2 }}
//               >
//                 <h1>Bindi Solar Energy Monitor</h1>
//                 <p className="tagline">
//                   Real-time insights • Environmental Impact • 165 Active Devices
//                 </p>
//               </motion.div>
//             </div>
//           </div>

//           <div className="header-actions">
//             <motion.button
//               className="refresh-btn"
//               onClick={handleManualRefresh}
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.95 }}
//               title="Refresh data"
//             >
//               <FiRefreshCw className={loading ? "spin-icon" : ""} />
//             </motion.button>

//             {lastUpdated && (
//               <div className="last-updated">
//                 <small>Updated: {lastUpdated.toLocaleTimeString()}</small>
//               </div>
//             )}

//             {isLoggedIn ? (
//               <motion.div
//                 className="user-menu"
//                 initial={{ opacity: 0, x: 20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 transition={{ delay: 0.3 }}
//               >
//                 <div className="user-info">
//                   <span className="user-name">{userName}</span>
//                   <button className="logout-btn" onClick={handleLogout}>
//                     Logout
//                   </button>
//                 </div>
//               </motion.div>
//             ) : (
//               <motion.button
//                 className="header-btn login-btn"
//                 initial={{ opacity: 0, x: 20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 transition={{ delay: 0.3 }}
//                 whileHover={{ scale: 1.05, y: -2 }}
//                 whileTap={{ scale: 0.95 }}
//                 onClick={() => setIsLoginModalOpen(true)}
//               >
//                 <FiLogIn />
//                 <span>Login</span>
//               </motion.button>
//             )}

//             <motion.div
//               className="status-badge active"
//               initial={{ opacity: 0, x: 20 }}
//               animate={{ opacity: 1, x: 0 }}
//               transition={{ delay: 0.35 }}
//               onClick={() => setIsMapModalOpen(true)}
//               style={{ cursor: "pointer" }}
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.95 }}
//             >
//               <motion.span
//                 className="pulsee"
//                 animate={{ scale: [1, 1.2, 1] }}
//                 transition={{ duration: 2, repeat: Infinity }}
//               />
//               Live Map
//             </motion.div>
//           </div>
//         </div>
//       </motion.header>

//       {/* Modals */}
//       <AnimatePresence>
//         <LoginModal
//           isOpen={isLoginModalOpen}
//           onClose={() => setIsLoginModalOpen(false)}
//           onLoginSuccess={handleLoginSuccess}
//         />
//         <MapModal
//           isOpen={isMapModalOpen}
//           onClose={() => setIsMapModalOpen(false)}
//         />
//       </AnimatePresence>

//       {/* Main Content */}
//       <main className="dashboard-main">
//         {/* Welcome Banner for Logged-in Users */}
//         {isLoggedIn && (
//           <motion.div
//             className="welcome-banner"
//             initial={{ opacity: 0, y: -20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.5 }}
//           >
//             <div className="welcome-content">
//               <RiLeafLine className="welcome-icon" />
//               <div>
//                 <h3>Welcome back, {userName}!</h3>
//                 <p>
//                   Your solar installations are generating clean energy. Total
//                   carbon offset: {summary.totalCO2Saved?.toFixed(2)} tons CO2.
//                 </p>
//               </div>
//             </div>
//           </motion.div>
//         )}

//         {/* Key Metrics Grid */}
//         <motion.section
//           className="metrics-grid"
//           variants={containerVariants}
//           initial="hidden"
//           animate="visible"
//         >
//           {[
//             {
//               icon: <FiZap />,
//               title: "Total Power Generated",
//               value: summary.totalPVKWh,
//               subtitle: "All time",
//               color: "primary",
//               unit: "kWh",
//               trend: `${summary.activeDevices} active`,
//             },
//             {
//               icon: <RiEarthLine />,
//               title: "CO2 Offset",
//               value: summary.totalCO2Saved,
//               subtitle: "This month",
//               color: "success",
//               unit: "Tons",
//               trend: "↓ emissions",
//             },
//             {
//               icon: <RiPlantLine />,
//               title: "Trees Equivalent",
//               value: summary.equivalentTrees,
//               subtitle: "Impact generated",
//               color: "eco",
//               unit: "trees",
//               trend: "Growing",
//             },
//             {
//               icon: <FiBarChart2 />,
//               title: "Carbon Credits",
//               value: summary.totalCarbonCredits,
//               subtitle: "Earned",
//               color: "secondary",
//               unit: "Credits",
//               trend: `${summary.totalDevices} devices`,
//             },
//           ].map((metric, idx) => (
//             <motion.div key={idx} variants={itemVariants}>
//               <MetricCard {...metric} />
//             </motion.div>
//           ))}
//         </motion.section>

//         {/* Status Overview */}
//         <motion.div
//           className="status-overview"
//           initial={{ opacity: 0 }}
//           whileInView={{ opacity: 1 }}
//           viewport={{ once: true }}
//           transition={{ duration: 0.6 }}
//         >
//           <motion.div
//             className="status-card"
//             whileHover={{
//               y: -8,
//               boxShadow: "0 20px 40px rgba(16, 185, 129, 0.2)",
//             }}
//             transition={{ duration: 0.3 }}
//           >
//             <div className="status-header">
//               <h3>System Overview</h3>
//               <motion.div
//                 className="status-indicator"
//                 animate={{ scale: [1, 1.05, 1] }}
//                 transition={{ duration: 2, repeat: Infinity }}
//               >
//                 <motion.span
//                   className="pulsee-dot"
//                   animate={{ scale: [1, 1.3, 1] }}
//                   transition={{ duration: 2, repeat: Infinity }}
//                 />
//                 <span>Live</span>
//               </motion.div>
//             </div>
//             <motion.div
//               className="status-grid"
//               variants={containerVariants}
//               initial="hidden"
//               animate="visible"
//             >
//               {[
//                 {
//                   icon: <FiCheckCircle />,
//                   label: "Active Devices",
//                   value: summary.activeDevices || 0,
//                   color: "primary",
//                 },
//                 {
//                   icon: <FiHome />,
//                   label: "Total Devices",
//                   value: summary.totalDevices || 0,
//                   color: "success",
//                 },
//                 {
//                   icon: <FiAlertCircle />,
//                   label: "Inactive",
//                   value: summary.inactiveDevices || 0,
//                   color: "secondary",
//                 },
//                 {
//                   icon: <FiTrendingUp />,
//                   label: "Success Rate",
//                   value: `${((summary.activeDevices / summary.totalDevices) * 100).toFixed(1)}%`,
//                   color: "eco",
//                 },
//               ].map((item, idx) => (
//                 <motion.div key={idx} variants={itemVariants}>
//                   <StatusItem {...item} />
//                 </motion.div>
//               ))}
//             </motion.div>
//           </motion.div>
//         </motion.div>

//         {/* Charts Section */}
//         <div className="charts-section">
//           {/* Power Generation Chart */}
//           {monthlyTrend.length > 0 && (
//             <motion.div
//               className="chart-container large"
//               initial={{ opacity: 0, y: 30 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               viewport={{ once: true }}
//               transition={{ duration: 0.6 }}
//             >
//               <div className="chart-header">
//                 <h2>Monthly Power Generation Trend</h2>
//                 <p className="chart-subtitle">Energy output progression</p>
//               </div>
//               <Chart
//                 options={{
//                   chart: {
//                     type: "area",
//                     toolbar: { show: false },
//                     sparkline: { enabled: false },
//                     fontFamily: "inherit",
//                   },
//                   colors: ["#10b981"],
//                   fill: {
//                     type: "gradient",
//                     gradient: {
//                       shadeIntensity: 1,
//                       opacityFrom: 0.45,
//                       opacityTo: 0.05,
//                       stops: [20, 100, 100, 100],
//                     },
//                   },
//                   dataLabels: { enabled: false },
//                   stroke: {
//                     curve: "smooth",
//                     width: 3,
//                     colors: ["#10b981"],
//                   },
//                   xaxis: {
//                     categories: chartData.categories,
//                     axisBorder: { show: false },
//                     axisTicks: { show: false },
//                     labels: {
//                       style: {
//                         colors: "#9ca3af",
//                         fontSize: "12px",
//                       },
//                     },
//                   },
//                   yaxis: {
//                     labels: {
//                       style: {
//                         colors: "#9ca3af",
//                         fontSize: "12px",
//                       },
//                     },
//                     axisBorder: { show: false },
//                   },
//                   grid: {
//                     borderColor: "rgba(16, 185, 129, 0.15)",
//                     strokeDashArray: 4,
//                   },
//                   tooltip: {
//                     theme: "dark",
//                     y: {
//                       formatter: (value) => `${value.toFixed(1)} kWh`,
//                     },
//                   },
//                 }}
//                 series={chartData.series}
//                 type="area"
//                 height={350}
//               />
//             </motion.div>
//           )}

//           {/* Environmental Impact */}
//           {environmentalChart.series.some((v) => v > 0) && (
//             <motion.div
//               className="chart-container"
//               initial={{ opacity: 0, y: 30 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               viewport={{ once: true }}
//               transition={{ duration: 0.6, delay: 0.1 }}
//             >
//               <div className="chart-header">
//                 <h2>Environmental Impact</h2>
//                 <p className="chart-subtitle">Sustainability metrics</p>
//               </div>
//               <Chart
//                 options={{
//                   chart: {
//                     type: "radialBar",
//                     sparkline: { enabled: false },
//                     toolbar: { show: false },
//                   },
//                   colors: ["#10b981", "#06b6d4", "#0ea5e9"],
//                   plotOptions: {
//                     radialBar: {
//                       size: undefined,
//                       inverseOrder: false,
//                       hollow: {
//                         margin: 5,
//                         size: "48%",
//                         background: "transparent",
//                       },
//                       track: {
//                         strokeWidth: "100%",
//                         margin: 5,
//                         background: "rgba(16, 185, 129, 0.1)",
//                       },
//                       dataLabels: {
//                         name: {
//                           fontSize: "14px",
//                           fontWeight: 600,
//                           color: "#e5e7eb",
//                         },
//                         value: {
//                           fontSize: "20px",
//                           fontWeight: 700,
//                           color: "#10b981",
//                         },
//                       },
//                     },
//                   },
//                   labels: environmentalChart.labels,
//                   stroke: { lineCap: "round" },
//                   tooltip: {
//                     theme: "dark",
//                   },
//                 }}
//                 series={environmentalChart.series}
//                 type="radialBar"
//                 height={280}
//               />
//             </motion.div>
//           )}
//         </div>

//         {/* Top Devices and Impact */}
//         <div className="devices-impact-section">
//           <TopDevicesWidget devices={topDevices} loading={loading} />

//           <motion.div
//             className="impact-card"
//             initial={{ opacity: 0, y: 20 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true }}
//             transition={{ duration: 0.6 }}
//             whileHover={{
//               y: -8,
//               boxShadow: "0 20px 40px rgba(16, 185, 129, 0.2)",
//             }}
//           >
//             <div className="impact-header">
//               <RiLeafLine className="impact-icon" />
//               <h3>Total Environmental Impact</h3>
//             </div>
//             <motion.div
//               className="impact-stats"
//               variants={containerVariants}
//               initial="hidden"
//               animate="visible"
//             >
//               {[
//                 {
//                   value: summary.equivalentTrees?.toFixed(2) || "0",
//                   label: "Equivalent Trees Planted",
//                   icon: <RiPlantLine />,
//                 },
//                 {
//                   value: `₹${(summary.totalCO2Saved * 500).toLocaleString("en-IN")}`,
//                   label: "Estimated Ecological Value",
//                   icon: <FiTrendingUp />,
//                 },
//                 {
//                   value: `${summary.totalCO2Saved?.toFixed(2) || 0}T`,
//                   label: "CO2 Offset",
//                   icon: <RiEarthLine />,
//                 },
//               ].map((stat, idx) => (
//                 <motion.div key={idx} variants={itemVariants}>
//                   <ImpactStat {...stat} />
//                 </motion.div>
//               ))}
//             </motion.div>
//           </motion.div>
//         </div>

//         {/* Top Donors Section */}
//         {topDonors.length > 0 && (
//           <motion.div
//             className="donors-section"
//             initial={{ opacity: 0, y: 20 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true }}
//             transition={{ duration: 0.6 }}
//           >
//             <div className="section-title">
//               <h2>Top Contributing Partners</h2>
//               <p>Organizations driving renewable energy adoption</p>
//             </div>
//             <div className="donors-grid">
//               {topDonors.map((donor, idx) => (
//                 <motion.div
//                   key={idx}
//                   className="donor-card"
//                   initial={{ opacity: 0, y: 20 }}
//                   whileInView={{ opacity: 1, y: 0 }}
//                   transition={{ delay: idx * 0.1 }}
//                   viewport={{ once: true }}
//                   whileHover={{
//                     y: -8,
//                     boxShadow: "0 20px 40px rgba(16, 185, 129, 0.15)",
//                   }}
//                 >
//                   <h4>{donor.donorName}</h4>
//                   <div className="donor-stats">
//                     <div className="stat">
//                       <span className="label">Devices</span>
//                       <span className="value">{donor.deviceCount}</span>
//                     </div>
//                     <div className="stat">
//                       <span className="label">kWh</span>
//                       <span className="value">
//                         {donor.totalPVKWh?.toFixed(2)}
//                       </span>
//                     </div>
//                     <div className="stat">
//                       <span className="label">CO2</span>
//                       <span className="value">
//                         {donor.totalCO2Saved?.toFixed(2)}T
//                       </span>
//                     </div>
//                   </div>
//                 </motion.div>
//               ))}
//             </div>
//           </motion.div>
//         )}

//         {/* Footer CTA Section */}
//         <footer className="footer-section">
//           <div className="footer-content">
//             <div className="footer-text">
//               <h2>Making renewable energy transparent and impactful</h2>
//               <p>
//                 Monitor your solar installations in real-time and track your
//                 contribution to a sustainable future.
//               </p>
//             </div>
//             <motion.button
//               className="footer-button"
//               whileHover={{ scale: 1.05, y: -2 }}
//               whileTap={{ scale: 0.95 }}
//               onClick={scrollToTop}
//             >
//               Back to Top <FiArrowRight />
//             </motion.button>
//           </div>
//           <div className="footer-bottom">
//             <p>&copy; 2026 Bindi Solar Energy Monitor. All rights reserved.</p>
//           </div>
//         </footer>
//       </main>
//     </div>
//   );
// };

// export default SolarDashboardRegister;


/* ============================================================
   SOLAR DASHBOARD - COMPREHENSIVE STYLING
   Modern, eco-focused design with premium animations
============================================================ */

:root {
  /* Primary Colors - Eco/Green Theme */
  --color-primary: #10b981;
  --color-primary-light: #6ee7b7;
  --color-primary-dark: #059669;
  --color-primary-lighter: rgba(16, 185, 129, 0.1);
  --color-primary-lighter-20: rgba(16, 185, 129, 0.2);

  /* Accent Colors */
  --color-success: #34d399;
  --color-warning: #fbbf24;
  --color-danger: #ef4444;
  --color-info: #0ea5e9;

  /* Secondary Colors */
  --color-eco: #8b5cf6;
  --color-secondary: #06b6d4;

  /* Neutral Colors */
  --color-dark: #0f172a;
  --color-dark-lighter: #1e293b;
  --color-dark-light: #334155;
  --color-gray-400: #9ca3af;
  --color-gray-300: #d1d5db;
  --color-gray-200: #e5e7eb;
  --color-gray-100: #f3f4f6;
  --color-white: #ffffff;

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  --shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.15);

  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  --spacing-2xl: 3rem;
  --spacing-3xl: 4rem;

  /* Typography */
  --font-primary: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  --font-display: "Poppins", "Segoe UI", sans-serif;

  /* Transitions */
  --transition-fast: 0.15s ease-in-out;
  --transition-base: 0.3s ease-in-out;
  --transition-slow: 0.5s ease-in-out;

  /* Border Radius */
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-2xl: 1.5rem;
  --radius-full: 9999px;
}

/* ============================================================
   GLOBAL STYLES
============================================================ */

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  font-family: var(--font-primary);
  background: linear-gradient(135deg, var(--color-dark) 0%, var(--color-dark-lighter) 100%);
  color: var(--color-gray-200);
  overflow-x: hidden;
}

.solar-dashboard {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1a1f2e 50%, #0f172a 100%);
}

/* ============================================================
   SCROLL PROGRESS BAR
============================================================ */

.scroll-progress-bar {
  position: fixed;
  top: 0;
  left: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--color-primary) 0%, var(--color-secondary) 100%);
  z-index: 999;
  transform-origin: 0;
}

/* ============================================================
   ERROR BANNER
============================================================ */

.error-banner {
  position: fixed;
  top: 20px;
  right: 20px;
  background: var(--color-danger);
  color: var(--color-white);
  padding: var(--spacing-lg) var(--spacing-xl);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  box-shadow: var(--shadow-xl);
  z-index: 1000;
  max-width: 400px;
  animation: slideInRight 0.3s ease-out;

  svg {
    flex-shrink: 0;
    width: 20px;
    height: 20px;
  }

  button {
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: var(--color-white);
    padding: 4px 12px;
    border-radius: var(--radius-sm);
    cursor: pointer;
    font-size: 12px;
    transition: var(--transition-fast);

    &:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  }
}

@keyframes slideInRight {
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* ============================================================
   HEADER
============================================================ */

.dashboard-header {
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.6) 100%);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(16, 185, 129, 0.2);
  padding: var(--spacing-xl) var(--spacing-2xl);
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-2xl);

  @media (max-width: 768px) {
    flex-direction: column;
    gap: var(--spacing-xl);
  }
}

.header-info {
  flex: 1;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);

  .logo-icon {
    width: 50px;
    height: 50px;
    border-radius: 12px;
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-white);
    font-size: 28px;
    flex-shrink: 0;
    cursor: pointer;
  }

  h1 {
    font-family: var(--font-display);
    font-size: 28px;
    font-weight: 700;
    color: var(--color-white);
    margin-bottom: 4px;
    background: linear-gradient(135deg, var(--color-white) 0%, var(--color-primary-light) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .tagline {
    color: var(--color-gray-400);
    font-size: 14px;
    font-weight: 500;
  }
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  flex-wrap: wrap;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }
}

.header-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: 10px 20px;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
  color: var(--color-white);
  border: none;
  border-radius: var(--radius-lg);
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition-base);
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
  }

  &:active {
    transform: translateY(0);
  }

  svg {
    width: 18px;
    height: 18px;
  }
}

.refresh-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: var(--transition-fast);

  &:hover {
    background: rgba(16, 185, 129, 0.2);
  }

  svg {
    width: 18px;
    height: 18px;
  }

  .spin-icon {
    animation: spin 1s linear infinite;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.last-updated {
  color: var(--color-gray-400);
  font-size: 12px;

  small {
    display: block;
  }
}

.user-menu {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.user-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);

  .user-name {
    color: var(--color-gray-200);
    font-weight: 600;
    font-size: 14px;
  }

  .logout-btn {
    padding: 6px 12px;
    background: rgba(239, 68, 68, 0.1);
    color: var(--color-danger);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: var(--radius-md);
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: var(--transition-fast);

    &:hover {
      background: rgba(239, 68, 68, 0.2);
    }
  }
}

.status-badge {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: 8px 16px;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.4);
  border-radius: var(--radius-full);
  color: var(--color-primary);
  font-size: 13px;
  font-weight: 600;
  position: relative;

  .pulsee {
    width: 8px;
    height: 8px;
    background: var(--color-primary);
    border-radius: 50%;
    display: inline-block;
  }

  &:hover {
    background: rgba(16, 185, 129, 0.15);
    border-color: rgba(16, 185, 129, 0.6);
  }
}

/* ============================================================
   MAIN CONTENT
============================================================ */

.dashboard-main {
  max-width: 1400px;
  margin: 0 auto;
  padding: var(--spacing-3xl) var(--spacing-2xl);

  @media (max-width: 768px) {
    padding: var(--spacing-2xl) var(--spacing-lg);
  }
}

/* ============================================================
   WELCOME BANNER
============================================================ */

.welcome-banner {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(6, 182, 212, 0.05) 100%);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl) var(--spacing-2xl);
  margin-bottom: var(--spacing-2xl);
  backdrop-filter: blur(10px);

  .welcome-content {
    display: flex;
    align-items: center;
    gap: var(--spacing-lg);

    .welcome-icon {
      font-size: 32px;
      color: var(--color-primary);
      flex-shrink: 0;
    }

    h3 {
      font-size: 20px;
      font-weight: 700;
      color: var(--color-white);
      margin-bottom: var(--spacing-xs);
    }

    p {
      color: var(--color-gray-300);
      font-size: 14px;
    }
  }
}

/* ============================================================
   METRICS GRID
============================================================ */

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--spacing-xl);
  margin-bottom: var(--spacing-3xl);

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: var(--spacing-lg);
  }
}

.metric-card {
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.5) 0%, rgba(15, 23, 42, 0.3) 100%);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl) var(--spacing-lg);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, var(--color-primary) 0%, var(--color-secondary) 100%);
  }

  &.metric-primary {
    --metric-color: var(--color-primary);
  }

  &.metric-success {
    --metric-color: var(--color-success);
  }

  &.metric-eco {
    --metric-color: var(--color-eco);
  }

  &.metric-secondary {
    --metric-color: var(--color-secondary);
  }

  .metric-icon {
    font-size: 32px;
    color: var(--metric-color, var(--color-primary));
    margin-bottom: var(--spacing-lg);
    display: inline-block;
  }

  h3 {
    font-size: 13px;
    font-weight: 600;
    color: var(--color-gray-400);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: var(--spacing-md);
  }

  .metric-value {
    font-size: 32px;
    font-weight: 700;
    color: var(--color-white);
    margin-bottom: var(--spacing-md);
    font-family: "Courier New", monospace;

    .metric-unit {
      font-size: 18px;
      color: var(--color-gray-400);
      margin-left: 4px;
      font-family: var(--font-primary);
    }
  }

  .metric-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid rgba(16, 185, 129, 0.1);
    padding-top: var(--spacing-md);

    .metric-subtitle {
      font-size: 12px;
      color: var(--color-gray-400);
    }

    .metric-trend {
      font-size: 12px;
      color: var(--metric-color, var(--color-primary));
      font-weight: 600;
      padding: 4px 8px;
      background: rgba(16, 185, 129, 0.1);
      border-radius: var(--radius-sm);
    }
  }
}

/* ============================================================
   STATUS OVERVIEW
============================================================ */

.status-overview {
  margin-bottom: var(--spacing-3xl);
}

.status-card {
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.5) 0%, rgba(15, 23, 42, 0.3) 100%);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: var(--radius-xl);
  padding: var(--spacing-2xl);
  backdrop-filter: blur(10px);

  .status-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-2xl);
    padding-bottom: var(--spacing-lg);
    border-bottom: 1px solid rgba(16, 185, 129, 0.1);

    h3 {
      font-size: 18px;
      font-weight: 700;
      color: var(--color-white);
    }

    .status-indicator {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      color: var(--color-success);
      font-size: 12px;
      font-weight: 600;

      .pulsee-dot {
        width: 8px;
        height: 8px;
        background: var(--color-success);
        border-radius: 50%;
        display: inline-block;
      }
    }
  }

  .status-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--spacing-lg);

    @media (max-width: 768px) {
      grid-template-columns: repeat(2, 1fr);
    }
  }
}

.status-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-lg);
  background: rgba(16, 185, 129, 0.05);
  border: 1px solid rgba(16, 185, 129, 0.1);
  border-radius: var(--radius-lg);
  transition: var(--transition-base);

  &.status-primary {
    --status-color: var(--color-primary);
  }

  &.status-success {
    --status-color: var(--color-success);
  }

  &.status-secondary {
    --status-color: var(--color-secondary);
  }

  &.status-eco {
    --status-color: var(--color-eco);
  }

  &:hover {
    background: rgba(16, 185, 129, 0.1);
    border-color: rgba(16, 185, 129, 0.3);
  }

  .status-icon {
    font-size: 24px;
    color: var(--status-color);
    flex-shrink: 0;
  }

  .status-text {
    display: flex;
    flex-direction: column;
    gap: 2px;

    .status-label {
      font-size: 12px;
      color: var(--color-gray-400);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    .status-value {
      font-size: 20px;
      font-weight: 700;
      color: var(--color-white);
    }
  }
}

/* ============================================================
   CHARTS SECTION
============================================================ */

.charts-section {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: var(--spacing-2xl);
  margin-bottom: var(--spacing-3xl);

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
}

.chart-container {
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.5) 0%, rgba(15, 23, 42, 0.3) 100%);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: var(--radius-xl);
  padding: var(--spacing-2xl);
  backdrop-filter: blur(10px);

  &.large {
    grid-column: 1 / -1;
  }

  .chart-header {
    margin-bottom: var(--spacing-2xl);

    h2 {
      font-size: 20px;
      font-weight: 700;
      color: var(--color-white);
      margin-bottom: var(--spacing-sm);
    }

    .chart-subtitle {
      font-size: 14px;
      color: var(--color-gray-400);
    }
  }
}

/* ============================================================
   TOP DEVICES WIDGET
============================================================ */

.top-devices-widget {
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.5) 0%, rgba(15, 23, 42, 0.3) 100%);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: var(--radius-xl);
  padding: var(--spacing-2xl);
  backdrop-filter: blur(10px);

  .widget-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-2xl);
    padding-bottom: var(--spacing-lg);
    border-bottom: 1px solid rgba(16, 185, 129, 0.1);

    h3 {
      font-size: 18px;
      font-weight: 700;
      color: var(--color-white);
    }

    .device-count {
      background: rgba(16, 185, 129, 0.1);
      color: var(--color-primary);
      padding: 4px 12px;
      border-radius: var(--radius-full);
      font-size: 12px;
      font-weight: 600;
    }
  }

  .devices-list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);
  }

  .device-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-lg);
    padding: var(--spacing-lg);
    background: rgba(16, 185, 129, 0.05);
    border: 1px solid rgba(16, 185, 129, 0.1);
    border-radius: var(--radius-lg);
    transition: var(--transition-base);

    &:hover {
      background: rgba(16, 185, 129, 0.1);
      border-color: rgba(16, 185, 129, 0.3);
    }

    .device-rank {
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-white);
      font-weight: 700;
      font-size: 14px;
      flex-shrink: 0;
    }

    .device-info {
      flex: 1;

      h4 {
        font-size: 14px;
        font-weight: 600;
        color: var(--color-white);
        margin-bottom: 4px;
      }

      .device-location {
        font-size: 12px;
        color: var(--color-gray-400);
      }
    }

    .device-stats {
      display: flex;
      gap: var(--spacing-lg);

      .stat {
        display: flex;
        flex-direction: column;
        align-items: center;

        .label {
          font-size: 11px;
          color: var(--color-gray-400);
          text-transform: uppercase;
          letter-spacing: 0.3px;
          margin-bottom: 2px;
        }

        .value {
          font-size: 14px;
          font-weight: 700;
          color: var(--color-white);
          font-family: "Courier New", monospace;
        }

        &.highlight {
          .value {
            color: var(--color-primary);
          }
        }
      }
    }
  }

  .loading-state,
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-3xl) var(--spacing-xl);
    color: var(--color-gray-400);

    svg {
      font-size: 32px;
      margin-bottom: var(--spacing-md);
    }

    &.loading-state svg {
      animation: spin 1s linear infinite;
    }

    p {
      font-size: 14px;
    }
  }
}

/* ============================================================
   DEVICES & IMPACT SECTION
============================================================ */

.devices-impact-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-2xl);
  margin-bottom: var(--spacing-3xl);

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
}

/* ============================================================
   IMPACT CARD
============================================================ */

.impact-card {
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.5) 0%, rgba(15, 23, 42, 0.3) 100%);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: var(--radius-xl);
  padding: var(--spacing-2xl);
  backdrop-filter: blur(10px);

  .impact-header {
    display: flex;
    align-items: center;
    gap: var(--spacing-lg);
    margin-bottom: var(--spacing-2xl);
    padding-bottom: var(--spacing-lg);
    border-bottom: 1px solid rgba(16, 185, 129, 0.1);

    .impact-icon {
      font-size: 28px;
      color: var(--color-primary);
    }

    h3 {
      font-size: 18px;
      font-weight: 700;
      color: var(--color-white);
    }
  }

  .impact-stats {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);
  }

  .impact-stat {
    display: flex;
    align-items: center;
    gap: var(--spacing-lg);
    padding: var(--spacing-lg);
    background: rgba(16, 185, 129, 0.05);
    border: 1px solid rgba(16, 185, 129, 0.1);
    border-radius: var(--radius-lg);
    transition: var(--transition-base);

    &:hover {
      background: rgba(16, 185, 129, 0.1);
      border-color: rgba(16, 185, 129, 0.3);
    }

    .impact-stat-icon {
      font-size: 24px;
      color: var(--color-primary);
      flex-shrink: 0;
    }

    > div {
      flex: 1;
    }

    .impact-stat-value {
      font-size: 18px;
      font-weight: 700;
      color: var(--color-white);
      font-family: "Courier New", monospace;
      margin-bottom: 2px;
    }

    .impact-stat-label {
      font-size: 12px;
      color: var(--color-gray-400);
    }
  }
}

/* ============================================================
   DONORS SECTION
============================================================ */

.donors-section {
  margin-bottom: var(--spacing-3xl);

  .section-title {
    text-align: center;
    margin-bottom: var(--spacing-3xl);

    h2 {
      font-size: 28px;
      font-weight: 700;
      color: var(--color-white);
      margin-bottom: var(--spacing-md);
      background: linear-gradient(135deg, var(--color-white) 0%, var(--color-primary-light) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    p {
      color: var(--color-gray-400);
      font-size: 16px;
    }
  }

  .donors-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: var(--spacing-xl);

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }

    .donor-card {
      background: linear-gradient(135deg, rgba(30, 41, 59, 0.5) 0%, rgba(15, 23, 42, 0.3) 100%);
      border: 1px solid rgba(16, 185, 129, 0.2);
      border-radius: var(--radius-xl);
      padding: var(--spacing-xl);
      backdrop-filter: blur(10px);
      transition: var(--transition-base);

      &:hover {
        border-color: rgba(16, 185, 129, 0.4);
      }

      h4 {
        font-size: 16px;
        font-weight: 700;
        color: var(--color-white);
        margin-bottom: var(--spacing-lg);
      }

      .donor-stats {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: var(--spacing-md);

        .stat {
          text-align: center;
          padding: var(--spacing-md);
          background: rgba(16, 185, 129, 0.05);
          border-radius: var(--radius-md);
          border: 1px solid rgba(16, 185, 129, 0.1);

          .label {
            display: block;
            font-size: 11px;
            color: var(--color-gray-400);
            text-transform: uppercase;
            letter-spacing: 0.3px;
            margin-bottom: 4px;
          }

          .value {
            display: block;
            font-size: 16px;
            font-weight: 700;
            color: var(--color-primary);
            font-family: "Courier New", monospace;
          }
        }
      }
    }
  }
}

/* ============================================================
   FOOTER SECTION
============================================================ */

.footer-section {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(6, 182, 212, 0.05) 100%);
  border-top: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: var(--radius-2xl) var(--radius-2xl) 0 0;
  padding: var(--spacing-3xl) var(--spacing-2xl);
  margin-top: var(--spacing-3xl);
  backdrop-filter: blur(10px);

  .footer-content {
    max-width: 900px;
    margin: 0 auto var(--spacing-2xl);
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--spacing-2xl);

    @media (max-width: 768px) {
      flex-direction: column;
      text-align: center;
    }

    .footer-text {
      flex: 1;

      h2 {
        font-size: 24px;
        font-weight: 700;
        color: var(--color-white);
        margin-bottom: var(--spacing-md);
      }

      p {
        color: var(--color-gray-300);
        font-size: 15px;
        line-height: 1.6;
      }
    }

    .footer-button {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      padding: 12px 28px;
      background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
      color: var(--color-white);
      border: none;
      border-radius: var(--radius-lg);
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      transition: var(--transition-base);
      box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
      flex-shrink: 0;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
      }

      svg {
        width: 16px;
        height: 16px;
      }
    }
  }

  .footer-bottom {
    text-align: center;
    padding-top: var(--spacing-lg);
    border-top: 1px solid rgba(16, 185, 129, 0.1);

    p {
      color: var(--color-gray-400);
      font-size: 13px;
    }
  }
}

/* ============================================================
   MODAL STYLES
============================================================ */

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(4px);
  padding: var(--spacing-lg);

  @media (max-width: 768px) {
    align-items: flex-end;
  }
}

.login-modal {
  background: linear-gradient(135deg, var(--color-dark-lighter) 0%, var(--color-dark) 100%);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: var(--radius-2xl);
  padding: var(--spacing-2xl);
  width: 100%;
  max-width: 450px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4);
  position: relative;

  @media (max-width: 768px) {
    border-radius: var(--radius-2xl) var(--radius-2xl) 0 0;
    max-width: 100%;
  }

  .modal-close {
    position: absolute;
    top: var(--spacing-lg);
    right: var(--spacing-lg);
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: rgba(16, 185, 129, 0.1);
    border: 1px solid rgba(16, 185, 129, 0.2);
    color: var(--color-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: var(--transition-fast);

    &:hover {
      background: rgba(16, 185, 129, 0.2);
    }
  }

  .login-modal-header {
    text-align: center;
    margin-bottom: var(--spacing-2xl);

    .login-modal-icon {
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-white);
      font-size: 32px;
      margin: 0 auto var(--spacing-lg);
    }

    h2 {
      font-size: 24px;
      font-weight: 700;
      color: var(--color-white);
      margin-bottom: var(--spacing-sm);
    }

    p {
      color: var(--color-gray-400);
      font-size: 14px;
    }
  }

  .login-modal-form {
    margin-bottom: var(--spacing-2xl);

    .form-group {
      margin-bottom: var(--spacing-lg);

      label {
        display: block;
        font-size: 13px;
        font-weight: 600;
        color: var(--color-gray-200);
        margin-bottom: var(--spacing-sm);
        text-transform: uppercase;
        letter-spacing: 0.3px;
      }

      .input-group {
        position: relative;
        display: flex;
        align-items: center;

        .input-icon {
          position: absolute;
          left: var(--spacing-lg);
          color: var(--color-gray-400);
          pointer-events: none;
        }

        input {
          width: 100%;
          padding: var(--spacing-lg) var(--spacing-lg) var(--spacing-lg) 40px;
          background: rgba(16, 185, 129, 0.05);
          border: 1px solid rgba(16, 185, 129, 0.2);
          border-radius: var(--radius-lg);
          color: var(--color-white);
          font-size: 14px;
          transition: var(--transition-fast);

          &:focus {
            outline: none;
            background: rgba(16, 185, 129, 0.1);
            border-color: rgba(16, 185, 129, 0.4);
          }

          &::placeholder {
            color: var(--color-gray-400);
          }
        }
      }
    }

    .form-options {
      margin-bottom: var(--spacing-lg);

      .remember-me {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        cursor: pointer;
        font-size: 14px;
        color: var(--color-gray-300);

        input[type="checkbox"] {
          width: 16px;
          height: 16px;
          cursor: pointer;
          accent-color: var(--color-primary);
        }
      }
    }

    .login-submit-btn {
      width: 100%;
      padding: var(--spacing-lg);
      background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
      color: var(--color-white);
      border: none;
      border-radius: var(--radius-lg);
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      transition: var(--transition-base);
      box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);

      &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
      }

      &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }
    }
  }

  .login-modal-footer {
    text-align: center;
    padding-top: var(--spacing-lg);
    border-top: 1px solid rgba(16, 185, 129, 0.1);

    p {
      color: var(--color-gray-400);
      font-size: 13px;

      a {
        color: var(--color-primary);
        text-decoration: none;
        font-weight: 600;
        transition: var(--transition-fast);

        &:hover {
          color: var(--color-primary-light);
        }
      }
    }
  }
}

.map-modal {
  background: linear-gradient(135deg, var(--color-dark-lighter) 0%, var(--color-dark) 100%);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: var(--radius-2xl);
  width: 100%;
  max-width: 1200px;
  height: 80vh;
  max-height: 90vh;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  overflow: hidden;

  @media (max-width: 768px) {
    max-width: 100%;
    height: 80vh;
    border-radius: var(--radius-xl);
  }

  .map-modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-xl) var(--spacing-2xl);
    border-bottom: 1px solid rgba(16, 185, 129, 0.1);

    h2 {
      font-size: 18px;
      font-weight: 700;
      color: var(--color-white);
    }

    .modal-close {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.2);
      color: var(--color-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: var(--transition-fast);

      &:hover {
        background: rgba(16, 185, 129, 0.2);
      }
    }
  }

  .map-modal-content {
    flex: 1;
    overflow: hidden;
  }
}

/* ============================================================
   RESPONSIVE DESIGN
============================================================ */

@media (max-width: 768px) {
  .dashboard-main {
    padding: var(--spacing-xl) var(--spacing-lg);
  }

  .metrics-grid {
    grid-template-columns: 1fr;
  }

  .charts-section {
    grid-template-columns: 1fr;
  }

  .devices-impact-section {
    grid-template-columns: 1fr;
  }

  .logo-section h1 {
    font-size: 20px;
  }
}

/* ============================================================
   ANIMATIONS
============================================================ */

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideInUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Print Styles */
@media print {
  .dashboard-header,
  .header-actions,
  .footer-section {
    display: none;
  }

  .solar-dashboard {
    background: white;
    color: black;
  }
}

