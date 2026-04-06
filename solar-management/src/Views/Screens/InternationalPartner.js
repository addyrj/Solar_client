import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { getNewDeviceList } from "../../Database/Action/DashboardAction";
import NoData from "../Components/NoData";

// Default center coordinates for India
const defaultCenter = {
  lat: 20.5937,
  lng: 78.9629
};

// Function to generate dynamic colors based on donor name
const getDonorColor = (donorName) => {
  if (!donorName) return "#2ecc71"; // Default green
  
  // Generate a consistent color based on donor name hash
  let hash = 0;
  for (let i = 0; i < donorName.length; i++) {
    hash = donorName.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Generate HSL color with good saturation and lightness
  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 70%, 55%)`;
};

// Custom Google Maps style marker icon with blinking/pulsing animation
// Custom Google Maps style marker icon with blinking/pulsing animation
const createCustomIconHtml = (color, isSelected = false, isBlinking = true) => {
  const size = isSelected ? 44 : 36;
  const borderWidth = isSelected ? 4 : 3;
  
  // Simple pulse animation without pseudo-elements
  const pulseAnimation = isBlinking ? `
    animation: pulse 1.5s ease-in-out infinite;
  ` : '';
  
  return `
    <div style="position: relative; cursor: pointer;">
      <style>
        @keyframes pulse {
          0% {
            transform: rotate(-45deg) scale(1);
            opacity: 1;
          }
          50% {
            transform: rotate(-45deg) scale(1.15);
            opacity: 0.9;
          }
          100% {
            transform: rotate(-45deg) scale(1);
            opacity: 1;
          }
        }
        @keyframes bounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.3); }
        }
      </style>
      <div style="
       background: linear-gradient(
  135deg,
  hsl(74, 70%, 55%),
  hsla(74, 70%, 55%, 0.85)
);
        
        width: ${size}px;
        height: ${size}px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: ${borderWidth}px solid white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.25);
        display: flex;
        align-items: center;
        justify-content: center;
        ${pulseAnimation}
      ">
        <div style="
          transform: rotate(45deg);
          color: white;
          font-size: ${isSelected ? '20px' : '16px'};
          font-weight: bold;
        ">
          📍
        </div>
      </div>
      ${isSelected ? `
        <div style="
          position: absolute;
          top: -8px;
          right: -8px;
          background: white;
          border-radius: 50%;
          width: 16px;
          height: 16px;
          border: 2px solid ${color};
          animation: bounce 0.5s ease;
        "></div>
      ` : ''}
    </div>
  `;
};

// Status badge component
const StatusBadge = ({ status }) => {
  const statusConfig = {
    active: { color: '#10b981', bg: '#d1fae5', text: 'Active' },
    inactive: { color: '#ef4444', bg: '#fee2e2', text: 'Inactive' },
    pending: { color: '#f59e0b', bg: '#fed7aa', text: 'Pending' },
    maintenance: { color: '#6366f1', bg: '#e0e7ff', text: 'Maintenance' }
  };
  
  const config = statusConfig[status?.toLowerCase()] || statusConfig.inactive;
  
  return `
    <span style="
      display: inline-block;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
      background: ${config.bg};
      color: ${config.color};
    ">${config.text}</span>
  `;
};

// Beautiful popup HTML template
const createPopupHtml = (device, color) => {
  const donorName = device.DonarName || device.donor?.DonarOrganisation || 'Unknown Donor';
  const status = device.status || device.Status || 'N/A';
  
  return `
    <div style="
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      min-width: 320px;
      max-width: 380px;
    ">
      <!-- Header with donor color -->
      <div style="
        background: linear-gradient(135deg, ${color}, ${color}dd);
        padding: 15px;
        border-radius: 12px 12px 0 0;
        margin: -12px -12px 0 -12px;
        color: white;
      ">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h3 style="margin: 0; font-size: 16px; font-weight: 600;">${donorName}</h3>
          ${StatusBadge({ status })}
        </div>
      </div>
      
      <!-- Device Info -->
      <div style="padding: 15px 0;">
        <!-- Device UID -->
        <div style="
          background: #f8f9fa;
          padding: 10px;
          border-radius: 8px;
          margin-bottom: 12px;
        ">
          <div style="font-size: 11px; color: #6c757d; margin-bottom: 4px;">📱 DEVICE UID</div>
          <div style="font-size: 13px; font-weight: 600; font-family: monospace;">${device.UID || 'N/A'}</div>
        </div>
        
        <!-- Beneficiary Info -->
        <div style="
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 12px;
          color: white;
        ">
          <div style="font-size: 11px; opacity: 0.9; margin-bottom: 4px;">👤 BENEFICIARY</div>
          <div style="font-size: 15px; font-weight: 600;">${device.NameOfBeneficiary || 'N/A'}</div>
          ${device.BeneficiaryPno ? `<div style="font-size: 12px; margin-top: 4px; opacity: 0.9;">📞 ${device.BeneficiaryPno}</div>` : ''}
        </div>
        
        <!-- Location Details -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px;">
          <div style="background: #f8f9fa; padding: 8px; border-radius: 6px;">
            <div style="font-size: 10px; color: #6c757d;">🏘️ BLOCK</div>
            <div style="font-size: 12px; font-weight: 500;">${device.Block || 'N/A'}</div>
          </div>
          <div style="background: #f8f9fa; padding: 8px; border-radius: 6px;">
            <div style="font-size: 10px; color: #6c757d;">📍 DISTRICT</div>
            <div style="font-size: 12px; font-weight: 500;">${device.District || 'N/A'}</div>
          </div>
          <div style="background: #f8f9fa; padding: 8px; border-radius: 6px;">
            <div style="font-size: 10px; color: #6c757d;">🗺️ STATE</div>
            <div style="font-size: 12px; font-weight: 500;">${device.State || 'N/A'}</div>
          </div>
          <div style="background: #f8f9fa; padding: 8px; border-radius: 6px;">
            <div style="font-size: 10px; color: #6c757d;">🏠 VILLAGE</div>
            <div style="font-size: 12px; font-weight: 500;">${device.VillageName || 'N/A'}</div>
          </div>
        </div>
        
        <!-- Installation Details -->
        <div style="
          background: #f8f9fa;
          padding: 10px;
          border-radius: 8px;
        ">
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <div>
              <div style="font-size: 10px; color: #6c757d;">📅 INSTALLATION DATE</div>
              <div style="font-size: 12px; font-weight: 500;">${device.InstallationDate || 'N/A'}</div>
            </div>
            <div>
              <div style="font-size: 10px; color: #6c757d;">🔄 DEVICE TYPE</div>
              <div style="font-size: 12px; font-weight: 500;">${device.deviceType || device.DeviceType || 'N/A'}</div>
            </div>
          </div>
          
          <!-- Coordinates Info -->
          <div style="border-top: 1px solid #e5e7eb; margin-top: 8px; padding-top: 8px;">
            <div style="font-size: 10px; color: #6c757d;">📍 COORDINATES</div>
            <div style="font-size: 11px; font-family: monospace;">${device.CLocation || 'N/A'}</div>
          </div>
          
          <!-- REW Info if available -->
          ${device.rew ? `
            <div style="border-top: 1px solid #e5e7eb; margin-top: 8px; padding-top: 8px;">
              <div style="font-size: 10px; color: #6c757d;">🔧 REW OFFICER</div>
              <div style="font-size: 12px;">${device.rew.rew_name || 'N/A'} - ${device.rew.rew_phone || ''}</div>
            </div>
          ` : ''}
          
          <!-- Contact Info -->
          <div style="border-top: 1px solid #e5e7eb; margin-top: 8px; padding-top: 8px;">
            <div style="display: flex; gap: 10px; font-size: 11px;">
              ${device.SolarEngineerName ? `<div>👨‍🔧 ${device.SolarEngineerName}</div>` : ''}
              ${device.GCName ? `<div>📋 ${device.GCName}</div>` : ''}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
};

