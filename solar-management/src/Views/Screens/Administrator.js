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
import {
  changeCreateModalStata,
  changeModalState,
  disableFilterCondition,
  disableSortCondition
} from "../../Database/Action/ConstantAction";
import "datatables.net-responsive";
import { getAdmins, createAdmin, updateAdmin, deleteAdmin } from "../../Database/Action/DashboardAction";
import NoData from "../Components/NoData";
import { useNavigate } from "react-router-dom"
import { filterCondition, sortinCondition } from "../Constant/FilterConditionList";
import moment from "moment";

const Administrator = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Updated selectors for admin data
  const adminData = useSelector((state) => state.DashboardReducer.admins);
  const mainAdminData = useSelector((state) => state.DashboardReducer.mainAdmins);

  const columnId = useSelector((state) => state.DashboardReducer.columnId);
  const conditionId = useSelector((state) => state.DashboardReducer.conditionId);
  const sortColumnId = useSelector((state) => state.DashboardReducer.sortColumnId);
  const sortConditionId = useSelector((state) => state.DashboardReducer.sortConditionId);

  const [admins, setAdmins] = useState([]);

  const openModal = (title, column, data) => {
    dispatch(
      changeModalState({
        openState: true,
        content: title,
        dataColumn: column,
        data: data,
        screenName: "Administrator"
      })
    );
  };

  const getConditionName = filterCondition.filter((item) => { return item.id === conditionId });
  const getSortConditionName = sortinCondition.filter((item) => { return item.id === sortConditionId });

  useEffect(() => {
    dispatch(getAdmins({ navigate: navigate }));
  }, [dispatch]);

useEffect(() => {
  if (Array.isArray(admins) && admins.length > 0) {
    window.JSZip = JSZip;
    initDatatable();
  }
}, [admins]);


useEffect(() => {
  setAdmins(adminData || []); // fallback to [] if undefined/null
}, [adminData]);

  // Handler functions for CRUD operations
  const handleCreateAdmin = (adminData) => {
    dispatch(createAdmin(adminData, navigate));
  };

  const handleUpdateAdmin = (id, adminData) => {
    dispatch(updateAdmin(id, adminData, navigate));
  };

  const handleDeleteAdmin = (id) => {
    if (window.confirm("Are you sure you want to delete this admin?")) {
      dispatch(deleteAdmin(id, navigate));
    }
  };

  return (
    <Wrapper>
      <div className="content-wrapper">
        <div className="container-full">
          {/* Content Header (Page header) */}
          {/* Main content */}
          <div className="content-header">
            <div className="d-flex align-items-center">
              <div className="me-auto">
                <h3 className="page-title">Administrators</h3>
                <div className="d-inline-block align-items-center">
                  <nav>
                    <ol className="breadcrumb">
                      <li className="breadcrumb-item">
                        <a href="#">
                          <i className="mdi mdi-home-outline" />
                        </a>
                      </li>
                      <li className="breadcrumb-item" aria-current="page">
                        Users
                      </li>
                      <li
                        className="breadcrumb-item active"
                        aria-current="page"
                      >
                        Administrators
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
                      <h4 className="box-title">Administrator Users</h4>
                      <div className="float-end">
                        <button
                          className="filterButton"
                          type="button"
                          data-bs-toggle="modal"
                          data-bs-target="#createModal"
                          onClick={() => dispatch(changeCreateModalStata({
                            openState: "true",
                            screenName: "Administrator",
                            actionState: "1"
                          }))}
                        >
                          <i
                            className="fa-solid fa-add"
                            style={{ marginRight: "10px" }}
                          />
                          Create
                        </button>
                        {/* <button
                          className="filterButton"
                          disabled={!admins || admins.length === 0}
                          onClick={() =>
                            openModal(
                              "filterModal",
                              admins && admins.length > 0 ? Object.keys(admins[0]) : [],
                              admins
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
                          disabled={admins.length === 0}
                          onClick={() =>
                            openModal(
                              "sortModal",
                              admins.length > 0 ? Object.keys(admins[0]) : [],
                              admins
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
                  <div className={columnId === "" ? "d-none" : "filterApplyCondition"}>
                    <i className="fa-solid fa-filter" />
                    <p style={{ fontSize: "14px", fontWeight: "medium", marginTop: "14px", marginLeft: "15px" }}>
                      {columnId + "    " + (getConditionName[0]?.title || "")}
                    </p>
                    <div style={{ marginLeft: "auto" }}>
                      <i
                        className="fa-solid fa-ban"
                        style={{ cursor: "pointer" }}
                        onClick={() => dispatch(disableFilterCondition({
                          mainData: mainAdminData,
                          activity: "Administrator"
                        }))}
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
                        onClick={() => dispatch(disableSortCondition({
                          mainSortData: mainAdminData,
                          sortActivity: "Administrator"
                        }))}
                      />
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
                            <th>ID</th>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Last Updated</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        {admins && admins.length === 0 ?
                          <tbody>
                            <tr>
                              <td colSpan={7}>
                                <NoData />
                              </td>
                            </tr>
                          </tbody> :

                          <tbody>
                            {admins.map((admin) => {
                              return (
                                <tr key={admin.ID}>
                                  <td className="text-dark" style={{ fontSize: '16px' }}>
                                    <input
                                      className="form-check-input"
                                      type="checkbox"
                                      value={admin.ID}
                                      id={admin.ID}
                                    />
                                    {admin.ID}
                                  </td>
                                  <td>{admin.username}</td>
                                  <td>{admin.email}</td>
                                  <td>{admin.role}</td>
                                  <td>
                                    <span className={`badge ${admin.active === "Yes" ? "bg-success" : "bg-danger"}`}>
                                      {admin.active}
                                    </span>
                                  </td>
                                  <td>{moment(admin.Time).format("YYYY-MM-DD HH:mm")}</td>
                                  <td>
                                    <i
                                      className="fa-solid fa-eye iconStyle"
                                      onClick={() => {/* View functionality */ }}
                                    />
                                    <i
                                      className="fa-solid fa-trash iconStyle"
                                      onClick={() => handleDeleteAdmin(admin.ID)}
                                    />
                                    <i
                                      className="fa-solid fa-pen-to-square iconStyle"
                                      onClick={() => {
                                        dispatch(changeCreateModalStata({
                                          openState: "true",
                                          screenName: "Administrator",
                                          actionState: "2",
                                          editData: admin
                                        }));
                                      }}
                                    />
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        }
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
    left: 0px;
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

export default Administrator;