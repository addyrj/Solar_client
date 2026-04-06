
// Database/Saga/DashboardSaga.js
/* eslint-disable require-yield */
import { put, takeEvery, call } from "redux-saga/effects";
import toast from "react-hot-toast";
import axios from "axios";
import {
  SET_UNREGISTERED_DEVICES,
  GET_NEW_DEVICE_LIST,
  SET_NEW_DEVICE_LIST,
  CREATE_NEW_DEVICE,
  GET_INTERNATIONAL_DONOR,
  GET_INTERNATIONAL_PARTNER,
  GET_MOBILE_DEVICE,
  GET_SOLAR_CHARGER,
  GET_SOLAR_LOCAL_DEVICE,
  GET_USER_DEVICE,
  SET_INTERNATIONAL_DONOR,
  SET_INTERNATIONAL_PARTNER,
  SET_MOBILE_DEVICE,
  SET_SOLAR_CHARGER,
  CREATE_DONOR,
  UPDATE_DONOR,
  GET_DONOR_BY_ID,
  SET_DONOR_BY_ID,
  SET_SOLAR_LOCAL_DEVICE,
  SET_SOLAR_LOCAL_DEVICE_FILTER_COLUMN,
  SET_USER_DEVICE,
  UPLOAD_SOLAR_DATA,
  UPLOAD_SOLAR_DATA_SUCCESS,
  UPLOAD_SOLAR_DATA_FAIL,
  UPDATE_NEW_DEVICE,
  DELETE_NEW_DEVICE,
  DELETE_DONOR,
  GET_ADMINS,
  SET_ADMINS,
  CREATE_ADMIN,
  UPDATE_ADMIN,
  DELETE_ADMIN,
  GET_UNREGISTERED_DEVICES,
  GET_REW,
  SET_REW,
  CREATE_REW,
  UPDATE_REW,
  DELETE_REW
} from "../Constant/DashboardConstant";
import { SET_LOADER } from "../Constant/constant";
import { getHeaderWithToken, handleTokenExpiration } from "../Utils";
import { changeCreateModalStata } from "../Action/ConstantAction";

function* handleApiError(error, action, customMessage) {
  console.error("API Error:", error);
  
  // Handle token expiration - this will redirect to login
  const handled = handleTokenExpiration(error);
  
  if (!handled) {
    // Show error message only if not token expiration (which already shows its own message)
    if (error?.response?.data?.status !== 400 && error?.response?.data?.status !== 300) {
      toast.error(error?.response?.data?.message || customMessage || error.message);
    }
  }
  
  return handled;
}

function* uploadSolarDataSaga(action) {
  try {
    yield put({ type: SET_LOADER, payload: true });
    const token = yield call(getHeaderWithToken);
    
    const response = yield call(
      axios.post, 
      process.env.REACT_APP_BASE_URL + "/createSolarCharger",
      action.payload,
      token
    );
    
    if (response.data.status === 200) {
      yield put({ type: SET_LOADER, payload: false });
      yield put({ 
        type: UPLOAD_SOLAR_DATA_SUCCESS,
        payload: response.data
      });
      yield put({ 
        type: GET_SOLAR_LOCAL_DEVICE,
        data: { navigate: action.payload.navigate }
      });
      toast.success(`Successfully uploaded ${response.data.inserted} records`);
    } else {
      throw new Error(response.data.message || "Upload failed");
    }
  } catch (error) {
    yield put({ type: SET_LOADER, payload: false });
    yield put({
      type: UPLOAD_SOLAR_DATA_FAIL,
      payload: error.message
    });
    
    yield call(handleApiError, error, action, "Upload failed");
  }
}

function* getNewDeviceListSaga(action) {
  try {
    const token = yield call(getHeaderWithToken);
    yield put({ type: SET_LOADER, payload: true });
    let response = yield axios.get(
      process.env.REACT_APP_BASE_URL + "/getNewDeviceList",
      token
    );
    if (response.data.status === 200) {
      yield put({ type: SET_LOADER, payload: false });
      yield put({ type: SET_NEW_DEVICE_LIST, payload: response.data.info || [] });
    } else {
      yield put({ type: SET_NEW_DEVICE_LIST, payload: [] });
    }
  } catch (error) {
    yield put({ type: SET_LOADER, payload: false });
    yield put({ type: SET_NEW_DEVICE_LIST, payload: [] });
    
    yield call(handleApiError, error, action, "Failed to fetch devices");
  }
}

