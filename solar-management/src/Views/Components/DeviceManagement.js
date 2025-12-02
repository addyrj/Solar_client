import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import UploadDataModal from '../Screens/UploadData';
import MQTTStatusPanel from '../Components/Modal/MQTTStatusPanel';
import CreateCharger from './CreateCharger';

const DeviceManagement = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('devices');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedUID, setSelectedUID] = useState(''); // Add this state

  const mqttStatus = useSelector(state => state.DashboardReducer?.mqttStatus);
  const deviceList = useSelector(state => state.DashboardReducer?.newDeviceList || []);

  const handleUploadForDevice = (uid) => {
    setSelectedUID(uid);
    setShowUploadModal(true);
  };

  return (
    <Wrapper>
      <div className="content-wrapper">
        <div className="container-full">
          <section className="content">
            
            {/* Header with Tabs */}
            <div className="row">
              <div className="col-12">
                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">Solar Device Management</h3>
                    <div className="card-tools">
                      <button 
                        className="btn btn-primary"
                        onClick={() => setShowCreateModal(true)}
                      >
                        <i className="fa-solid fa-plus"></i> Register New Device
                      </button>
                    </div>
                  </div>
                  
                  <div className="card-body">
                    {/* Navigation Tabs */}
                    <ul className="nav nav-tabs" role="tablist">
                      <li className="nav-item">
                        <button 
                          className={`nav-link ${activeTab === 'devices' ? 'active' : ''}`}
                          onClick={() => setActiveTab('devices')}
                        >
                          <i className="fa-solid fa-solar-panel"></i> Registered Devices
                        </button>
                      </li>
                      <li className="nav-item">
                        <button 
                          className={`nav-link ${activeTab === 'upload' ? 'active' : ''}`}
                          onClick={() => setActiveTab('upload')}
                        >
                          <i className="fa-solid fa-upload"></i> Manual Data Upload
                        </button>
                      </li>
                      <li className="nav-item">
                        <button 
                          className={`nav-link ${activeTab === 'mqtt' ? 'active' : ''}`}
                          onClick={() => setActiveTab('mqtt')}
                        >
                          <i className="fa-solid fa-satellite-dish"></i> MQTT Real-time
                        </button>
                      </li>
                    </ul>

                    {/* Tab Content */}
                    <div className="tab-content mt-3">
                      
                      {/* Registered Devices Tab */}
                      {activeTab === 'devices' && (
                        <div className="tab-pane fade show active">
                          <div className="row">
                            <div className="col-12">
                              <div className="card">
                                <div className="card-header">
                                  <h4 className="card-title">Registered Solar Devices</h4>
                                  <button 
                                    className="btn btn-success btn-sm"
                                    onClick={() => setShowUploadModal(true)}
                                  >
                                    <i className="fa-solid fa-upload"></i> Upload Data
                                  </button>
                                </div>
                                <div className="card-body">
                                  <div className="table-responsive">
                                    <table className="table table-bordered table-hover">
                                      <thead>
                                        <tr>
                                          <th>UID</th>
                                          <th>Location</th>
                                          <th>Status</th>
                                          <th>Last Update</th>
                                          <th>Data Source</th>
                                          <th>Actions</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {deviceList.map((device, index) => (
                                          <tr key={index}>
                                            <td>
                                              <strong>{device.UID}</strong>
                                            </td>
                                            <td>{device.Location || 'N/A'}</td>
                                            <td>
                                              <span className="badge bg-success">Active</span>
                                            </td>
                                            <td>
                                              {device.lastUpdate ? 
                                                new Date(device.lastUpdate).toLocaleString() : 
                                                'Never'
                                              }
                                            </td>
                                            <td>
                                              <span className="badge bg-info">
                                                {device.dataSource || 'Manual'}
                                              </span>
                                            </td>
                                            <td>
                                              <button 
                                                className="btn btn-primary btn-sm"
                                                onClick={() => handleUploadForDevice(device.UID)}
                                              >
                                                <i className="fa-solid fa-upload"></i> Upload
                                              </button>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Manual Upload Tab */}
                      {activeTab === 'upload' && (
                        <div className="tab-pane fade show active">
                          <div className="row">
                            <div className="col-12">
                              <div className="card">
                                <div className="card-header">
                                  <h4 className="card-title">Manual Data Upload</h4>
                                </div>
                                <div className="card-body">
                                  <div className="alert alert-info">
                                    <h5><i className="fa-solid fa-info-circle"></i> How to upload data manually:</h5>
                                    <ol>
                                      <li>Register your device first using "Register New Device" button</li>
                                      <li>Prepare your CSV file with the correct format</li>
                                      <li>Name your file as UID.csv (e.g., IND.DEL.del123.csv)</li>
                                      <li>Upload the file using the upload button below</li>
                                    </ol>
                                  </div>
                                  
                                  <div className="text-center">
                                    <button 
                                      className="btn btn-primary btn-lg"
                                      onClick={() => setShowUploadModal(true)}
                                    >
                                      <i className="fa-solid fa-upload"></i> Upload CSV Data
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* MQTT Real-time Tab */}
                      {activeTab === 'mqtt' && (
                        <div className="tab-pane fade show active">
                          <MQTTStatusPanel />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Modals */}
      {showUploadModal && (
        <UploadDataModal 
          show={showUploadModal} 
          onClose={() => {
            setShowUploadModal(false);
            setSelectedUID('');
          }}
          preselectedUID={selectedUID} // Pass the selected UID to the modal
        />
      )}

      {showCreateModal && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Register New Device</h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setShowCreateModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <CreateCharger />
              </div>
            </div>
          </div>
        </div>
      )}
    </Wrapper>
  );
};

const Wrapper = styled.section`
  .nav-tabs .nav-link {
    color: #6c757d;
    font-weight: 500;
    
    &.active {
      color: #0d6efd;
      font-weight: bold;
      border-bottom: 3px solid #0d6efd;
    }
  }
  
  .badge {
    font-size: 0.75em;
  }
  
  .table th {
    background-color: #f8f9fa;
    font-weight: 600;
  }
`;

export default DeviceManagement;