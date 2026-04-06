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
  FiRefreshCw,
  FiAlertCircle,
  FiCheckCircle,
  FiAward,
  FiUsers,
  FiClock,
  FiBattery,
  FiThermometer,
  FiActivity,
} from "react-icons/fi";
import { RiLeafLine, RiPlantLine, RiEarthLine, RiFlashlightLine, RiCloudLine } from "react-icons/ri";
import Chart from "react-apexcharts";
import toast from "react-hot-toast";
import isEmpty from "lodash.isempty";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setLoader } from "../../Database/Action/ConstantAction";
import { postHeaderWithoutToken } from "../../Database/Utils";
import Cookies from "universal-cookie";
import DeviceMapComponent from "../Components/DeviceMapComponent";
import { getNewDeviceList } from "../../Database/Action/DashboardAction";
import "./SolarDashboard.css";

// API Configuration
const API_BASE_URL = process.env.REACT_APP_BASE_URL;

const apiEndpoints = {
  devices: `${API_BASE_URL}getNewDeviceList`,
  carbonSummary: `${API_BASE_URL}getCarbonCreditSummary`,
  carbonDashboard: `${API_BASE_URL}getCarbonCreditDashboard`,
  singleDevice: (id) => `${API_BASE_URL}getNewDevice/${id}`,
};