function* createNewDeviceSaga(action) {
  try {
    const token = yield call(getHeaderWithToken);
    yield put({ type: SET_LOADER, payload: true });
    let response = yield axios.post(
      process.env.REACT_APP_BASE_URL + "/createNewDevice",
      action.data.payload,
      token
    );
    if (response.data.status === 200) {
      yield put({ type: SET_LOADER, payload: false });
      toast.success(response.data.message || "Device created successfully");
      yield put({ type: GET_NEW_DEVICE_LIST, data: action.data });
    }
  } catch (error) {
    yield put({ type: SET_LOADER, payload: false });
    
    yield call(handleApiError, error, action, "Failed to create device");
  }
}

function* updateNewDeviceSaga(action) {
  try {
    const { id, data, navigate } = action.payload;
    const tokenConfig = yield call(getHeaderWithToken);

    yield put({ type: SET_LOADER, payload: true });

    const response = yield call(
      axios.put,
      `${process.env.REACT_APP_BASE_URL}/updateNewDevice/${id}`,
      data,
      tokenConfig
    );

    if (response.data.status === 200) {
      yield put({ type: SET_LOADER, payload: false });
      toast.success(response.data.message || "Device updated successfully");

      yield put({ type: GET_NEW_DEVICE_LIST, data: { navigate } });

      yield put(
        changeCreateModalStata({
          openState: "false",
          screenName: "NewChargerController",
        })
      );
    }
  } catch (error) {
    yield put({ type: SET_LOADER, payload: false });
    
    yield call(handleApiError, error, action, "Failed to update device");
  }
}

function* deleteNewDeviceSaga(action) {
  try {
    const { id, navigate } = action.payload;
    const token = yield call(getHeaderWithToken);
    yield put({ type: SET_LOADER, payload: true });
    
    const response = yield call(
      axios.delete,
      `${process.env.REACT_APP_BASE_URL}/deleteNewDevice/${id}`,
      token
    );
    
    if (response.data.status === 200) {
      yield put({ type: SET_LOADER, payload: false });
      toast.success(response.data.message || "Device deleted successfully");
      yield put({ type: GET_NEW_DEVICE_LIST, data: { navigate } });
    }
  } catch (error) {
    yield put({ type: SET_LOADER, payload: false });
    
    yield call(handleApiError, error, action, "Failed to delete device");
  }
}

function* getSolarCharger(action) {
    try {
        const token = yield call(getHeaderWithToken);
        yield put({ type: SET_LOADER, payload: true });
        let response = yield axios.get(
            process.env.REACT_APP_BASE_URL + "/getSolarCharger",
            token
        );
        if (response.data.status === 200) {
            yield put({ type: SET_LOADER, payload: false });
            yield put({ type: SET_SOLAR_CHARGER, payload: response.data.info || [] });
        } else {
            yield put({ type: SET_SOLAR_CHARGER, payload: [] });
        }
    } catch (error) {
        yield put({ type: SET_LOADER, payload: false });
        yield put({ type: SET_SOLAR_CHARGER, payload: [] });
        
        yield call(handleApiError, error, action, "Failed to fetch solar data");
    }
}

function* getPartner(action) {
    try {
        const token = yield call(getHeaderWithToken);
        yield put({ type: SET_LOADER, payload: true });
        let response = yield axios.get(
            process.env.REACT_APP_BASE_URL + "/getInternationPartner",
            token
        );
        if (response.data.status === 200) {
            yield put({ type: SET_LOADER, payload: false });
            yield put({ type: SET_INTERNATIONAL_PARTNER, payload: response.data.info || [] });
        } else {
            yield put({ type: SET_INTERNATIONAL_PARTNER, payload: [] });
        }
    } catch (error) {
        yield put({ type: SET_LOADER, payload: false });
        yield put({ type: SET_INTERNATIONAL_PARTNER, payload: [] });
        
        yield call(handleApiError, error, action, "Failed to fetch partners");
    }
}

function* deleteDonorSaga(action) {
  try {
    const { id, navigate } = action.payload;
    const token = yield call(getHeaderWithToken);
    yield put({ type: SET_LOADER, payload: true });

    const response = yield call(
      axios.delete,
      `${process.env.REACT_APP_BASE_URL}/deleteDonor/${id}`,
      token
    );

    if (response.data.status === 200) {
      yield put({ type: SET_LOADER, payload: false });
      toast.success(response.data.message || "Donor deleted successfully");
      
      yield put({ type: GET_INTERNATIONAL_DONOR, data: { navigate } });
    }
  } catch (error) {
    yield put({ type: SET_LOADER, payload: false });
    
    yield call(handleApiError, error, action, "Failed to delete donor");
  }
}