const DeviceMap = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [filterDonor, setFilterDonor] = useState('');
  const [totalDevices, setTotalDevices] = useState(0);
  const [devicesWithCoordinates, setDevicesWithCoordinates] = useState(0);
  const [donorStats, setDonorStats] = useState({});
  const [validDevices, setValidDevices] = useState([]);
  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);
  const markersRef = useRef([]);

  // Get device data from Redux store
  const newDeviceList = useSelector((state) => state.DashboardReducer.newDeviceList);
  const apistate = useSelector((state) => state.ConstantReducer.apistate);

  // Fetch device data from API using Redux action
  useEffect(() => {
    dispatch(getNewDeviceList({ navigate: navigate }));
  }, [dispatch, apistate]);

  // Filter devices with valid coordinates and calculate statistics
  useEffect(() => {
    if (newDeviceList && newDeviceList.length > 0) {
      // Filter devices that have valid CLocation
      const devicesWithValidCoords = newDeviceList.filter(device => {
        if (!device.CLocation) return false;
        
        try {
          const [lat, lng] = device.CLocation.split(',').map(coord => parseFloat(coord.trim()));
          return !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
        } catch (error) {
          return false;
        }
      });
      
      setValidDevices(devicesWithValidCoords);
      setTotalDevices(newDeviceList.length);
      setDevicesWithCoordinates(devicesWithValidCoords.length);
      
      // Calculate donor statistics only for devices with valid coordinates
      const stats = {};
      devicesWithValidCoords.forEach(device => {
        const donorName = device.DonarName || device.donor?.DonarOrganisation || 'Unknown';
        stats[donorName] = (stats[donorName] || 0) + 1;
      });
      setDonorStats(stats);
    }
  }, [newDeviceList]);

  // Load Leaflet CSS and JS
  const loadLeaflet = () => {
    return new Promise((resolve, reject) => {
      if (window.L) {
        resolve(window.L);
        return;
      }

      // Load CSS
      const css = document.createElement('link');
      css.rel = 'stylesheet';
      css.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css';
      document.head.appendChild(css);

      // Load JS
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
      script.async = true;

      script.onload = () => {
        if (window.L) {
          resolve(window.L);
        } else {
          reject(new Error('Leaflet failed to load'));
        }
      };

      script.onerror = () => reject(new Error('Failed to load Leaflet'));
      document.head.appendChild(script);
    });
  };

  // Initialize map
  const initializeMap = async () => {
    if (!mapRef.current) return;

    try {
      const L = await loadLeaflet();

      // Create map centered on India with better tiles
      const map = L.map(mapRef.current).setView([defaultCenter.lat, defaultCenter.lng], 5);

      // Add beautiful map tiles (CartoDB Voyager for clean look)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
        minZoom: 3
      }).addTo(map);

      // Add scale control
      L.control.scale({ metric: true, imperial: false }).addTo(map);

      leafletMapRef.current = map;
      setMapLoaded(true);

      // Add markers if devices are already loaded
      if (validDevices.length > 0) {
        addMarkersToMap(L, map);
      }
    } catch (error) {
      console.error('Error loading Leaflet:', error);
    }
  };

  // Add markers to the map when devices data is available
  useEffect(() => {
    if (mapLoaded && validDevices.length > 0 && window.L && leafletMapRef.current) {
      addMarkersToMap(window.L, leafletMapRef.current);
    }
  }, [validDevices, mapLoaded, filterDonor]);

  // Initialize map on component mount
  useEffect(() => {
    initializeMap();

    // Cleanup function to remove map on component unmount
    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
      }
    };
  }, []);

  // Add markers to the map
  const addMarkersToMap = (L, map) => {
    // Clear existing markers
    clearMarkers();

    if (!validDevices || validDevices.length === 0) return;

    // Filter devices if donor filter is active
    const filteredDevices = filterDonor 
      ? validDevices.filter(item => 
          (item.DonarName === filterDonor) || (item.donor?.DonarOrganisation === filterDonor)
        )
      : validDevices;

    markersRef.current = filteredDevices.map(item => {
      if (!item.CLocation) return null;

      try {
        const [lat, lng] = item.CLocation.split(',').map(coord => parseFloat(coord.trim()));
        if (isNaN(lat) || isNaN(lng)) return null;

        // Get color based on donor dynamically
        const donorName = item.DonarName || item.donor?.DonarOrganisation || 'Unknown';
        const color = getDonorColor(donorName);
        const isSelected = selectedDevice?.ID === item.ID;
        
        // Create custom Google Maps style marker with blinking animation
        const customIcon = L.divIcon({
          className: 'custom-marker',
          html: createCustomIconHtml(color, isSelected, true), // true enables blinking
          iconSize: [isSelected ? 44 : 36, isSelected ? 44 : 36],
          iconAnchor: [isSelected ? 22 : 18, isSelected ? 22 : 18],
          popupAnchor: [0, -18]
        });

        // Create marker with custom icon
        const marker = L.marker([lat, lng], { icon: customIcon })
          .addTo(map)
          .bindPopup(createPopupHtml(item, color), {
            maxWidth: 400,
            minWidth: 320,
            className: 'custom-popup'
          });

        // Add click event to marker
        marker.on('click', () => {
          setSelectedDevice(item);
          // Smooth zoom to marker
          map.setView([lat, lng], 14, {
            animate: true,
            duration: 0.5
          });
        });

        return marker;
      } catch (error) {
        console.error('Error creating marker for item:', item, error);
        return null;
      }
    }).filter(marker => marker !== null);
  };

  // Clear all markers from the map
  const clearMarkers = () => {
    markersRef.current.forEach(marker => {
      if (marker && leafletMapRef.current) {
        leafletMapRef.current.removeLayer(marker);
      }
    });
    markersRef.current = [];
  };

  // Handle donor filter change
  const handleFilterChange = (donorName) => {
    setFilterDonor(donorName);
    setSelectedDevice(null);
    if (leafletMapRef.current && window.L) {
      addMarkersToMap(window.L, leafletMapRef.current);
    }
  };

  // Reset all filters
  const resetFilters = () => {
    setFilterDonor('');
    setSelectedDevice(null);
    if (leafletMapRef.current && window.L) {
      addMarkersToMap(window.L, leafletMapRef.current);
    }
  };

  // Get unique donors from valid devices
  const uniqueDonors = validDevices ? [...new Set(validDevices.map(item => 
    item.DonarName || item.donor?.DonarOrganisation
  ))].filter(Boolean) : [];

  // Function to center map on selected device
  const centerOnDevice = (device) => {
    if (!leafletMapRef.current || !device.CLocation) return;
    
    const [lat, lng] = device.CLocation.split(',').map(coord => parseFloat(coord.trim()));
    if (!isNaN(lat) && !isNaN(lng)) {
      leafletMapRef.current.setView([lat, lng], 15, {
        animate: true,
        duration: 0.5
      });
    }
  };

  return (
    <Wrapper>
      <div className="content-wrapper">
        <div className="container-full">
          <section className="content">
            <div className="row">
              <div className="col-12">
                <div className="box">
                  {/* Modern Header with Stats */}
                  <div className="box-header with-border" style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    borderRadius: '8px 8px 0 0'
                  }}>
                    <div className="row align-items-center">
                      <div className="col-md-4">
                        <h4 className="box-title mb-0" style={{ color: 'white' }}>
                          🌍 Device Location Map
                        </h4>
                        <small style={{ opacity: 0.9 }}>Real-time device tracking</small>
                      </div>
                      
                      <div className="col-md-8">
                        <div className="d-flex justify-content-end gap-3">
                          {/* Statistics Badges */}
                          <div className="stat-badge" title="Total devices in system">
                            <i className="fas fa-database"></i>
                            <span>Total: {totalDevices}</span>
                          </div>
                          
                          <div className="stat-badge" style={{ background: '#10b981' }} title="Devices with valid coordinates on map">
                            <i className="fas fa-map-marker-alt"></i>
                            <span>On Map: {devicesWithCoordinates}</span>
                          </div>
{/*                           
                          <div className="stat-badge" style={{ background: '#f59e0b' }} title="Devices missing coordinates">
                            <i className="fas fa-exclamation-triangle"></i>
                            <span>Missing: {totalDevices - devicesWithCoordinates}</span>
                          </div> */}
                          
                          {/* Donor Filter Dropdown */}
                          {validDevices.length > 0 && (
                            <select
                              className="filter-select"
                              onChange={(e) => handleFilterChange(e.target.value || '')}
                              value={filterDonor}
                            >
                              <option value="">All Donors ({devicesWithCoordinates})</option>
                              {uniqueDonors.map((donor) => (
                                <option key={donor} value={donor}>
                                  {donor} ({donorStats[donor] || 0})
                                </option>
                              ))}
                            </select>
                          )}
                          
                          {/* Reset Button */}
                          <button
                            className="reset-button"
                            onClick={resetFilters}
                            title="Reset all filters"
                          >
                            <i className="fas fa-sync-alt"></i> Reset
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="box-body" style={{ padding: "0" }}>
                    {/* Map Container */}
                    <div className="map-container">
                      <div
                        ref={mapRef}
                        className="map-wrapper"
                        style={{ 
                          minHeight: 'calc(100vh - 200px)',
                          height: '600px',
                          width: '100%',
                          position: 'relative'
                        }}
                      >
                        {!mapLoaded && (
                          <div className="loading-overlay">
                            <div className="loading-spinner">
                              <div className="spinner"></div>
                              <p>Loading Map...</p>
                            </div>
                          </div>
                        )}
                        {mapLoaded && validDevices.length === 0 && (
                          <div className="no-data-overlay">
                            <NoData message={`No devices with valid coordinates found. ${totalDevices - devicesWithCoordinates} devices missing coordinates.`} />
                          </div>
                        )}
                        {mapLoaded && validDevices.length > 0 && markersRef.current.length === 0 && filterDonor && (
                          <div className="no-data-overlay">
                            <NoData message={`No devices found for donor: ${filterDonor}`} />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Selected Device Info Panel */}
                    {selectedDevice && (
                      <div className="selected-device-panel">
                        <div className="panel-header" style={{
                          background: `linear-gradient(135deg, ${getDonorColor(selectedDevice.DonarName || selectedDevice.donor?.DonarOrganisation)}, ${getDonorColor(selectedDevice.DonarName || selectedDevice.donor?.DonarOrganisation)}dd)`
                        }}>
                          <h4>Selected Device</h4>
                          <button onClick={() => setSelectedDevice(null)} className="close-btn">×</button>
                        </div>
                        <div className="panel-content">
                          <div className="info-row">
                            <span className="label">Device UID:</span>
                            <span className="value">{selectedDevice.UID || 'N/A'}</span>
                          </div>
                          <div className="info-row">
                            <span className="label">Beneficiary:</span>
                            <span className="value">{selectedDevice.NameOfBeneficiary || 'N/A'}</span>
                          </div>
                          <div className="info-row">
                            <span className="label">Location:</span>
                            <span className="value">{selectedDevice.VillageName}, {selectedDevice.Block}</span>
                          </div>
                          <div className="info-row">
                            <span className="label">Status:</span>
                            <span className={`status-badge ${selectedDevice.status || selectedDevice.Status}`}>
                              {selectedDevice.status || selectedDevice.Status || 'N/A'}
                            </span>
                          </div>
                          <div className="info-row">
                            <span className="label">Coordinates:</span>
                            <span className="value" style={{ fontSize: '11px', fontFamily: 'monospace' }}>
                              {selectedDevice.CLocation || 'N/A'}
                            </span>
                          </div>
                          <button onClick={() => centerOnDevice(selectedDevice)} className="center-btn">
                            <i className="fas fa-crosshairs"></i> Center on Map
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </Wrapper>
  );
};

const Wrapper = styled.section`
  .box {
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  }
  
  .stat-badge {
    background: rgba(255,255,255,0.2);
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 500;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    transition: all 0.3s ease;
    
    i {
      font-size: 14px;
    }
    
    &:hover {
      transform: translateY(-2px);
      background: rgba(255,255,255,0.3);
    }
  }
  
  .filter-select {
    background: rgba(255,255,255,0.95);
    border: none;
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 14px;
    cursor: pointer;
    outline: none;
    transition: all 0.3s ease;
    color: #333;
    
    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
  }
  
  .reset-button {
    background: rgba(255,255,255,0.2);
    border: 1px solid rgba(255,255,255,0.3);
    padding: 8px 16px;
    border-radius: 20px;
    color: white;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 14px;
    
    &:hover {
      background: rgba(255,255,255,0.3);
      transform: translateY(-1px);
    }
  }
  
  .map-container {
    position: relative;
  }
  
  .loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255,255,255,0.95);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }
  
  .no-data-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255,255,255,0.95);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }
  
  .loading-spinner {
    text-align: center;
    
    .spinner {
      width: 50px;
      height: 50px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 16px;
    }
    
    p {
      color: #667eea;
      font-weight: 500;
    }
  }
  
  .selected-device-panel {
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 320px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.15);
    z-index: 1000;
    animation: slideIn 0.3s ease;
    
    .panel-header {
      padding: 16px;
      color: white;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-radius: 12px 12px 0 0;
      
      h4 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
      }
      
      .close-btn {
        background: none;
        border: none;
        color: white;
        font-size: 24px;
        cursor: pointer;
        padding: 0;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: all 0.3s ease;
        
        &:hover {
          background: rgba(255,255,255,0.2);
        }
      }
    }
    
    .panel-content {
      padding: 16px;
      
      .info-row {
        margin-bottom: 12px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        .label {
          font-size: 12px;
          color: #6c757d;
          font-weight: 500;
        }
        
        .value {
          font-size: 13px;
          font-weight: 600;
          color: #2c3e50;
        }
        
        .status-badge {
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          
          &.active {
            background: #d1fae5;
            color: #10b981;
          }
          
          &.inactive {
            background: #fee2e2;
            color: #ef4444;
          }
        }
      }
      
      .center-btn {
        width: 100%;
        padding: 10px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        margin-top: 8px;
        transition: all 0.3s ease;
        
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102,126,234,0.4);
        }
        
        i {
          margin-right: 8px;
        }
      }
    }
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  /* Custom marker styles with blinking animation */
  .custom-marker {
    background: transparent;
    border: none;
  }
  
  /* Leaflet popup custom styles */
  .custom-popup .leaflet-popup-content-wrapper {
    border-radius: 12px;
    padding: 0;
    overflow: hidden;
    box-shadow: 0 8px 24px rgba(0,0,0,0.15);
  }
  
  .custom-popup .leaflet-popup-content {
    margin: 12px;
    min-width: 320px;
  }
  
  .custom-popup .leaflet-popup-tip {
    box-shadow: 0 8px 24px rgba(0,0,0,0.15);
  }
  
  /* Additional animation keyframes */
  @keyframes bounce {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.2);
    }
  }
`;

export default DeviceMap;

// Views/DeviceMap.jsx
// import React from 'react';
// import DeviceMapComponent from '../Components/DeviceMapComponent';

// const DeviceMap = () => {
//   return (
//     <div style={{ marginTop: '120px',padding: '10px',minHeight: '85vh' }}>
//       <DeviceMapComponent 
//         showHeader={true}
//         showFilters={true}
//         customHeight="calc(90vh - 120px)"
//       />
//     </div>
//   );
// };

// export default DeviceMap;