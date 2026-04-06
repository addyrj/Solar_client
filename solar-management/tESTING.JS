// import React, { useState, useEffect, useRef } from 'react';
// import { useDispatch, useSelector } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import styled from "styled-components";
// import { getNewDeviceList,getInternationalDonor } from "../../Database/Action/DashboardAction";
// import NoData from "../Components/NoData";

// // Default center coordinates for India
// const defaultCenter = {
//   lat: 20.5937,
//   lng: 78.9629
// };

// const DeviceMap = () => {
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const [mapLoaded, setMapLoaded] = useState(false);
//   const [selectedDevice, setSelectedDevice] = useState(null);
//   const mapRef = useRef(null);
//   const leafletMapRef = useRef(null);
//   const markersRef = useRef([]);

//   // Get device data from Redux store
//   const newDeviceList = useSelector((state) => state.DashboardReducer.newDeviceList);
//   const apistate = useSelector((state) => state.ConstantReducer.apistate);

//   // Define colors for different donors
//   const donorColors = {
//     "Luminous": "#3498db", // Blue
//     "Royal Rajasthan Foundation": "#e84393", // Pink
//     "default": "#2ecc71" // Green for any other donors
//   };

//   // Fetch device data from API using Redux action
//   useEffect(() => {
//     dispatch(getNewDeviceList({ navigate: navigate }));
//   }, [dispatch, apistate]);

//   // Load Leaflet CSS and JS
//   const loadLeaflet = () => {
//     return new Promise((resolve, reject) => {
//       if (window.L) {
//         resolve(window.L);
//         return;
//       }

//       // Load CSS
//       const css = document.createElement('link');
//       css.rel = 'stylesheet';
//       css.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css';
//       document.head.appendChild(css);

//       // Load JS
//       const script = document.createElement('script');
//       script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
//       script.async = true;

//       script.onload = () => {
//         if (window.L) {
//           resolve(window.L);
//         } else {
//           reject(new Error('Leaflet failed to load'));
//         }
//       };

//       script.onerror = () => reject(new Error('Failed to load Leaflet'));
//       document.head.appendChild(script);
//     });
//   };

//   // Initialize map
//   const initializeMap = async () => {
//     if (!mapRef.current) return;

//     try {
//       const L = await loadLeaflet();

//       // Create map centered on India
//       const map = L.map(mapRef.current).setView([defaultCenter.lat, defaultCenter.lng], 5);

//       // Add OpenStreetMap tiles
//       L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//         attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
//         maxZoom: 19
//       }).addTo(map);

//       leafletMapRef.current = map;
//       setMapLoaded(true);

//       // Add markers if devices are already loaded
//       if (newDeviceList && newDeviceList.length > 0) {
//         addMarkersToMap(L, map);
//       }
//     } catch (error) {
//       console.error('Error loading Leaflet:', error);
//     }
//   };

//   // Add markers to the map when devices data is available
//   useEffect(() => {
//     if (mapLoaded && newDeviceList && newDeviceList.length > 0 && window.L && leafletMapRef.current) {
//       addMarkersToMap(window.L, leafletMapRef.current);
//     }
//   }, [newDeviceList, mapLoaded]);

//   // Initialize map on component mount
//   useEffect(() => {
//     initializeMap();

//     // Cleanup function to remove map on component unmount
//     return () => {
//       if (leafletMapRef.current) {
//         leafletMapRef.current.remove();
//       }
//     };
//   }, []);

//   // Add markers to the map
//   const addMarkersToMap = (L, map) => {
//     // Clear existing markers
//     clearMarkers();

//     if (!newDeviceList || newDeviceList.length === 0) return;

//     markersRef.current = newDeviceList.map(item => {
//       // Skip items without valid coordinates
//       if (!item.Location) return null;

//       try {
//         const [lat, lng] = item.Location.split(',').map(coord => parseFloat(coord.trim()));
//         if (isNaN(lat) || isNaN(lng)) return null;

//         // Get color based on donor
//         const color = donorColors[item.DonarName] || donorColors.default;

//         // Create custom icon
//         const customIcon = L.divIcon({
//           className: 'custom-marker',
//           html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5);"></div>`,
//           iconSize: [20, 20],
//           iconAnchor: [10, 10]
//         });

