import React, { useState, useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import {
  changeApistate,
  setLoader,
} from "../../../Database/Action/ConstantAction";
import { postHeaderWithToken } from "../../../Database/Utils";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getRew, getInternationalDonor } from "../../../Database/Action/DashboardAction";

const CreateNewCharger = ({ isOpen, onClose, onSuccess, deviceData }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const internationalDonors = useSelector(
    (state) => state.DashboardReducer.internationalDonor || [],
  );
  
  // Get REWs from Redux state
  const rewsData = useSelector(
    (state) => state.DashboardReducer.rew || [],
  );

  const [chargerInfo, setChargerInfo] = useState({
    UID: "",
    NameOfBeneficiary: "",
    BeneficiaryPno: "",
    InstallationDate: "",
    Location: "",        // Location code (e.g., "IND.RAJ.SHA201")
    CLocation: "",        // Coordinates (e.g., "26.814073, 75.221152")
    donor_id: "",         // Changed from DonarName to donor_id
    VillageName: "",
    PanchayatSamiti: "",
    Block: "",
    District: "",
    State: "Rajasthan",     // ✅ Default State
    Country: "India", 
    SolarEngineerName: "",
    SolarEngineerPno: "",
    GCName: "",
    GCPhoneNumber: "",
    rew_id: "", // Add rew_id field (optional)
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Fetch REWs and Donors when modal opens
  useEffect(() => {
    if (isOpen) {
      console.log("Modal opened, fetching REWs and Donors...");
      dispatch(getRew());
      dispatch(getInternationalDonor());
    }
  }, [isOpen, dispatch]);

  // Debug: Log data when it changes
  useEffect(() => {
    if (internationalDonors.length > 0) {
      console.log("Donors loaded:", internationalDonors);
    }
  }, [internationalDonors]);

  // Pre-fill form when deviceData is provided (from unregistered devices)
  useEffect(() => {
    if (deviceData?.UID) {
      setChargerInfo((prev) => ({
        ...prev,
        UID: deviceData.UID,
        Location: deviceData.Location || '',
      }));
    }
  }, [deviceData]);

  // Reset form when modal is opened
  useEffect(() => {
    if (isOpen) {
      if (deviceData?.UID) {
        setChargerInfo((prev) => ({
          ...prev,
          UID: deviceData.UID,
          Location: deviceData.Location || '',
          CLocation: '',
          rew_id: '',
          donor_id: '',
        }));
      } else {
        setChargerInfo({
          UID: "",
          NameOfBeneficiary: "",
          BeneficiaryPno: "",
          InstallationDate: "",
          Location: "",
          CLocation: "",
          donor_id: "", // Changed from DonarName
          VillageName: "",
          PanchayatSamiti: "",
          Block: "",
          District: "",
          State: "Rajasthan",
          Country: "India", 
          SolarEngineerName: "",
          SolarEngineerPno: "",
          GCName: "",
          GCPhoneNumber: "",
          rew_id: "",
        });
      }
      // Reset errors and touched when modal opens
      setErrors({});
      setTouched({});
    }
  }, [isOpen, deviceData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setChargerInfo({ ...chargerInfo, [name]: value });
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched({ ...touched, [name]: true });
    
    // Validate the field on blur
    const fieldError = validateField(name, chargerInfo[name]);
    if (fieldError) {
      setErrors({ ...errors, [name]: fieldError });
    } else {
      const newErrors = { ...errors };
      delete newErrors[name];
      setErrors(newErrors);
    }
  };

  const validateField = (fieldName, value) => {
    // Skip validation for rew_id as it's optional
    if (fieldName === 'rew_id') return "";

    if (!value || (typeof value === 'string' && value.trim() === "") || (fieldName === 'donor_id' && !value)) {
      const fieldLabels = {
        UID: "UID",
        NameOfBeneficiary: "Beneficiary Name",
        BeneficiaryPno: "Beneficiary Phone",
        InstallationDate: "Installation Date",
        Location: "UID-Location",
        CLocation: "Location Coordinates",
        donor_id: "Donor",
        VillageName: "Village Name",
        PanchayatSamiti: "Panchayat Samiti",
        Block: "Block",
        District: "District",
        State: "State",
        Country: "Country",
        SolarEngineerName: "Solar Engineer Name",
        SolarEngineerPno: "Solar Engineer Phone",
        GCName: "GC Name",
        GCPhoneNumber: "GC Phone Number",
      };
      return `${fieldLabels[fieldName] || fieldName} is required`;
    }
    
    // Additional validation for phone numbers
    if (fieldName === 'BeneficiaryPno' || fieldName === 'SolarEngineerPno' || fieldName === 'GCPhoneNumber') {
      const phoneRegex = /^\d{10}$/;
      if (value && !phoneRegex.test(value)) {
        return "Please enter a valid 10-digit phone number";
      }
    }
    
    return "";
  };

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = [
      'UID',
      'NameOfBeneficiary',
      'BeneficiaryPno',
      'InstallationDate',
      'Location',
      'CLocation',
      'donor_id', // Changed from DonarName
      'VillageName',
      'PanchayatSamiti',
      'Block',
      'District',
      'State',
      'Country',
      'SolarEngineerName',
      'SolarEngineerPno',
      'GCName',
      'GCPhoneNumber',
    ];

    // Check all required fields
    requiredFields.forEach(field => {
      const error = validateField(field, chargerInfo[field]);
      if (error) {
        newErrors[field] = error;
      }
    });

    // Validate phone numbers format
    const phoneFields = ['BeneficiaryPno', 'SolarEngineerPno', 'GCPhoneNumber'];
    phoneFields.forEach(field => {
      if (chargerInfo[field] && !/^\d{10}$/.test(chargerInfo[field])) {
        newErrors[field] = "Please enter a valid 10-digit phone number";
      }
    });

    setErrors(newErrors);
    
    // Mark all fields as touched to show errors
    const allTouched = {};
    requiredFields.forEach(field => {
      allTouched[field] = true;
    });
    setTouched(allTouched);

    return Object.keys(newErrors).length === 0;
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = `${position.coords.latitude},${position.coords.longitude}`;
        setChargerInfo((prev) => ({ ...prev, CLocation: coords }));
        // Clear error for CLocation if it exists
        if (errors.CLocation) {
          setErrors({ ...errors, CLocation: "" });
        }
        toast.success("Location captured successfully");
      },
      (error) => {
        toast.error("Unable to retrieve location");
        console.error("Location error:", error);
      },
    );
  };

  const createChargerController = async () => {
    if (!validateForm()) {
      toast.error("Please fill in all required fields correctly");
      return;
    }

    // Convert donor_id to number if it's a string
    const payload = {
      ...chargerInfo,
      donor_id: chargerInfo.donor_id ? Number(chargerInfo.donor_id) : null,
      rew_id: chargerInfo.rew_id ? Number(chargerInfo.rew_id) : null
    };

    try {
      const token = await postHeaderWithToken();
      dispatch(setLoader(true));

      const response = await axios.post(
        process.env.REACT_APP_BASE_URL + "createNewDevice",
        payload,
        token,
      );

      if (response.data.status === 200) {
        toast.success(response.data.message);
        dispatch(changeApistate());

        setChargerInfo({
          UID: "",
          NameOfBeneficiary: "",
          BeneficiaryPno: "",
          InstallationDate: "",
          Location: "",
          CLocation: "",
          donor_id: "",
          VillageName: "",
          PanchayatSamiti: "",
          Block: "",
          District: "",
          State: "",
          Country: "",
          SolarEngineerName: "",
          SolarEngineerPno: "",
          GCName: "",
          GCPhoneNumber: "",
          rew_id: "",
        });

        if (onSuccess) {
          onSuccess();
        }

        if (onClose) {
          onClose();
        }
      }
    } catch (error) {
      console.error("Error creating device:", error);
      if (error?.response?.data?.status === 302) {
        navigate("/");
        window.location.reload(false);
      }
      toast.error(error?.response?.data?.message || "Failed to create device");
    } finally {
      dispatch(setLoader(false));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createChargerController();
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal fade show"
      id="createModal"
      tabIndex="-1"
      aria-labelledby="createModalLabel"
      aria-hidden="true"
      style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-xl">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="createModalLabel">
              {deviceData?.UID ? "Register Unregistered Device" : "Create New Charger Controller"}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={handleClose}
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body" style={{ maxHeight: "70vh", overflowY: "auto" }}>
            <div className="box">
              <form onSubmit={handleSubmit}>
                <div className="box-body">
                  {/* Row 1: UID and Location Code */}
                  <div className="row">
                    <div className="col-md-4">
                      <div className="form-group">
                        <label className="form-label">
                          UID <span className="text-danger">*</span>
                        </label>
                        <div className="input-group mb-3">
                          <span className="input-group-text">
                            <i className="fa-solid fa-id-card"></i>
                          </span>
                          <input
                            type="text"
                            className={`form-control ${touched.UID && errors.UID ? 'is-invalid' : ''}`}
                            name="UID"
                            value={chargerInfo.UID}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            required
                            readOnly={!!deviceData?.UID}
                          />
                        </div>
                        {touched.UID && errors.UID && (
                          <div className="text-danger small mt-1">{errors.UID}</div>
                        )}
                      </div>
                    </div>

                    <div className="col-md-4">
                      <div className="form-group">
                        <label className="form-label">
                          UID-Location <span className="text-danger">*</span>
                        </label>
                        <div className="input-group mb-3">
                          <span className="input-group-text">
                            <i className="fa-solid fa-code"></i>
                          </span>
                          <input
                            type="text"
                            className={`form-control ${touched.Location && errors.Location ? 'is-invalid' : ''}`}
                            name="Location"
                            value={chargerInfo.Location}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="UID Location"
                            readOnly={!!deviceData?.UID}
                          />
                        </div>
                        {touched.Location && errors.Location && (
                          <div className="text-danger small mt-1">{errors.Location}</div>
                        )}
                      </div>
                    </div>

                    {/* REW Selection - Optional */}
                    <div className="col-md-4">
                      <div className="form-group">
                        <label className="form-label">REW Name (Optional)</label>
                        <div className="input-group mb-3">
                          <span className="input-group-text">
                            <i className="fa-solid fa-user-tie"></i>
                          </span>
                          <select
                            className="form-control"
                            name="rew_id"
                            value={chargerInfo.rew_id}
                            onChange={handleChange}
                            onBlur={handleBlur}
                          >
                            <option value="">Select REW</option>
                            {rewsData && rewsData.length > 0 ? (
                              rewsData.map((rew) => (
                                <option key={rew.id} value={rew.id}>
                                  {rew.rew_name}
                                </option>
                              ))
                            ) : (
                              <option value="" disabled>Loading REWs...</option>
                            )}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Location Coordinates with button */}
                  <div className="row">
                    <div className="col-6">
                      <div className="form-group">
                        <label className="form-label">
                          Location Coordinates <span className="text-danger">*</span>
                        </label>
                        <div className="input-group mb-3">
                          <span className="input-group-text">
                            <i className="fa-solid fa-location-crosshairs"></i>
                          </span>
                          <input
                            type="text"
                            className={`form-control ${touched.CLocation && errors.CLocation ? 'is-invalid' : ''}`}
                            name="CLocation"
                            value={chargerInfo.CLocation}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder=""
                          />
                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={getLocation}
                          >
                            <i className="fa-solid fa-location-crosshairs me-2"></i>
                            Current Location
                          </button>
                        </div>
                        {touched.CLocation && errors.CLocation && (
                          <div className="text-danger small mt-1">{errors.CLocation}</div>
                        )}
                      </div>
                    </div>
                       
                    <div className="col-6">
                      <div className="form-group">
                        <label className="form-label">
                          Country <span className="text-danger">*</span>
                        </label>
                        <div className="input-group mb-3">
                          <span className="input-group-text">
                            <i className="fa-solid fa-flag"></i>
                          </span>
                          <input
                            type="text"
                            className={`form-control ${touched.Country && errors.Country ? 'is-invalid' : ''}`}
                            name="Country"
                            value={chargerInfo.Country}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            required
                          />
                        </div>
                        {touched.Country && errors.Country && (
                          <div className="text-danger small mt-1">{errors.Country}</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Row 3: Beneficiary Name and Phone */}
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="form-label">
                          Beneficiary Name <span className="text-danger">*</span>
                        </label>
                        <div className="input-group mb-3">
                          <span className="input-group-text">
                            <i className="fa-solid fa-user"></i>
                          </span>
                          <input
                            type="text"
                            className={`form-control ${touched.NameOfBeneficiary && errors.NameOfBeneficiary ? 'is-invalid' : ''}`}
                            name="NameOfBeneficiary"
                            value={chargerInfo.NameOfBeneficiary}
                            onChange={handleChange}
                            onBlur={handleBlur}
                          />
                        </div>
                        {touched.NameOfBeneficiary && errors.NameOfBeneficiary && (
                          <div className="text-danger small mt-1">{errors.NameOfBeneficiary}</div>
                        )}
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="form-label">
                          Beneficiary Phone <span className="text-danger">*</span>
                        </label>
                        <div className="input-group mb-3">
                          <span className="input-group-text">
                            <i className="fa-solid fa-phone"></i>
                          </span>
                          <input
                            type="text"
                            className={`form-control ${touched.BeneficiaryPno && errors.BeneficiaryPno ? 'is-invalid' : ''}`}
                            name="BeneficiaryPno"
                            value={chargerInfo.BeneficiaryPno}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            maxLength="10"
                          />
                        </div>
                        {touched.BeneficiaryPno && errors.BeneficiaryPno && (
                          <div className="text-danger small mt-1">{errors.BeneficiaryPno}</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Row 4: Installation Date and Donor Name */}
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="form-label">
                          Installation Date <span className="text-danger">*</span>
                        </label>
                        <div className="input-group mb-3">
                          <span className="input-group-text">
                            <i className="fa-solid fa-calendar-days"></i>
                          </span>
                          <input
                            type="date"
                            className={`form-control ${touched.InstallationDate && errors.InstallationDate ? 'is-invalid' : ''}`}
                            name="InstallationDate"
                            value={chargerInfo.InstallationDate}
                            onChange={handleChange}
                            onBlur={handleBlur}
                          />
                        </div>
                        {touched.InstallationDate && errors.InstallationDate && (
                          <div className="text-danger small mt-1">{errors.InstallationDate}</div>
                        )}
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="form-label">
                          Donor <span className="text-danger">*</span>
                        </label>
                        <div className="input-group mb-3">
                          <span className="input-group-text">
                            <i className="fa-solid fa-hand-holding-heart"></i>
                          </span>
                          <select
                            className={`form-control ${touched.donor_id && errors.donor_id ? 'is-invalid' : ''}`}
                            name="donor_id"
                            value={chargerInfo.donor_id}
                            onChange={handleChange}
                            onBlur={handleBlur}
                          >
                            <option value="">Select Donor</option>
                            {internationalDonors && internationalDonors.length > 0 ? (
                              internationalDonors.map((donor) => (
                                <option
                                  key={donor.ID || donor.id}
                                  value={donor.ID || donor.id}
                                >
                                  {donor.DonarOrganisation || donor.name}
                                </option>
                              ))
                            ) : (
                              <option value="" disabled>Loading Donors...</option>
                            )}
                          </select>
                        </div>
                        {touched.donor_id && errors.donor_id && (
                          <div className="text-danger small mt-1">{errors.donor_id}</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Row 5: Village Name and Panchayat Samiti */}
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="form-label">
                          Village Name <span className="text-danger">*</span>
                        </label>
                        <div className="input-group mb-3">
                          <span className="input-group-text">
                            <i className="fa-solid fa-location-dot"></i>
                          </span>
                          <input
                            type="text"
                            className={`form-control ${touched.VillageName && errors.VillageName ? 'is-invalid' : ''}`}
                            name="VillageName"
                            value={chargerInfo.VillageName}
                            onChange={handleChange}
                            onBlur={handleBlur}
                          />
                        </div>
                        {touched.VillageName && errors.VillageName && (
                          <div className="text-danger small mt-1">{errors.VillageName}</div>
                        )}
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="form-label">
                          Panchayat Samiti <span className="text-danger">*</span>
                        </label>
                        <div className="input-group mb-3">
                          <span className="input-group-text">
                            <i className="fa-solid fa-users"></i>
                          </span>
                          <input
                            type="text"
                            className={`form-control ${touched.PanchayatSamiti && errors.PanchayatSamiti ? 'is-invalid' : ''}`}
                            name="PanchayatSamiti"
                            value={chargerInfo.PanchayatSamiti}
                            onChange={handleChange}
                            onBlur={handleBlur}
                          />
                        </div>
                        {touched.PanchayatSamiti && errors.PanchayatSamiti && (
                          <div className="text-danger small mt-1">{errors.PanchayatSamiti}</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Row 6: Block, District, State */}
                  <div className="row">
                    <div className="col-md-4">
                      <div className="form-group">
                        <label className="form-label">
                          Block <span className="text-danger">*</span>
                        </label>
                        <div className="input-group mb-3">
                          <span className="input-group-text">
                            <i className="fa-solid fa-map"></i>
                          </span>
                          <input
                            type="text"
                            className={`form-control ${touched.Block && errors.Block ? 'is-invalid' : ''}`}
                            name="Block"
                            value={chargerInfo.Block}
                            onChange={handleChange}
                            onBlur={handleBlur}
                          />
                        </div>
                        {touched.Block && errors.Block && (
                          <div className="text-danger small mt-1">{errors.Block}</div>
                        )}
                      </div>
                    </div>

                    <div className="col-md-4">
                      <div className="form-group">
                        <label className="form-label">
                          District <span className="text-danger">*</span>
                        </label>
                        <div className="input-group mb-3">
                          <span className="input-group-text">
                            <i className="fa-solid fa-map-location-dot"></i>
                          </span>
                          <input
                            type="text"
                            className={`form-control ${touched.District && errors.District ? 'is-invalid' : ''}`}
                            name="District"
                            value={chargerInfo.District}
                            onChange={handleChange}
                            onBlur={handleBlur}
                          />
                        </div>
                        {touched.District && errors.District && (
                          <div className="text-danger small mt-1">{errors.District}</div>
                        )}
                      </div>
                    </div>

                    <div className="col-md-4">
                      <div className="form-group">
                        <label className="form-label">
                          State <span className="text-danger">*</span>
                        </label>
                        <div className="input-group mb-3">
                          <span className="input-group-text">
                            <i className="fa-solid fa-globe"></i>
                          </span>
                          <input
                            type="text"
                            className={`form-control ${touched.State && errors.State ? 'is-invalid' : ''}`}
                            name="State"
                            value={chargerInfo.State}
                            onChange={handleChange}
                            onBlur={handleBlur}
                          />
                        </div>
                        {touched.State && errors.State && (
                          <div className="text-danger small mt-1">{errors.State}</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Row 7: Solar Engineer Name and Phone */}
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="form-label">
                          Solar Engineer Name <span className="text-danger">*</span>
                        </label>
                        <div className="input-group mb-3">
                          <span className="input-group-text">
                            <i className="fa-solid fa-user-gear"></i>
                          </span>
                          <input
                            type="text"
                            className={`form-control ${touched.SolarEngineerName && errors.SolarEngineerName ? 'is-invalid' : ''}`}
                            name="SolarEngineerName"
                            value={chargerInfo.SolarEngineerName}
                            onChange={handleChange}
                            onBlur={handleBlur}
                          />
                        </div>
                        {touched.SolarEngineerName && errors.SolarEngineerName && (
                          <div className="text-danger small mt-1">{errors.SolarEngineerName}</div>
                        )}
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="form-label">
                          Solar Engineer Phone <span className="text-danger">*</span>
                        </label>
                        <div className="input-group mb-3">
                          <span className="input-group-text">
                            <i className="fa-solid fa-phone"></i>
                          </span>
                          <input
                            type="text"
                            className={`form-control ${touched.SolarEngineerPno && errors.SolarEngineerPno ? 'is-invalid' : ''}`}
                            name="SolarEngineerPno"
                            value={chargerInfo.SolarEngineerPno}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            maxLength="10"
                          />
                        </div>
                        {touched.SolarEngineerPno && errors.SolarEngineerPno && (
                          <div className="text-danger small mt-1">{errors.SolarEngineerPno}</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Row 8: GC Name and Phone */}
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="form-label">
                          GC Name <span className="text-danger">*</span>
                        </label>
                        <div className="input-group mb-3">
                          <span className="input-group-text">
                            <i className="fa-solid fa-user-tie"></i>
                          </span>
                          <input
                            type="text"
                            className={`form-control ${touched.GCName && errors.GCName ? 'is-invalid' : ''}`}
                            name="GCName"
                            value={chargerInfo.GCName}
                            onChange={handleChange}
                            onBlur={handleBlur}
                          />
                        </div>
                        {touched.GCName && errors.GCName && (
                          <div className="text-danger small mt-1">{errors.GCName}</div>
                        )}
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="form-label">
                          GC Phone Number <span className="text-danger">*</span>
                        </label>
                        <div className="input-group mb-3">
                          <span className="input-group-text">
                            <i className="fa-solid fa-phone"></i>
                          </span>
                          <input
                            type="text"
                            className={`form-control ${touched.GCPhoneNumber && errors.GCPhoneNumber ? 'is-invalid' : ''}`}
                            name="GCPhoneNumber"
                            value={chargerInfo.GCPhoneNumber}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            maxLength="10"
                          />
                        </div>
                        {touched.GCPhoneNumber && errors.GCPhoneNumber && (
                          <div className="text-danger small mt-1">{errors.GCPhoneNumber}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer with buttons */}
                <div className="box-footer" style={{ borderColor: "transparent", padding: "1rem 0" }}>
                  <div className="d-flex justify-content-end gap-2">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleClose}
                    >
                      <i className="ti-close me-2"></i>
                      Close
                    </button>
                    <button type="submit" className="btn btn-primary">
                      <i className="ti-save-alt me-2"></i>
                      Save
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateNewCharger;