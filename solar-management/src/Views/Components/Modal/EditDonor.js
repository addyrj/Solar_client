import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { updateDonor } from '../../../Database/Action/DashboardAction';

const EditDonor = ({ donorData, onSuccess, onCancel }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [donorInfo, setDonorInfo] = useState({
    country: '',
    organisation: '',
    mobile: '',
    email: '',
    website: '',
  });

  const [logoPreview, setLogoPreview] = useState('');
  const [logoFile, setLogoFile] = useState(null);

  useEffect(() => {
    if (donorData) {
      setDonorInfo({
        country: donorData.Country || '',
        organisation: donorData.DonarOrganisation || '',
        mobile: donorData.Mobile?.trim() || '',
        email: donorData.Email?.trim() || '',
        website: donorData.Website?.trim() || '',
      });
      
      if (donorData.Logo) {
        setLogoPreview(donorData.Logo);
      }
    }
  }, [donorData]);

  const handleChange = (e) => {
    setDonorInfo({ ...donorInfo, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!donorInfo.country?.trim()) {
      toast.error('Country is required');
      return;
    }
    if (!donorInfo.organisation?.trim()) {
      toast.error('Organisation name is required');
      return;
    }
    if (!donorInfo.mobile?.trim()) {
      toast.error('Mobile number is required');
      return;
    }
    if (!donorInfo.email?.trim()) {
      toast.error('Email is required');
      return;
    }

    const formData = new FormData();
    
    formData.append("country", donorInfo.country);
    formData.append("organisation", donorInfo.organisation);
    formData.append("mobile", donorInfo.mobile);
    formData.append("email", donorInfo.email);
    formData.append("website", donorInfo.website || '');
    
    if (logoFile) {
      formData.append("logo", logoFile);
    }

    if (donorData?.ID) {
      dispatch(updateDonor(donorData.ID, formData, navigate));
      if (onSuccess) onSuccess();
    }
  };

  return (
    <div className="box">
      <form onSubmit={handleSubmit}>
        <div className="box-body">
          <div className="form-group">
            <label className="form-label">Country <span className="text-danger">*</span></label>
            <div className="input-group mb-3">
              <span className="input-group-text">
                <i className="fa-solid fa-flag"></i>
              </span>
              <input 
                type="text" 
                className="form-control" 
                name="country" 
                value={donorInfo.country} 
                onChange={handleChange}
                placeholder="e.g., Canada14"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Organisation <span className="text-danger">*</span></label>
            <div className="input-group mb-3">
              <span className="input-group-text">
                <i className="fa-solid fa-building"></i>
              </span>
              <input 
                type="text" 
                className="form-control" 
                name="organisation" 
                value={donorInfo.organisation} 
                onChange={handleChange}
                placeholder="e.g., test1"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Mobile <span className="text-danger">*</span></label>
            <div className="input-group mb-3">
              <span className="input-group-text">
                <i className="fa-solid fa-phone"></i>
              </span>
              <input 
                type="tel" 
                className="form-control" 
                name="mobile" 
                value={donorInfo.mobile} 
                onChange={handleChange}
                placeholder="e.g., 1987654321"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email <span className="text-danger">*</span></label>
            <div className="input-group mb-3">
              <span className="input-group-text">
                <i className="fa-solid fa-envelope"></i>
              </span>
              <input 
                type="email" 
                className="form-control" 
                name="email" 
                value={donorInfo.email} 
                onChange={handleChange}
                placeholder="e.g., ad@gmail.com"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Website</label>
            <div className="input-group mb-3">
              <span className="input-group-text">
                <i className="fa-solid fa-globe"></i>
              </span>
              <input 
                type="url" 
                className="form-control" 
                name="website" 
                value={donorInfo.website} 
                onChange={handleChange}
                placeholder="e.g., https://c12anadiansolar.com"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Logo (Image only)</label>
            <div className="input-group mb-3">
              <span className="input-group-text">
                <i className="fa-solid fa-image"></i>
              </span>
              <input 
                type="file" 
                className="form-control" 
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
            {logoPreview && (
              <div className="mt-2 text-center">
                <img 
                  src={logoPreview} 
                  alt="Preview" 
                  style={{ 
                    maxWidth: '150px', 
                    maxHeight: '80px', 
                    objectFit: 'contain',
                    border: '1px solid #dee2e6',
                    borderRadius: '4px',
                    padding: '4px'
                  }}
                />
              </div>
            )}
          </div>
        </div>

        <div
          className="box-footer"
          style={{
            float: "right",
            width: "auto",
            borderColor: "transparent",
            padding: "15px 0"
          }}
        >
          <button
            type="button"
            className="btn btn-primary-light me-1"
            onClick={onCancel}
          >
            <i className="ti-trash" /> Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            <i className="ti-save-alt" /> Update
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditDonor;