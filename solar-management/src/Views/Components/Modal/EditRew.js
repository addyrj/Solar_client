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
import { getRew } from "../../../Database/Action/DashboardAction";

const EditRew = ({ rewData, onSuccess }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [rewInfo, setRewInfo] = useState({
    rew_name: "",
    rew_phone: "",
  });

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [existingPhotos, setExistingPhotos] = useState([]);
  const [photosToDelete, setPhotosToDelete] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Parse photos helper
  const parsePhotos = (photos) => {
    if (!photos) return [];
    
    try {
      if (Array.isArray(photos)) {
        // Handle case where first element might be a JSON string
        if (photos.length > 0 && typeof photos[0] === 'string' && photos[0].startsWith('[')) {
          try {
            return JSON.parse(photos[0]);
          } catch (e) {
            return photos;
          }
        }
        return photos;
      }
      
      if (typeof photos === 'string') {
        try {
          const parsed = JSON.parse(photos);
          return Array.isArray(parsed) ? parsed : [parsed];
        } catch (e) {
          // If it's a comma-separated string
          if (photos.includes(',')) {
            return photos.split(',').map(p => p.trim());
          }
          return [photos];
        }
      }
    } catch (error) {
      console.error('Error parsing photos:', error);
    }
    
    return [];
  };

  // Build image URL
  const buildImageUrl = (filename) => {
    if (!filename) return null;
    // Remove any leading slashes
    const cleanFilename = filename.replace(/^\/+/, '');
    return `${process.env.REACT_APP_IMAGE_URL}rew-photos/${cleanFilename}`;
  };

  // Initialize form with existing data when modal opens or rewData changes
  useEffect(() => {
    if (rewData) {
      setRewInfo({
        rew_name: rewData.rew_name || "",
        rew_phone: rewData.rew_phone || "",
      });

      // Parse existing photos
      const parsedPhotos = parsePhotos(rewData.rew_photos);
      setExistingPhotos(parsedPhotos);
      setPhotosToDelete([]);
      setSelectedFiles([]);
      setPreviewUrls([]);
    }
  }, [rewData]);

  // Listen for modal open event to reset form
  useEffect(() => {
    const modal = document.getElementById('editRewModal');
    const handleModalShow = () => {
      if (rewData) {
        setRewInfo({
          rew_name: rewData.rew_name || "",
          rew_phone: rewData.rew_phone || "",
        });

        const parsedPhotos = parsePhotos(rewData.rew_photos);
        setExistingPhotos(parsedPhotos);
        setPhotosToDelete([]);
        setSelectedFiles([]);
        setPreviewUrls([]);
      }
    };

    if (modal) {
      modal.addEventListener('show.bs.modal', handleModalShow);
      return () => {
        modal.removeEventListener('show.bs.modal', handleModalShow);
      };
    }
  }, [rewData]);

  // Clean up preview URLs on unmount
  useEffect(() => {
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const handleChange = (e) => {
    setRewInfo({ ...rewInfo, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Calculate total photos after adding new files
    const totalAfterAdd = existingPhotos.length + selectedFiles.length + files.length;
    
    if (totalAfterAdd > 5) {
      toast.error(`Maximum 5 photos allowed. You can add ${5 - (existingPhotos.length + selectedFiles.length)} more.`);
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
    const maxSize = 5 * 1024 * 1024;
    const oversizedFiles = files.filter(file => file.size > maxSize);
    
    if (oversizedFiles.length > 0) {
      toast.error("Each file must be less than 5MB");
      return;
    }

    // Create preview URLs for new files
    const urls = files.map(file => URL.createObjectURL(file));
    
    setSelectedFiles(prev => [...prev, ...files]);
    setPreviewUrls(prev => [...prev, ...urls]);
    
    // Clear input
    e.target.value = '';
  };

  const removeNewFile = (index) => {
    const newFiles = [...selectedFiles];
    const newUrls = [...previewUrls];
    
    // Revoke the URL to prevent memory leaks
    URL.revokeObjectURL(newUrls[index]);
    
    newFiles.splice(index, 1);
    newUrls.splice(index, 1);
    
    setSelectedFiles(newFiles);
    setPreviewUrls(newUrls);
  };

  const removeExistingPhoto = (photoPath) => {
    // Add to delete list
    setPhotosToDelete(prev => [...prev, photoPath]);
    
    // Remove from existing photos display
    setExistingPhotos(prev => prev.filter(p => p !== photoPath));
  };

  const undoRemoveExistingPhoto = (photoPath) => {
    // Remove from delete list
    setPhotosToDelete(prev => prev.filter(p => p !== photoPath));
    
    // Add back to existing photos
    setExistingPhotos(prev => [...prev, photoPath]);
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

  const updateRew = async () => {
    if (!validateForm()) return;

    try {
      const token = await postHeaderWithToken();
      dispatch(setLoader(true));
      setIsLoading(true);

      const formData = new FormData();
      formData.append("rew_name", rewInfo.rew_name.trim());
      
      if (rewInfo.rew_phone) {
        formData.append("rew_phone", rewInfo.rew_phone.trim());
      }

      // IMPORTANT FIX: Send photos_to_delete as a JSON string, not as multiple fields
      if (photosToDelete.length > 0) {
        // Send as a single field with JSON string
        formData.append("photos_to_delete", JSON.stringify(photosToDelete));
        console.log('Photos to delete:', photosToDelete);
      }

      // Append new files
      selectedFiles.forEach((file) => {
        formData.append("rew_photos", file);
      });

      // Log FormData for debugging
      console.log('FormData contents:');
      for (let pair of formData.entries()) {
        if (pair[0] === 'photos_to_delete') {
          console.log(pair[0], pair[1]); // This should be a JSON string
        } else {
          console.log(pair[0], pair[1] instanceof File ? `File: ${pair[1].name}` : pair[1]);
        }
      }

      const response = await axios.put(
        `${process.env.REACT_APP_BASE_URL}/updateRew/${rewData.id}`,
        formData,
        {
          ...token,
          headers: {
            ...token.headers,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.status === 200) {
        toast.success(response.data.message || "REW updated successfully");
        dispatch(changeApistate());
        
        // Refresh the REW list
        dispatch(getRew({ navigate }));

        // Clean up preview URLs
        previewUrls.forEach(url => URL.revokeObjectURL(url));

        if (onSuccess) {
          onSuccess();
        }

        // Close the modal
        const modal = window.bootstrap.Modal.getInstance(document.getElementById('editRewModal'));
        if (modal) modal.hide();
      }
    } catch (error) {
      console.error("Error updating REW:", error);
      console.error("Error response:", error.response?.data);
      if (error?.response?.data?.status === 302) {
        navigate("/");
        window.location.reload(false);
      }
      toast.error(error?.response?.data?.message || "Failed to update REW");
    } finally {
      dispatch(setLoader(false));
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateRew();
  };

  const handleClose = () => {
    // Clean up preview URLs
    previewUrls.forEach(url => URL.revokeObjectURL(url));
    const modal = window.bootstrap.Modal.getInstance(document.getElementById('editRewModal'));
    if (modal) modal.hide();
  };

  if (!rewData) return null;

  const totalPhotos = existingPhotos.length + selectedFiles.length;

  return (
    <div className="box">
      <div className="box-header with-border">
        <h4 className="box-title">Edit REW: {rewData.rew_name}</h4>
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

          {/* Existing Photos Section */}
          {existingPhotos.length > 0 && (
            <div className="form-group">
              <label className="form-label">
                Current Photos ({existingPhotos.length}/5)
              </label>
              <div className="image-preview-container">
                {existingPhotos.map((photo, index) => (
                  <div key={index} className="image-preview-item existing">
                    <img
                      src={buildImageUrl(photo)}
                      alt={`Existing ${index + 1}`}
                      className="preview-image"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/placeholder-image.jpg';
                      }}
                    />
                    <button
                      type="button"
                      className="btn-remove-image"
                      onClick={() => removeExistingPhoto(photo)}
                      title="Remove this photo"
                    >
                      <i className="fa-solid fa-times"></i>
                    </button>
                    <span className="image-index">{index + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Photo Upload Field */}
          <div className="form-group">
            <label className="form-label">
              Add New Photos ({totalPhotos}/5 used, {5 - totalPhotos} remaining)
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
                disabled={totalPhotos >= 5}
              />
            </div>
            <small className="text-muted">
              Supported formats: JPEG, PNG, GIF, WEBP (Max 5MB each)
            </small>
          </div>

          {/* New Image Previews */}
          {previewUrls.length > 0 && (
            <div className="form-group">
              <label className="form-label">New Photos to Add ({previewUrls.length})</label>
              <div className="image-preview-container">
                {previewUrls.map((url, index) => (
                  <div key={index} className="image-preview-item new">
                    <img
                      src={url}
                      alt={`New Preview ${index + 1}`}
                      className="preview-image"
                    />
                    <button
                      type="button"
                      className="btn-remove-image"
                      onClick={() => removeNewFile(index)}
                    >
                      <i className="fa-solid fa-times"></i>
                    </button>
                    <span className="image-index">{index + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Photos to Delete Summary */}
          {photosToDelete.length > 0 && (
            <div className="form-group">
              <div className="photo-summary alert alert-warning">
                <p className="mb-0">
                  <i className="fa-solid fa-trash-can me-2"></i>
                  <strong>{photosToDelete.length}</strong> photo(s) marked for deletion
                </p>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary mt-2"
                  onClick={() => {
                    // Restore all deleted photos
                    setExistingPhotos(prev => [...prev, ...photosToDelete]);
                    setPhotosToDelete([]);
                  }}
                >
                  <i className="fa-solid fa-undo me-1"></i>
                  Undo all
                </button>
              </div>
            </div>
          )}

          <div className="box-footer" style={{ padding: "1rem 0 0 0" }}>
            <div className="d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleClose}
                disabled={isLoading}
              >
                <i className="ti-close me-2"></i>
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={!rewInfo.rew_name || rewInfo.rew_name.trim() === "" || isLoading}
              >
                {isLoading ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin me-2"></i>
                    Updating...
                  </>
                ) : (
                  <>
                    <i className="ti-save-alt me-2"></i>
                    Update REW
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Styles */}
      <style jsx>{`
        .image-preview-container {
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
          margin-top: 10px;
        }
        
        .image-preview-item {
          position: relative;
          width: 100px;
          height: 100px;
          border: 1px solid #ddd;
          border-radius: 4px;
          overflow: hidden;
        }
        
        .preview-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .btn-remove-image {
          position: absolute;
          top: 5px;
          right: 5px;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: rgba(255, 0, 0, 0.8);
          color: white;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 12px;
          z-index: 10;
        }
        
        .btn-remove-image:hover {
          background: red;
        }
        
        .image-index {
          position: absolute;
          bottom: 5px;
          left: 5px;
          background: rgba(0, 0, 0, 0.6);
          color: white;
          padding: 2px 6px;
          border-radius: 10px;
          font-size: 10px;
          z-index: 10;
        }
        
        .image-preview-item.existing {
          border-color: #28a745;
          border-width: 2px;
        }
        
        .image-preview-item.new {
          border-color: #007bff;
          border-width: 2px;
        }
        
        .photo-summary {
          padding: 10px;
          border-radius: 4px;
          font-size: 14px;
        }
        
        .btn-outline-secondary {
          color: #6c757d;
          border-color: #6c757d;
        }
        
        .btn-outline-secondary:hover {
          color: #fff;
          background-color: #6c757d;
          border-color: #6c757d;
        }
      `}</style>
    </div>
  );
};

export default EditRew;