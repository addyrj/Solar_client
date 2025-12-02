import React, { useEffect, useRef, useState, useCallback } from "react";
import $ from "jquery";

import "../../Style/datatables_custom.css";
import { initDatatable } from "../../JavaScript/Datatables";
import "datatables.net-buttons";
import JSZip from "jszip";
import "datatables.net-buttons/js/buttons.colVis";
import "datatables.net-buttons/js/buttons.html5";
import "datatables.net-buttons/js/buttons.print";
import "datatables.net-responsive";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import { changeApistate, changeCreateModalStata, changeModalState, disableFilterCondition, disableSortCondition } from "../../Database/Action/ConstantAction";
import { getNewDeviceList, deleteNewDevice, updateNewDevice } from "../../Database/Action/DashboardAction";
import NoData from "../Components/NoData";
import { filterCondition, sortinCondition } from "../Constant/FilterConditionList";
import { useNavigate } from "react-router-dom";


const NewChargerController = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const createRef = useRef(null);

  // Changed from localDeviceDetail to newDeviceList
  const newDeviceList = useSelector((state) => state.DashboardReducer.newDeviceList);
  const mainNewDeviceList = useSelector((state) => state.DashboardReducer.mainNewDeviceList);
  const apistate = useSelector((state) => state.ConstantReducer.apistate);

  const columnId = useSelector((state) => state.DashboardReducer.columnId);
  const conditionId = useSelector((state) => state.DashboardReducer.conditionId);
  const sortColumnId = useSelector((state) => state.DashboardReducer.sortColumnId);
  const sortConditionId = useSelector((state) => state.DashboardReducer.sortConditionId);

  const [devices, setDevices] = useState([]);
  const tableRef = useRef(null);
  const dataTableRef = useRef(null);
  const mountedRef = useRef(true);
  // Add the missing tableContainerRef
  const tableContainerRef = useRef(null);

const handleEdit = useCallback((device) => {
  console.log('Edit device:', device);
  
  // ✅ Ensure we have all necessary data including ID
  const editData = {
    ...device,
    ID: device.ID, // Make sure ID is included
    // Convert date format if needed
    InstallationDate: device.InstallationDate ? 
      new Date(device.InstallationDate).toISOString().split('T')[0] : ""
  };
  
  // ✅ Dispatch the correct modal state for editing
  dispatch(
    changeCreateModalStata({
      openState: "true",
      screenName: "NewChargerController",
      actionState: "2", // "2" = edit mode
      editData: editData
    })
  );
}, [dispatch]);

