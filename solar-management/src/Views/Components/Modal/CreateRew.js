import React, { useState, useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import {
  changeApistate,
  setLoader,
} from "../../../Database/Action/ConstantAction";
import { postHeaderWithToken } from "../../../Database/Utils";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const CreateRew = ({ onSuccess }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [rewInfo, setRewInfo] = useState({
    rew_name: "",
    rew_phone: "",
  });

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  // Reset form when modal is opened
  useEffect(() => {
    const modal = document.getElementById('createRewModal');
    const handleModalShow = () => {
      setRewInfo({
        rew_name: "",
        rew_phone: "",
      });
      // Clean up preview URLs
      previewUrls.forEach(url => URL.revokeObjectURL(url));
      setSelectedFiles([]);
      setPreviewUrls([]);
    };

    if (modal) {
      modal.addEventListener('show.bs.modal', handleModalShow);
      return () => {
        modal.removeEventListener('show.bs.modal', handleModalShow);
      };
    }
  }, [previewUrls]);

  const handleChange = (e) => {
    setRewInfo({ ...rewInfo, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Check total files (existing new selection)
    const totalFiles = selectedFiles.length + files.length;
    
    if (totalFiles > 5) {
      toast.error(`Maximum 5 photos allowed. You can add ${5 - selectedFiles.length} more.`);
      return;
    }

    // Validate file types
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const invalidFiles = files.filter(file => !validTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      toast.error("Only image files (JPEG, PNG, GIF, WEBP) are allowed");
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    const oversizedFiles = files.filter(file => file.size > maxSize);
    
    if (oversizedFiles.length > 0) {
      toast.error("Each file must be less than 5MB");
      return;
    }

    // Create preview URLs for new files
    const urls = files.map(file => URL.createObjectURL(file));
    
    // Update state - append new files to existing ones
    setSelectedFiles(prev => [...prev, ...files]);
    setPreviewUrls(prev => [...prev, ...urls]);
    
    // Clear the input value so the same file can be selected again if needed
    e.target.value = '';
  };

  const removeFile = (index) => {
    const newFiles = [...selectedFiles];
    const newUrls = [...previewUrls];
    
    // Revoke the URL to prevent memory leaks
    URL.revokeObjectURL(newUrls[index]);
    
    newFiles.splice(index, 1);
    newUrls.splice(index, 1);
    
    setSelectedFiles(newFiles);
    setPreviewUrls(newUrls);
  };

  const validateForm = () => {
    if (!rewInfo.rew_name || rewInfo.rew_name.trim() === "") {
      toast.error("REW name is required");
      return false;
    }
    
    if (rewInfo.rew_phone && !/^\d{10}$/.test(rewInfo.rew_phone.replace(/\D/g, ''))) {
      toast.error("Please enter a valid 10-digit phone number");
      return false;
    }
    
    return true;
  };

  const createRew = async () => {
    if (!validateForm()) return;

    try {
      const token = await postHeaderWithToken();
      dispatch(setLoader(true));

      const formData = new FormData();
      formData.append("rew_name", rewInfo.rew_name.trim());
      
      if (rewInfo.rew_phone) {
        formData.append("rew_phone", rewInfo.rew_phone.trim());
      }

      // IMPORTANT: Append each file with the SAME field name 'rew_photos[]'
      // This ensures backend receives all files
    selectedFiles.forEach((file) => {
  formData.append("rew_photos", file); // Changed from "rew_photos[]" to "rew_photos"
});

      // Log FormData contents for debugging
      console.log('FormData entries:');
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      const response = await axios.post(
        process.env.REACT_APP_BASE_URL + "/createRew",
        formData,
        {
          ...token,
          headers: {
            ...token.headers,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.status === 201 || response.data.status === 200) {
        toast.success(response.data.message || "REW created successfully");
        dispatch(changeApistate());
        
        // Clean up preview URLs
        previewUrls.forEach(url => URL.revokeObjectURL(url));

        if (onSuccess) {
          onSuccess();
        }

        // Close the modal
        const modal = window.bootstrap.Modal.getInstance(document.getElementById('createRewModal'));
        if (modal) modal.hide();
      }
    } catch (error) {
      console.error("Error creating REW:", error);
      console.error("Error response:", error.response?.data);
      if (error?.response?.data?.status === 302) {
        navigate("/");
        window.location.reload(false);
      }
      toast.error(error?.response?.data?.message || "Failed to create REW");
    } finally {
      dispatch(setLoader(false));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createRew();
  };

  const handleClose = () => {
    previewUrls.forEach(url => URL.revokeObjectURL(url));
    const modal = window.bootstrap.Modal.getInstance(document.getElementById('createRewModal'));
    if (modal) modal.hide();
  };

  return (
    <div className="box">
      <div className="box-header with-border">
        <h4 className="box-title">Create New REW (Rural Energy Warrior)</h4>
        <button type="button" className="btn-close float-end" onClick={handleClose} aria-label="Close"></button>
      </div>
      <div className="box-body">
        <form onSubmit={handleSubmit}>
          {/* REW Name Field */}
          <div className="form-group">
            <label className="form-label">
              REW Name <span className="text-danger">*</span>
            </label>
            <div className="input-group mb-3">
              <span className="input-group-text">
                <i className="fa-solid fa-user"></i>
              </span>
              <input
                type="text"
                className="form-control"
                name="rew_name"
                value={rewInfo.rew_name}
                onChange={handleChange}
                placeholder="Enter REW name"
                required
              />
            </div>
          </div>

          {/* REW Phone Field */}
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <div className="input-group mb-3">
              <span className="input-group-text">
                <i className="fa-solid fa-phone"></i>
              </span>
              <input
                type="tel"
                className="form-control"
                name="rew_phone"
                value={rewInfo.rew_phone}
                onChange={handleChange}
                placeholder="Enter 10-digit phone number"
                maxLength="10"
              />
            </div>
            <small className="text-muted">Optional: Enter 10-digit mobile number</small>
          </div>

          {/* Photo Upload Field */}
          <div className="form-group">
            <label className="form-label">
              Photos {selectedFiles.length > 0 && `(${selectedFiles.length}/5 selected)`}
            </label>
            <div className="input-group mb-3">
              <span className="input-group-text">
                <i className="fa-solid fa-image"></i>
              </span>
              <input
                type="file"
                className="form-control"
                name="rew_photos"
                onChange={handleFileChange}
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                multiple
                disabled={selectedFiles.length >= 5}
              />
            </div>
            <small className="text-muted">
              Supported formats: JPEG, PNG, GIF, WEBP (Max 5MB each, Max 5 files total)
            </small>
          </div>

          {/* Image Previews */}
          {previewUrls.length > 0 && (
            <div className="row mt-3">
              <div className="col-12">
                <label className="form-label">Selected Photos ({previewUrls.length}/5)</label>
                <div className="image-preview-container">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="image-preview-item">
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="preview-image"
                      />
                      <button
                        type="button"
                        className="btn-remove-image"
                        onClick={() => removeFile(index)}
                      >
                        <i className="fa-solid fa-times"></i>
                      </button>
                      <span className="image-index">{index + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="box-footer" style={{ padding: "1rem 0 0 0" }}>
            <div className="d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleClose}
              >
                <i className="ti-close me-2"></i>
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={!rewInfo.rew_name || rewInfo.rew_name.trim() === ""}
              >
                <i className="ti-save-alt me-2"></i>
                Create REW
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRew;