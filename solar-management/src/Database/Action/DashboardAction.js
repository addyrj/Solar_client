//DashboardAction.js
import { 
  FILTER_SOLAR_CHARGER, 
  GET_INTERNATIONAL_DONOR, 
DELETE_DONOR,
CREATE_DONOR,
UPDATE_DONOR,
GET_DONOR_BY_ID,
SET_DONOR_BY_ID ,
  GET_INTERNATIONAL_PARTNER, 
  GET_MOBILE_DEVICE, 
  GET_NEW_DEVICE_LIST,
  GET_SOLAR_CHARGER, 
  GET_SOLAR_LOCAL_DEVICE, 
  GET_USER_DEVICE,
  UPLOAD_SOLAR_DATA,
  CREATE_NEW_DEVICE,
  UPDATE_NEW_DEVICE,
  DELETE_NEW_DEVICE,
  GET_ADMINS,
  CREATE_ADMIN,
  UPDATE_ADMIN,
  DELETE_ADMIN,
  GET_UNREGISTERED_DEVICES,
  GET_REW,
  CREATE_REW,
  UPDATE_REW,
  DELETE_REW

} from "../Constant/DashboardConstant"

export const getSolarCharger = (item) => {
    return {
        type: GET_SOLAR_CHARGER,
        data: item
    }
}
export const createDonor = (formData, navigate) => {
  return {
    type: CREATE_DONOR,
    payload: { formData, navigate }
  };
};

export const updateDonor = (id, formData, navigate) => {
  return {
    type: UPDATE_DONOR,
    payload: { id, formData, navigate }
  };
};

export const getDonorById = (id) => {
  return {
    type: GET_DONOR_BY_ID,
    payload: { id }
  };
};
export const deleteDonor = (id, navigate) => {
  return {
    type: DELETE_DONOR,
    payload: { id, navigate }
  };
};

// export const getSolarLocalDevice = (item) => {
//     return {
//         type: GET_SOLAR_LOCAL_DEVICE,
//         data: item
//     }
// }

export const filterSolarCharger = (item) => {
    return {
        type: FILTER_SOLAR_CHARGER,
        payload: item
    }
}

export const getInternationPartner = (item) => {
    return {
        type: GET_INTERNATIONAL_PARTNER,
        data: item
    }
}

export const getInternationalDonor = (item) => {
    return {
        type: GET_INTERNATIONAL_DONOR,
        data: item
    }
}

export const getMobileDevice = (item) => {
    return {
        type: GET_MOBILE_DEVICE,
        data: item
    }
}

export const getUserDevice = (item) => {
    return {
        type: GET_USER_DEVICE,
        data: item
    }
}

export const getNewDeviceList = (item) => {
    return {
        type: GET_NEW_DEVICE_LIST,
        data: item
    }
}

export const createNewDevice = (item) => {
    return {
        type: CREATE_NEW_DEVICE,
        data: item
    }
}

// Fixed action creators
export const updateNewDevice = (id, data, navigate) => ({
  type: UPDATE_NEW_DEVICE,
  payload: { id, data, navigate }
});

export const deleteNewDevice = (id, navigate) => ({
  type: DELETE_NEW_DEVICE,
  payload: { id, navigate }
});

export const uploadSolarData = (payload) => ({
  type: UPLOAD_SOLAR_DATA,
  payload
});
// Add these action creators
export const getAdmins = (item) => {
  return {
    type: GET_ADMINS,
    data: item
  }
}

export const createAdmin = (adminData, navigate) => {
  return {
    type: CREATE_ADMIN,
    payload: { adminData, navigate }
  }
}

export const updateAdmin = (id, adminData, navigate) => {
  return {
    type: UPDATE_ADMIN,
    payload: { id, adminData, navigate }
  }
}

export const deleteAdmin = (id, navigate) => {
  return {
    type: DELETE_ADMIN,
    payload: { id, navigate }
  }
}
// Add this with your other action creators
export const getUnregisteredDevices = (item) => {
    return {
        type: GET_UNREGISTERED_DEVICES,
        data: item
    }
}
// Add these action creators
export const getRew = (item) => {
  return {
    type: GET_REW,
    data: item
  }
}

export const createRew = (formData, navigate) => {
  return {
    type: CREATE_REW,
    payload: { formData, navigate }
  }
}

export const updateRew = (id, formData, navigate) => {
  return {
    type: UPDATE_REW,
    payload: { id, formData, navigate }
  }
}

export const deleteRew = (id, navigate) => {
  return {
    type: DELETE_REW,
    payload: { id, navigate }
  }
}