//         // Create marker with custom icon
//         const marker = L.marker([lat, lng], { icon: customIcon })
//           .addTo(map)
//           .bindPopup(`
//             <div style="min-width: 200px;">
//               <h3 style="margin: 0 0 10px; color: ${color};">${item.DonarName || 'Unknown Donor'}</h3>
//               <p><strong>Device UID:</strong> ${item.UID}</p>
//               <p><strong>Beneficiary:</strong> ${item.NameOfBeneficiary || 'N/A'}</p>
//               <p><strong>Village:</strong> ${item.VillageName || 'N/A'}</p>
//               <p><strong>Block:</strong> ${item.Block || 'N/A'}</p>
//               <p><strong>District:</strong> ${item.District || 'N/A'}</p>
//               <p><strong>State:</strong> ${item.State || 'N/A'}</p>
//               ${item.InstallationDate ? `<p><strong>Installation Date:</strong> ${item.InstallationDate}</p>` : ''}
//             </div>
//           `);

//         // Add click event to marker
//         marker.on('click', () => {
//           setSelectedDevice(item);
//         });

//         return marker;
//       } catch (error) {
//         console.error('Error creating marker for item:', item, error);
//         return null;
//       }
//     }).filter(marker => marker !== null);
//   };

//   // Clear all markers from the map
//   const clearMarkers = () => {
//     markersRef.current.forEach(marker => {
//       if (marker && leafletMapRef.current) {
//         leafletMapRef.current.removeLayer(marker);
//       }
//     });
//     markersRef.current = [];
//   };

//   // Filter devices by donor
//   const filterByDonor = (donorName) => {
//     if (!leafletMapRef.current || !window.L || !newDeviceList) return;

//     // Clear existing markers
//     clearMarkers();

//     // Add filtered markers
//     const filteredDevices = donorName ? newDeviceList.filter(item => item.DonarName === donorName) : newDeviceList;

//     // Create new markers for filtered devices
//     markersRef.current = filteredDevices.map(item => {
//       if (!item.Location) return null;

//       try {
//         const [lat, lng] = item.Location.split(',').map(coord => parseFloat(coord.trim()));
//         if (isNaN(lat) || isNaN(lng)) return null;

//         const color = donorColors[item.DonarName] || donorColors.default;

//         const customIcon = window.L.divIcon({
//           className: 'custom-marker',
//           html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5);"></div>`,
//           iconSize: [20, 20],
//           iconAnchor: [10, 10]
//         });

//         const marker = window.L.marker([lat, lng], { icon: customIcon })
//           .addTo(leafletMapRef.current)
//           .bindPopup(`
//             <div style="min-width: 200px;">
//               <h3 style="margin: 0 0 10px; color: ${color};">${item.DonarName || 'Unknown Donor'}</h3>
//               <p><strong>Device UID:</strong> ${item.UID}</p>
//               <p><strong>Beneficiary:</strong> ${item.NameOfBeneficiary || 'N/A'}</p>
//               <p><strong>Village:</strong> ${item.VillageName || 'N/A'}</p>
//               <p><strong>Block:</strong> ${item.Block || 'N/A'}</p>
//               <p><strong>District:</strong> ${item.District || 'N/A'}</p>
//               <p><strong>State:</strong> ${item.State || 'N/A'}</p>
//               ${item.InstallationDate ? `<p><strong>Installation Date:</strong> ${item.InstallationDate}</p>` : ''}
//             </div>
//           `);

//         marker.on('click', () => {
//           setSelectedDevice(item);
//         });

//         return marker;
//       } catch (error) {
//         console.error('Error creating marker for item:', item, error);
//         return null;
//       }
//     }).filter(marker => marker !== null);

//     setSelectedDevice(null);
//   };

//   // Get unique donors from devices
//   const uniqueDonors = newDeviceList ? [...new Set(newDeviceList.map(item => item.DonarName))].filter(Boolean) : [];

//   return (
//     <Wrapper>
//       <div className="content-wrapper">
//         <div className="container-full">
//           {/* <div className="content-header">
//             <div className="d-flex align-items-center">
//               <div className="me-auto">
//                 <h3 className="page-title">Device Location Map</h3>
//                 <div className="d-inline-block align-items-center">
//                   <nav>
//                     <ol className="breadcrumb">
//                       <li className="breadcrumb-item">
//                         <a href="#">
//                           <i className="mdi mdi-home-outline" />
//                         </a>
//                       </li>
//                       <li className="breadcrumb-item" aria-current="page">
//                         Maps
//                       </li>
//                       <li className="breadcrumb-item active" aria-current="page">
//                         Device Locations
//                       </li>
//                     </ol>
//                   </nav>
//                 </div>
//               </div>
//             </div>
//           </div> */}

