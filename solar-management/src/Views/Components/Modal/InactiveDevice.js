import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import { getNewDeviceList } from "../../../Database/Action/DashboardAction";
import NoData from "../../Components/NoData";

const InactiveDevice = ({ isOpen, onClose, onSuccess }) => {
  const dispatch = useDispatch();
  
  // Get devices from Redux store
  const newDeviceList = useSelector(
    (state) => state.DashboardReducer.newDeviceList || []
  );

  const [inactiveDevices, setInactiveDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [deviceTypeFilter, setDeviceTypeFilter] = useState("all"); // "all", "offlineDevice", "onlineDevice"

  // Filter inactive devices (status = 'inactive')
  useEffect(() => {
    if (newDeviceList.length > 0) {
      const inactive = newDeviceList.filter(
        (device) => device?.status === 'inactive'
      );
      setInactiveDevices(inactive);
      
      // Debug: Log the device types to see what values we have
      console.log("Inactive devices:", inactive.map(d => ({ 
        UID: d.UID, 
        deviceType: d.deviceType,
        status: d.status 
      })));
    }
  }, [newDeviceList]);

  // Fetch devices when modal opens
  useEffect(() => {
    if (isOpen) {
      dispatch(getNewDeviceList({ navigate: {} }));
    }
  }, [isOpen, dispatch]);

  // Get filtered devices based on device type
  const getFilteredDevices = () => {
    if (deviceTypeFilter === "all") {
      return inactiveDevices;
    }
    return inactiveDevices.filter(device => device.deviceType === deviceTypeFilter);
  };

  const getDeviceCount = (type) => {
    if (type === "all") return inactiveDevices.length;
    return inactiveDevices.filter(device => device.deviceType === type).length;
  };

  const handleViewDetails = (device) => {
    setSelectedDevice(device);
    setShowDetails(true);
  };

  const handleBackToList = () => {
    setShowDetails(false);
    setSelectedDevice(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };

  if (!isOpen) return null;

  const filteredDevices = getFilteredDevices();

  return (
    <ModalOverlay>
      <ModalContainer>
        <ModalHeader>
          <h3>
            <i className="fa-solid fa-clock"></i>
            All Inactive Devices ({inactiveDevices.length})
          </h3>
          
          <FilterButtons>
            <FilterButton
              className={deviceTypeFilter === "offlineDevice" ? "active" : ""}
              onClick={() => setDeviceTypeFilter("offlineDevice")}
            >
              <i className="fa-solid fa-wifi"></i>
              Offline Inactive Device ({getDeviceCount("offlineDevice")})
            </FilterButton>
            <FilterButton
              className={deviceTypeFilter === "onlineDevice" ? "active" : ""}
              onClick={() => setDeviceTypeFilter("onlineDevice")}
            >
              <i className="fa-solid fa-globe"></i>
              Online Inactive Device ({getDeviceCount("onlineDevice")})
            </FilterButton>
            {deviceTypeFilter !== "all" && (
              <ClearFilterButton onClick={() => setDeviceTypeFilter("all")}>
                <i className="fa-solid fa-times"></i>
              </ClearFilterButton>
            )}
          </FilterButtons>
          
          <button className="close-btn" onClick={onClose}>
            <i className="fa-solid fa-times"></i>
          </button>
        </ModalHeader>

        <ModalBody>
          {showDetails && selectedDevice ? (
            // Device Details View
            <div className="details-view">
              <button className="back-btn" onClick={handleBackToList}>
                <i className="fa-solid fa-arrow-left"></i> Back to List
              </button>
              
              <div className="device-details-card">
                <h4>
                  Device Details - {selectedDevice.UID}
                  <DeviceTypeBadge type={selectedDevice.deviceType}>
                    {selectedDevice.deviceType === "onlineDevice" ? "Online Device" : "Offline Device"}
                  </DeviceTypeBadge>
                </h4>
                
                <div className="details-grid">
                  <div className="detail-section">
                    <h5>Basic Information</h5>
                    <div className="detail-item">
                      <span className="label">UID:</span>
                      <span className="value">{selectedDevice.UID || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Device Type:</span>
                      <span className="value">
                        {selectedDevice.deviceType === "onlineDevice" ? "Online Device" : "Offline Device"}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Location Code:</span>
                      <span className="value">{selectedDevice.Location || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Coordinates:</span>
                      <span className="value">{selectedDevice.CLocation || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Status:</span>
                      <span className="value status-inactive">Inactive</span>
                    </div>
                  </div>

                  <div className="detail-section">
                    <h5>Beneficiary Details</h5>
                    <div className="detail-item">
                      <span className="label">Name:</span>
                      <span className="value">{selectedDevice.NameOfBeneficiary || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Phone:</span>
                      <span className="value">{selectedDevice.BeneficiaryPno || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="detail-section">
                    <h5>Location Details</h5>
                    <div className="detail-item">
                      <span className="label">Country:</span>
                      <span className="value">{selectedDevice.Country || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">State:</span>
                      <span className="value">{selectedDevice.State || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">District:</span>
                      <span className="value">{selectedDevice.District || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Block:</span>
                      <span className="value">{selectedDevice.Block || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Village:</span>
                      <span className="value">{selectedDevice.VillageName || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Panchayat Samiti:</span>
                      <span className="value">{selectedDevice.PanchayatSamiti || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="detail-section">
                    <h5>Ground Coordinator Details</h5>
                    <div className="detail-item">
                      <span className="label">GC Name:</span>
                      <span className="value">{selectedDevice.GCName || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">GC Phone:</span>
                      <span className="value">{selectedDevice.GCPhoneNumber || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="detail-section">
                    <h5>Solar Engineer Details</h5>
                    <div className="detail-item">
                      <span className="label">Engineer Name:</span>
                      <span className="value">{selectedDevice.SolarEngineerName || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Engineer Phone:</span>
                      <span className="value">{selectedDevice.SolarEngineerPno || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="detail-section">
                    <h5>Additional Information</h5>
                    <div className="detail-item">
                      <span className="label">Donar Name:</span>
                      <span className="value">{selectedDevice.DonarName || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Installation Date:</span>
                      <span className="value">{selectedDevice.InstallationDate || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Created At:</span>
                      <span className="value">{formatDate(selectedDevice.createdAt)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Last Updated:</span>
                      <span className="value">{formatDate(selectedDevice.updatedAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // List View
            <>
              <p className="modal-subtitle">
                These devices are inactive (no data received in last 60 days)
                {deviceTypeFilter !== "all" && (
                  <FilterIndicator>
                    Showing: {deviceTypeFilter === "onlineDevice" ? "Online" : "Offline"} Devices
                  </FilterIndicator>
                )}
              </p>
              
              <div className="table-responsive">
                <table className="table inactive-table">
                  <thead>
                    <tr>
                      <th>UID / Location</th>
                      <th>Device Type</th>
                      <th>Beneficiary Name</th>
                      <th>Beneficiary Phone</th>
                      <th>GC Name</th>
                      <th>GC Phone</th>
                      <th>Last Seen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDevices.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center">
                          <NoData message={`No ${deviceTypeFilter === "onlineDevice" ? "online" : "offline"} inactive devices found`} />
                        </td>
                      </tr>
                    ) : (
                      filteredDevices.map((device) => (
                        <tr key={device.ID}>
                          <td>
                            <div 
                              className="clickable-uid"
                              onClick={() => handleViewDetails(device)}
                            >
                              <div className="location-text">{device.Location || 'N/A'}</div>
                              <div className="uid-text">{device.UID}</div>
                            </div>
                          </td>
                          <td>
                            <DeviceTypeBadge type={device.deviceType} small>
                              {device.deviceType === "onlineDevice" ? "Online" : "Offline"}
                            </DeviceTypeBadge>
                          </td>
                          <td>{device.NameOfBeneficiary || 'N/A'}</td>
                          <td>{device.BeneficiaryPno || 'N/A'}</td>
                          <td>{device.GCName || 'N/A'}</td>
                          <td>{device.GCPhoneNumber || 'N/A'}</td>
                        <td>
  <span className="last-seen-badge">
    {device.updatedAt ? formatDate(device.updatedAt) : "Never"}
  </span>
</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </ModalBody>

        <ModalFooter>
          {showDetails ? (
            <button className="btn-secondary" onClick={handleBackToList}>
              Back to List
            </button>
          ) : (
            <button className="btn-secondary" onClick={onClose}>
              Close
            </button>
          )}
        </ModalFooter>
      </ModalContainer>
    </ModalOverlay>
  );
};

// Styled Components
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContainer = styled.div`
  background: white;
  border-radius: 8px;
  width: 1100px;
  max-width: 95%;
  max-height: 85vh;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
`;

const ModalHeader = styled.div`
  padding: 15px 20px;
  background: #6c757d;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;

  h3 {
    margin: 0;
    font-size: 18px;
    color: #fff;
    display: flex;
    align-items: center;
    gap: 8px;

    i {
      color: #ffc107;
    }
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
    color: #fff;

    &:hover {
      color: #ffc107;
    }
  }
`;

const FilterButtons = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  margin: 0 10px;
  flex-wrap: wrap;
`;

const FilterButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: all 0.2s ease;

  i {
    font-size: 12px;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.5);
  }

  &.active {
    background: #ffc107;
    border-color: #ffc107;
    color: #333;
    font-weight: 500;
  }
`;

const ClearFilterButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 12px;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const DeviceTypeBadge = styled.span`
  display: inline-block;
  padding: ${props => props.small ? '2px 6px' : '4px 8px'};
  border-radius: 4px;
  font-size: ${props => props.small ? '11px' : '12px'};
  font-weight: 500;
  background-color: ${props => props.type === 'onlineDevice' ? '#d4edda' : '#fff3cd'};
  color: ${props => props.type === 'onlineDevice' ? '#155724' : '#856404'};
  margin-left: ${props => props.small ? '0' : '10px'};
`;

const ModalBody = styled.div`
  padding: 20px;
  overflow-y: auto;
  max-height: calc(85vh - 120px);

  .modal-subtitle {
    color: #666;
    font-size: 14px;
    margin-bottom: 15px;
    padding-bottom: 10px;
    border-bottom: 1px solid #dee2e6;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .filter-indicator {
    background: #e9ecef;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 12px;
    color: #495057;
  }

  .inactive-table {
    width: 100%;
    border-collapse: collapse;

    th {
      background-color: #f2f2f2;
      color: #666;
      padding: 12px;
      text-align: left;
      font-weight: 600;
      border-bottom: 2px solid #dee2e6;
    }

    td {
      padding: 10px 12px;
      color: #666;
      border-bottom: 1px solid #dee2e6;
    }

    tr:hover {
      background-color: #fff3f3;
    }
  }

  .clickable-uid {
    cursor: pointer;
    padding: 5px;
    border-radius: 4px;
    transition: all 0.2s ease;

    &:hover {
      background-color: #e9ecef;
      
      .location-text {
        color: #d4af37;
      }
      
      .uid-text {
        color: #0056b3;
      }
    }
  }

  .location-text {
    color: #b8860b;
    font-weight: 500;
    font-size: 13px;
  }

  .uid-text {
    font-weight: 600;
    font-size: 14px;
    color: #333;
  }

  .last-seen-badge {
    background-color: #f8d7da;
    color: #721c24;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
  }

  .back-btn {
    background: none;
    border: none;
    color: #6c757d;
    cursor: pointer;
    font-size: 14px;
    padding: 8px 0;
    margin-bottom: 15px;
    display: flex;
    align-items: center;
    gap: 5px;

    &:hover {
      color: #0056b3;
    }
  }

  .device-details-card {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 20px;

    h4 {
      margin-top: 0;
      margin-bottom: 20px;
      color: #333;
      border-bottom: 2px solid #dee2e6;
      padding-bottom: 10px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
  }

  .details-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
  }

  .detail-section {
    background: white;
    padding: 15px;
    border-radius: 6px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

    h5 {
      margin-top: 0;
      margin-bottom: 15px;
      color: #495057;
      border-bottom: 1px solid #dee2e6;
      padding-bottom: 8px;
    }
  }

  .detail-item {
    margin-bottom: 10px;
    display: flex;
    flex-direction: column;
    gap: 4px;

    .label {
      font-size: 12px;
      color: #6c757d;
      font-weight: 500;
    }

    .value {
      font-size: 14px;
      color: #212529;
      font-weight: 400;
      word-break: break-word;
    }

    .status-inactive {
      background-color: #f8d7da;
      color: #721c24;
      padding: 4px 8px;
      border-radius: 4px;
      display: inline-block;
      font-weight: 500;
      width: fit-content;
    }
  }

  .text-center {
    text-align: center;
    padding: 30px !important;
  }
`;

const FilterIndicator = styled.span`
  background: #e9ecef;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  color: #495057;
  margin-left: 10px;
`;

const ModalFooter = styled.div`
  padding: 15px 20px;
  background-color: #f8f9fa;
  border-top: 1px solid #dee2e6;
  display: flex;
  justify-content: flex-end;

  .btn-secondary {
    background-color: #6c757d;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;

    &:hover {
      background-color: #5a6268;
    }
  }
`;

export default InactiveDevice;