// ✅ Updated create button handler
const handleCreate = useCallback(() => {
  console.log('Create new device');
  
  // ✅ Reset modal state completely for create mode
  dispatch(
    changeCreateModalStata({
      openState: "true",
      screenName: "NewChargerController", 
      actionState: "1", // "1" = create mode
      editData: null // Clear any existing edit data
    })
  );
}, [dispatch]);

  // Add the missing handleDelete function
  const handleDelete = useCallback((deviceId) => {
    console.log('Delete device ID:', deviceId);
    if (window.confirm('Are you sure you want to delete this device?')) {
      dispatch(deleteNewDevice(deviceId, navigate));
    }
  }, [dispatch, navigate]);

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

  const getConditionName = filterCondition.filter((item) => { return item.id === conditionId });
  const getSortConditionName = sortinCondition.filter((item) => { return item.id === sortConditionId });

  useEffect(() => {
    dispatch(changeApistate())
  }, [])

  // Remove this useEffect as we only need DataTable event handlers

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
            const tableElement = $('#example-datatables');
            tableElement.off('click.newcharger');

            if ($.fn.DataTable.isDataTable('#example-datatables')) {
              dataTableRef.current.destroy(true);
            }
          } catch (error) {
            console.warn('DataTable cleanup warning:', error);
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
            $('#example-datatables').on('click.newcharger', '.edit-btn', function (e) {
              e.stopPropagation();
              e.preventDefault();

              try {
                const rawData = $(this).attr('data-device');
                if (rawData) {
                  const decodedData = decodeURIComponent(rawData);
                  const device = JSON.parse(decodedData);
                  handleEdit(device);
                }
              } catch (error) {
                console.error('Edit error:', error);
              }
            });

            $('#example-datatables').on('click.newcharger', '.delete-btn', function (e) {
              e.stopPropagation();
              e.preventDefault();

              const id = $(this).data('id');
              if (id) {
                handleDelete(id);
              }
            });

          } catch (error) {
            console.error('DataTable initialization error:', error);
          }
        }, 100);

      } catch (error) {
        console.error('Error in DataTable setup:', error);
      }
    };

    timeoutId = setTimeout(initializeDataTable, 200);

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      if (dataTableRef.current && mountedRef.current) {
        try {
          const tableElement = $('#example-datatables');
          tableElement.off('click.newcharger');

          if ($.fn.DataTable.isDataTable('#example-datatables')) {
            dataTableRef.current.destroy(true);
          }
        } catch (error) {
          console.warn('Final cleanup warning:', error);
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
                      <li className="breadcrumb-item active" aria-current="page">
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
  data-bs-toggle="modal"
  data-bs-target="#createModal"
  onClick={handleCreate} // Use the new handler
>
  <i className="fa-solid fa-add" style={{ marginRight: "10px" }} />
  Create
</button>
                        <button
                          className="filterButton"
                          onClick={() =>
                            devices.length !== 0 && openModal(
                              "filterModal",
                              Object.keys(devices[0]),
                              devices
                            )
                          }
                        >
                          <i className="fa-solid fa-filter" style={{ marginRight: "10px" }} />
                          Filter
                        </button>
                        <button
                          className="filterButton"
                          disabled={devices.length === 0 ? true : false}
                          onClick={() =>
                            devices.length !== 0 && openModal(
                              "sortModal",
                              Object.keys(devices[0]),
                              devices
                            )
                          }
                        >
                          <i className="fa-solid fa-sort" style={{ marginRight: "10px" }} />
                          Sort
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* filter condition layout */}
                  <div className={columnId === "" ? "d-none" : "filterApplyCondition"}>
                    <i className="fa-solid fa-filter" />
                    <p style={{ fontSize: "14px", fontWeight: "medium", marginTop: "14px", marginLeft: "15px" }}>
                      {columnId + "    " + (getConditionName[0]?.title || "")}
                    </p>
                    <div style={{ marginLeft: "auto" }}>
                      <i
                        className="fa-solid fa-ban"
                        style={{ cursor: "pointer" }}
                        onClick={() => dispatch(disableFilterCondition({ mainData: mainNewDeviceList, activity: "NewChargerController" }))}
                      />
                    </div>
                  </div>

                  {/* filter sort layout */}
                  <div className={sortColumnId === "" ? "d-none" : "filterApplyCondition"}>
                    <i className="fa-solid fa-filter" />
                    <p style={{ fontSize: "14px", fontWeight: "medium", marginTop: "14px", marginLeft: "15px" }}>
                      {sortColumnId + "    " + (getSortConditionName[0]?.title || "")}
                    </p>
                    <div style={{ marginLeft: "auto" }}>
                      <i
                        className="fa-solid fa-ban"
                        style={{ cursor: "pointer" }}
                        onClick={() => dispatch(disableSortCondition({ mainSortData: mainNewDeviceList, sortActivity: "NewChargerController" }))}
                      />
                    </div>
                  </div>

                  <div className="box-body">
                    <div className="">
                      {/* <div id="toolbar"></div> */}
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
                              <td colSpan={17}>
                                <NoData />
                              </td>
                            </tr>
                          ) : (
                            devices?.map((item, index) => (
                              <tr key={`device-${item?.ID || index}`}>
                                <td className="text-dark" style={{ fontSize: "16px" }}>
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    value={item?.ID}
                                    id={`checkbox-${item?.ID}`}
                                  />
                                  {item?.UID}
                                </td>
                                <td style={{ position: "relative" }}>
                                  <div style={{ display: "flex", gap: "4px" }}>
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
  data-device={encodeURIComponent(JSON.stringify(item))}
  data-bs-toggle="modal"
  data-bs-target="#createModal"
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
                            ))
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
`;

export default NewChargerController;import React, { useState, useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { changeApistate, setLoader } from "../../../Database/Action/ConstantAction";
import { postHeaderWithToken } from "../../../Database/Utils";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getNewDeviceList, deleteNewDevice, updateNewDevice } from "../../Database/Action/DashboardAction";

const CreateNewCharger = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // 🔑 Get modal state (create/edit)
// Get modal state safely
const createModalState = useSelector(
  (state) => state?.ConstantReducer?.createModalState
) || {};


  const [chargerInfo, setChargerInfo] = useState({
    UID: "",
    Country: "",
    State: "",
    District: "",
    Block: "",
    VillageName: "",
    NameOfBeneficiary: "",
    BeneficiaryPno: "",
    Location: "",
    SolarEngineerName: "",
    SolarEngineerPno: "",
    GCName: "",
    GCPhoneNumber: "",
    DonarName: "",
    InstallationDate: "",
    PanchayatSamiti: "",
  });

  // ✅ When modal opens in edit mode, prefill data
useEffect(() => {
  if (createModalState?.actionState === "2" && createModalState?.editData) {
    setChargerInfo(createModalState.editData);
  } else if (createModalState?.actionState === "1") {
    setChargerInfo({
      UID: "",
      Country: "",
      State: "",
      District: "",
      Block: "",
      VillageName: "",
      NameOfBeneficiary: "",
      BeneficiaryPno: "",
      Location: "",
      SolarEngineerName: "",
      SolarEngineerPno: "",
      GCName: "",
      GCPhoneNumber: "",
      DonarName: "",
      InstallationDate: "",
      PanchayatSamiti: "",
    });
  }
}, [createModalState?.actionState, createModalState?.editData]);


  const handleChange = (e) => {
    setChargerInfo({ ...chargerInfo, [e.target.name]: e.target.value });
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = `${position.coords.latitude},${position.coords.longitude}`;
        setChargerInfo((prev) => ({ ...prev, Location: coords }));
        toast.success("Location captured successfully");
      },
      (error) => {
        toast.error("Unable to retrieve location");
        console.error("Location error:", error);
      }
    );
  };

  const validateForm = () => {
    if (!chargerInfo.UID) {
      toast.error("UID is required");
      return false;
    }
    if (!chargerInfo.Country) {
      toast.error("Country is required");
      return false;
    }
    return true;
  };

  // 🔑 Unified Create/Update Handler
  const saveChargerController = async () => {
    if (!validateForm()) return;

    try {
      const token = await postHeaderWithToken();
      dispatch(setLoader(true));

      let response;
      if (createModalState.actionState === "1") {
        // 👉 Create API
        response = await axios.post(
          process.env.REACT_APP_BASE_URL + "createNewDevice",
          chargerInfo,
          token
        );
      } else {
        // 👉 Update API
        response = await axios.put(
          process.env.REACT_APP_BASE_URL + `updateNewDevice/${chargerInfo.ID}`,
          chargerInfo,
          token
        );
      }

      if (response.data.status === 200) {
        toast.success(response.data.message);
        dispatch(changeApistate());
      }
    } catch (error) {
      console.error("Error saving device:", error);
      if (error?.response?.data?.status === 302) {
        navigate("/");
        window.location.reload(false);
      }
      toast.error(error?.response?.data?.message || "Failed to save device");
    } finally {
      dispatch(setLoader(false));
    }
  };

    return (
        <div className="box">
            <div className="box-header with-border">
    <h4 className="box-title">
  {createModalState?.actionState === "1"
    ? "Create New Charger Controller"
    : "Edit Charger Controller"}
</h4>
            </div>
            <div className="box-body">

         <div className="form-group">
                    <label className="form-label">UID *</label>
                    <div className="input-group mb-3">
                        <span className="input-group-text">
                            <i className="fa-solid fa-id-card"></i>
                        </span>
                        <input 
                            type="text" 
                            className="form-control" 
                            name="UID" 
                            value={chargerInfo.UID} 
                            onChange={handleChange} 
                            required
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Country *</label>
                    <div className="input-group mb-3">
                        <span className="input-group-text">
                            <i className="fa-solid fa-flag"></i>
                        </span>
                        <input 
                            type="text" 
                            className="form-control" 
                            name="Country" 
                            value={chargerInfo.Country} 
                            onChange={handleChange} 
                            required
                        />
                    </div>
                </div>

                {/* Other fields - similar pattern */}
                <div className="form-group">
                    <label className="form-label">State</label>
                    <div className="input-group mb-3">
                        <span className="input-group-text">
                            <i className="fa-solid fa-globe"></i>
                        </span>
                        <input 
                            type="text" 
                            className="form-control" 
                            name="State" 
                            value={chargerInfo.State} 
                            onChange={handleChange} 
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">District</label>
                    <div className="input-group mb-3">
                        <span className="input-group-text">
                            <i className="fa-solid fa-map-location-dot"></i>
                        </span>
                        <input type="text" className="form-control" name="District" value={chargerInfo.District} onChange={handleChange} />
                    </div>
                </div>
                <div className="form-group">
                    <label className="form-label">Block</label>
                    <div className="input-group mb-3">
                        <span className="input-group-text">
                            <i className="fa-solid fa-map"></i>
                        </span>
                        <input type="text" className="form-control" name="Block" value={chargerInfo.Block} onChange={handleChange} />
                    </div>
                </div>
                <div className="form-group">
                    <label className="form-label">Village Name</label>
                    <div className="input-group mb-3">
                        <span className="input-group-text">
                            <i className="fa-solid fa-location-dot"></i>
                        </span>
                        <input type="text" className="form-control" name="VillageName" value={chargerInfo.VillageName} onChange={handleChange} />
                    </div>
                </div>
                <div className="form-group">
                    <label className="form-label">Beneficiary Name</label>
                    <div className="input-group mb-3">
                        <span className="input-group-text">
                            <i className="fa-solid fa-user"></i>
                        </span>
                        <input type="text" className="form-control" name="NameOfBeneficiary" value={chargerInfo.NameOfBeneficiary} onChange={handleChange} />
                    </div>
                </div>
                <div className="form-group">
                    <label className="form-label">Beneficiary Phone</label>
                    <div className="input-group mb-3">
                        <span className="input-group-text">
                            <i className="fa-solid fa-phone"></i>
                        </span>
                        <input type="text" className="form-control" name="BeneficiaryPno" value={chargerInfo.BeneficiaryPno} onChange={handleChange} />
                    </div>
                </div>
            <div className="form-group">
                    <label className="form-label">Location Coordinates</label>
                    <div className="input-group mb-3">
                        <span className="input-group-text"><i className="fa-solid fa-location-crosshairs"></i></span>
                        <input type="text" className="form-control" name="Location" value={chargerInfo.Location} onChange={handleChange} placeholder="lat,long" />
 <button
  type="button"
  className="btn btn-outline-secondary"
  onClick={getLocation}
>
  <i className="fa-solid fa-location-crosshairs me-2"></i>
  Get Location
</button>


                    </div>
                </div>
                <div className="form-group">
                    <label className="form-label">Solar Engineer Name</label>
                    <div className="input-group mb-3">
                        <span className="input-group-text">
                            <i className="fa-solid fa-user-gear"></i>
                        </span>
                        <input type="text" className="form-control" name="SolarEngineerName" value={chargerInfo.SolarEngineerName} onChange={handleChange} />
                    </div>
                </div>
                <div className="form-group">
                    <label className="form-label">Solar Engineer Phone</label>
                    <div className="input-group mb-3">
                        <span className="input-group-text">
                            <i className="fa-solid fa-phone"></i>
                        </span>
                        <input type="text" className="form-control" name="SolarEngineerPno" value={chargerInfo.SolarEngineerPno} onChange={handleChange} />
                    </div>
                </div>
                <div className="form-group">
                    <label className="form-label">GC Name</label>
                    <div className="input-group mb-3">
                        <span className="input-group-text">
                            <i className="fa-solid fa-user-tie"></i>
                        </span>
                        <input type="text" className="form-control" name="GCName" value={chargerInfo.GCName} onChange={handleChange} />
                    </div>
                </div>
                <div className="form-group">
                    <label className="form-label">GC Phone Number</label>
                    <div className="input-group mb-3">
                        <span className="input-group-text">
                            <i className="fa-solid fa-phone"></i>
                        </span>
                        <input type="text" className="form-control" name="GCPhoneNumber" value={chargerInfo.GCPhoneNumber} onChange={handleChange} />
                    </div>
                </div>
        

                <div className="form-group">
                    <label className="form-label">Donar Name</label>
                    <div className="input-group mb-3">
                        <span className="input-group-text">
                            <i className="fa-solid fa-hand-holding-heart"></i>
                        </span>
                        <input 
                            type="text" 
                            className="form-control" 
                            name="DonarName" 
                            value={chargerInfo.DonarName} 
                            onChange={handleChange} 
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Installation Date</label>
                    <div className="input-group mb-3">
                        <span className="input-group-text">
                            <i className="fa-solid fa-calendar-days"></i>
                        </span>
                        <input 
                            type="date" 
                            className="form-control" 
                            name="InstallationDate" 
                            value={chargerInfo.InstallationDate} 
                            onChange={handleChange} 
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Panchayat Samiti</label>
                    <div className="input-group mb-3">
                        <span className="input-group-text">
                            <i className="fa-solid fa-users"></i>
                        </span>
                        <input 
                            type="text" 
                            className="form-control" 
                            name="PanchayatSamiti" 
                            value={chargerInfo.PanchayatSamiti} 
                            onChange={handleChange} 
                        />
                    </div>
                </div>
            </div>

            <div className="box-footer" style={{ float: "right", width: 'auto' }}>
                <button type="button" className="btn btn-primary-light me-1" data-bs-dismiss="modal">
                    <i className="ti-trash" /> Cancel
                </button>
         <button
  type="submit"
  className="btn btn-primary"
  data-bs-dismiss="modal"
  onClick={saveChargerController}
>
  <i className="ti-save-alt" />{" "}
  {createModalState?.actionState === "1" ? "Create" : "Update"}
</button>
            </div>
        </div>
    )
}

export default CreateNewCharger;



// ---------------------------------------for uplod in excle file bulk then 
// import React, { useState } from 'react';
// import axios from "axios";
// import { useDispatch } from 'react-redux';
// import { changeApistate, setLoader } from '../../../Database/Action/ConstantAction';
// import { postHeaderWithToken } from '../../../Database/Utils';
// import { useNavigate } from 'react-router-dom';
// import toast from 'react-hot-toast';

// const CreateNewCharger = () => {
//     const dispatch = useDispatch();
//     const navigate = useNavigate();
//     const [chargerInfo, setChargerInfo] = useState({
//         UID: "",
//         Country: "",
//         State: "",
//         District: "",
//         Block: "",
//         VillageName: "",
//         NameOfBeneficiary: "",
//         BeneficiaryPno: "",
//         Location: "",
//         SolarEngineerName: "",
//         SolarEngineerPno: "",
//         GCName: "",
//         GCPhoneNumber: ""
//     });
//     const [selectedFile, setSelectedFile] = useState(null);

//     const handleChange = (e) => {
//         setChargerInfo({ ...chargerInfo, [e.target.name]: e.target.value });
//     };

//     const handleFileChange = (e) => {
//         setSelectedFile(e.target.files[0]);
//     };

//     const validateForm = () => {
//         if (!chargerInfo.UID) {
//             toast.error("UID is required");
//             return false;
//         }
//         if (!chargerInfo.Country) {
//             toast.error("Country is required");
//             return false;
//         }
//         return true;
//     };

//     const createChargerController = async () => {
//         if (!validateForm()) return;

//         try {
//             const token = await postHeaderWithToken();
//             dispatch(setLoader(true));

//             const response = await axios.post(
//                 process.env.REACT_APP_BASE_URL + "createNewDevice",
//                 chargerInfo,
//                 token
//             );

//             if (response.data.status === 200) {
//                 toast.success(response.data.message);
//                 dispatch(changeApistate());
//                 setChargerInfo({
//                     UID: "",
//                     Country: "",
//                     State: "",
//                     District: "",
//                     Block: "",
//                     VillageName: "",
//                     NameOfBeneficiary: "",
//                     BeneficiaryPno: "",
//                     Location: "",
//                     SolarEngineerName: "",
//                     SolarEngineerPno: "",
//                     GCName: "",
//                     GCPhoneNumber: ""
//                 });
//             }
//         } catch (error) {
//             console.error("Error creating device:", error);
//             if (error?.response?.data?.status === 302) {
//                 navigate("/");
//                 window.location.reload(false);
//             }
//             toast.error(error?.response?.data?.message || "Failed to create device");
//         } finally {
//             dispatch(setLoader(false));
//         }
//     };

//     const uploadExcelFile = async () => {
//         if (!selectedFile) {
//             toast.error("Please select an Excel file first");
//             return;
//         }

//         try {
//             dispatch(setLoader(true));
//             const token = await postHeaderWithToken();
            
//             const formData = new FormData();
//             formData.append("excelFile", selectedFile);

//             const response = await axios.post(
//              process.env.REACT_APP_BASE_URL + "createNewDevice", // Changed endpoint
//                 formData,
//                 {
//                     headers: {
//                         ...token.headers,
//                         'Content-Type': 'multipart/form-data'
//                     }
//                 }
//             );

//             if (response.data.status === 200) {
//                 toast.success(response.data.message);
//                 dispatch(changeApistate());
//                 setSelectedFile(null);
//                 // Clear file input
//                 document.getElementById("excelUpload").value = "";
//             }
//         } catch (error) {
//             console.error("Error uploading Excel file:", error);
//             if (error?.response?.data?.status === 302) {
//                 navigate("/");
//                 window.location.reload(false);
//             }
//             toast.error(error?.response?.data?.message || "Failed to upload Excel file");
//         } finally {
//             dispatch(setLoader(false));
//         }
//     };

//     return (
//         <div className="box">
//             <div className="box-header with-border">
//                 <h4 className="box-title">Create New Charger Controller</h4>
//             </div>
//             <div className="box-body">
//                 {/* Excel Upload Section */}
//                 <div className="form-group mb-4">
//                     <label className="form-label">Bulk Upload via Excel</label>
//                     <div className="input-group">
//                         <input 
//                             id="excelUpload"
//                             type="file" 
//                             className="form-control" 
//                             accept=".xlsx, .xls" 
//                             onChange={handleFileChange}
//                         />
//                         <button 
//                             className="btn btn-primary" 
//                             onClick={uploadExcelFile}
//                             disabled={!selectedFile}
//                         >
//                             Upload Excel File
//                         </button>
//                     </div>
//                     <small className="text-muted">
//                         Excel format should include: UID, VillageName, Block, District, State, 
//                         NameOfBeneficiary, BeneficiaryPno, Location, SolarEngineerName, 
//                         SolarEngineerPno, GC Name, GCPhoneNumber, Country
//                     </small>
//                 </div>

//                 <div className="form-group">
//                     <label className="form-label">UID *</label>
//                     <div className="input-group mb-3">
//                         <span className="input-group-text">
//                             <i className="fa-solid fa-id-card"></i>
//                         </span>
//                         <input 
//                             type="text" 
//                             className="form-control" 
//                             name="UID" 
//                             value={chargerInfo.UID} 
//                             onChange={handleChange} 
//                             required
//                         />
//                     </div>
//                 </div>


//             </div>
//             <div className="box-footer" style={{ float: "right", width: 'auto' }}>
//                 <button type="button" className="btn btn-primary-light me-1" data-bs-dismiss="modal">
//                     <i className="ti-trash" /> Cancel
//                 </button>
//                 <button 
//                     type="submit" 
//                     className="btn btn-primary" 
//                     onClick={createChargerController}
//                     disabled={!chargerInfo.UID || !chargerInfo.Country}
//                 >
//                     <i className="ti-save-alt" /> Save
//                 </button>
//             </div>
//         </div>
//     );
// };

// export default CreateNewCharger;