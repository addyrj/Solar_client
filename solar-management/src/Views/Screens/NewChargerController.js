import React, { useEffect, useRef, useState, useCallback } from "react";
import $ from "jquery";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

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
} from "../../Database/Action/DashboardAction";
import NoData from "../Components/NoData";
import {
  filterCondition,
  sortinCondition,
} from "../Constant/FilterConditionList";

// Import the separate components
import CreateNewCharger from "../../Views/Components/Modal/NewCreateCharger";
import EditNewCharger from "../../Views/Components/Modal/EditNewCharger";

const NewChargerController = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const createRef = useRef(null);

  // Redux state
  const newDeviceList = useSelector(
    (state) => state.DashboardReducer.newDeviceList
  );
  const mainNewDeviceList = useSelector(
    (state) => state.DashboardReducer.mainNewDeviceList
  );
  const apistate = useSelector((state) => state.ConstantReducer.apistate);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);

  // Filter and sort states
  const columnId = useSelector((state) => state.DashboardReducer.columnId);
  const conditionId = useSelector(
    (state) => state.DashboardReducer.conditionId
  );
  const sortColumnId = useSelector(
    (state) => state.DashboardReducer.sortColumnId
  );
  const sortConditionId = useSelector(
    (state) => state.DashboardReducer.sortConditionId
  );

  // Component states
  const [devices, setDevices] = useState([]);
  const tableRef = useRef(null);
  const dataTableRef = useRef(null);
  const mountedRef = useRef(true);
  const tableContainerRef = useRef(null);

  // Function to check if device is inactive (based on appropriate timestamp > 60 days)
  const isDeviceInactive = useCallback((device) => {
    // Determine which timestamp to use
    let timestamp;

    // Priority 1: Use RecordTime if available (telemetry data)
    if (device.RecordTime) {
      timestamp = device.RecordTime;
    }
    // Priority 2: Use Time if available (telemetry data)
    else if (device.Time) {
      timestamp = device.Time;
    }
    // Priority 3: Use updatedAt if available (configuration data)
    else if (device.updatedAt) {
      timestamp = device.updatedAt;
    }
    // Priority 4: Use createdAt if available (configuration data)
    else if (device.createdAt) {
      timestamp = device.createdAt;
    }
    // If no timestamp is available, consider it inactive
    else {
      return true;
    }

    // Parse the timestamp
    const recordDate = new Date(timestamp);

    // Check if the date is valid
    if (isNaN(recordDate.getTime())) {
      return true; // Invalid date, consider inactive
    }

    const currentDate = new Date();
    const diffTime = currentDate - recordDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    return diffDays > 60;
  }, []);

  // Handle Edit - opens EditNewCharger component
  const handleEdit = useCallback((device) => {
    console.log("Edit device data received:", device);
    setSelectedDevice(device);
    setIsEditModalOpen(true);
  }, []);

  // Handle Create - opens CreateNewCharger component
  const handleCreate = useCallback(() => {
    console.log("Create new device");
    setIsCreateModalOpen(true);
  }, []);

  // Handle Delete
  const handleDelete = useCallback(
    (deviceId) => {
      console.log("Delete device ID:", deviceId);
      if (window.confirm("Are you sure you want to delete this device?")) {
        dispatch(deleteNewDevice(deviceId, navigate));
      }
    },
    [dispatch, navigate]
  );

  // Handle modal success callbacks
  const handleOperationSuccess = useCallback(() => {
    // Refresh the device list
    dispatch(getNewDeviceList({ navigate: navigate }));
  }, [dispatch, navigate]);

  // Handle closing modals
  const handleCloseCreateModal = useCallback(() => {
    setIsCreateModalOpen(false);
  }, []);

  const handleCloseEditModal = useCallback(() => {
    setIsEditModalOpen(false);
    setSelectedDevice(null);
  }, []);

  const openModal = (title, column, data) => {
    dispatch(
      changeModalState({
        openState: true,
        content: title,
        dataColumn: column,
        data: data,
        screenName: "NewChargerController",
      })
    );
  };

  const getConditionName = Array.isArray(filterCondition)
    ? filterCondition.filter((item) => item.id === conditionId)
    : [];

  const getSortConditionName = Array.isArray(sortinCondition)
    ? sortinCondition.filter((item) => item.id === sortConditionId)
    : [];

  useEffect(() => {
    dispatch(changeApistate());
  }, []);

  useEffect(() => {
    dispatch(getNewDeviceList({ navigate: navigate }));
  }, [dispatch, apistate]);

  useEffect(() => {
    setDevices(newDeviceList);
  }, [newDeviceList, apistate, newDeviceList?.length]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    let timeoutId = null;

    const initializeDataTable = () => {
      if (!mountedRef.current || devices.length === 0) return;

      try {
        // Clean up existing DataTable
        if (dataTableRef.current) {
          try {
            const tableElement = $("#example-datatables");
            tableElement.off("click.newcharger");

            if ($.fn.DataTable.isDataTable("#example-datatables")) {
              dataTableRef.current.destroy(true);
            }
          } catch (error) {
            console.warn("DataTable cleanup warning:", error);
          }
          dataTableRef.current = null;
        }

        // Wait for cleanup to complete
        setTimeout(() => {
          if (!mountedRef.current) return;

          try {
            window.JSZip = JSZip;

            const dataTable = initDatatable();
            dataTableRef.current = dataTable;

            // Set up event handlers with namespace
            $("#example-datatables").on(
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
              }
            );

            $("#example-datatables").on(
              "click.newcharger",
              ".delete-btn",
              function (e) {
                e.stopPropagation();
                e.preventDefault();

                const id = $(this).data("id");
                if (id) {
                  handleDelete(id);
                }
              }
            );
          } catch (error) {
            console.error("DataTable initialization error:", error);
          }
        }, 100);
      } catch (error) {
        console.error("Error in DataTable setup:", error);
      }
    };

    timeoutId = setTimeout(initializeDataTable, 200);

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      if (dataTableRef.current && mountedRef.current) {
        try {
          const tableElement = $("#example-datatables");
          tableElement.off("click.newcharger");

          if ($.fn.DataTable.isDataTable("#example-datatables")) {
            dataTableRef.current.destroy(true);
          }
        } catch (error) {
          console.warn("Final cleanup warning:", error);
        }
        dataTableRef.current = null;
      }
    };
  }, [devices, handleEdit, handleDelete]);

  return (
    <Wrapper>
      <div className="content-wrapper">
        <div className="container-full">
          <div className="content-header">
            <div className="d-flex align-items-center">
              <div className="me-auto">
                <h3 className="page-title">Charge Controller Data</h3>
                <div className="d-inline-block align-items-center">
                  <nav>
                    <ol className="breadcrumb">
                      <li className="breadcrumb-item">
                        <a href="#">
                          <i className="mdi mdi-home-outline" />
                        </a>
                      </li>
                      <li className="breadcrumb-item" aria-current="page">
                        Devices
                      </li>
                      <li
                        className="breadcrumb-item active"
                        aria-current="page"
                      >
                        Charge Controller
                      </li>
                    </ol>
                  </nav>
                </div>
              </div>
            </div>
          </div>

          <section className="content">
            <div className="row">
              <div className="col-12">
                <div className="box">
                  <div className="row">
                    <div className="box-header with-border">
                      <h4 className="box-title">Charge Controller Devices</h4>
                      <div className="float-end">
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
                        {/* <button
                          className="filterButton"
                          onClick={() =>
                            devices.length !== 0 &&
                            openModal(
                              "filterModal",
                              Object.keys(devices[0]),
                              devices
                            )
                          }
                        >
                          <i
                            className="fa-solid fa-filter"
                            style={{ marginRight: "10px" }}
                          />
                          Filter
                        </button> */}
                        {/* <button
                          className="filterButton"
                          disabled={devices.length === 0 ? true : false}
                          onClick={() =>
                            devices.length !== 0 &&
                            openModal(
                              "sortModal",
                              Object.keys(devices[0]),
                              devices
                            )
                          }
                        >
                          <i
                            className="fa-solid fa-sort"
                            style={{ marginRight: "10px" }}
                          />
                          Sort
                        </button> */}
                      </div>
                    </div>
                  </div>

                  {/* filter condition layout */}
                  <div
                    className={
                      columnId === "" ? "d-none" : "filterApplyCondition"
                    }
                  >
                    <i className="fa-solid fa-filter" />
                    <p
                      style={{
                        fontSize: "14px",
                        fontWeight: "medium",
                        marginTop: "14px",
                        marginLeft: "15px",
                      }}
                    >
                      {columnId + "    " + (getConditionName[0]?.title || "")}
                    </p>
                    <div style={{ marginLeft: "auto" }}>
                      <i
                        className="fa-solid fa-ban"
                        style={{ cursor: "pointer" }}
                        onClick={() =>
                          dispatch(
                            disableFilterCondition({
                              mainData: mainNewDeviceList,
                              activity: "NewChargerController",
                            })
                          )
                        }
                      />
                    </div>
                  </div>

                  {/* filter sort layout */}
                  <div
                    className={
                      sortColumnId === "" ? "d-none" : "filterApplyCondition"
                    }
                  >
                    <i className="fa-solid fa-filter" />
                    <p
                      style={{
                        fontSize: "14px",
                        fontWeight: "medium",
                        marginTop: "14px",
                        marginLeft: "15px",
                      }}
                    >
                      {sortColumnId +
                        "    " +
                        (getSortConditionName[0]?.title || "")}
                    </p>
                    <div style={{ marginLeft: "auto" }}>
                      <i
                        className="fa-solid fa-ban"
                        style={{ cursor: "pointer" }}
                        onClick={() =>
                          dispatch(
                            disableSortCondition({
                              mainSortData: mainNewDeviceList,
                              sortActivity: "NewChargerController",
                            })
                          )
                        }
                      />
                    </div>
                  </div>

                  <div className="box-body">
                    <div className="">
                      <div ref={tableContainerRef}></div>
                      <table
                        ref={tableRef}
                        id="example-datatables"
                        className="table text-fade table-bordered table-hover margin-top-10 w-p100"
                        style={{ width: "100%" }}
                      >
                        <thead>
                          <tr className="text-dark">
                            <th>UID</th>
                            <th>Status</th>
                            <th>Action</th>
                            <th>State</th>
                            <th>District</th>
                            <th>Block</th>
                            <th>Village</th>
                            <th>Donar Name</th>
                            <th>Installation Date</th>
                            <th>Panchayat Samiti</th>
                            <th>Beneficiary Name</th>
                            <th>GC Name</th>
                            <th>Beneficiary Phone</th>
                            <th>Location</th>
                            <th>Country</th>
                            <th>Solar Engineer</th>
                            <th>Engineer Phone</th>
                            <th>GC Phone</th>
                          </tr>
                        </thead>

                        <tbody>
                          {devices.length === 0 ? (
                            <tr>
                              <td colSpan={18}>
                                <NoData />
                              </td>
                            </tr>
                          ) : (
                            devices?.map((item, index) => {
                              const inactive = isDeviceInactive(item);
                              return (
                                <tr key={`device-${item?.ID || index}`}>
                                  <td
                                    className={`text-dark ${
                                      inactive ? "inactive-device" : ""
                                    }`}
                                    style={{
                                      fontSize: "16px",
                                      cursor: "pointer",
                                      textDecoration: "underline",
                                    }}
                                    // In NewChargerController.js, modify the onClick handler:
                                    onClick={(e) => {
                                      e.stopPropagation();

                                      // Get the device data for this specific device
                                      const deviceDataForGraph = devices.find(
                                        (device) => device.UID === item?.UID
                                      );

                                      navigate("/show_graph", {
                                        state: {
                                          uid: item?.UID,
                                          deviceData: deviceDataForGraph, // Pass the specific device data
                                        },
                                      });
                                    }}
                                  >
                                    <input
                                      className="form-check-input"
                                      type="checkbox"
                                      value={item?.ID}
                                      id={`checkbox-${item?.ID}`}
                                      onClick={(e) => e.stopPropagation()} // ✅ important
                                    />
                                    {item?.UID}
                                  </td>

                                  <td>
                                    <span
                                      className={`status-badge ${
                                        inactive
                                          ? "status-inactive"
                                          : "status-active"
                                      }`}
                                    >
                                      {inactive ? "Inactive" : "Active"}
                                    </span>
                                  </td>
                                  <td style={{ position: "relative" }}>
                                    <div
                                      style={{ display: "flex", gap: "4px" }}
                                    >
                                      <button
                                        className="delete-btn"
                                        data-id={item?.ID}
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
                                          JSON.stringify(item)
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
                                  <td>{item?.State || "NULL"}</td>
                                  <td>{item?.District || "NULL"}</td>
                                  <td>{item?.Block || "NULL"}</td>
                                  <td>{item?.VillageName || "NULL"}</td>
                                  <td>{item?.DonarName || "NULL"}</td>
                                  <td>{item?.InstallationDate || "NULL"}</td>
                                  <td>{item?.PanchayatSamiti || "NULL"}</td>
                                  <td>{item?.NameOfBeneficiary || "NULL"}</td>
                                  <td>{item?.GCName || "NULL"}</td>
                                  <td>{item?.BeneficiaryPno || "NULL"}</td>
                                  <td>{item?.Location || "NULL"}</td>
                                  <td>{item?.Country || "NULL"}</td>
                                  <td>{item?.SolarEngineerName || "NULL"}</td>
                                  <td>{item?.SolarEngineerPno || "NULL"}</td>
                                  <td>{item?.GCPhoneNumber || "NULL"}</td>
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

      {/* Render CreateNewCharger Modal */}
      {isCreateModalOpen && (
        <CreateNewCharger
          isOpen={isCreateModalOpen}
          onClose={handleCloseCreateModal}
          onSuccess={handleOperationSuccess}
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
    </Wrapper>
  );
};

const Wrapper = styled.section`
  .tableCheckBox {
    border-color: 1px solid white;
  }
  .sorting_1 .dtr-control {
  }
  .filterButton {
    background: ${({ theme }) => theme.colors.themeColor};
    padding: 10px 20px 10px 20px;
    color: white;
    margin: 5px;
    &:hover,
    &:active {
      background-color: transparent;
      border: none;
      color: white;
      cursor: pointer;
      border: 1px solid;
      border-color: ${({ theme }) => theme.colors.themeColor};
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
  .iconStyle {
    margin-left: 10px;
    cursor: pointer;
  }
  .filterApplyCondition {
    width: 95%;
    height: 40px;
    background: ${({ theme }) => theme.colors.themeColor};
    padding: 5px 20px 0 10px;
    margin: 10px;
    border-radius: 10px;
    align-self: center;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: row;
  }
  .iconButton {
    background: transparent;
    border: none;
    padding: 0;
    margin-left: 10px;
    cursor: pointer;

    &:focus {
      outline: none;
    }
  }

  /* Status badge styling */
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

  /* Inactive device styling */
  .inactive-device {
    background-color: #ffcccc !important;
    color: #cc0000 !important;
    font-weight: bold;
  }
`;

export default NewChargerController;