//           <section className="content">
//             <div className="row">
//               <div className="col-12">
//                 <div className="box">
//                   <div className="row">
//                     <div className="box-header with-border d-flex justify-content-between align-items-center">
//                       {/* Left side: Title */}
//                       <h4 className="box-title mb-0">Device Locations</h4>

//                       {/* Center: Donor Dropdown */}
//                       {newDeviceList && newDeviceList.length > 0 && (

//                   <div className="mx-auto" style={{ display: "flex", gap: "19px" }}>
//                           <h3 className="text-lg font-semibold mb-3">Filter by Donor:</h3>
//                           <select
//                             className="px-3 py-2 border rounded-md text-sm"
//                             onChange={(e) => filterByDonor(e.target.value || null)}
//                             defaultValue=""
//                           >
//                             <option value="">All Donors</option>
//                             {uniqueDonors.map((donor) => (
//                               <option key={donor} value={donor}>
//                                 {donor}
//                               </option>
//                             ))}
//                           </select>
//                         </div>
//                       )}

//                       {/* Right side: Refresh button */}
//                       <div>
//                         <button
//                           className="filterButton"
//                           onClick={() => window.location.reload()}
//                         >
//                           <i className="fa-solid fa-refresh" style={{ marginRight: "10px" }} />
//                           Refresh
//                         </button>
//                       </div>
//                     </div>
//                   </div>


//                   <div className="box-body" style={{ padding:"0px" }}>


//                     <div className="mb-6">
//                       <div
//                         ref={mapRef}
//                         className="w-full h-96 border-2 border-gray-300 rounded-lg bg-gray-100"
//                         style={{ minHeight: '500px' }}
//                       >
//                         {!mapLoaded && (
//                           <div className="flex items-center justify-center h-full">
//                             <div className="text-center p-4">
//                               <div className="text-lg font-semibold mb-2">🗺️ Loading Map...</div>
//                               <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
//                             </div>
//                           </div>
//                         )}
//                         {mapLoaded && (!newDeviceList || newDeviceList.length === 0) && (
//                           <div className="flex items-center justify-center h-full">
//                             <NoData message="No device data available" />
//                           </div>
//                         )}
//                       </div>
//                     </div>

//                   </div>
//                 </div>
//               </div>
//             </div>
//           </section>
//         </div>
//       </div>
//     </Wrapper>
//   );
// };

// const Wrapper = styled.section`
//   .filterButton {
//     background: ${({ theme }) => theme.colors.themeColor};
//     padding: 10px 20px 10px 20px;
//     color: white;
//     margin: 5px;
//     &:hover,
//     &:active {
//       background-color: transparent;
//       border: none;
//       color: white;
//       cursor: pointer;
//       border: 1px solid;
//       border-color: ${({ theme }) => theme.colors.themeColor};
//       transform: scale(0.96);
//     }
//   }
// `;

// export default DeviceMap; 

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiSun,
  FiZap,
  FiTrendingUp,
  FiHome,
  FiDroplet,
  FiWind,
  FiBarChart2,
  FiLogIn,
  FiMap,
  FiX,
  FiUser,
  FiLock,
  FiArrowRight,
} from "react-icons/fi";
import { RiLeafLine, RiPlantLine, RiEarthLine } from "react-icons/ri";
import Chart from "react-apexcharts";
import toast from "react-hot-toast";
import isEmpty from "lodash.isempty";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setLoader } from "../../Database/Action/ConstantAction";
import { postHeaderWithoutToken, getHeaderWithToken } from "../../Database/Utils";
import Cookies from "universal-cookie";
import DeviceMapComponent from "../Components/DeviceMapComponent";
import "./SolarDashboard.css";

