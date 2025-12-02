import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMQTTStatus, getRealtimeData } from '../../../Database/Action/DashboardAction';

const MQTTStatusPanel = () => {
  const dispatch = useDispatch();
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  const mqttStatus = useSelector(state => state.DashboardReducer?.mqttStatus);
  const realtimeData = useSelector(state => state.DashboardReducer?.realtimeData || []);

  useEffect(() => {
    // Initial load
    dispatch(getMQTTStatus());
    dispatch(getRealtimeData());

    // Auto refresh every 10 seconds
    if (autoRefresh) {
      const interval = setInterval(() => {
        dispatch(getMQTTStatus());
        dispatch(getRealtimeData());
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [dispatch, autoRefresh]);

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="row">
      <div className="col-12">
        <div className="card">
          <div className="card-header">
            <h4 className="card-title">MQTT Real-time Data</h4>
            <div className="card-tools">
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                />
                <label className="form-check-label">Auto Refresh</label>
              </div>
              <button 
                className="btn btn-sm btn-primary"
                onClick={() => {
                  dispatch(getMQTTStatus());
                  dispatch(getRealtimeData());
                }}
              >
                <i className="fa-solid fa-refresh"></i> Refresh
              </button>
            </div>
          </div>
          <div className="card-body">
            
            {/* MQTT Connection Status */}
            <div className="row mb-4">
              <div className="col-12">
                <div className={`alert ${mqttStatus?.isConnected ? 'alert-success' : 'alert-danger'}`}>
                  <h5>
                    <i className={`fa-solid ${mqttStatus?.isConnected ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
                    MQTT Connection: {mqttStatus?.isConnected ? 'CONNECTED' : 'DISCONNECTED'}
                  </h5>
                  {mqttStatus?.timestamp && (
                    <small>Last checked: {formatTimestamp(mqttStatus.timestamp)}</small>
                  )}
                </div>
              </div>
            </div>

            {/* Real-time Data */}
            <div className="row">
              <div className="col-12">
                <h5>Latest Real-time Data ({realtimeData.length} records)</h5>
                <div className="table-responsive">
                  <table className="table table-bordered table-sm">
                    <thead>
                      <tr>
                        <th>Device</th>
                        <th>Battery Voltage</th>
                        <th>PV Voltage</th>
                        <th>PV Current</th>
                        <th>Energy (kWh)</th>
                        <th>Record Time</th>
                        <th>Source</th>
                      </tr>
                    </thead>
                    <tbody>
                      {realtimeData.slice(0, 10).map((record, index) => (
                        <tr key={index}>
                          <td>
                            <strong>{record.UID}</strong>
                            <br />
                            <small>{record.Location}</small>
                          </td>
                          <td>{record.BatVoltage}V</td>
                          <td>{record.PvVolt}V</td>
                          <td>{record.PvCur}A</td>
                          <td>{record.PVKWh}kWh</td>
                          <td>
                            {record.RecordTime ? 
                              formatTimestamp(record.RecordTime) : 
                              'N/A'
                            }
                          </td>
                          <td>
                            <span className={`badge ${
                              record.IP === 'MQTT' ? 'bg-success' : 'bg-info'
                            }`}>
                              {record.IP === 'MQTT' ? 'MQTT' : 'Manual'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {realtimeData.length === 0 && (
                  <div className="alert alert-warning text-center">
                    <i className="fa-solid fa-exclamation-triangle"></i>
                    No real-time data available. Make sure MQTT is connected and devices are sending data.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MQTTStatusPanel;