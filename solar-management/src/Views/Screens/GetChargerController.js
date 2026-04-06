import React, { useEffect, useRef, useState, useCallback } from "react";
import $ from "jquery";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import InactiveDevice from "../Components/Modal/InactiveDevice"; // Adjust path as needed
import "../../Style/datatables_custom.css";
import { initDatatable } from "../../JavaScript/Datatables";
import "datatables.net-buttons";
import JSZip from "jszip";
import "datatables.net-buttons/js/buttons.colVis";
import "datatables.net-buttons/js/buttons.html5";
import "datatables.net-buttons/js/buttons.print";
import "datatables.net-responsive";
import styled from "styled-components";
import {
  changeApistate,
  changeCreateModalStata,
  changeModalState,
  disableFilterCondition,
  disableSortCondition,
  setLoader,
} from "../../Database/Action/ConstantAction";
import {
  getNewDeviceList,
  deleteNewDevice,
  getUnregisteredDevices,
} from "../../Database/Action/DashboardAction";
import NoData from "../Components/NoData";
import {
  filterCondition,
  sortinCondition,
} from "../Constant/FilterConditionList";

// Import the separate components
import CreateNewCharger from "../Components/Modal/NewCreateCharger";
import EditNewCharger from "../Components/Modal/EditNewCharger";