// Login Modal Component
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
        postHeaderWithoutToken
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
        onLoginSuccess(loginInfo.userName);
        navigate("/dashboard");
      })
      .catch((error) => {
        dispatch(setLoader(false));
        setIsLoading(false);
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

// Enhanced Metric Card Component
const MetricCard = ({ icon, title, value, subtitle, color, trend, unit }) => (
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
        {typeof value === "number" ? value.toFixed(2) : value}
        {unit && <span className="metric-unit">{unit}</span>}
      </motion.div>
      <div className="metric-footer">
        <span className="metric-subtitle">{subtitle}</span>
        {trend && <span className="metric-trend">{trend}</span>}
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

// Enhanced Top Performing Devices Component
const TopDevicesWidget = ({ devices, loading }) => {
  const topDevices = devices || [];

  return (
    <motion.div
      className="top-devices-widget"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <div className="widget-header">
        <div>
          <h3>
            <FiZap className="header-icon" /> Top Performing Devices
          </h3>
          <p className="widget-subtitle">Highest energy generating installations</p>
        </div>
        <span className="device-count">{topDevices.length} devices</span>
      </div>
      <div className="devices-list">
        {loading ? (
          <div className="loading-state">
            <FiRefreshCw className="spin-icon" />
            <p>Loading devices...</p>
          </div>
        ) : topDevices.length > 0 ? (
          topDevices.map((device, idx) => {
            const beneficiaryName = device.deviceInfo?.NameOfBeneficiary || device.uid || "Unknown Device";
            const location = device.deviceInfo?.Location || "Location N/A";
            const progressPercent = Math.min((device.totalPVKWh / 200) * 100, 100);
            
            return (
              <motion.div
                key={device.uid || idx}
                className="device-item"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -4, backgroundColor: "rgba(16, 185, 129, 0.08)" }}
              >
                <div className="device-rank">
                  {idx === 0 && <span className="crown">👑</span>}
                  #{idx + 1}
                </div>
                <div className="device-info">
                  <h4>{beneficiaryName}</h4>
                  <p className="device-location">
                    <FiMap className="location-icon" /> {location}
                  </p>
                </div>
                <div className="device-stats">
                  <div className="stat">
                    <span className="label">⚡ kWh</span>
                    <span className="value">{(device.totalPVKWh || 0).toFixed(2)}</span>
                  </div>
                  <div className="stat">
                    <span className="label">🌿 CO₂</span>
                    <span className="value">{(device.totalCO2Saved || 0).toFixed(2)}T</span>
                  </div>
                  <div className="stat highlight">
                    <span className="label">💎 Credits</span>
                    <span className="value">{(device.totalCarbonCredits || 0).toFixed(4)}</span>
                  </div>
                </div>
                <div className="device-progress">
                  <div className="progress-bar" style={{ width: `${progressPercent}%` }} />
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="empty-state">
            <FiAlertCircle />
            <p>No devices available</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Enhanced Top Contributing Partners Component
const TopDonorsWidget = ({ donors, loading }) => {
  const topDonors = donors || [];

  return (
    <motion.div
      className="top-donors-widget"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <div className="widget-header">
        <div>
          <h3>
            <FiUsers className="header-icon" /> Top Contributing Partners
          </h3>
          <p className="widget-subtitle">Organizations driving renewable energy adoption</p>
        </div>
      </div>
      <div className="donors-list">
        {loading ? (
          <div className="loading-state">
            <FiRefreshCw className="spin-icon" />
            <p>Loading partners...</p>
          </div>
        ) : topDonors.length > 0 ? (
          topDonors.map((donor, idx) => (
            <motion.div
              key={donor.donorId || idx}
              className="donor-item"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -4, backgroundColor: "rgba(16, 185, 129, 0.08)" }}
            >
              <div className="donor-rank">#{idx + 1}</div>
              <div className="donor-info">
                <h4>{donor.donorName || "Unknown Partner"}</h4>
                <p className="donor-contribution">
                  {donor.deviceCount} {donor.deviceCount === 1 ? 'installation' : 'installations'}
                </p>
              </div>
              <div className="donor-stats">
                <div className="stat">
                  <span className="label">Devices</span>
                  <span className="value">{donor.deviceCount || 0}</span>
                </div>
                <div className="stat">
                  <span className="label">⚡ kWh</span>
                  <span className="value">{(donor.totalPVKWh || 0).toFixed(2)}</span>
                </div>
                <div className="stat">
                  <span className="label">🌿 CO₂</span>
                  <span className="value">{(donor.totalCO2Saved || 0).toFixed(2)}T</span>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="empty-state">
            <FiAlertCircle />
            <p>No partner data available</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Live Energy Flow Component
const LiveEnergyFlow = ({ currentOutput }) => (
  <motion.div className="energy-flow-card">
    <div className="energy-flow-header">
      <h3>
        <FiActivity className="pulse-icon" /> Live Energy Flow
      </h3>
      <motion.div
        className="live-indicator"
        animate={{ opacity: [1, 0.5, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <span className="live-dot" /> LIVE
      </motion.div>
    </div>
    <div className="energy-flow-visual">
      <div className="energy-source">
        <FiSun className="sun-icon" />
        <span>Solar Panels</span>
      </div>
      <div className="energy-wave">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="wave"
            animate={{ height: [3, 15 + Math.random() * 20, 3] }}
            transition={{ duration: 1, delay: i * 0.1, repeat: Infinity }}
          />
        ))}
      </div>
      <div className="energy-consumer">
        <FiHome className="home-icon" />
        <span>Grid / Storage</span>
      </div>
    </div>
    <div className="energy-stats">
      <div className="energy-stat">
        <span className="label">Current Output</span>
        <motion.span
          className="value"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {currentOutput.toFixed(2)} kW
        </motion.span>
      </div>
      <div className="energy-stat">
        <span className="label">Today's Peak</span>
        <span className="value">{(currentOutput * 1.25).toFixed(2)} kW</span>
      </div>
    </div>
  </motion.div>
);

// Main Solar Dashboard Component
const SolarDashboardRegister = () => {
  const cookies = new Cookies();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [currentOutput, setCurrentOutput] = useState(12.45);

  // API Data States
  const [dashboardData, setDashboardData] = useState(null);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Fetch Dashboard Data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [dashboardRes, devicesRes] = await Promise.all([
        axios.get(apiEndpoints.carbonDashboard),
        axios.get(apiEndpoints.devices),
      ]);

      setDashboardData(dashboardRes.data?.data);
      setDevices(devicesRes.data?.info || []);
      setLastUpdated(new Date());

      // Simulate real-time output
      setCurrentOutput(8 + Math.random() * 10);

      if (!isLoggedIn) {
        toast.success("Data updated successfully!");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch dashboard data. Please try again.");
      toast.error("Error loading dashboard data");
      console.error("API Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Simulate real-time energy updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentOutput(prev => {
        const change = (Math.random() - 0.5) * 2;
        let newVal = prev + change;
        return Math.min(Math.max(newVal, 5), 25);
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Initial load
  useEffect(() => {
    fetchDashboardData();

    const rememberMeCookie = cookies.get("rememberMe");
    if (rememberMeCookie !== undefined) {
      const rememberMe = typeof rememberMeCookie === "string" ? JSON.parse(rememberMeCookie) : rememberMeCookie;
      if (rememberMe?.checkState === true) {
        const adminToken = cookies.get("adminToken");
        if (adminToken) {
          setIsLoggedIn(true);
          setUserName("Admin");
        }
      }
    }
  }, []);

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      fetchDashboardData();
    }, 30000);
    return () => clearInterval(refreshInterval);
  }, [isLoggedIn]);

  // Scroll progress handler
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setScrollProgress(scrollPercent);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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

  const handleManualRefresh = () => {
    fetchDashboardData();
    toast.success("Data refreshing...");
  };

  // Extract data from API response
  const summary = dashboardData?.summary || {};
  const monthlyTrend = dashboardData?.monthlyTrend || [];
  const topDonors = dashboardData?.topDonors || [];
  const topDevicesFromDashboard = dashboardData?.topDevices || [];

  // Calculate total equivalent trees planted
  const totalTrees = summary.equivalentTrees || 0;

  // Chart data
  const chartData = {
    series: [{ name: "Power Generation (kWh)", data: monthlyTrend.map((m) => m.totalPVKWh || 0) }],
    categories: monthlyTrend.map((m) => {
      const [year, month] = m.month.split("-");
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return monthNames[parseInt(month) - 1];
    }),
  };

  const environmentalChart = {
    series: [summary.totalCO2Saved || 0, summary.equivalentTrees || 0, summary.totalCarbonCredits || 0],
    labels: ["CO₂ Saved (Tons)", "Trees Equivalent", "Carbon Credits"],
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <div className="solar-dashboard">
      <motion.div className="scroll-progress-bar" style={{ scaleX: scrollProgress / 100 }} initial={{ scaleX: 0 }} transition={{ duration: 0.2 }} />

      <AnimatePresence>
        {error && (
          <motion.div className="error-banner" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <FiAlertCircle />
            <span>{error}</span>
            <button onClick={fetchDashboardData}>Retry</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.header className="dashboard-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <div className="header-content">
          <div className="header-info">
            <div className="logo-section">
              <motion.div className="logo-icon" whileHover={{ scale: 1.1, rotate: 10 }} whileTap={{ scale: 0.95 }}>
                <FiSun />
              </motion.div>
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                <h1>Bindi Solar Energy Monitor</h1>
                {/* <p className="tagline">
                  Real-time insights • Environmental Impact • {summary.totalDevices || 0} Active Installations
                </p> */}
              </motion.div>
            </div>
          </div>

          <div className="header-actions">
            <motion.button className="refresh-btn" onClick={handleManualRefresh} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} title="Refresh data">
              <FiRefreshCw className={loading ? "spin-icon" : ""} />
            </motion.button>
            {lastUpdated && <div className="last-updated"><small>Updated: {lastUpdated.toLocaleTimeString()}</small></div>}
            {isLoggedIn ? (
              <motion.div className="user-menu" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                <div className="user-info">
                  <span className="user-name">{userName}</span>
                  <button className="logout-btn" onClick={handleLogout}>Logout</button>
                </div>
              </motion.div>
            ) : (
              <motion.button className="header-btn login-btn" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }} onClick={() => setIsLoginModalOpen(true)}>
                <FiLogIn />
                <span>Login</span>
              </motion.button>
            )}
            <motion.div className="status-badge active" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }} onClick={() => setIsMapModalOpen(true)} style={{ cursor: "pointer" }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <motion.span className="pulsee" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }} />
              Live Map
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Modals */}
      <AnimatePresence>
        <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} onLoginSuccess={handleLoginSuccess} />
        <MapModal isOpen={isMapModalOpen} onClose={() => setIsMapModalOpen(false)} />
      </AnimatePresence>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Welcome Banner */}
        {isLoggedIn && (
          <motion.div className="welcome-banner" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="welcome-content">
              <RiLeafLine className="welcome-icon" />
              <div>
                <h3>Welcome back, {userName}!</h3>
                <p>Your solar installations are generating clean energy. Total carbon offset: {summary.totalCO2Saved?.toFixed(2)} tons CO₂ — equivalent to planting {Math.floor(totalTrees)} trees! 🌳</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Live Energy Flow Card */}
        <LiveEnergyFlow currentOutput={currentOutput} />

        {/* Key Metrics Grid */}
        <motion.section className="metrics-grid" variants={containerVariants} initial="hidden" animate="visible">
          {[
            { icon: <FiZap />, title: "Total Power Generated", value: summary.totalPVKWh, subtitle: "All time", color: "primary", unit: "kWh", trend: `${summary.activeDevices} active` },
            { icon: <RiEarthLine />, title: "CO₂ Offset", value: summary.totalCO2Saved, subtitle: "Total reduction", color: "success", unit: "Tons", trend: "↓ emissions" },
            { icon: <RiPlantLine />, title: "Trees Equivalent", value: summary.equivalentTrees, subtitle: "Carbon absorbed", color: "eco", unit: "trees", trend: "Growing" },
            { icon: <FiAward />, title: "Carbon Credits", value: summary.totalCarbonCredits, subtitle: "Earned", color: "secondary", unit: "Credits", trend: `${summary.totalDevices} devices` },
          ].map((metric, idx) => (
            <motion.div key={idx} variants={itemVariants}>
              <MetricCard {...metric} />
            </motion.div>
          ))}
        </motion.section>

        {/* Status Overview */}
        <motion.div className="status-overview" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <motion.div className="status-card" whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(16, 185, 129, 0.2)" }} transition={{ duration: 0.3 }}>
            <div className="status-header">
              <h3>System Overview</h3>
              <motion.div className="status-indicator" animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                <motion.span className="pulsee-dot" animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity }} />
                <span>Live</span>
              </motion.div>
            </div>
            <motion.div className="status-grid" variants={containerVariants} initial="hidden" animate="visible">
              {[
                { icon: <FiCheckCircle />, label: "Active Devices", value: summary.activeDevices || 0, color: "primary" },
                { icon: <FiHome />, label: "Total Devices", value: summary.totalDevices || 0, color: "success" },
                { icon: <FiAlertCircle />, label: "Inactive", value: summary.inactiveDevices || 0, color: "secondary" },
                { icon: <FiTrendingUp />, label: "Success Rate", value: summary.totalDevices > 0 ? `${((summary.activeDevices / summary.totalDevices) * 100).toFixed(1)}%` : "0%", color: "eco" },
              ].map((item, idx) => (
                <motion.div key={idx} variants={itemVariants}>
                  <StatusItem {...item} />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Charts Section */}
        <div className="charts-section">
          {monthlyTrend.length > 0 && (
            <motion.div className="chart-container large" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <div className="chart-header">
                <h2>📈 Monthly Power Generation Trend</h2>
                <p className="chart-subtitle">Energy output progression over time</p>
              </div>
              <Chart options={{
                chart: { type: "area", toolbar: { show: false }, sparkline: { enabled: false }, fontFamily: "inherit" },
                colors: ["#10b981"],
                fill: { type: "gradient", gradient: { shadeIntensity: 1, opacityFrom: 0.45, opacityTo: 0.05, stops: [20, 100, 100, 100] } },
                dataLabels: { enabled: false },
                stroke: { curve: "smooth", width: 3, colors: ["#10b981"] },
                xaxis: { categories: chartData.categories, axisBorder: { show: false }, axisTicks: { show: false }, labels: { style: { colors: "#9ca3af", fontSize: "12px" } } },
                yaxis: { labels: { style: { colors: "#9ca3af", fontSize: "12px" } }, axisBorder: { show: false } },
                grid: { borderColor: "rgba(16, 185, 129, 0.15)", strokeDashArray: 4 },
                tooltip: { theme: "dark", y: { formatter: (value) => `${value.toFixed(1)} kWh` } },
              }} series={chartData.series} type="area" height={350} />
            </motion.div>
          )}

          {environmentalChart.series.some((v) => v > 0) && (
            <motion.div className="chart-container" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}>
              <div className="chart-header">
                <h2>🌍 Environmental Impact</h2>
                <p className="chart-subtitle">Sustainability metrics at a glance</p>
              </div>
              <Chart options={{
                chart: { type: "radialBar", sparkline: { enabled: false }, toolbar: { show: false } },
                colors: ["#10b981", "#06b6d4", "#0ea5e9"],
                plotOptions: { radialBar: { size: undefined, inverseOrder: false, hollow: { margin: 5, size: "48%", background: "transparent" }, track: { strokeWidth: "100%", margin: 5, background: "rgba(16, 185, 129, 0.1)" }, dataLabels: { name: { fontSize: "14px", fontWeight: 600, color: "#e5e7eb" }, value: { fontSize: "20px", fontWeight: 700, color: "#10b981" } } } },
                labels: environmentalChart.labels,
                stroke: { lineCap: "round" },
                tooltip: { theme: "dark" },
              }} series={environmentalChart.series} type="radialBar" height={280} />
            </motion.div>
          )}
        </div>

        {/* Top Devices and Top Partners Section */}
        <div className="devices-partners-section">
          <TopDevicesWidget devices={topDevicesFromDashboard} loading={loading} />
          <TopDonorsWidget donors={topDonors} loading={loading} />
        </div>

        {/* Enhanced Impact Card */}
        <motion.div className="impact-card full-width" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(16, 185, 129, 0.2)" }}>
          <div className="impact-header">
            <RiLeafLine className="impact-icon" />
            <h3>🌱 Total Environmental Impact</h3>
          </div>
          <motion.div className="impact-stats" variants={containerVariants} initial="hidden" animate="visible">
            {[
              { value: summary.equivalentTrees?.toFixed(2) || "0", label: "Equivalent Trees Planted", icon: <RiPlantLine /> },
              { value: `₹${((summary.totalCO2Saved || 0) * 500).toLocaleString("en-IN")}`, label: "Estimated Ecological Value", icon: <FiTrendingUp /> },
              { value: `${summary.totalCO2Saved?.toFixed(2) || 0}T`, label: "CO₂ Offset", icon: <RiEarthLine /> },
              { value: `${summary.totalCarbonCredits?.toFixed(4) || 0}`, label: "Total Carbon Credits", icon: <FiAward /> },
            ].map((stat, idx) => (
              <motion.div key={idx} variants={itemVariants}>
                <ImpactStat {...stat} />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Footer */}
        <footer className="footer-section">
          <div className="footer-content">
            <div className="footer-text">
              <h2>☀️ Making renewable energy transparent and impactful</h2>
              <p>Monitor your solar installations in real-time and track your contribution to a sustainable future.</p>
            </div>
            <motion.button className="footer-button" whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }} onClick={scrollToTop}>
              Back to Top <FiArrowRight />
            </motion.button>
          </div>
          <div className="footer-bottom">
            <p>© 2026 Bindi Solar Energy Monitor. All rights reserved. | Powered by Clean Energy</p>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default SolarDashboardRegister;