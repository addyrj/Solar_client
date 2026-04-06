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
import { getRew, deleteRew } from "../../Database/Action/DashboardAction";
import NoData from "../Components/NoData";
import "datatables.net-responsive";
import {
  filterCondition,
  sortinCondition,
} from "../Constant/FilterConditionList";
import { useNavigate } from "react-router-dom";
import CreateRew from "../../Views/Components/Modal/CreateRew";
import EditRew from "../../Views/Components/Modal/EditRew";

const ViewRew = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Get data from Redux store with memoization
  const rewData = useSelector(
    (state) => state.DashboardReducer?.rew || [],
    shallowEqual,
  );
  const mainRewData = useSelector(
    (state) => state.DashboardReducer?.mainRew || [],
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

  // State for edit modal
  const [selectedRewForEdit, setSelectedRewForEdit] = useState(null);

  // Memoize filter/sort condition lookups
  const conditionName = useMemo(
    () => filterCondition.find((item) => item.id === conditionId),
    [conditionId],
  );

  const sortConditionName = useMemo(
    () => sortinCondition.find((item) => item.id === sortConditionId),
    [sortConditionId],
  );

  const [rew, setRew] = useState([]);
  const [selectedRew, setSelectedRew] = useState(null);
  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [selectedDevices, setSelectedDevices] = useState([]);
  const [selectedRewName, setSelectedRewName] = useState("");
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  // Parse photos helper function - memoized
  const parsePhotosData = useCallback((photos) => {
    if (!photos) return [];

    try {
      if (Array.isArray(photos)) {
        if (
          photos.length > 0 &&
          typeof photos[0] === "string" &&
          photos[0].startsWith("[")
        ) {
          try {
            return JSON.parse(photos[0]);
          } catch (e) {
            return photos;
          }
        }
        return photos;
      }

      if (typeof photos === "string") {
        try {
          const parsed = JSON.parse(photos);
          return Array.isArray(parsed) ? parsed : [parsed];
        } catch (e) {
          if (photos.includes(",")) {
            return photos.split(",").map((p) => p.trim());
          }
          return [photos];
        }
      }
    } catch (error) {
      console.error("Error parsing photos:", error);
    }

    return [];
  }, []);

  // Build image URL - memoized
  const buildImageUrl = useCallback((imagePath) => {
    if (!imagePath) return null;

    if (imagePath.startsWith("http")) {
      return imagePath;
    }

    const cleanPath = imagePath.replace(/^\/+/, "");

    // For rew-photos, ensure the path includes the folder
    if (!cleanPath.includes("rew-photos/") && cleanPath.includes("-")) {
      return `${process.env.REACT_APP_IMAGE_URL}rew-photos/${cleanPath}`;
    }

    return `${process.env.REACT_APP_IMAGE_URL}${cleanPath}`;
  }, []);

  // Fetch REW data on mount only
  useEffect(() => {
    dispatch(getRew({ navigate: navigate }));
  }, [dispatch, navigate]);

  // Initialize datatable when rew changes
  useEffect(() => {
    if (rew.length !== 0) {
      window.JSZip = JSZip;
      const timer = setTimeout(() => {
        initDatatable();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [rew]);

  // Sync Redux -> State with comparison to prevent infinite loop
  useEffect(() => {
    if (JSON.stringify(rew) !== JSON.stringify(rewData)) {
      setRew(rewData);
    }
  }, [rewData, rew]);

  // Handle view devices
  const handleViewDevices = useCallback((rewItem) => {
    setSelectedRewName(rewItem.rew_name);
    setSelectedDevices(rewItem.devices || []);
    setShowDeviceModal(true);
  }, []);

  // Handle view photos
  const handleViewPhotos = useCallback(
    (photos, rewName) => {
      const parsedPhotos = parsePhotosData(photos);
      setSelectedPhotos(parsedPhotos);
      setSelectedRewName(rewName);
      setCurrentPhotoIndex(0);
      setShowPhotoModal(true);
    },
    [parsePhotosData],
  );

  // Handle delete
  const handleDelete = useCallback(
    (id, rewName) => {
      if (window.confirm(`Are you sure you want to delete "${rewName}"?`)) {
        dispatch(deleteRew(id, navigate));
      }
    },
    [dispatch, navigate],
  );

  // Handle edit - store the selected item for edit modal
  const handleEdit = useCallback((rewItem) => {
    setSelectedRewForEdit(rewItem);
    // Trigger the edit modal via Bootstrap
    const editModal = new window.bootstrap.Modal(
      document.getElementById("editRewModal"),
    );
    editModal.show();
  }, []);

  // Handle create button click
  const handleCreateClick = useCallback(() => {
    // Trigger the create modal via Bootstrap
    const createModal = new window.bootstrap.Modal(
      document.getElementById("createRewModal"),
    );
    createModal.show();
  }, []);

  // Navigate photos
  const nextPhoto = useCallback(() => {
    setCurrentPhotoIndex((prev) => (prev + 1) % selectedPhotos.length);
  }, [selectedPhotos.length]);

  const prevPhoto = useCallback(() => {
    setCurrentPhotoIndex(
      (prev) => (prev - 1 + selectedPhotos.length) % selectedPhotos.length,
    );
  }, [selectedPhotos.length]);

  // Get photo preview
  const getPhotoPreview = useCallback(
    (photos) => {
      const photoArray = parsePhotosData(photos);
      return photoArray.length > 0 ? photoArray[0] : null;
    },
    [parsePhotosData],
  );

  // Get photo count
  const getPhotoCount = useCallback(
    (photos) => {
      const photoArray = parsePhotosData(photos);
      return photoArray.length;
    },
    [parsePhotosData],
  );

  return (
    <Wrapper>
      {/* Create Modal - Using Bootstrap modal structure */}
      <div
        className="modal fade"
        id="createRewModal"
        tabIndex="-1"
        aria-labelledby="createRewModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <CreateRew onSuccess={() => dispatch(getRew({ navigate }))} />
          </div>
        </div>
      </div>

      {/* Edit Modal - Using Bootstrap modal structure */}
      <div
        className="modal fade"
        id="editRewModal"
        tabIndex="-1"
        aria-labelledby="editRewModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            {selectedRewForEdit && (
              <EditRew
                rewData={selectedRewForEdit}
                onSuccess={() => {
                  dispatch(getRew({ navigate }));
                }}
              />
            )}
          </div>
        </div>
      </div>

      <div className="content-wrapper">
        <div className="container-full">
          {/* Main Content */}
          <section className="content">
            <div className="row">
              <div className="col-12">
                <div className="box">
                  <div className="row">
                    <div className="box-header with-border">
                      <h4 className="box-title">
                        Rural Electronic Workshop (REW)
                      </h4>
                      <div className="float-end">
                        {/* Create Button - Using data-bs-toggle like InternationalDonor */}
                        <button
                          className="filterButton"
                          type="button"
                          data-bs-toggle="modal"
                          data-bs-target="#createRewModal"
                          onClick={handleCreateClick}
                        >
                          <i
                            className="fa-solid fa-add"
                            style={{ marginRight: "10px" }}
                          />{" "}
                          Create REW
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
                      {columnId} {conditionName?.title}
                    </p>
                    <div style={{ marginLeft: "auto" }}>
                      <i
                        className="fa-solid fa-ban"
                        style={{ cursor: "pointer" }}
                        onClick={() =>
                          dispatch(
                            disableFilterCondition({
                              mainData: mainRewData,
                              activity: "Rew",
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
                      {sortColumnId} {sortConditionName?.title}
                    </p>
                    <div style={{ marginLeft: "auto" }}>
                      <i
                        className="fa-solid fa-ban"
                        style={{ cursor: "pointer" }}
                        onClick={() =>
                          dispatch(
                            disableSortCondition({
                              mainSortData: mainRewData,
                              sortActivity: "Rew",
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
                            <th>S.No</th>
                            <th>REW Name</th>
                            <th>Phone Number</th>
                            <th>Photos</th>
                            <th>Devices Count</th>
                            <th>Actions</th>
                          </tr>
                        </thead>

                        {rew.length === 0 ? (
                          <tbody>
                            <tr>
                              <td colSpan={6}>
                                <NoData />
                              </td>
                            </tr>
                          </tbody>
                        ) : (
                          <tbody>
                            {rew.map((item, index) => {
                              const photoCount = getPhotoCount(item.rew_photos);
                              const deviceCount = item.devices?.length || 0;
                              const previewPhoto = getPhotoPreview(
                                item.rew_photos,
                              );
                              const previewPhotoUrl = previewPhoto
                                ? buildImageUrl(previewPhoto)
                                : null;

                              return (
                                <tr key={item.id}>
                                  <td
                                    className="text-dark"
                                    style={{ fontSize: "16px" }}
                                  >
                                    <input
                                      className="form-check-input"
                                      type="checkbox"
                                      value={item.id}
                                      id={item.id}
                                    />{" "}
                                    {index + 1}
                                  </td>
                                  <td>{item.rew_name}</td>
                                  <td>{item.rew_phone || "N/A"}</td>
                                  <td>
                                    {photoCount > 0 ? (
                                      <div className="photo-preview-container">
                                        {previewPhotoUrl && (
                                          <img
                                            src={previewPhotoUrl}
                                            alt="Preview"
                                            className="photo-thumbnail"
                                            onClick={() =>
                                              handleViewPhotos(
                                                item.rew_photos,
                                                item.rew_name,
                                              )
                                            }
                                            style={{ cursor: "pointer" }}
                                            onError={(e) => {
                                              e.target.onerror = null;
                                              e.target.src =
                                                "/placeholder-image.jpg";
                                            }}
                                          />
                                        )}
                                        <span
                                          className="photo-count-badge"
                                          onClick={() =>
                                            handleViewPhotos(
                                              item.rew_photos,
                                              item.rew_name,
                                            )
                                          }
                                        >
                                          <i
                                            className="fa-regular fa-images"
                                            style={{ marginRight: "5px" }}
                                          ></i>
                                          View {photoCount}
                                        </span>
                                      </div>
                                    ) : (
                                      <span className="text-muted">
                                        No photos
                                      </span>
                                    )}
                                  </td>
                                  <td>
                                    <span
                                      className="device-count-badge"
                                      onClick={() => handleViewDevices(item)}
                                      style={{ cursor: "pointer" }}
                                    >
                                      <i
                                        className="fa-solid fa-microchip"
                                        style={{ marginRight: "5px" }}
                                      ></i>
                                      {deviceCount}
                                    </span>
                                  </td>
                                  <td>
                                    <i
                                      className="fa-regular fa-pen-to-square iconStyle"
                                      onClick={() => handleEdit(item)}
                                      title="Edit"
                                      data-bs-toggle="modal"
                                      data-bs-target="#editRewModal"
                                    />
                                    <i
                                      className="fa-regular fa-trash-can iconStyle"
                                      onClick={() =>
                                        handleDelete(item.id, item.rew_name)
                                      }
                                      title="Delete"
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

      {/* Devices Modal */}
      <div
        className={`modal fade ${showDeviceModal ? "show" : ""}`}
        style={{
          display: showDeviceModal ? "block" : "none",
          backgroundColor: "rgba(0,0,0,0.5)",
        }}
        id="devicesModal"
        tabIndex="-1"
      >
        <div className="modal-dialog modal-xl">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Devices for {selectedRewName}</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowDeviceModal(false)}
              ></button>
            </div>
            <div className="modal-body">
              {selectedDevices.length === 0 ? (
                <p className="text-muted">
                  No devices associated with this REW
                </p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th>
                          UIDLocation
                          <br />
                          UID
                        </th>
                        <th>Beneficiary</th>
                        <th>Location</th>
                        <th>Village</th>
                        <th>Status</th>
                        <th>Solar Engineer</th>
                        <th>Panchayat Samiti</th>
                        <th>Donor</th>
                        <th>Installation Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedDevices.map((device) => (
                        <tr key={device.ID}>
                          <td>{device.UID}</td>
                          <td>{device.NameOfBeneficiary}</td>
                          <td>{device.Location}</td>
                          <td>{device.VillageName}</td>
                          <td>
                            <span
                              className={`badge ${device.status === "active" ? "bg-success" : "bg-danger"}`}
                            >
                              {device.status}
                            </span>
                          </td>
                          <td>{device.SolarEngineerName || "N/A"}</td>
                          <td>{device.PanchayatSamiti || "N/A"}</td>

                          <td>{device.DonarName || "N/A"}</td>
                          <td>
                            {device.InstallationDate
                              ? new Date(
                                  device.InstallationDate,
                                ).toLocaleDateString()
                              : "N/A"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowDeviceModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

{/* Photos Modal - Updated with fixed dimensions */}
<div className={`modal fade ${showPhotoModal ? 'show' : ''}`} 
     style={{ display: showPhotoModal ? 'block' : 'none', backgroundColor: 'rgba(0,0,0,0.5)' }}
     id="photosModal" 
     tabIndex="-1">
  <div className="modal-dialog modal-lg modal-dialog-centered">
    <div className="modal-content">
      <div className="modal-header">
        <h5 className="modal-title">Photos for {selectedRewName}</h5>
        <button type="button" className="btn-close" onClick={() => setShowPhotoModal(false)}></button>
      </div>
      <div className="modal-body p-0">
        {selectedPhotos.length === 0 ? (
          <p className="text-muted p-3">No photos available</p>
        ) : (
          <>
            <div className="image-container-fixed"> {/* Changed class name */}
              <img 
                src={buildImageUrl(selectedPhotos[currentPhotoIndex])} 
                alt={`REW ${currentPhotoIndex + 1}`}
                className="modal-fixed-image" 
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/placeholder-image.jpg';
                }}
              />
            </div>
            {selectedPhotos.length > 1 && (
              <div className="text-center p-3 bg-light border-top">
                <button className="btn btn-primary me-2" onClick={prevPhoto}>
                  <i className="fa-solid fa-chevron-left"></i> Previous
                </button>
                <button className="btn btn-primary" onClick={nextPhoto}>
                  Next <i className="fa-solid fa-chevron-right"></i>
                </button>
                <p className="mt-2 mb-0">{currentPhotoIndex + 1} / {selectedPhotos.length}</p>
              </div>
            )}
          </>
        )}
      </div>
      <div className="modal-footer">
        <button type="button" className="btn btn-secondary" onClick={() => setShowPhotoModal(false)}>Close</button>
      </div>
    </div>
  </div>
</div>
    </Wrapper>
  );
};

const Wrapper = styled.section`
  .tableCheckBox {
    border-color: 1px solid white;
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
  .photo-preview-container {
    display: flex;
    align-items: center;
   justify-content: space-between;
  }
  .photo-thumbnail {
    width: 100px;
    height: 50px;
    object-fit: cover;
    border-radius: 4px;
  }
  .photo-count-badge {
    background: ${({ theme }) => theme.colors.themeColor};
    color: white;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 12px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
  }
  .device-count-badge {
    background: #17a2b8;
    color: white;
    padding: 4px 12px;
    border-radius: 16px;
    font-size: 12px;
    display: inline-flex;
    align-items: center;
    cursor: pointer;
  }
  .badge {
    padding: 5px 10px;
    border-radius: 4px;
    font-size: 12px;
    display: inline-block;
  }
  .bg-success {
    background-color: #28a745;
    color: white;
  }
  .bg-danger {
    background-color: #dc3545;
    color: white;
  }

  /* Modal Styles */
  .modal.show {
    display: block;
    background-color: rgba(0, 0, 0, 0.5);
  }
  // Replace the existing image-container styles with these fixed ones
  .image-container-fixed {
    min-height: 400px;
    height: 400px;
    max-height: 70vh;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    /* background-color: #f8f9fa; */
    padding: 10px;
  }

  .modal-fixed-image {
    max-width: 100%;
    max-height: 100%;
    width: auto;
    height: auto;
    object-fit: contain;
  }

  .modal-header {
    padding: 15px 20px;
    border-bottom: 1px solid #dee2e6;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #f8f9fa;
  }

  .modal-header .btn-close {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #666;
  }

  .modal-body {
    padding: 20px;
    max-height: 70vh;
    overflow-y: auto;
  }

  .modal-footer {
    padding: 15px 20px;
    border-top: 1px solid #dee2e6;
    display: flex;
    justify-content: flex-end;
    background: #f8f9fa;
  }

  .btn-secondary {
    background: #6c757d;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
  }

  .btn-secondary:hover {
    background: #5a6268;
  }

  .btn-primary {
    background: ${({ theme }) => theme.colors.themeColor};
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
  }

  .btn-primary:hover {
    opacity: 0.9;
  }

  .table-responsive {
    overflow-x: auto;
  }

  .table {
    width: 100%;
    border-collapse: collapse;
  }

  .table th,
  .table td {
    padding: 8px;
    text-align: left;
    border-bottom: 1px solid #dee2e6;
  }

  .table th {
    background: #f8f9fa;
    color: #6c757d;
    font-weight: 600;
  }

  .text-muted {
    color: #6c757d;
  }

  .d-none {
    display: none !important;
  }
`;

export default ViewRew;