function* getDonor(action) {
    try {
        const token = yield call(getHeaderWithToken);
        yield put({ type: SET_LOADER, payload: true });
        let response = yield axios.get(
            process.env.REACT_APP_BASE_URL + "/getDonor",
            token
        );
        if (response.data.status === 200) {
            yield put({ type: SET_LOADER, payload: false });
            yield put({ type: SET_INTERNATIONAL_DONOR, payload: response.data.info || [] });
        } else {
            yield put({ type: SET_INTERNATIONAL_DONOR, payload: [] });
        }
    } catch (error) {
        yield put({ type: SET_LOADER, payload: false });
        yield put({ type: SET_INTERNATIONAL_DONOR, payload: [] });
        
        yield call(handleApiError, error, action, "Failed to fetch donors");
    }
}

function* getMobileDevice(action) {
    try {
        const token = yield call(getHeaderWithToken);
        yield put({ type: SET_LOADER, payload: true });
        let response = yield axios.get(
            process.env.REACT_APP_BASE_URL + "/getMobileDevice",
            token
        );
        if (response.data.status === 200) {
            yield put({ type: SET_LOADER, payload: false });
            yield put({ type: SET_MOBILE_DEVICE, payload: response.data.info || [] });
        } else {
            yield put({ type: SET_MOBILE_DEVICE, payload: [] });
        }
    } catch (error) {
        yield put({ type: SET_LOADER, payload: false });
        yield put({ type: SET_MOBILE_DEVICE, payload: [] });
        
        yield call(handleApiError, error, action, "Failed to fetch mobile devices");
    }
}

function* getUserDevice(action) {
    try {
        const token = yield call(getHeaderWithToken);
        yield put({ type: SET_LOADER, payload: true });
        let response = yield axios.get(
            process.env.REACT_APP_BASE_URL + "/getUserDevice",
            token
        );
        if (response.data.status === 200) {
            yield put({ type: SET_LOADER, payload: false });
            yield put({ type: SET_USER_DEVICE, payload: response.data.info || [] });
        } else {
            yield put({ type: SET_USER_DEVICE, payload: [] });
        }
    } catch (error) {
        yield put({ type: SET_LOADER, payload: false });
        yield put({ type: SET_USER_DEVICE, payload: [] });
        
        yield call(handleApiError, error, action, "Failed to fetch users");
    }
}

function* getAdminsSaga(action) {
  try {
    const token = yield call(getHeaderWithToken);
    yield put({ type: SET_LOADER, payload: true });
    let response = yield axios.get(
      process.env.REACT_APP_BASE_URL + "/getAdmins",
      token
    );
    if (response.data.status === 200) {
      yield put({ type: SET_LOADER, payload: false });
      yield put({ type: SET_ADMINS, payload: response.data.data || [] });
    } else {
      yield put({ type: SET_ADMINS, payload: [] });
    }
  } catch (error) {
    yield put({ type: SET_LOADER, payload: false });
    yield put({ type: SET_ADMINS, payload: [] });
    
    yield call(handleApiError, error, action, "Failed to fetch admins");
  }
}

function* createAdminSaga(action) {
  try {
    const { adminData, navigate } = action.payload;
    const token = yield call(getHeaderWithToken);
    yield put({ type: SET_LOADER, payload: true });

    let response = yield axios.post(
      process.env.REACT_APP_BASE_URL + "/createAdmin",
      adminData,
      token
    );

    if (response.data.status === 200) {
      yield put({ type: SET_LOADER, payload: false });
      toast.success(response.data.message || "Admin created successfully");
      yield put({ type: GET_ADMINS, data: { navigate } });

      yield put(changeCreateModalStata({
        openState: "false",
        screenName: "Administrator"
      }));
    }
  } catch (error) {
    yield put({ type: SET_LOADER, payload: false });
    
    yield call(handleApiError, error, action, "Failed to create admin");
  }
}

function* updateAdminSaga(action) {
  try {
    const { id, adminData, navigate } = action.payload;
    const token = yield call(getHeaderWithToken);
    yield put({ type: SET_LOADER, payload: true });

    let response = yield axios.put(
      `${process.env.REACT_APP_BASE_URL}/updateAdmin/${id}`,
      adminData,
      token
    );

    if (response.data.status === 200) {
      yield put({ type: SET_LOADER, payload: false });
      toast.success(response.data.message || "Admin updated successfully");
      yield put({ type: GET_ADMINS, data: { navigate } });

      yield put(changeCreateModalStata({
        openState: "false",
        screenName: "Administrator"
      }));
    }
  } catch (error) {
    yield put({ type: SET_LOADER, payload: false });
    
    yield call(handleApiError, error, action, "Failed to update admin");
  }
}

