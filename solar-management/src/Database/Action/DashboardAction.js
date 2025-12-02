import { 
  FILTER_SOLAR_CHARGER, 
  GET_INTERNATIONAL_DONOR, 
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
  DELETE_ADMIN

} from "../Constant/DashboardConstant"

export const getSolarCharger = (item) => {
    return {
        type: GET_SOLAR_CHARGER,
        data: item
    }
}

export const getSolarLocalDevice = (item) => {
    return {
        type: GET_SOLAR_LOCAL_DEVICE,
        data: item
    }
}

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



// import { 
//   FILTER_SOLAR_CHARGER, 
//   GET_INTERNATIONAL_DONOR, 
//   GET_INTERNATIONAL_PARTNER, 
//   GET_MOBILE_DEVICE, 
//   GET_NEW_DEVICE_LIST,
//   GET_SOLAR_CHARGER, 
//   GET_SOLAR_LOCAL_DEVICE, 
//   GET_USER_DEVICE,
//   UPLOAD_SOLAR_DATA,
//   CREATE_NEW_DEVICE,
//   UPDATE_NEW_DEVICE,
//   DELETE_NEW_DEVICE,
//   GET_ADMINS,
//   CREATE_ADMIN,
//   UPDATE_ADMIN,
//   DELETE_ADMIN,
//   GET_MQTT_STATUS,
//   GET_REALTIME_DATA


// } from "../Constant/DashboardConstant"

// export const getMQTTStatus = () => ({
//   type: GET_MQTT_STATUS
// });

// export const getRealtimeData = (deviceId = null) => ({
//   type: GET_REALTIME_DATA,
//   payload: { deviceId }
// });

// export const getSolarCharger = (item) => {
//     return {
//         type: GET_SOLAR_CHARGER,
//         data: item
//     }
// }

// export const getSolarLocalDevice = (item) => {
//     return {
//         type: GET_SOLAR_LOCAL_DEVICE,
//         data: item
//     }
// }

// export const filterSolarCharger = (item) => {
//     return {
//         type: FILTER_SOLAR_CHARGER,
//         payload: item
//     }
// }

// export const getInternationPartner = (item) => {
//     return {
//         type: GET_INTERNATIONAL_PARTNER,
//         data: item
//     }
// }

// export const getInternationalDonor = (item) => {
//     return {
//         type: GET_INTERNATIONAL_DONOR,
//         data: item
//     }
// }

// export const getMobileDevice = (item) => {
//     return {
//         type: GET_MOBILE_DEVICE,
//         data: item
//     }
// }

// export const getUserDevice = (item) => {
//     return {
//         type: GET_USER_DEVICE,
//         data: item
//     }
// }

// export const getNewDeviceList = (item) => {
//     return {
//         type: GET_NEW_DEVICE_LIST,
//         data: item
//     }
// }

// export const createNewDevice = (item) => {
//     return {
//         type: CREATE_NEW_DEVICE,
//         data: item
//     }
// }

// // Fixed action creators
// export const updateNewDevice = (id, data, navigate) => ({
//   type: UPDATE_NEW_DEVICE,
//   payload: { id, data, navigate }
// });

// export const deleteNewDevice = (id, navigate) => ({
//   type: DELETE_NEW_DEVICE,
//   payload: { id, navigate }
// });

// export const uploadSolarData = (payload) => ({
//   type: UPLOAD_SOLAR_DATA,
//   payload
// });
// // Add these action creators
// export const getAdmins = (item) => {
//   return {
//     type: GET_ADMINS,
//     data: item
//   }
// }

// export const createAdmin = (adminData, navigate) => {
//   return {
//     type: CREATE_ADMIN,
//     payload: { adminData, navigate }
//   }
// }

// export const updateAdmin = (id, adminData, navigate) => {
//   return {
//     type: UPDATE_ADMIN,
//     payload: { id, adminData, navigate }
//   }
// }

// export const deleteAdmin = (id, navigate) => {
//   return {
//     type: DELETE_ADMIN,
//     payload: { id, navigate }
//   }
// }