const NewChargerController = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const createRef = useRef(null);

  // Redux state
  const newDeviceList = useSelector(
    (state) => state.DashboardReducer.newDeviceList,
  );
  const mainNewDeviceList = useSelector(
    (state) => state.DashboardReducer.mainNewDeviceList,
  );
  const unregisteredDevices = useSelector(
    (state) => state.DashboardReducer.unregisteredDevices || [],
  );
  const apistate = useSelector((state) => state.ConstantReducer.apistate);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUnregisteredModalOpen, setIsUnregisteredModalOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [selectedUnregisteredDevice, setSelectedUnregisteredDevice] =
    useState(null);
  const [isInactiveModalOpen, setIsInactiveModalOpen] = useState(false);

  // Filter and sort states
  const columnId = useSelector((state) => state.DashboardReducer.columnId);
  const conditionId = useSelector(
    (state) => state.DashboardReducer.conditionId,
  );
  const sortColumnId = useSelector(
    (state) => state.DashboardReducer.sortColumnId,
  );
  const sortConditionId = useSelector(
    (state) => state.DashboardReducer.sortConditionId,
  );

  // Component states
  const [devices, setDevices] = useState([]);
  const tableRef = useRef(null);
  const dataTableRef = useRef(null);
  const mountedRef = useRef(true);
  const tableContainerRef = useRef(null);
  const modalRef = useRef(null);

  // Fetch unregistered devices on component mount
  useEffect(() => {
    dispatch(getUnregisteredDevices({ navigate }));
  }, [dispatch, navigate]);

  // Handle Edit - opens EditNewCharger component
  const handleEdit = useCallback((device) => {
    console.log("Edit device data received:", device);
    setSelectedDevice(device);
    setIsEditModalOpen(true);
  }, []);

  // Handle Create - opens CreateNewCharger component
  const handleCreate = useCallback(() => {
    console.log("Create new device");
    setSelectedUnregisteredDevice(null);
    setIsCreateModalOpen(true);
  }, []);

  // Handle Register from unregistered devices modal
  const handleRegisterUnregistered = useCallback((device) => {
    console.log("Register unregistered device:", device);
    setSelectedUnregisteredDevice(device);
    setIsUnregisteredModalOpen(false); // Close unregistered modal
    setIsCreateModalOpen(true); // Open create modal
  }, []);

  // Handle Delete
  const handleDelete = useCallback(
    (deviceId) => {
      console.log("Delete device ID:", deviceId);
      if (window.confirm("Are you sure you want to delete this device?")) {
        dispatch(deleteNewDevice(deviceId, navigate));
      }
    },
    [dispatch, navigate],
  );

  // Handle modal success callbacks
  const handleOperationSuccess = useCallback(() => {
    dispatch(getNewDeviceList({ navigate: navigate }));
    dispatch(getUnregisteredDevices({ navigate }));
  }, [dispatch, navigate]);

  // Handle closing modals
  const handleCloseCreateModal = useCallback(() => {
    setIsCreateModalOpen(false);
    setSelectedUnregisteredDevice(null);
  }, []);

  const handleCloseEditModal = useCallback(() => {
    setIsEditModalOpen(false);
    setSelectedDevice(null);
  }, []);

  const handleCloseUnregisteredModal = useCallback(() => {
    setIsUnregisteredModalOpen(false);
  }, []);

  // Handle opening unregistered modal
  const handleOpenUnregisteredModal = useCallback(() => {
    setIsUnregisteredModalOpen(true);
  }, []);

  // Click outside to close modal
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        handleCloseUnregisteredModal();
      }
    };

    if (isUnregisteredModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isUnregisteredModalOpen, handleCloseUnregisteredModal]);

  const openModal = (title, column, data) => {
    dispatch(
      changeModalState({
        openState: true,
        content: title,
        dataColumn: column,
        data: data,
        screenName: "NewChargerController",
      }),
    );
  };

  const getConditionName = Array.isArray(filterCondition)
    ? filterCondition.filter((item) => item.id === conditionId)
    : [];

  const getSortConditionName = Array.isArray(sortinCondition)
    ? sortinCondition.filter((item) => item.id === sortConditionId)
    : [];
  
  // Handle opening inactive devices modal
  const handleOpenInactiveModal = useCallback(() => {
    setIsInactiveModalOpen(true);
  }, []);

  // Handle closing inactive devices modal
  const handleCloseInactiveModal = useCallback(() => {
    setIsInactiveModalOpen(false);
  }, []);
  
  useEffect(() => {
    dispatch(changeApistate());
  }, []);

  useEffect(() => {
    dispatch(getNewDeviceList({ navigate: navigate }));
  }, [dispatch, apistate]);

  useEffect(() => {
    setDevices(newDeviceList);
    // Log the first device to see its structure
    if (newDeviceList && newDeviceList.length > 0) {
      console.log("First device full data:", newDeviceList[0]);
      console.log("Donor object:", newDeviceList[0]?.donor);
      console.log("Donor name from donor object:", newDeviceList[0]?.donor?.DonarOrganisation);
    }
  }, [newDeviceList, apistate]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Fixed DataTable initialization
  useEffect(() => {
    let timeoutId = null;

    const initializeDataTable = () => {
      if (!mountedRef.current) return;

      // Ensure the table element exists
      const tableElement = document.getElementById("example-datatables");
      if (!tableElement) return;

      try {
        // Clean up existing DataTable
        if (dataTableRef.current) {
          try {
            if ($.fn.DataTable.isDataTable("#example-datatables")) {
              dataTableRef.current.destroy();
              dataTableRef.current = null;
            }
          } catch (error) {
            console.warn("DataTable cleanup warning:", error);
          }
        }

        // Initialize new DataTable only if there are devices
        if (devices.length > 0) {
          window.JSZip = JSZip;
          
          // Small delay to ensure DOM is ready
          setTimeout(() => {
            if (!mountedRef.current) return;
            
            try {
              const dataTable = initDatatable();
              dataTableRef.current = dataTable;

              // Attach event handlers
              $("#example-datatables").off("click.newcharger").on(
                "click.newcharger",
                ".edit-btn",
                function (e) {
                  e.stopPropagation();
                  e.preventDefault();

                  try {
                    const rawData = $(this).attr("data-device");
                    if (rawData) {
                      const decodedData = decodeURIComponent(rawData);
                      const device = JSON.parse(decodedData);
                      handleEdit(device);
                    }
                  } catch (error) {
                    console.error("Edit error:", error);
                  }
                },
              );

              $("#example-datatables").off("click.newcharger.delete").on(
                "click.newcharger.delete",
                ".delete-btn",
                function (e) {
                  e.stopPropagation();
                  e.preventDefault();

                  const id = $(this).data("id");
                  if (id) {
                    handleDelete(id);
                  }
                },
              );
            } catch (error) {
              console.error("DataTable initialization error:", error);
            }
          }, 100);
        }
      } catch (error) {
        console.error("Error in DataTable setup:", error);
      }
    };

    timeoutId = setTimeout(initializeDataTable, 200);

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // Clean up DataTable on unmount
      if (dataTableRef.current) {
        try {
          if ($.fn.DataTable.isDataTable("#example-datatables")) {
            dataTableRef.current.destroy();
          }
        } catch (error) {
          // Ignore cleanup errors
        }
        dataTableRef.current = null;
      }
    };
  }, [devices, handleEdit, handleDelete]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };

  // Function to get donor name from device data
  const getDonorName = (item) => {
    if (!item) return "NULL";
    
    // Try different possible paths for donor name
    // Based on your backend response, donor data is in item.donor.DonarOrganisation
    if (item.donor && item.donor.DonarOrganisation) {
      return item.donor.DonarOrganisation;
    }
    if (item.DonarName) {
      return item.DonarName;
    }
    if (item.donor && item.donor.name) {
      return item.donor.name;
    }
    if (item.donor_name) {
      return item.donor_name;
    }
    
    return "NULL";
  };

  return (
    <Wrapper>
      <div className="content-wrapper">
        <div className="container-full">
          <section className="content">
            <div className="row">
              <div className="col-12">
                <div className="box">
                  <div className="row">
                    <div className="box-header with-border d-flex justify-content-between align-items-center">
                      {/* Left Section */}
                      <div className="d-flex align-items-center gap-3">
                        <h4 className="box-title mb-0">
                          Charge Controller Devices
                        </h4>

                        <div className="d-flex gap-2">
                          {/* Unregistered Devices Alert */}
                          {unregisteredDevices?.length > 0 && (
                            <div
                              className="unregistered-alert"
                              onClick={handleOpenUnregisteredModal}
                            >
                              <i className="fa-solid fa-exclamation-circle"></i>
                              <span>
                                {unregisteredDevices.length} Unregistered Device
                                {unregisteredDevices.length > 1 ? "s" : ""}{" "}
                                Waiting for Registration
                              </span>
                            </div>
                          )}

                          {/* Inactive Devices Button */}
                          <div
                            className="inactive-alert"
                            onClick={handleOpenInactiveModal}
                          >
                            <i className="fa-solid fa-clock"></i>
                            <span>
                              {
                                devices?.filter((d) => d?.status === "inactive")
                                  .length
                              }{" "}
                              Inactive Device List
                              {devices?.filter((d) => d?.status === "inactive")
                                .length !== 1
                                ? "s"
                                : ""}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right Section */}
                      <button
                        className="filterButton"
                        type="button"
                        onClick={handleCreate}
                      >
                        <i
                          className="fa-solid fa-add"
                          style={{ marginRight: "10px" }}
                        />
                        Create
                      </button>
                    </div>
                  </div>

                  <div className="box-body">
                    <div className="table-responsive">
                      <table
                        ref={tableRef}
                        id="example-datatables"
                        className="table text-fade table-bordered table-hover margin-top-10 w-p100"
                        style={{ width: "100%" }}
                      >
                        <thead>
                          <tr className="text-dark">
                            <th>
                              UIDLocation
                              <br />
                              UID
                            </th>
                            <th>Status</th>
                            <th>Action</th>
                            <th>Beneficiary Name</th>
                            <th>Beneficiary Phone</th>
                            <th>Installation Date</th>
                            <th>Panchayat Samiti</th>
                            <th>Donor Name</th>
                            <th>Village</th>
                            <th>REW Name</th>
                            <th>Location</th>
                            <th>Block</th>
                            <th>District</th>
                            <th>State</th>
                            <th>Country</th>
                            <th>GC Name</th>
                            <th>GC Phone</th>
                            <th>Solar Engineer</th>
                            <th>Engineer Phone</th>
                          </tr>
                        </thead>

                        <tbody>
                          {devices.length === 0 ? (
                            <tr>
                              <td colSpan={19}>
                                <NoData />
                              </td>
                            </tr>
                          ) : (
                            devices?.map((item, index) => {
                              const isActive = item?.status === "active";
                              const donorName = getDonorName(item);

                              return (
                                <tr
                                  key={`device-${item?.ID || item?.id || index}`}
                                  className={!isActive ? "inactive-row" : ""}
                                >
                                  <td
                                    className={`text-dark`}
                                    style={{
                                      fontSize: "16px",
                                      cursor: "pointer",
                                      textDecoration: "underline",
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigate("/show_graph", {
                                        state: {
                                          uid: item?.UID,
                                          deviceData: item,
                                        },
                                      });
                                    }}
                                  >
                                    {item?.Location && (
                                      <div
                                        style={{
                                          color: "#d4af37",
                                          fontWeight: "300",
                                          fontSize: "14px",
                                        }}
                                      >
                                        {item.Location}
                                      </div>
                                    )}

                                    <div
                                      style={{
                                        fontWeight: "300",
                                        fontSize: "14px",
                                      }}
                                    >
                                      {item?.UID}
                                    </div>

                                    <div className="mt-2">
                                      <input
                                        className="form-check-input"
                                        type="checkbox"
                                        value={item?.ID || item?.id}
                                        id={`checkbox-${item?.ID || item?.id}`}
                                        onClick={(e) => e.stopPropagation()}
                                      />
                                    </div>
                                  </td>

                                  <td>
                                    <span
                                      className={`status-badge ${
                                        isActive
                                          ? "status-active"
                                          : "status-inactive"
                                      }`}
                                    >
                                      {isActive ? "Active" : "Inactive"}
                                    </span>

                                    {!isActive && item?.RecordTime && (
                                      <div className="last-seen-small">
                                        Last: {formatDate(item.RecordTime)}
                                      </div>
                                    )}
                                  </td>

                                  <td>
                                    <div style={{ display: "flex", gap: "4px" }}>
                                      <button
                                        className="delete-btn"
                                        data-id={item?.ID || item?.id}
                                        style={{
                                          background: "red",
                                          color: "white",
                                          border: "none",
                                          padding: "8px 12px",
                                          borderRadius: "4px",
                                          cursor: "pointer",
                                        }}
                                      >
                                        <i className="fa-solid fa-trash" />
                                      </button>

                                      <button
                                        className="action-btn edit-btn"
                                        data-device={encodeURIComponent(
                                          JSON.stringify(item),
                                        )}
                                        style={{
                                          background: "#0096c7",
                                          color: "white",
                                          border: "none",
                                          padding: "8px 12px",
                                          borderRadius: "4px",
                                          cursor: "pointer",
                                        }}
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          handleEdit(item);
                                        }}
                                      >
                                        <i className="fa-solid fa-pen-to-square" />
                                      </button>
                                    </div>
                                  </td>
                                  
                                  <td>{item?.NameOfBeneficiary || "NULL"}</td>
                                  <td>{item?.BeneficiaryPno || "NULL"}</td>
                                  <td>{item?.InstallationDate || "NULL"}</td>
                                  <td>{item?.PanchayatSamiti || "NULL"}</td>
                                  <td>{donorName}</td>
                                  <td>{item?.VillageName || "NULL"}</td>
                                  <td>
                                    {item?.rew?.rew_name || 
                                     item?.REW?.rew_name || 
                                     item?.rew_name || 
                                     'N/A'}
                                  </td>
                                  <td>{item?.CLocation || "NULL"}</td>
                                  <td>{item?.Block || "NULL"}</td>
                                  <td>{item?.District || "NULL"}</td>
                                  <td>{item?.State || "NULL"}</td>
                                  <td>{item?.Country || "NULL"}</td>
                                  <td>{item?.GCName || "NULL"}</td>
                                  <td>{item?.GCPhoneNumber || "NULL"}</td>
                                  <td>{item?.SolarEngineerName || "NULL"}</td>
                                  <td>{item?.SolarEngineerPno || "NULL"}</td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Unregistered Devices Modal */}
      {isUnregisteredModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container" ref={modalRef}>
            <div className="modal-header">
              <h3>
                <i className="fa-solid fa-exclamation-triangle"></i>
                Unregistered Devices
              </h3>
              <button
                className="close-btn"
                onClick={handleCloseUnregisteredModal}
              >
                <i className="fa-solid fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <p className="modal-subtitle">
                These devices have sent data but are not registered in the
                system. Click Register to add them.
              </p>
              <div className="table-responsive">
                <table className="table unregistered-table">
                  <thead>
                    <tr>
                      <th>UID</th>
                      <th>Location</th>
                      <th>First Seen</th>
                      <th>Last Seen</th>
                      <th>Count</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {unregisteredDevices.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center">
                          <NoData message="No unregistered devices found" />
                        </td>
                      </tr>
                    ) : (
                      unregisteredDevices.map((item) => (
                        <tr key={item.UID}>
                          <td>
                            <strong>{item.UID}</strong>
                          </td>
                          <td>{item.Location || "N/A"}</td>
                          <td>{formatDate(item.firstSeen)}</td>
                          <td>{formatDate(item.lastSeen)}</td>
                          <td>
                            <span className="count-badge">{item.count}</span>
                          </td>
                          <td>
                            <button
                              className="register-btn"
                              onClick={() => handleRegisterUnregistered(item)}
                            >
                              <i className="fa-solid fa-check"></i>
                              Register here
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={handleCloseUnregisteredModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Render CreateNewCharger Modal */}
      {isCreateModalOpen && (
        <CreateNewCharger
          isOpen={isCreateModalOpen}
          onClose={handleCloseCreateModal}
          onSuccess={handleOperationSuccess}
          deviceData={selectedUnregisteredDevice}
        />
      )}

      {/* Render EditNewCharger Modal */}
      {isEditModalOpen && selectedDevice && (
        <EditNewCharger
          deviceData={selectedDevice}
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          onSuccess={handleOperationSuccess}
        />
      )}
      
      {/* Inactive Devices Modal */}
      <InactiveDevice
        isOpen={isInactiveModalOpen}
        onClose={handleCloseInactiveModal}
        onSuccess={handleOperationSuccess}
      />
    </Wrapper>
  );
};

const Wrapper = styled.section`
  .tableCheckBox {
    border-color: 1px solid white;
  }
  .filterButton {
    background: ${({ theme }) => theme.colors.themeColor};
    padding: 10px 20px 10px 20px;
    color: white;
    margin: 5px;
    border: none;
    border-radius: 4px;
    cursor: pointer;

    &:hover,
    &:active {
      background-color: transparent;
      color: ${({ theme }) => theme.colors.themeColor};
      border: 1px solid ${({ theme }) => theme.colors.themeColor};
      transform: scale(0.96);
    }
  }

  input[type="checkbox"] {
    width: 15px;
    height: 15px;
    opacity: 1 !important;
    margin-right: 12px;
    position: relative !important;
    left: 0px;
  }

  .status-badge {
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: bold;
  }

  .status-active {
    background-color: #d4edda;
    color: #155724;
  }

  .status-inactive {
    background-color: #f8d7da;
    color: #721c24;
  }

  .unregistered-alert {
    background: #cc0000;
    color: #ffcccc;
    padding: 8px 15px;
    border-radius: 20px;
    font-weight: bold;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.3s ease;
    font-size: 14px;

    i {
      font-size: 16px;
    }
  }

  .inactive-alert {
    background: #ffc107;
    color: #856404;
    padding: 8px 15px;
    border-radius: 20px;
    font-weight: bold;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.3s ease;
    font-size: 14px;
    border: 1px solid #ffc107;

    i {
      font-size: 16px;
      color: #856404;
    }

    &:hover {
      background: #e0a800;
      color: #533f03;
      transform: scale(1.02);

      i {
        color: #533f03;
      }
    }
  }

  .modal-overlay {
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
  }

  .modal-container {
    background: #fff;
    border-radius: 8px;
    width: 900px;
    max-width: 95%;
    max-height: 80vh;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  }

  .modal-header {
    padding: 15px 20px;
    background: #6c757d;
    color: #fff;
    display: flex;
    justify-content: space-between;
    align-items: center;

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
        color: #533f03;
      }
    }
  }

  .modal-body {
    padding: 20px;
    overflow-y: auto;
    max-height: calc(80vh - 120px);

    .modal-subtitle {
      color: #666;
      font-size: 14px;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 1px solid #dee2e6;
    }
  }

  .modal-footer {
    padding: 15px 20px;

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
  }

  .unregistered-table {
    width: 100%;
    border-collapse: collapse;

    th {
      color: #666;
      padding: 12px;
      text-align: left;
      font-weight: 600;
      border-bottom: 2px solid #dee2e6;
    }

    td {
      color: #666;
      padding: 10px 12px;
      border-bottom: 1px solid #dee2e6;
    }

    tr:hover {
      background-color: #fff9e6;
    }
  }

  .count-badge {
    background-color: #ffc107;
    color: #000;
    padding: 4px 8px;
    border-radius: 4px;
    font-weight: bold;
    display: inline-block;
    min-width: 30px;
    text-align: center;
  }

  .register-btn {
    background: #28a745;
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 13px;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    transition: all 0.3s ease;

    i {
      font-size: 12px;
    }

    &:hover {
      background: #218838;
      transform: scale(0.98);
    }
  }

  .d-flex {
    display: flex;
  }

  .gap-2 {
    gap: 0.5rem;
  }

  .gap-3 {
    gap: 1rem;
  }

  .text-center {
    text-align: center;
    padding: 30px !important;
  }
`;

export default NewChargerController;