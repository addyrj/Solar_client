import React, { useEffect, useState, useMemo, useCallback } from "react";
import "../../Style/datatables_custom.css";
import { initDatatable } from "../../JavaScript/Datatables";
import "datatables.net-buttons";
import JSZip from "jszip";
import "datatables.net-buttons/js/buttons.colVis";
import "datatables.net-buttons/js/buttons.html5";
import "datatables.net-buttons/js/buttons.print";
import styled from "styled-components";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import {
  changeCreateModalStata,
  changeModalState,
  disableFilterCondition,
  disableSortCondition,
} from "../../Database/Action/ConstantAction";
import {
  getInternationalDonor,
  deleteDonor,
} from "../../Database/Action/DashboardAction";
import NoData from "../Components/NoData";
import "datatables.net-responsive";
import {
  filterCondition,
  sortinCondition,
} from "../Constant/FilterConditionList";
import { useNavigate } from "react-router-dom";
import CreateDonor from "../Components/Modal/CreateDonor";
import EditDonor from "../Components/Modal/EditDonor";

const InternationalDonor = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Get data from Redux store with memoization
  const internationalDonorData = useSelector(
    (state) => state.DashboardReducer?.internationalDonor || [],
    shallowEqual,
  );
  const mainInternationalDonor = useSelector(
    (state) => state.DashboardReducer?.mainInternationalDonor || [],
    shallowEqual,
  );
  const columnId = useSelector((state) => state.DashboardReducer?.columnId);
  const conditionId = useSelector(
    (state) => state.DashboardReducer?.conditionId,
  );
  const sortColumnId = useSelector(
    (state) => state.DashboardReducer?.sortColumnId,
  );
  const sortConditionId = useSelector(
    (state) => state.DashboardReducer?.sortConditionId,
  );

  // State for modals
  const [selectedDonorForEdit, setSelectedDonorForEdit] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [internationalDonor, setInternationalDonor] = useState([]);

  // Memoize filter/sort condition lookups
  const conditionName = useMemo(
    () => filterCondition.find((item) => item.id === conditionId),
    [conditionId],
  );

  const sortConditionName = useMemo(
    () => sortinCondition.find((item) => item.id === sortConditionId),
    [sortConditionId],
  );

  // ✅ Fetch donors on load
  useEffect(() => {
    dispatch(getInternationalDonor({ navigate: navigate }));
  }, [dispatch, navigate]);

  // ✅ Initialize datatable
  useEffect(() => {
    if (internationalDonor.length !== 0) {
      window.JSZip = JSZip;
      const timer = setTimeout(() => {
        initDatatable();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [internationalDonor]);

  // ✅ Sync Redux -> State with comparison
  useEffect(() => {
    if (
      JSON.stringify(internationalDonor) !==
      JSON.stringify(internationalDonorData)
    ) {
      setInternationalDonor(internationalDonorData);
    }
  }, [internationalDonorData, internationalDonor]);

  // ✅ Delete handler
  const handleDelete = useCallback(
    (id, organisation) => {
      if (
        window.confirm(`Are you sure you want to delete "${organisation}"?`)
      ) {
        dispatch(deleteDonor(id, navigate));
      }
    },
    [dispatch, navigate],
  );

  // ✅ Edit handler
  const handleEdit = useCallback((donor) => {
    setSelectedDonorForEdit(donor);
    setShowEditModal(true);
  }, []);

  // ✅ Create handler
  const handleCreate = useCallback(() => {
    setShowCreateModal(true);
  }, []);

  // ✅ Close modal handlers
  const handleCloseCreateModal = useCallback(() => {
    setShowCreateModal(false);
  }, []);

  const handleCloseEditModal = useCallback(() => {
    setShowEditModal(false);
    setSelectedDonorForEdit(null);
  }, []);

  // ✅ Success handler
  const handleSuccess = useCallback(() => {
    dispatch(getInternationalDonor({ navigate: navigate }));
    handleCloseCreateModal();
    handleCloseEditModal();
  }, [dispatch, navigate, handleCloseCreateModal, handleCloseEditModal]);

  // ✅ Truncate URL function
  const truncateUrl = useCallback((url, maxLength = 30) => {
    if (!url) return "";

    // Remove http:// or https:// for display
    let displayUrl = url.replace(/^https?:\/\//, "");

    if (displayUrl.length > maxLength) {
      return displayUrl.substring(0, maxLength) + "...";
    }
    return displayUrl;
  }, []);

  return (
    <Wrapper>
      {/* Create Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>
                <i className="fa-solid fa-plus-circle"></i>
                Create International Donor
              </h3>
              <button
                className="close-btn"
                onClick={handleCloseCreateModal}
              >
                <i className="fa-solid fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <CreateDonor
                onSuccess={handleSuccess}
                onCancel={handleCloseCreateModal}
              />
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedDonorForEdit && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>
                <i className="fa-solid fa-pen-to-square"></i>
                Edit International Donor
              </h3>
              <button
                className="close-btn"
                onClick={handleCloseEditModal}
              >
                <i className="fa-solid fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <EditDonor
                donorData={selectedDonorForEdit}
                onSuccess={handleSuccess}
                onCancel={handleCloseEditModal}
              />
            </div>
          </div>
        </div>
      )}

      <div className="content-wrapper">
        <div className="container-full">
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
                          onClick={handleCreate}
                        >
                          <i
                            className="fa-solid fa-add"
                            style={{ marginRight: "10px" }}
                          />{" "}
                          Create
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Filter Applied */}
                  <div
                    className={!columnId ? "d-none" : "filterApplyCondition"}
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
                      {columnId} {conditionName?.title || ""}
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
                            }),
                          )
                        }
                      />
                    </div>
                  </div>

                  {/* Sort Applied */}
                  <div
                    className={
                      !sortColumnId ? "d-none" : "filterApplyCondition"
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
                      {sortColumnId} {sortConditionName?.title || ""}
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
                            }),
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
                            <th>Sno</th>
                            <th>DonorCountry</th>
                            <th>
                              Donor Organisation Name
                              <br />
                              <span
                                style={{
                                  fontSize: "12px",
                                  fontWeight: "normal",
                                }}
                              >
                                Websites
                              </span>
                            </th>
                            <th>Donor's Logo</th>
                            <th>Donor Device device</th>
                            <th>DonorMobile</th>
                            <th>DonorEmail</th>
                            <th>Action</th>
                          </tr>
                        </thead>

                        {internationalDonor.length === 0 ? (
                          <tbody>
                            <tr>
                              <td colSpan={8}>
                                <NoData />
                              </td>
                            </tr>
                          </tbody>
                        ) : (
                          <tbody>
                            {internationalDonor.map((item, index) => {
                              // Logo display from API
                              const logo = item.Logo ? (
                                <img
                                  src={item.Logo}
                                  alt={item.DonarOrganisation}
                                  style={{
                                    width: "150px",
                                    height: "75px",
                                    // objectFit: "contain",
                                  }}
                                />
                              ) : (
                                "N/A"
                              );

                              return (
                                <tr key={item.ID}>
                                  <td
                                    className="text-dark"
                                    style={{ fontSize: "16px" }}
                                  >
                                    {index + 1}
                                  </td>
                                  <td>{item.Country}</td>
                                  <td>
                                    <div>
                                      <div
                                        style={{
                                          fontWeight: "500",
                                          marginBottom: "4px",
                                        }}
                                      >
                                        {item.DonarOrganisation}
                                      </div>
                                      {item.Website && (
                                        <div style={{ fontSize: "12px" }}>
                                          <a
                                            href={item.Website.trim()}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            title={item.Website.trim()}
                                            style={{
                                              color: "#0066cc",
                                              textDecoration: "none",
                                              wordBreak: "break-all",
                                            }}
                                          >
                                            {truncateUrl(
                                              item.Website.trim(),
                                              25,
                                            )}
                                          </a>
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                  <td>
                                    {item.Website ? (
                                      <a
                                        href={item.Website.trim()}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        title={item.Website.trim()}
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
                                    onClick={() =>
                                      navigate("/iot_map")
                                    }
                                  >
                                    {item.DonorDevice ?? 0}
                                  </td>
                                  <td>{item.Mobile?.trim() || "N/A"}</td>
                                  <td>
                                    {item.Email?.trim() ? (
                                      <a
                                        href={`mailto:${item.Email.trim()}`}
                                        style={{
                                          color: "#0066cc",
                                          textDecoration: "none",
                                        }}
                                        title={item.Email.trim()} // full email on hover
                                      >
                                        {item.Email.trim().substring(0, 10)}...
                                      </a>
                                    ) : (
                                      "N/A"
                                    )}
                                  </td>
                                  <td>
                                    <i
                                      className="fa-solid fa-pen-to-square iconStyle"
                                      onClick={() => handleEdit(item)}
                                      title="Edit Donor"
                                    />
                                    <i
                                      className="fa-solid fa-trash iconStyle"
                                      onClick={() =>
                                        handleDelete(
                                          item.ID,
                                          item.DonarOrganisation,
                                        )
                                      }
                                      title="Delete Donor"
                                    />
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
    border: none;
    border-radius: 4px;

    &:hover,
    &:active {
      background-color: transparent;
      border: 1px solid ${({ theme }) => theme.colors.themeColor};
      color: ${({ theme }) => theme.colors.themeColor};
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
    font-size: 16px;

    &:hover {
      transform: scale(1.1);
      color: ${({ theme }) => theme.colors.themeColor};
    }
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
    color: white;
  }
  td {
    vertical-align: middle;
  }
  td a:hover {
    text-decoration: underline !important;
  }

  /* Modal Styles - Copied from NewChargerController */
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

  .modal-content {

    border-radius: 8px;
    width: 600px;
    max-width: 95%;
    max-height: 90vh;
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
        color: ${({ theme }) => theme.colors.themeColor || '#ffc107'};
      }
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 20px;
      cursor: pointer;
      color: #fff;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;

      &:hover {
        background-color: rgba(255, 255, 255, 0.1);
        color: #fff;
      }
    }
  }

  .modal-body {
    padding: 20px;
    overflow-y: auto;
    max-height: calc(90vh - 119px);
   
  }

  /* Form elements inside modal */
  .modal-body .form-group {
    margin-bottom: 1rem;
  }

  .modal-body .form-label {
    color: #333;
    font-weight: 500;
    margin-bottom: 0.5rem;
    display: block;
  }

  .modal-body .input-group-text {
   
  }


 
   



  .modal-body option {
    background: #fff;
    color: #333;
  }

  .modal-body .text-danger {
    color: #dc3545 !important;
  }

  .d-none {
    display: none !important;
  }
`;

export default InternationalDonor;