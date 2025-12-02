import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Papa from 'papaparse';
import toast from 'react-hot-toast';
import { uploadSolarData, getNewDeviceList } from '../../Database/Action/DashboardAction';

const UploadDataModal = ({ show, onClose }) => {
  const dispatch = useDispatch();
  const [selectedUID, setSelectedUID] = useState('');
  const [uploading, setUploading] = useState(false);
  const [filenameUID, setFilenameUID] = useState('');
  const [filename, setFilename] = useState('');

  const deviceList = useSelector(state => state.DashboardReducer.newDeviceList || []);

  useEffect(() => {
    dispatch(getNewDeviceList());
  }, [dispatch]);

  const extractUIDFromFilename = (filename) => {
    const baseName = filename.replace(/\.csv$/i, '');
    return baseName.trim();
  };

  const normalizeUID = (uid) => {
    return String(uid || '').trim().toUpperCase();
  };

  const safeParseFloat = (value) => {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      toast.error("Please select a CSV file to upload.");
      return;
    }

    e.target.value = null;
    setFilename(file.name);

    if (file.type !== "text/csv" && !file.name.endsWith('.csv')) {
      toast.error("Invalid file type. Please upload a CSV file.");
      return;
    }

    const extractedUID = extractUIDFromFilename(file.name);
    setFilenameUID(extractedUID);

    const normalizedExtractedUID = normalizeUID(extractedUID);

    const deviceExists = deviceList.some(device => {
      const deviceUID = normalizeUID(device?.UID);
      return deviceUID === normalizedExtractedUID;
    });

    if (!deviceExists) {
      toast.error(`The filename UID (${extractedUID}) is not registered. Please select a registered UID.`);
      return;
    }

    setSelectedUID(extractedUID);
    setUploading(true);

    try {
      const results = await new Promise((resolve, reject) => {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          transformHeader: header => header.trim(),
          complete: resolve,
          error: reject,
        });
      });

      if (results.errors.length > 0) throw new Error("CSV parsing error");

      const formattedData = results.data
        .filter(row => row['Date & Time'] && row['PV Voltage'])
        .map(row => {
          let recordTime;
          try {
            const dateString = row['Date & Time'].trim();
            if (/^\d{2}:\d{2}:\d{2} \d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
              const [timePart, datePart] = dateString.split(' ');
              const [hours, minutes, seconds] = timePart.split(':');
              const [day, month, year] = datePart.split('/');
              recordTime = new Date(Date.UTC(year, month - 1, day, hours, minutes, seconds)).toISOString();
            } else {
              recordTime = new Date().toISOString();
            }
          } catch (err) {
            recordTime = new Date().toISOString();
          }

          return {
            PvVolt: safeParseFloat(row['PV Voltage']),
            PvCur: safeParseFloat(row['PV Current']),
            BatVoltage: safeParseFloat(row['Bat Voltage']),
            BatCurrent: safeParseFloat(row['Bat Current']),
            LoadVoltage: safeParseFloat(row['Bat Voltage']),
            LoadCurrent: safeParseFloat(row['Bat Current']),
            BatKWh: 0,
            PVKWh: safeParseFloat(row['KwH (till date)']),
            Temperature: 0,
            RecordTime: recordTime,
          };
        });

      if (formattedData.length === 0) throw new Error("CSV has no valid data");

      dispatch(uploadSolarData({
        UID: extractedUID,
        data: formattedData,
      }));

      toast.success("Data uploaded successfully");
      onClose();

    } catch (error) {
      console.error("CSV Upload Error:", error);
      toast.error(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const isUIDRegistered = (uid) => {
    const normalizedInputUID = normalizeUID(uid);
    return deviceList.some(device => {
      const deviceUID = normalizeUID(device?.UID);
      return deviceUID === normalizedInputUID;
    });
  };

  if (!show) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        width: '400px',
        maxWidth: '90%',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
              padding: '15px',
              color: 'white',
      backgroundColor: '#0d6efd',
        }}>
          <h3 style={{ margin: 0 }}>Upload Solar Data</h3>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer'
            }}
          >
            &times;
          </button>
        </div>
        
        <div style={{ padding: '0px 16px 16px 16px' }}>
          <div >
            <label style={{ display: 'block',}}>Select UID</label>
            <select
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                margin: '0px 0px 16px 0px ',
                border: '1px solid #ddd'
              }}
              value={selectedUID}
              onChange={(e) => setSelectedUID(e.target.value)}
            >
              <option value="">-- Avalible Device UID (Unique CODE)--</option>
              {deviceList.map((item, idx) => (
                <option key={idx} value={item.UID}>{item.UID}</option>
              ))}
            </select>
            {filename && (
              <div style={{ marginTop: '8px' }}>
                <small style={{ color: isUIDRegistered(filenameUID) ? 'green' : 'red' }}>
                  This UID from filename: {filenameUID} 
                  {isUIDRegistered(filenameUID) ? ' (Registered)' : ' (Not registered--Register First )'} 
                </small>
              </div>
            )}
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="fileUpload" style={{
              display: 'inline-block',
              padding: '8px 16px',
              backgroundColor: '#0d6efd',
              color: 'white',
              borderRadius: '4px',
              cursor: 'pointer'
            }}>
              {uploading ? (
                <i className="fas fa-spinner fa-spin" />
              ) : (
                <>
                  <i className="fa-solid fa-upload" /> Upload Device Data in CSV
                </>
              )}
            </label>
            <input
              id="fileUpload"
              type="file"
              accept=".csv"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
            <div style={{ marginTop: '8px' }}>
              <small style={{ color: '#6c757d' }}>
                File name format: UID.csv (e.g., IND.RAJ.SHA001.csv)
              </small>
            </div>
          </div>
        </div>
        
        <div >
      
        </div>
      </div>
    </div>
  );
};