function* getUnregisteredDevicesSaga(action) {
    try {
        const token = yield call(getHeaderWithToken);
        yield put({ type: SET_LOADER, payload: true });
        let response = yield axios.get(
            process.env.REACT_APP_BASE_URL + "/getUnregisteredDevices",
            token
        );
        if (response.data.status === 200) {
            yield put({ type: SET_LOADER, payload: false });
            yield put({ type: SET_UNREGISTERED_DEVICES, payload: response.data.devices || [] });
        } else {
            yield put({ type: SET_UNREGISTERED_DEVICES, payload: [] });
        }
    } catch (error) {
        yield put({ type: SET_LOADER, payload: false });
        yield put({ type: SET_UNREGISTERED_DEVICES, payload: [] });
        
        yield call(handleApiError, error, action, "Failed to fetch unregistered devices");
    }
}

function* deleteAdminSaga(action) {
  try {
    const { id, navigate } = action.payload;
    const token = yield call(getHeaderWithToken);
    yield put({ type: SET_LOADER, payload: true });

    let response = yield axios.delete(
      `${process.env.REACT_APP_BASE_URL}/deleteAdmin/${id}`,
      token
    );

    if (response.data.status === 200) {
      yield put({ type: SET_LOADER, payload: false });
      toast.success(response.data.message || "Admin deleted successfully");
      yield put({ type: GET_ADMINS, data: { navigate } });
    }
  } catch (error) {
    yield put({ type: SET_LOADER, payload: false });
    
    yield call(handleApiError, error, action, "Failed to delete admin");
  }
}

function* getRewSaga(action) {
  try {
    const token = yield call(getHeaderWithToken);
    yield put({ type: SET_LOADER, payload: true });
    let response = yield axios.get(
      process.env.REACT_APP_BASE_URL + "/getAllRew",
      token
    );
    if (response.data.status === 200) {
      yield put({ type: SET_LOADER, payload: false });
      yield put({ type: SET_REW, payload: response.data.data || [] });
    } else {
      yield put({ type: SET_REW, payload: [] });
    }
  } catch (error) {
    yield put({ type: SET_LOADER, payload: false });
    yield put({ type: SET_REW, payload: [] });
    
    yield call(handleApiError, error, action, "Failed to fetch REW data");
  }
}

function* createRewSaga(action) {
  try {
    const { formData, navigate } = action.payload;
    const token = yield call(getHeaderWithToken);
    yield put({ type: SET_LOADER, payload: true });

    let response = yield axios.post(
      process.env.REACT_APP_BASE_URL + "/createRew",
      formData,
      token
    );

    if (response.data.status === 201) {
      yield put({ type: SET_LOADER, payload: false });
      toast.success(response.data.message || "REW created successfully");
      yield put({ type: GET_REW, data: { navigate } });

      yield put(changeCreateModalStata({
        openState: "false",
        screenName: "Rew"
      }));
    }
  } catch (error) {
    yield put({ type: SET_LOADER, payload: false });
    
    yield call(handleApiError, error, action, "Failed to create REW");
  }
}

function* updateRewSaga(action) {
  try {
    const { id, formData, navigate } = action.payload;
    const token = yield call(getHeaderWithToken);
    yield put({ type: SET_LOADER, payload: true });

    let response = yield axios.put(
      `${process.env.REACT_APP_BASE_URL}/updateRew/${id}`,
      formData,
      token
    );

    if (response.data.status === 200) {
      yield put({ type: SET_LOADER, payload: false });
      toast.success(response.data.message || "REW updated successfully");
      yield put({ type: GET_REW, data: { navigate } });

      yield put(changeCreateModalStata({
        openState: "false",
        screenName: "Rew"
      }));
    }
  } catch (error) {
    yield put({ type: SET_LOADER, payload: false });
    
    yield call(handleApiError, error, action, "Failed to update REW");
  }
}

function* deleteRewSaga(action) {
  try {
    const { id, navigate } = action.payload;
    const token = yield call(getHeaderWithToken);
    yield put({ type: SET_LOADER, payload: true });

    let response = yield axios.delete(
      `${process.env.REACT_APP_BASE_URL}/deleteRew/${id}`,
      token
    );

    if (response.data.status === 200) {
      yield put({ type: SET_LOADER, payload: false });
      toast.success(response.data.message || "REW deleted successfully");
      yield put({ type: GET_REW, data: { navigate } });
    }
  } catch (error) {
    yield put({ type: SET_LOADER, payload: false });
    
    yield call(handleApiError, error, action, "Failed to delete REW");
  }
}

