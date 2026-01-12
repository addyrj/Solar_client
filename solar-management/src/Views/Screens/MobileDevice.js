import React, { useEffect, useState } from "react";
import "../../Style/datatables_custom.css";
import { initDatatable } from "../../JavaScript/Datatables";
import "datatables.net-buttons";
import JSZip from "jszip";
import "datatables.net-buttons/js/buttons.colVis";
import "datatables.net-buttons/js/buttons.html5";
import "datatables.net-buttons/js/buttons.print";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import { changeCreateModalStata, changeModalState, disableFilterCondition, disableSortCondition } from "../../Database/Action/ConstantAction";
import { getMobileDevice } from "../../Database/Action/DashboardAction";
import NoData from "../Components/NoData";
import "datatables.net-responsive";
import { filterCondition, sortinCondition } from "../Constant/FilterConditionList";
import { useNavigate } from "react-router-dom";

const MobileDevice = () => {
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const mobileDeviceData = useSelector(
    (state) => state.DashboardReducer.mobileDevice
  );
  const mainMobileDevice = useSelector((state) => state.DashboardReducer.mainMobileDevice);

  const columnId = useSelector((state) => state.DashboardReducer.columnId);
  const conditionId = useSelector((state) => state.DashboardReducer.conditionId);
  const sortColumnId = useSelector((state) => state.DashboardReducer.sortColumnId);
  const sortConditionId = useSelector((state) => state.DashboardReducer.sortConditionId);

  const [mobileDevice, setMobileDevice] = useState([]);

  const openModal = (title, column, data) => {
    dispatch(
      changeModalState({
        openState: true,
        content: title,
        dataColumn: column,
        data: data,
        screenName: "MobileDevice"
      })
    );
  };

  const getConditionName = filterCondition.filter((item) => { return item.id === conditionId });
  const getSortConditionName = sortinCondition.filter((item) => { return item.id === sortConditionId });



  useEffect(() => {
    dispatch(getMobileDevice({ navigate: navigate }));
  }, [dispatch]);

  useEffect(() => {
    if (mobileDevice.length !== 0) {
      window.JSZip = JSZip;
      initDatatable();
    }
  }, [mobileDevice]);

  useEffect(() => {
    setMobileDevice(mobileDeviceData);
  }, [mobileDeviceData]);


  return (
    <Wrapper>
      <div className="content-wrapper">
        <div className="container-full">
          {/* Content Header (Page header) */}
          {/* Main content */}
          <div className="content-header">
            <div className="d-flex align-items-center">
              <div className="me-auto">
                <h3 className="page-title">Data Tables</h3>
                <div className="d-inline-block align-items-center">
                  <nav>
                    <ol className="breadcrumb">
                      <li className="breadcrumb-item">
                        <a href="#">
                          <i className="mdi mdi-home-outline" />
                        </a>
                      </li>
                      <li className="breadcrumb-item" aria-current="page">
                        Tables
                      </li>
                      <li
                        className="breadcrumb-item active"
                        aria-current="page"
                      >
                        Data Tables
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
                      <h4 className="box-title">Mobile Device</h4>
                      <div className="float-end">
                        <button
                          className="filterButton"
                          type="button"
                          data-bs-toggle="modal"
                          data-bs-target="#createModal"
                          onClick={() => dispatch(changeCreateModalStata({ openState: "true", screenName: "MobileDevice", actionState: "1" }))}>
                          <i
                            className="fa-solid fa-add"
                            style={{ marginRight: "10px" }}
                          />
                          Create
                        </button>
                        {/* <button
                          className="filterButton"
                          disabled={mobileDevice.length === 0 ? true : false}
                          onClick={() =>
                            openModal(
                              "filterModal",
                              Object.keys(mobileDevice[0]),
                              mobileDevice
                            )
                          }
                        >
                          <i
                            className="fa-solid fa-filter"
                            style={{ marginRight: "10px" }}
                          />
                          Filter
                        </button>
                        <button
                          className="filterButton"
                          disabled={mobileDevice.length === 0 ? true : false}
                          onClick={() =>
                            openModal(
                              "sortModal",
                              Object.keys(mobileDevice[0]),
                              mobileDevice
                            )
                          }
                        >
                          <i
                            className="fa-solid fa-sort"
                            style={{ marginRight: "10px" }}
                          />
                          Sort
                        </button> */}
                        {/* <button
                          className="filterButton"
                          disabled={mobileDevice.length === 0 ? true : false}
                          onClick={() =>
                            openModal(
                              "settingModal",
                              Object.keys(mobileDevice[0]),
                              mobileDevice
                            )
                          }
                        >
                          <i
                            className="fa-solid fa-spin fa-gear"
                            style={{ marginRight: "10px" }}
                          />
                          Setting
                        </button> */}
                      </div>
                    </div>
                  </div>
                  {/* filter condition layout */}

                  <div className={columnId == "" ? "d-none" : "filterApplyCondition"}>
                    <i className="fa-solid fa-filter" />
                    <p style={{ fontSize: "14px", fontWeight: "medium", marginTop: "14px", marginLeft: "15px" }}>{columnId + "    " + getConditionName[0]?.title}</p>

                    <div style={{ marginLeft: "auto" }}>
                      <i className="fa-solid fa-ban" style={{ cursor: "pointer" }} onClick={() => dispatch(disableFilterCondition({ mainData: mainMobileDevice, activity: "MobileDevice" }))} />
                    </div>
                  </div>

                  {/* filter sort layout */}

                  <div className={sortColumnId == "" ? "d-none" : "filterApplyCondition"}>
                    <i className="fa-solid fa-filter" />
                    <p style={{ fontSize: "14px", fontWeight: "medium", marginTop: "14px", marginLeft: "15px" }}>{sortColumnId + "    " + getSortConditionName[0]?.title}</p>

                    <div style={{ marginLeft: "auto" }}>
                      <i className="fa-solid fa-ban" style={{ cursor: "pointer" }} onClick={() => dispatch(disableSortCondition({ mainSortData: mainMobileDevice, sortActivity: "MobileDevice" }))} />
                    </div>
                  </div>


                  {/* /.box-header */}
                  <div className="box-body">
                    <div className="">
                      <div id="toolbar"></div>
                      <table
                        id="example-datatables"
                        className="table text-fade table-bordered table-hover margin-top-10 w-p100"
                        style={{ width: "100%" }}
                      >
                        <thead>
                          <tr className="text-dark">
                            <th></th>
                            <th className="text-center">Id</th>
                            <th className="text-center">Device Details</th>
                            <th className="text-center">Action</th>
                          </tr>
                        </thead>
                        {mobileDevice.length === 0 ? <tbody>
                          <td colSpan={3}>
                            <NoData />
                          </td>
                        </tbody> :
                          <tbody>
                            {mobileDevice.map((item, index) => {
                              return (
                                <tr>
                                  <td className="text-dark text-center" style={{ fontSize: '16px' }}>
                                    <input
                                      className="form-check-input"
                                      type="checkbox"
                                      value={index}
                                      id={index}
                                    />
                                  </td>
                                  <td className="text-center">{item.ID}</td>
                                  <td className="text-center">{item.Device}</td>
                                  <td className="text-center">
                                    <i className="fa-solid fa-eye iconStyle" />
                                    <i className="fa-solid fa-trash iconStyle" />
                                    <i className="fa-solid fa-pen-to-square iconStyle" />
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>}
                      </table>
                    </div>
                  </div>
                  {/* /.box-body */}
                </div>
              </div>
            </div>
          </section>
          {/* /.content */}
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
    left : 0px;
  }
  .iconStyle{
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
`;

export default MobileDevice;