// Login Modal Component with full API integration
const LoginModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const dispatch = useDispatch();
  const cookies = new Cookies();
  const navigate = useNavigate();

  const [loginInfo, setLoginInfo] = useState({
    userName: "",
    password: "",
    rememberMe: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
    if (isEmpty(loginInfo.userName)) {
      toast.error("Failed! Please Enter UserName");
      return;
    }
    if (isEmpty(loginInfo.password)) {
      toast.error("Failed! Please Enter Password");
      return;
    }

    setIsLoading(true);
    dispatch(setLoader(true));

    let formData = new FormData();
    formData.append("userId", loginInfo.userName);
    formData.append("pass", loginInfo.password);

    axios
      .post(
        process.env.REACT_APP_BASE_URL + "loginAdmin",
        formData,
        postHeaderWithoutToken,
      )
      .then((res) => {
        dispatch(setLoader(false));
        setIsLoading(false);

        const rememberMe = {
          rememberToken: res?.data?.token,
          checkState: loginInfo.rememberMe,
        };

        cookies.remove("adminToken");
        cookies.remove("rememberMe");

        cookies.set("adminToken", res?.data?.token, {
          path: "/",
          maxAge: loginInfo.rememberMe ? 30 * 24 * 60 * 60 : undefined,
        });

        if (loginInfo.rememberMe) {
          cookies.set("rememberMe", JSON.stringify(rememberMe), {
            path: "/",
            maxAge: 30 * 24 * 60 * 60,
          });
        }
        toast.success(res.data.message);
        navigate("/dashboard");
      })
      .catch((error) => {
        dispatch(setLoader(false));
        setIsLoading(false);
        console.log("error is     ", error);
        toast.error(error?.response?.data?.message || error.message);
      });
  };

  if (!isOpen) return null;

  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="login-modal"
        initial={{ scale: 0.9, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 50 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose}>
          <FiX />
        </button>

        <div className="login-modal-header">
          <div className="login-modal-icon">
            <FiSun />
          </div>
          <h2>Welcome Back</h2>
          <p>Sign in to access your solar dashboard</p>
        </div>

        <div className="login-modal-form">
          <div className="form-group">
            <label>Username</label>
            <div className="input-group">
              <FiUser className="input-icon" />
              <input
                type="text"
                placeholder="Enter your username"
                value={loginInfo.userName}
                onChange={(e) =>
                  setLoginInfo({ ...loginInfo, userName: e.target.value })
                }
                onKeyPress={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-group">
              <FiLock className="input-icon" />
              <input
                type="password"
                placeholder="Enter your password"
                value={loginInfo.password}
                onChange={(e) =>
                  setLoginInfo({ ...loginInfo, password: e.target.value })
                }
                onKeyPress={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>
          </div>

          <div className="form-options">
            <label className="remember-me">
              <input
                type="checkbox"
                checked={loginInfo.rememberMe}
                onChange={(e) =>
                  setLoginInfo({ ...loginInfo, rememberMe: e.target.checked })
                }
              />
              <span>Remember Me</span>
            </label>
          </div>

          <motion.button
            className="login-submit-btn"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </motion.button>
        </div>

        <div className="login-modal-footer">
          <p>
            Need help? <a href="#">Contact support</a>
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Map Modal Component
const MapModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="map-modal"
        initial={{ scale: 0.9, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 50 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="map-modal-header">
          <h2>Solar Installation Map</h2>
          <button className="modal-close" onClick={onClose}>
            <FiX />
          </button>
        </div>
        <div className="map-modal-content">
          <DeviceMapComponent
            showHeader={false}
            showFilters={false}
            customHeight="100%"
          />
        </div>
      </motion.div>
    </motion.div>
  );
};

// Metric Card Component
const MetricCard = ({ icon, title, value, subtitle, color, trend }) => (
  <motion.div
    className={`metric-card metric-${color}`}
    whileHover={{ y: -12, boxShadow: "0 20px 40px rgba(16, 185, 129, 0.25)" }}
    transition={{ duration: 0.3 }}
  >
    <motion.div
      className="metric-icon"
      whileHover={{ scale: 1.15, rotate: -15 }}
      transition={{ duration: 0.3 }}
    >
      {icon}
    </motion.div>
    <div className="metric-content">
      <h3>{title}</h3>
      <motion.div className="metric-value" layoutId={`metric-${title}`}>
        {value}
      </motion.div>
      <div className="metric-footer">
        <span className="metric-subtitle">{subtitle}</span>
        <span className="metric-trend">{trend}</span>
      </div>
    </div>
  </motion.div>
);

// Status Item Component
const StatusItem = ({ icon, label, value, color }) => (
  <motion.div
    className={`status-item status-${color}`}
    whileHover={{ y: -6, backgroundColor: "rgba(16, 185, 129, 0.1)" }}
    transition={{ duration: 0.2 }}
  >
    <motion.div
      className="status-icon"
      whileHover={{ scale: 1.2, rotate: 10 }}
      transition={{ duration: 0.2 }}
    >
      {icon}
    </motion.div>
    <div className="status-text">
      <span className="status-label">{label}</span>
      <span className="status-value">{value}</span>
    </div>
  </motion.div>
);

// Impact Stat Component
const ImpactStat = ({ value, label, icon }) => (
  <motion.div
    className="impact-stat"
    whileHover={{ y: -8, backgroundColor: "rgba(16, 185, 129, 0.2)" }}
    transition={{ duration: 0.2 }}
  >
    <motion.div
      className="impact-stat-icon"
      whileHover={{ scale: 1.2, rotate: -15 }}
      transition={{ duration: 0.2 }}
    >
      {icon}
    </motion.div>
    <div>
      <div className="impact-stat-value">{value}</div>
      <div className="impact-stat-label">{label}</div>
    </div>
  </motion.div>
);

// Installation Card Component
const InstallationCard = ({ title, specs, icon }) => (
  <motion.div
    className="installation-card"
    whileHover={{ y: -16, boxShadow: "0 25px 50px rgba(16, 185, 129, 0.2)" }}
    transition={{ duration: 0.3 }}
  >
    <motion.div
      className="installation-icon"
      whileHover={{ scale: 1.2, rotate: -20 }}
      transition={{ duration: 0.3 }}
    >
      {icon}
    </motion.div>
    <h3>{title}</h3>
    <ul className="specs-list">
      {specs.map((spec, idx) => (
        <motion.li
          key={idx}
          initial={{ opacity: 0, x: -10 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.05 }}
          viewport={{ once: true }}
        >
          {spec}
        </motion.li>
      ))}
    </ul>
  </motion.div>
);

// Main SolarDashboard Component
const SolarDashboardRegister = () => {
  const cookies = new Cookies();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");

  // ── API-driven state ──────────────────────────────────────────────────────
  const [carbonSummary, setCarbonSummary] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [deviceCount, setDeviceCount] = useState({ total: 0, active: 0 });
  const [apiLoading, setApiLoading] = useState(true);

  // Derived stats (fall back to safe defaults while loading)
  const stats = {
    // totalPVKWh from summary as "solar generated today" proxy
    solarGenerated: carbonSummary
      ? parseFloat(carbonSummary.totalPVKWh.toFixed(2))
      : 0,
    // Convert CO2 saved (kg → tons) — API already returns tons
    carbonOffset: carbonSummary
      ? parseFloat(carbonSummary.totalCO2Saved.toFixed(2))
      : 0,
    equivalentTrees: carbonSummary
      ? Math.round(carbonSummary.equivalentTrees)
      : 0,
    totalCarbonCredits: carbonSummary
      ? parseFloat(carbonSummary.totalCarbonCredits.toFixed(4))
      : 0,
    activeDevices: carbonSummary ? carbonSummary.activeDevices : 0,
    totalDevices: carbonSummary ? carbonSummary.totalDevices : 0,
    inactiveDevices: carbonSummary ? carbonSummary.inactiveDevices : 0,
    // efficiency: active / total * 100
    efficiency:
      carbonSummary && carbonSummary.totalDevices > 0
        ? parseFloat(
            (
              (carbonSummary.activeDevices / carbonSummary.totalDevices) *
              100
            ).toFixed(1)
          )
        : 0,
  };

  // Build monthly chart from API trend data
  const buildChartData = () => {
    const trend = dashboardData?.monthlyTrend || carbonSummary?.monthlyTrend;
    if (!trend || trend.length === 0) {
      return {
        series: [
          {
            name: "Power Generation (kWh)",
            data: [0, 0, 0],
          },
        ],
        categories: ["No Data"],
      };
    }
    return {
      series: [
        {
          name: "Power Generation (kWh)",
          data: trend.map((t) => parseFloat(t.totalPVKWh.toFixed(2))),
        },
      ],
      categories: trend.map((t) => {
        const [year, month] = t.month.split("-");
        const date = new Date(year, parseInt(month) - 1);
        return date.toLocaleString("default", { month: "short", year: "2-digit" });
      }),
    };
  };

  const chartData = buildChartData();

  // Radial chart: carbon offset %, active device %, carbon credits scaled
  const environmentalChart = {
    series: carbonSummary
      ? [
          Math.min(Math.round((carbonSummary.totalCO2Saved / 150) * 100), 100),
          Math.round(
            (carbonSummary.activeDevices / (carbonSummary.totalDevices || 1)) * 100
          ),
          Math.min(Math.round(carbonSummary.equivalentTrees * 5), 100),
        ]
      : [0, 0, 0],
    labels: ["CO2 Saved\n(vs 150T target)", "Active Devices\n(%)", "Trees\nEquivalent"],
  };

  // ── Fetch API data ────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchPublicData = async () => {
      setApiLoading(true);
      try {
        // 1. Carbon Credit Summary (public endpoint)
        const summaryRes = await axios.get(
          process.env.REACT_APP_BASE_URL + "getCarbonCreditSummary"
        );
        if (summaryRes?.data?.data?.summary) {
          setCarbonSummary(summaryRes.data.data.summary);
        }

        // 2. Carbon Credit Dashboard (public endpoint)
        const dashRes = await axios.get(
          process.env.REACT_APP_BASE_URL + "getCarbonCreditDashboard"
        );
        if (dashRes?.data?.data) {
          setDashboardData(dashRes.data.data);
        }

        // 3. Device list for total count
        const deviceRes = await axios.get(
          process.env.REACT_APP_BASE_URL + "getNewDeviceList"
        );
        if (deviceRes?.data?.count !== undefined) {
          const allDevices = deviceRes.data.info || [];
          const active = allDevices.filter((d) => d.status === "active").length;
          setDeviceCount({ total: deviceRes.data.count, active });
        }
      } catch (error) {
        console.error("Failed to fetch public dashboard data:", error);
        // Silently fail — dashboard still renders with zeros
      } finally {
        setApiLoading(false);
      }
    };

    fetchPublicData();
  }, []);

  // Check for existing session on mount
  useEffect(() => {
    const expiredMessage = sessionStorage.getItem("tokenExpired");
    if (expiredMessage) {
      toast.error(expiredMessage);
      sessionStorage.removeItem("tokenExpired");
    }

    const rememberMeCookie = cookies.get("rememberMe");
    if (rememberMeCookie !== undefined) {
      const rememberMe =
        typeof rememberMeCookie === "string"
          ? JSON.parse(rememberMeCookie)
          : rememberMeCookie;
      if (rememberMe?.checkState === true) {
        const adminToken = cookies.get("adminToken");
        if (adminToken) {
          setIsLoggedIn(true);
          setUserName("Admin");
        }
      }
    }
  }, []);

  // Scroll progress handler
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setScrollProgress(scrollPercent);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Real-time solar generated value flicker (live feel)
  useEffect(() => {
    if (!carbonSummary) return;
    const base = carbonSummary.totalPVKWh;
    const interval = setInterval(() => {
      const jitter = (Math.random() - 0.5) * 0.5;
      setCarbonSummary((prev) =>
        prev ? { ...prev, totalPVKWh: parseFloat((base + jitter).toFixed(2)) } : prev
      );
    }, 3000);
    return () => clearInterval(interval);
  }, [carbonSummary?.activeDevices]);

  const handleLoginSuccess = (username) => {
    setIsLoggedIn(true);
    setUserName(username);
  };

  const handleLogout = () => {
    cookies.remove("adminToken");
    cookies.remove("rememberMe");
    setIsLoggedIn(false);
    setUserName("");
    toast.success("Logged out successfully");
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  // Top device for installation overview
  const topDevice = dashboardData?.topDevices?.[0];

  return (
    <div className="solar-dashboard">
      {/* Scroll Progress Bar */}
      <motion.div
        className="scroll-progress-bar"
        style={{ scaleX: scrollProgress / 100 }}
        initial={{ scaleX: 0 }}
        transition={{ duration: 0.2 }}
      />

      {/* Header */}
      <motion.header
        className="dashboard-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="header-content">
          <div className="header-info">
            <div className="logo-section">
              <motion.div
                className="logo-icon"
                whileHover={{ scale: 1.1, rotate: 10 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiSun />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h1>Bindi Solar Energy Monitor</h1>
                <p className="tagline">
                  Empowering renewable energy. Real-time insights.
                </p>
              </motion.div>
            </div>
          </div>

          <div className="header-actions">
            {isLoggedIn ? (
              <motion.div
                className="user-menu"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="user-info">
                  <span className="user-name">{userName}</span>
                  <button className="logout-btn" onClick={handleLogout}>
                    Logout
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.button
                className="header-btn login-btn"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsLoginModalOpen(true)}
              >
                <FiLogIn />
                <span>Login</span>
              </motion.button>
            )}

            <motion.div
              className="status-badge active"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 }}
              onClick={() => setIsMapModalOpen(true)}
              style={{ cursor: "pointer" }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.span
                className="pulsee"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              Live System map view
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Modals */}
      <AnimatePresence>
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          onLoginSuccess={handleLoginSuccess}
        />
        <MapModal
          isOpen={isMapModalOpen}
          onClose={() => setIsMapModalOpen(false)}
        />
      </AnimatePresence>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Welcome Banner for Logged-in Users */}
        {isLoggedIn && (
          <motion.div
            className="welcome-banner"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="welcome-content">
              <RiLeafLine className="welcome-icon" />
              <div>
                <h3>Welcome back, {userName}!</h3>
                <p>
                  Your solar system is performing optimally. Keep up the great
                  work in renewable energy!
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Key Metrics Grid — driven by API */}
        <motion.section
          className="metrics-grid"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {[
            {
              icon: <FiZap />,
              title: "Total Power Generated",
              value: apiLoading ? "Loading..." : `${stats.solarGenerated} kWh`,
              subtitle: "All time",
              color: "primary",
              trend: `${stats.activeDevices} active`,
            },
            {
              icon: <RiLeafLine />,
              title: "Carbon Offset",
              value: apiLoading ? "Loading..." : `${stats.carbonOffset} T CO2`,
              subtitle: "Total saved",
              color: "success",
              trend: `${stats.totalCarbonCredits} credits`,
            },
            {
              icon: <RiPlantLine />,
              title: "Equivalent Trees",
              value: apiLoading ? "Loading..." : stats.equivalentTrees,
              subtitle: "Planted impact",
              color: "eco",
              trend: `+${stats.equivalentTrees}`,
            },
            {
              icon: <FiTrendingUp />,
              title: "Active Installations",
              value: apiLoading
                ? "Loading..."
                : `${stats.activeDevices} / ${stats.totalDevices}`,
              subtitle: "Devices online",
              color: "secondary",
              trend: `${stats.efficiency}% uptime`,
            },
          ].map((metric, idx) => (
            <motion.div key={idx} variants={itemVariants}>
              <MetricCard {...metric} />
            </motion.div>
          ))}
        </motion.section>

        {/* Main Charts Section */}
        <div className="charts-section">
          {/* Monthly Power Generation Chart — from API monthlyTrend */}
          <motion.div
            className="chart-container large"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="chart-header">
              <h2>Monthly Power Generation</h2>
              <p className="chart-subtitle">
                Energy output per month (kWh) — live from device network
              </p>
            </div>
            <Chart
              options={{
                chart: {
                  type: "area",
                  toolbar: { show: false },
                  sparkline: { enabled: false },
                  fontFamily: "inherit",
                },
                colors: ["#10b981"],
                fill: {
                  type: "gradient",
                  gradient: {
                    shadeIntensity: 1,
                    opacityFrom: 0.45,
                    opacityTo: 0.05,
                    stops: [20, 100, 100, 100],
                  },
                },
                dataLabels: { enabled: false },
                stroke: {
                  curve: "smooth",
                  width: 3,
                  colors: ["#10b981"],
                },
                xaxis: {
                  categories: chartData.categories,
                  axisBorder: { show: false },
                  axisTicks: { show: false },
                  labels: {
                    style: { colors: "#9ca3af", fontSize: "12px" },
                  },
                },
                yaxis: {
                  labels: {
                    style: { colors: "#9ca3af", fontSize: "12px" },
                  },
                  axisBorder: { show: false },
                },
                grid: {
                  borderColor: "rgba(16, 185, 129, 0.15)",
                  strokeDashArray: 4,
                },
                tooltip: {
                  theme: "dark",
                  y: { formatter: (value) => `${value.toFixed(2)} kWh` },
                },
              }}
              series={chartData.series}
              type="area"
              height={350}
            />
          </motion.div>

          {/* Environmental Impact Radial — driven by API */}
          <motion.div
            className="chart-container"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="chart-header">
              <h2>Environmental Impact</h2>
              <p className="chart-subtitle">Collective benefits</p>
            </div>
            <Chart
              options={{
                chart: {
                  type: "radialBar",
                  sparkline: { enabled: false },
                  toolbar: { show: false },
                },
                colors: ["#10b981", "#06b6d4", "#0ea5e9"],
                plotOptions: {
                  radialBar: {
                    size: undefined,
                    inverseOrder: false,
                    hollow: {
                      margin: 5,
                      size: "48%",
                      background: "transparent",
                    },
                    track: {
                      strokeWidth: "100%",
                      margin: 5,
                      background: "rgba(16, 185, 129, 0.1)",
                    },
                    dataLabels: {
                      name: { fontSize: "14px", fontWeight: 600, color: "#e5e7eb" },
                      value: { fontSize: "20px", fontWeight: 700, color: "#10b981" },
                    },
                  },
                },
                labels: environmentalChart.labels,
                stroke: { lineCap: "round" },
                tooltip: { theme: "dark" },
              }}
              series={environmentalChart.series}
              type="radialBar"
              height={280}
            />
          </motion.div>
        </div>

        {/* System Status & Details */}
        <motion.div
          className="status-section"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Real-time Status */}
          <motion.div
            className="status-card"
            whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(16, 185, 129, 0.2)" }}
            transition={{ duration: 0.3 }}
          >
            <div className="status-header">
              <h3>System Status</h3>
              <motion.div
                className="status-indicator"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <motion.span
                  className="pulsee-dot"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span>Live</span>
              </motion.div>
            </div>
            <motion.div
              className="status-grid"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {[
                {
                  icon: <FiZap />,
                  label: "Total Generated",
                  value: apiLoading ? "—" : `${stats.solarGenerated} kWh`,
                  color: "primary",
                },
                {
                  icon: <FiHome />,
                  label: "Active Devices",
                  value: apiLoading ? "—" : `${stats.activeDevices} Devices`,
                  color: "success",
                },
                {
                  icon: <FiDroplet />,
                  label: "Inactive Devices",
                  value: apiLoading ? "—" : `${stats.inactiveDevices} Devices`,
                  color: "secondary",
                },
                {
                  icon: <FiWind />,
                  label: "System Uptime",
                  value: apiLoading ? "—" : `${stats.efficiency}%`,
                  color: "eco",
                },
              ].map((item, idx) => (
                <motion.div key={idx} variants={itemVariants}>
                  <StatusItem {...item} />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Impact Summary — driven by API */}
          <motion.div
            className="impact-card"
            whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(16, 185, 129, 0.2)" }}
            transition={{ duration: 0.3 }}
          >
            <div className="impact-header">
              <RiLeafLine className="impact-icon" />
              <h3>Total Impact</h3>
            </div>
            <motion.div
              className="impact-stats"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {[
                {
                  value: apiLoading ? "—" : `${stats.equivalentTrees}`,
                  label: "Trees Planted Equivalent",
                  icon: <RiPlantLine />,
                },
                {
                  value: apiLoading ? "—" : `${stats.totalCarbonCredits} CC`,
                  label: "Carbon Credits Earned",
                  icon: <FiTrendingUp />,
                },
                {
                  value: apiLoading ? "—" : `${stats.carbonOffset}T`,
                  label: "CO2 Offset",
                  icon: <RiEarthLine />,
                },
              ].map((stat, idx) => (
                <motion.div key={idx} variants={itemVariants}>
                  <ImpactStat {...stat} />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Installation Details — top device from API + static hardware specs */}
        <motion.section
          className="installation-section"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="section-title">
            <h2>Installation Overview</h2>
            <p>System specifications and top device performance</p>
          </div>
          <motion.div
            className="installation-grid"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {[
              {
                title: "Solar Panels",
                specs: [
                  "Capacity: 10 kW",
                  "Efficiency: 21.5%",
                  "Type: Monocrystalline",
                ],
                icon: <FiSun />,
              },
              {
                title: "Battery Storage",
                specs: [
                  "Capacity: 50 kWh",
                  "Chemistry: LiFePO4",
                  "Cycles: 6000+",
                  "Warranty: 10 years",
                ],
                icon: <FiZap />,
              },
              {
                title: "Top Device",
                specs: topDevice
                  ? [
                      `UID: ${topDevice.uid}`,
                      `Location: ${topDevice.deviceInfo?.Location || "N/A"}`,
                      `Generated: ${topDevice.totalPVKWh} kWh`,
                      `CO2 Saved: ${topDevice.totalCO2Saved} T`,
                      `Trees Equiv: ${topDevice.equivalentTrees}`,
                    ]
                  : ["No data yet", "Check back soon"],
                icon: <FiBarChart2 />,
              },
              {
                title: "Network Performance",
                specs: [
                  `Total Devices: ${apiLoading ? "..." : stats.totalDevices}`,
                  `Active: ${apiLoading ? "..." : stats.activeDevices}`,
                  `Inactive: ${apiLoading ? "..." : stats.inactiveDevices}`,
                  `Total kWh: ${apiLoading ? "..." : carbonSummary?.totalPVKWh ?? 0}`,
                ],
                icon: <FiTrendingUp />,
              },
            ].map((card, idx) => (
              <motion.div key={idx} variants={itemVariants}>
                <InstallationCard {...card} />
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {/* Footer CTA Section */}
        <footer className="footer-section">
          <div className="footer-content">
            <div className="footer-text">
              <h2>Ready to monitor your solar installation?</h2>
              <p>
                Get real-time insights and maximize your energy efficiency today.
              </p>
            </div>
            <motion.button
              className="footer-button"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={scrollToTop}
            >
              Get Started <FiArrowRight />
            </motion.button>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2026 Bindi Solar Energy Monitor. All rights reserved.</p>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default SolarDashboardRegister;