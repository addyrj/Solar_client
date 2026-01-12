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
  disableSortCondition,
} from "../../Database/Action/ConstantAction";
import { getInternationalDonor } from "../../Database/Action/DashboardAction";
import NoData from "../Components/NoData";
import "datatables.net-responsive";
import { filterCondition, sortinCondition } from "../Constant/FilterConditionList";
import { useNavigate } from "react-router-dom";

const InternationalDonor = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const internationalDonorData = useSelector(
    (state) => state.DashboardReducer.internationalDonor
  );
  const mainInternationalDonor = useSelector(
    (state) => state.DashboardReducer.mainInternationalDonor
  );
  const columnId = useSelector((state) => state.DashboardReducer.columnId);
  const conditionId = useSelector((state) => state.DashboardReducer.conditionId);
  const sortColumnId = useSelector((state) => state.DashboardReducer.sortColumnId);
  const sortConditionId = useSelector((state) => state.DashboardReducer.sortConditionId);

  const [internationalDonor, setInternationalDonor] = useState([]);

  // ✅ Modal opener
  const openModal = (title, column, data) => {
    dispatch(
      changeModalState({
        openState: true,
        content: title,
        dataColumn: column,
        data: data,
        screenName: "InternationalDonor",
      })
    );
  };

  // ✅ Filter & Sort condition display
  const getConditionName = filterCondition.filter((item) => item.id === conditionId);
  const getSortConditionName = sortinCondition.filter((item) => item.id === sortConditionId);

  // ✅ Fetch donors on load
  useEffect(() => {
    dispatch(getInternationalDonor({ navigate: navigate }));
  }, [dispatch]);

  // ✅ Initialize datatable
  useEffect(() => {
    if (internationalDonor.length !== 0) {
      window.JSZip = JSZip;
      initDatatable();
    }
  }, [internationalDonor]);

  // ✅ Sync Redux -> State
  useEffect(() => {
    setInternationalDonor(internationalDonorData);
  }, [internationalDonorData]);

  return (
    <Wrapper>
      <div className="content-wrapper">
        <div className="container-full">
          {/* Content Header */}
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
                      <li className="breadcrumb-item">Tables</li>
                      <li className="breadcrumb-item active">Data Tables</li>
                    </ol>
                  </nav>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <section className="content">
            <div className="row">
              <div className="col-12">
                <div className="box">
                  <div className="row">
                    <div className="box-header with-border">
                      <h4 className="box-title">International Donor</h4>
                      <div className="float-end">
                        {/* Create Button */}
                        <button
                          className="filterButton"
                          type="button"
                          data-bs-toggle="modal"
                          data-bs-target="#createModal"
                          onClick={() =>
                            dispatch(
                              changeCreateModalStata({
                                openState: "true",
                                screenName: "Donor",
                                actionState: "1",
                              })
                            )
                          }
                        >
                          <i className="fa-solid fa-add" style={{ marginRight: "10px" }} /> Create
                        </button>

                        {/* Filter Button */}
                        {/* <button
                          className="filterButton"
                          disabled={internationalDonor.length === 0}
                          onClick={() =>
                            openModal(
                              "filterModal",
                              Object.keys(internationalDonor[0]),
                              internationalDonor
                            )
                          }
                        >
                          <i className="fa-solid fa-filter" style={{ marginRight: "10px" }} /> Filter
                        </button> */}

                        {/* Sort Button */}
                        {/* <button
                          className="filterButton"
                          disabled={internationalDonor.length === 0}
                          onClick={() =>
                            openModal(
                              "sortModal",
                              Object.keys(internationalDonor[0]),
                              internationalDonor
                            )
                          }
                        >
                          <i className="fa-solid fa-sort" style={{ marginRight: "10px" }} /> Sort
                        </button> */}
                      </div>
                    </div>
                  </div>

                  {/* Filter Applied */}
                  <div className={columnId === "" ? "d-none" : "filterApplyCondition"}>
                    <i className="fa-solid fa-filter" />
                    <p style={{ fontSize: "14px", fontWeight: "medium", marginTop: "14px", marginLeft: "15px" }}>
                      {columnId + " " + getConditionName[0]?.title}
                    </p>
                    <div style={{ marginLeft: "auto" }}>
                      <i
                        className="fa-solid fa-ban"
                        style={{ cursor: "pointer" }}
                        onClick={() =>
                          dispatch(
                            disableFilterCondition({
                              mainData: mainInternationalDonor,
                              activity: "InternationalDonor",
                            })
                          )
                        }
                      />
                    </div>
                  </div>

                  {/* Sort Applied */}
                  <div className={sortColumnId === "" ? "d-none" : "filterApplyCondition"}>
                    <i className="fa-solid fa-filter" />
                    <p style={{ fontSize: "14px", fontWeight: "medium", marginTop: "14px", marginLeft: "15px" }}>
                      {sortColumnId + " " + getSortConditionName[0]?.title}
                    </p>
                    <div style={{ marginLeft: "auto" }}>
                      <i
                        className="fa-solid fa-ban"
                        style={{ cursor: "pointer" }}
                        onClick={() =>
                          dispatch(
                            disableSortCondition({
                              mainSortData: mainInternationalDonor,
                              sortActivity: "InternationalDonor",
                            })
                          )
                        }
                      />
                    </div>
                  </div>

                  {/* Table */}
                  <div className="box-body">
                    <div>
                      <div id="toolbar"></div>
                      <table
                        id="example-datatables"
                        className="table text-fade table-bordered table-hover margin-top-10 w-p100"
                        style={{ width: "100%" }}
                      >
                        <thead>
                          <tr className="text-dark">
                            <th>ID</th>
                            <th>Country</th>
                            <th>Donor Organisation</th>
                            <th>Logo & Websites</th>
                            <th>Iot Device Count</th>
                            <th>Mobile</th>
                            <th>Email</th>
                            <th>Action</th>
                          </tr>
                        </thead>

                        {internationalDonor.length === 0 ? (
                          <tbody>
                            <td colSpan={7}>
                              <NoData />
                            </td>
                          </tbody>
                        ) : (
                          <tbody>
                            {internationalDonor.map((item) => {
                              const logo =
                                item.DonarOrganisation === "Luminous" ? (
                                  <img
                                    src="/luminous.jpg"
                                    alt="Luminous"
                                    style={{
                                      width: "100%",
                                      height: "auto",
                                      objectFit: "contain",
                                    }}
                                  />
                                ) : item.DonarOrganisation === "Royal Rajasthan Foundation" ? (
                                  <img
                                    src="/foundation.jpg"
                                    alt="Rajasthan"
                                    style={{
                                      width: "100%",
                                      height: "auto",
                                      objectFit: "contain",
                                    }}
                                  />
                                ) : (
                                  "N/A"
                                );

                              return (
                                <tr key={item.ID}>
                                  <td className="text-dark" style={{ fontSize: "16px" }}>
                                    <input
                                      className="form-check-input"
                                      type="checkbox"
                                      value={item.ID}
                                      id={item.ID}
                                    />{" "}
                                    {item.ID}
                                  </td>
                                  <td>{item.Country}</td>
                                  <td>{item.DonarOrganisation}</td>
                                  <td>
                                    {item.Website ? (
                                      <a
                                        href={item.Website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        title={item.Website}
                                      >
                                        {logo}
                                      </a>
                                    ) : (
                                      logo
                                    )}
                                  </td>
                                  <td
                                    style={{
                                      cursor: "pointer",
                                      textDecoration: "underline",
                                      textAlign: "center",
                                    }}
                                    onClick={() => navigate("/international_partner")}
                                  >
                                    {item.deviceCount ?? 0}
                                  </td>
                                  <td>{item.Mobile || "N/A"}</td>
                                  <td>{item.Email || "N/A"}</td>
                                  <td>
                                    <i className="fa-solid fa-eye iconStyle" />
                                    <i className="fa-solid fa-trash iconStyle" />
                                    <i className="fa-solid fa-pen-to-square iconStyle" />
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        )}
                      </table>
                    </div>
                  </div>
                  {/* /.box-body */}
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
    padding: 10px 20px;
    color: white;
    margin: 5px;

    &:hover,
    &:active {
      background-color: transparent;
      border: 1px solid ${({ theme }) => theme.colors.themeColor};
      color: white;
      cursor: pointer;
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
`;

export default InternationalDonor;