function* createDonorSaga(action) {
  try {
    const { formData, navigate } = action.payload;
    const token = yield call(getHeaderWithToken);
    yield put({ type: SET_LOADER, payload: true });

    const response = yield call(
      axios.post,
      process.env.REACT_APP_BASE_URL + "/createInternationalDonor",
      formData,
      token
    );

    if (response.data.status === 200) {
      yield put({ type: SET_LOADER, payload: false });
      toast.success(response.data.message || "Donor created successfully");
      
      yield put({ type: GET_INTERNATIONAL_DONOR, data: { navigate } });
      
      yield put(changeCreateModalStata({
        openState: "false",
        screenName: "Donor"
      }));
    }
  } catch (error) {
    yield put({ type: SET_LOADER, payload: false });
    
    yield call(handleApiError, error, action, "Failed to create donor");
  }
}

function* updateDonorSaga(action) {
  try {
    const { id, formData, navigate } = action.payload;
    const token = yield call(getHeaderWithToken);
    yield put({ type: SET_LOADER, payload: true });

    const response = yield call(
      axios.put,
      `${process.env.REACT_APP_BASE_URL}/updateDonor/${id}`,
      formData,
      token
    );

    if (response.data.status === 200) {
      yield put({ type: SET_LOADER, payload: false });
      toast.success(response.data.message || "Donor updated successfully");
      
      yield put({ type: GET_INTERNATIONAL_DONOR, data: { navigate } });
      
      yield put(changeCreateModalStata({
        openState: "false",
        screenName: "Donor"
      }));
    }
  } catch (error) {
    yield put({ type: SET_LOADER, payload: false });
    
    yield call(handleApiError, error, action, "Failed to update donor");
  }
}

function* getDonorByIdSaga(action) {
  try {
    const { id } = action.payload;
    const token = yield call(getHeaderWithToken);
    yield put({ type: SET_LOADER, payload: true });

    const response = yield call(
      axios.get,
      `${process.env.REACT_APP_BASE_URL}/getDonor/${id}`,
      token
    );

    if (response.data.status === 200) {
      yield put({ type: SET_LOADER, payload: false });
      yield put({ 
        type: SET_DONOR_BY_ID, 
        payload: response.data.info 
      });
    }
  } catch (error) {
    yield put({ type: SET_LOADER, payload: false });
    
    yield call(handleApiError, error, action, "Failed to fetch donor");
  }
}

function* DashboardSaga() {
  yield takeEvery(GET_SOLAR_CHARGER, getSolarCharger);
  yield takeEvery(GET_INTERNATIONAL_PARTNER, getPartner);
  yield takeEvery(GET_INTERNATIONAL_DONOR, getDonor);
  yield takeEvery(GET_MOBILE_DEVICE, getMobileDevice);
  yield takeEvery(GET_USER_DEVICE, getUserDevice);
  yield takeEvery(GET_NEW_DEVICE_LIST, getNewDeviceListSaga);
  yield takeEvery(CREATE_NEW_DEVICE, createNewDeviceSaga);
  yield takeEvery(UPLOAD_SOLAR_DATA, uploadSolarDataSaga);
  yield takeEvery(UPDATE_NEW_DEVICE, updateNewDeviceSaga);
  yield takeEvery(DELETE_NEW_DEVICE, deleteNewDeviceSaga);
  
  yield takeEvery(GET_ADMINS, getAdminsSaga);
  yield takeEvery(CREATE_ADMIN, createAdminSaga);
  yield takeEvery(UPDATE_ADMIN, updateAdminSaga);
  yield takeEvery(DELETE_ADMIN, deleteAdminSaga);
  yield takeEvery(GET_UNREGISTERED_DEVICES, getUnregisteredDevicesSaga);
  yield takeEvery(GET_REW, getRewSaga);
  yield takeEvery(CREATE_REW, createRewSaga);
  yield takeEvery(UPDATE_REW, updateRewSaga);
  yield takeEvery(DELETE_REW, deleteRewSaga);
  yield takeEvery(DELETE_DONOR, deleteDonorSaga); 
  yield takeEvery(CREATE_DONOR, createDonorSaga);
  yield takeEvery(UPDATE_DONOR, updateDonorSaga);
  yield takeEvery(GET_DONOR_BY_ID, getDonorByIdSaga);
}

export default DashboardSaga;