export default UploadDataModal;








// import React, { useEffect, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import Papa from 'papaparse';
// import toast from 'react-hot-toast';
// import { uploadSolarData, getNewDeviceList } from '../../Database/Action/DashboardAction';

// const UploadDataModal = ({ show, onClose, preselectedUID = '' }) => {
//   const dispatch = useDispatch();
//   const [selectedUID, setSelectedUID] = useState('');
//   const [uploading, setUploading] = useState(false);
//   const [filenameUID, setFilenameUID] = useState('');
//   const [filename, setFilename] = useState('');

//   // Add safe selector with default value
//   const deviceList = useSelector(state => state.DashboardReducer?.newDeviceList || []);

//   // Add loading state and error handling
//   const [loading, setLoading] = useState(true);

//   // Set the preselected UID when modal opens
//   useEffect(() => {
//     if (show && preselectedUID) {
//       setSelectedUID(preselectedUID);
//     }
//   }, [show, preselectedUID]);

//   useEffect(() => {
//     const fetchDevices = async () => {
//       try {
//         setLoading(true);
//         await dispatch(getNewDeviceList());
//       } catch (error) {
//         console.error('Error fetching devices:', error);
//         toast.error('Failed to load device list');
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (show) {
//       fetchDevices();
//     }
//   }, [dispatch, show]);

//   const extractUIDFromFilename = (filename) => {
//     const baseName = filename.replace(/\.csv$/i, '');
//     return baseName.trim();
//   };

//   const normalizeUID = (uid) => {
//     return String(uid || '').trim().toUpperCase();
//   };

//   const safeParseFloat = (value) => {
//     if (value === '' || value === null || value === undefined) return 0;
//     const num = parseFloat(value);
//     return isNaN(num) ? 0 : num;
//   };

//   const handleFileUpload = async (e) => {
//     const file = e.target.files[0];
//     if (!file) {
//       toast.error("Please select a CSV file to upload.");
//       return;
//     }

//     e.target.value = null;
//     setFilename(file.name);

//     if (file.type !== "text/csv" && !file.name.endsWith('.csv')) {
//       toast.error("Invalid file type. Please upload a CSV file.");
//       return;
//     }

//     const extractedUID = extractUIDFromFilename(file.name);
//     setFilenameUID(extractedUID);

//     const normalizedExtractedUID = normalizeUID(extractedUID);

//     // Safe check for device list
//     const deviceExists = Array.isArray(deviceList) && deviceList.some(device => {
//       const deviceUID = normalizeUID(device?.UID);
//       return deviceUID === normalizedExtractedUID;
//     });

//     if (!deviceExists) {
//       toast.error(`The filename UID (${extractedUID}) is not registered. Please register the device first.`);
//       return;
//     }

//     // Use the UID from filename, not from dropdown
//     const finalUID = extractedUID;
//     setSelectedUID(finalUID);
//     setUploading(true);

//     try {
//       const results = await new Promise((resolve, reject) => {
//         Papa.parse(file, {
//           header: true,
//           skipEmptyLines: true,
//           transformHeader: header => header.trim(),
//           complete: resolve,
//           error: reject,
//         });
//       });

//       if (results.errors.length > 0) {
//         console.error('CSV parsing errors:', results.errors);
//         throw new Error("CSV parsing error - check file format");
//       }

//       const formattedData = results.data
//         .filter(row => row['Date & Time'] && row['PV Voltage'])
//         .map(row => {
//           let recordTime;
//           try {
//             const dateString = row['Date & Time'].trim();
//             if (/^\d{2}:\d{2}:\d{2} \d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
//               const [timePart, datePart] = dateString.split(' ');
//               const [hours, minutes, seconds] = timePart.split(':');
//               const [day, month, year] = datePart.split('/');
//               recordTime = new Date(Date.UTC(year, month - 1, day, hours, minutes, seconds)).toISOString();
//             } else {
//               recordTime = new Date().toISOString();
//             }
//           } catch (err) {
//             console.warn('Date parsing error, using current time:', err);
//             recordTime = new Date().toISOString();
//           }

//           return {
//             PvVolt: safeParseFloat(row['PV Voltage']),
//             PvCur: safeParseFloat(row['PV Current']),
//             BatVoltage: safeParseFloat(row['Bat Voltage']),
//             BatCurrent: safeParseFloat(row['Bat Current']),
//             LoadVoltage: safeParseFloat(row['Bat Voltage']), // Using battery voltage as load voltage
//             LoadCurrent: safeParseFloat(row['Bat Current']),
//             BatKWh: 0,
//             PVKWh: safeParseFloat(row['KwH (till date)']),
//             Temperature: 0,
//             RecordTime: recordTime,
//             IP: "Manual Upload"
//           };
//         });

//       if (formattedData.length === 0) {
//         throw new Error("CSV has no valid data. Please check the file format.");
//       }

//       console.log('Uploading data for UID:', finalUID, 'Records:', formattedData.length);

//       // Dispatch the upload action
//       dispatch(uploadSolarData({
//         UID: finalUID,
//         data: formattedData,
//       }));

//       toast.success(`Successfully uploaded ${formattedData.length} records for ${finalUID}`);
//       onClose();

//     } catch (error) {
//       console.error("CSV Upload Error:", error);
//       toast.error(`Upload failed: ${error.message}`);
//     } finally {
//       setUploading(false);
//     }
//   };

//   const isUIDRegistered = (uid) => {
//     if (!Array.isArray(deviceList)) return false;
//     const normalizedInputUID = normalizeUID(uid);
//     return deviceList.some(device => {
//       const deviceUID = normalizeUID(device?.UID);
//       return deviceUID === normalizedInputUID;
//     });
//   };

//   // Show preselected UID info
//   const showPreselectedInfo = preselectedUID && selectedUID === preselectedUID;

//   if (!show) return null;

//   return (
//     <div style={{
//       position: 'fixed',
//       top: 0,
//       left: 0,
//       right: 0,
//       bottom: 0,
//       backgroundColor: 'rgba(0,0,0,0.5)',
//       display: 'flex',
//       justifyContent: 'center',
//       alignItems: 'center',
//       zIndex: 1000
//     }}>
//       <div style={{
//         backgroundColor: 'white',
//         borderRadius: '8px',
//         width: '500px',
//         maxWidth: '90%',
//         maxHeight: '90vh',
//         overflow: 'auto'
//       }}>
//         <div style={{
//           display: 'flex',
//           justifyContent: 'space-between',
//           alignItems: 'center',
//           padding: '15px',
//           color: 'white',
//           backgroundColor: '#0d6efd',
//         }}>
//           <h3 style={{ margin: 0 }}>Upload Solar Data</h3>
//           <button 
//             onClick={onClose}
//             style={{
//               background: 'none',
//               border: 'none',
//               fontSize: '1.5rem',
//               cursor: 'pointer',
//               color: 'white'
//             }}
//           >
//             &times;
//           </button>
//         </div>
        
//         <div style={{ padding: '20px' }}>
//           {loading ? (
//             <div style={{ textAlign: 'center', padding: '20px' }}>
//               <i className="fas fa-spinner fa-spin" /> Loading devices...
//             </div>
//           ) : (
//             <>
//               {/* Show preselected UID info */}
//               {showPreselectedInfo && (
//                 <div style={{
//                   marginBottom: '16px',
//                   padding: '10px',
//                   backgroundColor: '#e7f3ff',
//                   border: '1px solid #b3d9ff',
//                   borderRadius: '4px'
//                 }}>
//                   <strong>Uploading for device:</strong> {preselectedUID}
//                   <br />
//                   <small style={{ color: '#0066cc' }}>
//                     This device was selected from the device list
//                   </small>
//                 </div>
//               )}

//               <div style={{ marginBottom: '16px' }}>
//                 <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
//                   {preselectedUID ? 'Change Device UID (Optional)' : 'Select Registered Device UID'}
//                 </label>
//                 <select
//                   style={{
//                     width: '100%',
//                     padding: '10px',
//                     borderRadius: '4px',
//                     border: '1px solid #ddd',
//                     fontSize: '14px'
//                   }}
//                   value={selectedUID}
//                   onChange={(e) => setSelectedUID(e.target.value)}
//                 >
//                   <option value="">-- Select Registered Device --</option>
//                   {Array.isArray(deviceList) && deviceList.map((item, idx) => (
//                     <option key={idx} value={item.UID}>
//                       {item.UID} - {item.Location || 'No Location'}
//                     </option>
//                   ))}
//                 </select>
                
//                 {filename && (
//                   <div style={{ marginTop: '8px', fontSize: '12px' }}>
//                     <span style={{ 
//                       color: isUIDRegistered(filenameUID) ? 'green' : 'red',
//                       fontWeight: 'bold'
//                     }}>
//                       Detected UID from filename: {filenameUID} 
//                       {isUIDRegistered(filenameUID) ? 
//                         ' ✓ (Registered)' : 
//                         ' ✗ (Not registered - Please register device first)'
//                       } 
//                     </span>
//                   </div>
//                 )}
//               </div>

//               <div style={{ marginBottom: '16px' }}>
//                 <label htmlFor="fileUpload" style={{
//                   display: 'inline-block',
//                   padding: '10px 20px',
//                   backgroundColor: uploading ? '#6c757d' : '#0d6efd',
//                   color: 'white',
//                   borderRadius: '4px',
//                   cursor: uploading ? 'not-allowed' : 'pointer',
//                   fontSize: '14px'
//                 }}>
//                   {uploading ? (
//                     <>
//                       <i className="fas fa-spinner fa-spin" /> Uploading...
//                     </>
//                   ) : (
//                     <>
//                       <i className="fa-solid fa-upload" /> Choose CSV File
//                     </>
//                   )}
//                 </label>
//                 <input
//                   id="fileUpload"
//                   type="file"
//                   accept=".csv"
//                   style={{ display: 'none' }}
//                   onChange={handleFileUpload}
//                   disabled={uploading}
//                 />
                
//                 {filename && (
//                   <div style={{ marginTop: '8px' }}>
//                     <strong>Selected file:</strong> {filename}
//                   </div>
//                 )}
                
//                 <div style={{ marginTop: '12px', fontSize: '12px', color: '#6c757d' }}>
//                   <strong>File requirements:</strong>
//                   <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
//                     <li>File name format: UID.csv (e.g., IND.RAJ.SHA001.csv)</li>
//                     <li>CSV must contain columns: Date & Time, PV Voltage, PV Current, Bat Voltage, Bat Current, KwH (till date)</li>
//                     <li>Date format: HH:mm:ss DD/MM/YYYY</li>
//                   </ul>
//                 </div>
//               </div>

//               {/* Upload Instructions */}
//               <div style={{
//                 padding: '12px',
//                 backgroundColor: '#fff3cd',
//                 border: '1px solid #ffeaa7',
//                 borderRadius: '4px',
//                 fontSize: '13px'
//               }}>
//                 <strong>Important:</strong>
//                 <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
//                   <li>The CSV filename must match the device UID</li>
//                   <li>Device must be registered before uploading data</li>
//                   <li>Duplicate records (same timestamp) will be skipped automatically</li>
//                 </ul>
//               </div>
//             </>
//           )}
//         </div>
        
//         <div style={{ 
//           padding: '15px', 
//           borderTop: '1px solid #ddd',
//           display: 'flex',
//           justifyContent: 'flex-end',
//           gap: '10px'
//         }}>
//           <button
//             onClick={onClose}
//             style={{
//               padding: '8px 16px',
//               border: '1px solid #6c757d',
//               borderRadius: '4px',
//               backgroundColor: 'white',
//               color: '#6c757d',
//               cursor: 'pointer'
//             }}
//             disabled={uploading}
//           >
//             Cancel
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default UploadDataModal;



// // import React, { useEffect, useState } from 'react';
// // import { useDispatch, useSelector } from 'react-redux';
// // import Papa from 'papaparse';
// // import toast from 'react-hot-toast';
// // import { uploadSolarData, getNewDeviceList } from '../../Database/Action/DashboardAction';

// // const UploadDataModal = ({ show, onClose }) => {
// //   const dispatch = useDispatch();
// //   const [selectedUID, setSelectedUID] = useState('');
// //   const [uploading, setUploading] = useState(false);
// //   const [filenameUID, setFilenameUID] = useState('');
// //   const [filename, setFilename] = useState('');

// //   const deviceList = useSelector(state => state.DashboardReducer.newDeviceList || []);

// //   useEffect(() => {
// //     dispatch(getNewDeviceList());
// //   }, [dispatch]);

// //   const extractUIDFromFilename = (filename) => {
// //     const baseName = filename.replace(/\.csv$/i, '');
// //     return baseName.trim();
// //   };

// //   const normalizeUID = (uid) => {
// //     return String(uid || '').trim().toUpperCase();
// //   };

// //   const safeParseFloat = (value) => {
// //     const num = parseFloat(value);
// //     return isNaN(num) ? 0 : num;
// //   };

// //   const handleFileUpload = async (e) => {
// //     const file = e.target.files[0];
// //     if (!file) {
// //       toast.error("Please select a CSV file to upload.");
// //       return;
// //     }

// //     e.target.value = null;
// //     setFilename(file.name);

// //     if (file.type !== "text/csv" && !file.name.endsWith('.csv')) {
// //       toast.error("Invalid file type. Please upload a CSV file.");
// //       return;
// //     }

// //     const extractedUID = extractUIDFromFilename(file.name);
// //     setFilenameUID(extractedUID);

// //     const normalizedExtractedUID = normalizeUID(extractedUID);

// //     const deviceExists = deviceList.some(device => {
// //       const deviceUID = normalizeUID(device?.UID);
// //       return deviceUID === normalizedExtractedUID;
// //     });

// //     if (!deviceExists) {
// //       toast.error(`The filename UID (${extractedUID}) is not registered. Please select a registered UID.`);
// //       return;
// //     }

// //     setSelectedUID(extractedUID);
// //     setUploading(true);

// //     try {
// //       const results = await new Promise((resolve, reject) => {
// //         Papa.parse(file, {
// //           header: true,
// //           skipEmptyLines: true,
// //           transformHeader: header => header.trim(),
// //           complete: resolve,
// //           error: reject,
// //         });
// //       });

// //       if (results.errors.length > 0) throw new Error("CSV parsing error");

// //       const formattedData = results.data
// //         .filter(row => row['Date & Time'] && row['PV Voltage'])
// //         .map(row => {
// //           let recordTime;
// //           try {
// //             const dateString = row['Date & Time'].trim();
// //             if (/^\d{2}:\d{2}:\d{2} \d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
// //               const [timePart, datePart] = dateString.split(' ');
// //               const [hours, minutes, seconds] = timePart.split(':');
// //               const [day, month, year] = datePart.split('/');
// //               recordTime = new Date(Date.UTC(year, month - 1, day, hours, minutes, seconds)).toISOString();
// //             } else {
// //               recordTime = new Date().toISOString();
// //             }
// //           } catch (err) {
// //             recordTime = new Date().toISOString();
// //           }

// //           return {
// //             PvVolt: safeParseFloat(row['PV Voltage']),
// //             PvCur: safeParseFloat(row['PV Current']),
// //             BatVoltage: safeParseFloat(row['Bat Voltage']),
// //             BatCurrent: safeParseFloat(row['Bat Current']),
// //             LoadVoltage: safeParseFloat(row['Bat Voltage']),
// //             LoadCurrent: safeParseFloat(row['Bat Current']),
// //             BatKWh: 0,
// //             PVKWh: safeParseFloat(row['KwH (till date)']),
// //             Temperature: 0,
// //             RecordTime: recordTime,
// //           };
// //         });

// //       if (formattedData.length === 0) throw new Error("CSV has no valid data");

// //       dispatch(uploadSolarData({
// //         UID: extractedUID,
// //         data: formattedData,
// //       }));

// //       toast.success("Data uploaded successfully");
// //       onClose();

// //     } catch (error) {
// //       console.error("CSV Upload Error:", error);
// //       toast.error(`Upload failed: ${error.message}`);
// //     } finally {
// //       setUploading(false);
// //     }
// //   };

// //   const isUIDRegistered = (uid) => {
// //     const normalizedInputUID = normalizeUID(uid);
// //     return deviceList.some(device => {
// //       const deviceUID = normalizeUID(device?.UID);
// //       return deviceUID === normalizedInputUID;
// //     });
// //   };

// //   if (!show) return null;

// //   return (
// //     <div style={{
// //       position: 'fixed',
// //       top: 0,
// //       left: 0,
// //       right: 0,
// //       bottom: 0,
// //       backgroundColor: 'rgba(0,0,0,0.5)',
// //       display: 'flex',
// //       justifyContent: 'center',
// //       alignItems: 'center',
// //       zIndex: 1000
// //     }}>
// //       <div style={{
// //         backgroundColor: 'white',
// //         borderRadius: '8px',
// //         width: '400px',
// //         maxWidth: '90%',
// //         maxHeight: '90vh',
// //         overflow: 'auto'
// //       }}>
// //         <div style={{
// //           display: 'flex',
// //           justifyContent: 'space-between',
// //           alignItems: 'center',
// //               padding: '15px',
// //               color: 'white',
// //       backgroundColor: '#0d6efd',
// //         }}>
// //           <h3 style={{ margin: 0 }}>Upload Solar Data</h3>
// //           <button 
// //             onClick={onClose}
// //             style={{
// //               background: 'none',
// //               border: 'none',
// //               fontSize: '1.5rem',
// //               cursor: 'pointer'
// //             }}
// //           >
// //             &times;
// //           </button>
// //         </div>
        
// //         <div style={{ padding: '0px 16px 16px 16px' }}>
// //           <div >
// //             <label style={{ display: 'block',}}>Select UID</label>
// //             <select
// //               style={{
// //                 width: '100%',
// //                 padding: '8px',
// //                 borderRadius: '4px',
// //                 margin: '0px 0px 16px 0px ',
// //                 border: '1px solid #ddd'
// //               }}
// //               value={selectedUID}
// //               onChange={(e) => setSelectedUID(e.target.value)}
// //             >
// //               <option value="">-- Avalible Device UID (Unique CODE)--</option>
// //               {deviceList.map((item, idx) => (
// //                 <option key={idx} value={item.UID}>{item.UID}</option>
// //               ))}
// //             </select>
// //             {filename && (
// //               <div style={{ marginTop: '8px' }}>
// //                 <small style={{ color: isUIDRegistered(filenameUID) ? 'green' : 'red' }}>
// //                   This UID from filename: {filenameUID} 
// //                   {isUIDRegistered(filenameUID) ? ' (Registered)' : ' (Not registered--Register First )'} 
// //                 </small>
// //               </div>
// //             )}
// //           </div>

// //           <div style={{ marginBottom: '16px' }}>
// //             <label htmlFor="fileUpload" style={{
// //               display: 'inline-block',
// //               padding: '8px 16px',
// //               backgroundColor: '#0d6efd',
// //               color: 'white',
// //               borderRadius: '4px',
// //               cursor: 'pointer'
// //             }}>
// //               {uploading ? (
// //                 <i className="fas fa-spinner fa-spin" />
// //               ) : (
// //                 <>
// //                   <i className="fa-solid fa-upload" /> Upload Device Data in CSV
// //                 </>
// //               )}
// //             </label>
// //             <input
// //               id="fileUpload"
// //               type="file"
// //               accept=".csv"
// //               style={{ display: 'none' }}
// //               onChange={handleFileUpload}
// //             />
// //             <div style={{ marginTop: '8px' }}>
// //               <small style={{ color: '#6c757d' }}>
// //                 File name format: UID.csv (e.g., IND.RAJ.SHA001.csv)
// //               </small>
// //             </div>
// //           </div>
// //         </div>
        
// //         <div >
      
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default UploadDataModal;