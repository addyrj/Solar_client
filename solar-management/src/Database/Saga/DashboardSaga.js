/* eslint-disable require-yield */
import { put, takeEvery, call } from "redux-saga/effects";
import toast from "react-hot-toast";
import axios from "axios";
import {
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
  SET_SOLAR_LOCAL_DEVICE,
  SET_SOLAR_LOCAL_DEVICE_FILTER_COLUMN,
  SET_USER_DEVICE,
  UPLOAD_SOLAR_DATA,
  UPLOAD_SOLAR_DATA_SUCCESS,
  UPLOAD_SOLAR_DATA_FAIL,
  UPDATE_NEW_DEVICE,
  DELETE_NEW_DEVICE,
  // Admin-related constants
  GET_ADMINS,
  SET_ADMINS,
  CREATE_ADMIN,
  UPDATE_ADMIN,
  DELETE_ADMIN
} from "../Constant/DashboardConstant";
import { SET_LOADER } from "../Constant/constant";
import { getHeaderWithToken } from "../Utils";
import { changeCreateModalStata } from "../Action/ConstantAction";

function* uploadSolarDataSaga(action) {
  try {
    yield put({ type: SET_LOADER, payload: true });
    const token = getHeaderWithToken();
    
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
    
    console.error("Upload error:", error);
    if (error?.response?.data?.status === 302) {
      if (action.payload?.navigate) {
        action.payload.navigate("/");
      }
      window.location.reload();
    }
    toast.error(error?.response?.data?.message || error.message);
  }
}

function* getNewDeviceListSaga(action) {
  try {
    const token = getHeaderWithToken();
    yield put({ type: SET_LOADER, payload: true });
    let response = yield axios.get(
      process.env.REACT_APP_BASE_URL + "/getNewDeviceList",
      token
    );
    if (response.data.status === 200) {
      yield put({ type: SET_LOADER, payload: false });
      yield put({ type: SET_NEW_DEVICE_LIST, payload: response.data.info || [] }); // ✅ Ensure array
    } else {
      yield put({ type: SET_NEW_DEVICE_LIST, payload: [] }); // ✅ Set empty array on non-200 status
    }
  } catch (error) {
    yield put({ type: SET_LOADER, payload: false });
    yield put({ type: SET_NEW_DEVICE_LIST, payload: [] }); // ✅ Set empty array on error
    console.log("error is   ", error);
    if (error?.response?.data?.status === 302) {
      toast.error(error?.response?.data?.message || error.message);
      if (action.data?.navigate) {
        action.data.navigate("/");
      }
      window.location.reload();
    }
    if (error?.response?.data?.status !== 400) {
      toast.error(error?.response?.data?.message || error.message);
    }
  }
}

function* createNewDeviceSaga(action) {
  try {
    const token = getHeaderWithToken();
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
    console.log("error is   ", error);
    if (error?.response?.data?.status === 302) {
      toast.error(error?.response?.data?.message || error.message);
      if (action.data?.navigate) {
        action.data.navigate("/");
      }
      window.location.reload();
    }
    if (error?.response?.data?.status !== 400) {
      toast.error(error?.response?.data?.message || error.message);
    }
  }
}

function* updateNewDeviceSaga(action) {
  try {
    const { id, data, navigate } = action.payload;
    const tokenConfig = getHeaderWithToken();

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
    console.error("Update error:", error);

    if (error?.response?.data?.status === 302) {
      if (action.payload?.navigate) {
        action.payload.navigate("/");
      }
      window.location.reload();
    }

    toast.error(error?.response?.data?.message || "Failed to update device");
  }
}

function* deleteNewDeviceSaga(action) {
  try {
    const { id, navigate } = action.payload;
    const token = getHeaderWithToken();
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
    console.error("Delete error:", error);
    if (error?.response?.data?.status === 302) {
      if (action.payload?.navigate) {
        action.payload.navigate("/");
      }
      window.location.reload();
    }
    toast.error(error?.response?.data?.message || error.message);
  }
}

function* getSolarCharger(action) {
    const token = getHeaderWithToken();
    try {
        yield put({ type: SET_LOADER, payload: true });
        let response = yield axios.get(
            process.env.REACT_APP_BASE_URL + "/getSolarCharger",
            token
        );
        if (response.data.status === 200) {
            yield put({ type: SET_LOADER, payload: false });
            yield put({ type: SET_SOLAR_CHARGER, payload: response.data.info || [] }); // ✅ Ensure array
        } else {
            yield put({ type: SET_SOLAR_CHARGER, payload: [] }); // ✅ Set empty array on non-200 status
        }
    } catch (error) {
        yield put({ type: SET_LOADER, payload: false });
        yield put({ type: SET_SOLAR_CHARGER, payload: [] }); // ✅ Set empty array on error
        console.log("error is   ", error);
        if (error?.response?.data?.status === 302) {
            toast.error(error?.response?.data?.message || error.message);
            if (action.data?.navigate) {
                action.data.navigate("/");
            }
            window.location.reload();
        }
        if (error?.response?.data?.status !== 400) {
            toast.error(error?.response?.data?.message || error.message);
        }
    }
}

function* getPartner(action) {
    try {
        const token = getHeaderWithToken();
        yield put({ type: SET_LOADER, payload: true });
        let response = yield axios.get(
            process.env.REACT_APP_BASE_URL + "/getInternationPartner",
            token
        );
        if (response.data.status === 200) {
            yield put({ type: SET_LOADER, payload: false });
            yield put({ type: SET_INTERNATIONAL_PARTNER, payload: response.data.info || [] }); // ✅ Ensure array
        } else {
            yield put({ type: SET_INTERNATIONAL_PARTNER, payload: [] }); // ✅ Set empty array on non-200 status
        }
    } catch (error) {
        yield put({ type: SET_LOADER, payload: false });
        yield put({ type: SET_INTERNATIONAL_PARTNER, payload: [] }); // ✅ Set empty array on error
        console.log("error is   ", error);
        if (error?.response?.data?.status === 302) {
            toast.error(error?.response?.data?.message || error.message);
            if (action.data?.navigate) {
                action.data.navigate("/");
            }
            window.location.reload();
        }

        if (error?.response?.data?.status !== 400) {
            toast.error(error?.response?.data?.message || error.message);
        }
    }
}

function* getDonor(action) {
    try {
        const token = getHeaderWithToken();
        yield put({ type: SET_LOADER, payload: true });
        let response = yield axios.get(
            process.env.REACT_APP_BASE_URL + "/getInternationDonor",
            token
        );
        if (response.data.status === 200) {
            yield put({ type: SET_LOADER, payload: false });
            yield put({ type: SET_INTERNATIONAL_DONOR, payload: response.data.info || [] }); // ✅ Ensure array
        } else {
            yield put({ type: SET_INTERNATIONAL_DONOR, payload: [] }); // ✅ Set empty array on non-200 status
        }
    } catch (error) {
        yield put({ type: SET_LOADER, payload: false });
        yield put({ type: SET_INTERNATIONAL_DONOR, payload: [] }); // ✅ Set empty array on error
        console.log("error is   ", error);
        if (error?.response?.data?.status === 302) {
            toast.error(error?.response?.data?.message || error.message);
            if (action.data?.navigate) {
                action.data.navigate("/");
            }
            window.location.reload();
        }

        if (error?.response?.data?.status !== 400) {
            toast.error(error?.response?.data?.message || error.message);
        }
    }
}

function* getMobileDevice(action) {
    try {
        const token = getHeaderWithToken();
        yield put({ type: SET_LOADER, payload: true });
        let response = yield axios.get(
            process.env.REACT_APP_BASE_URL + "/getMobileDevice",
            token
        );
        if (response.data.status === 200) {
            yield put({ type: SET_LOADER, payload: false });
            yield put({ type: SET_MOBILE_DEVICE, payload: response.data.info || [] }); // ✅ Ensure array
        } else {
            yield put({ type: SET_MOBILE_DEVICE, payload: [] }); // ✅ Set empty array on non-200 status
        }
    } catch (error) {
        yield put({ type: SET_LOADER, payload: false });
        yield put({ type: SET_MOBILE_DEVICE, payload: [] }); // ✅ Set empty array on error
        console.log("error is   ", error);
        if (error?.response?.data?.status === 302) {
            toast.error(error?.response?.data?.message || error.message);
            if (action.data?.navigate) {
                action.data.navigate("/");
            }
            window.location.reload();
        }

        if (error?.response?.data?.status !== 400) {
            toast.error(error?.response?.data?.message || error.message);
        }
    }
}

function* getUserDevice(action) {
    try {
        const token = getHeaderWithToken();
        yield put({ type: SET_LOADER, payload: true });
        let response = yield axios.get(
            process.env.REACT_APP_BASE_URL + "/getUserDevice",
            token
        );
        if (response.data.status === 200) {
            yield put({ type: SET_LOADER, payload: false });
            yield put({ type: SET_USER_DEVICE, payload: response.data.info || [] }); // ✅ Ensure array
        } else {
            yield put({ type: SET_USER_DEVICE, payload: [] }); // ✅ Set empty array on non-200 status
        }
    } catch (error) {
        yield put({ type: SET_LOADER, payload: false });
        yield put({ type: SET_USER_DEVICE, payload: [] }); // ✅ Set empty array on error
        console.log("error is   ", error);
        if (error?.response?.data?.status === 302) {
            toast.error(error?.response?.data?.message || error.message);
            if (action.data?.navigate) {
                action.data.navigate("/");
            }
            window.location.reload();
        }

        if (error?.response?.data?.status !== 400) {
            toast.error(error?.response?.data?.message || error.message);
        }
    }
}

function* getSolarLocalDevice(action) {
    try {
        const token = getHeaderWithToken();
        yield put({ type: SET_LOADER, payload: true });
        let response = yield axios.get(
            process.env.REACT_APP_BASE_URL + "/getLocalDevDetail", // ✅ Fixed missing slash
            token
        );
        
        if (response.data.status === 200) {
            const sourceArray = response.data.info || []; // ✅ Ensure array
            let slectedCountry = [],
                slectedProviece = [],
                slectedDistrict = [],
                slectedVillage = [];
                
            if (sourceArray.length !== 0) {
                slectedCountry = sourceArray.map((currELem) => currELem.Country);
                slectedProviece = sourceArray.map((currELem) => currELem.Province);
                slectedDistrict = sourceArray.map((currELem) => currELem.District);
                slectedVillage = sourceArray.map((currELem) => currELem.Village);
            }
            
            const uniqCountry = [...new Set(slectedCountry)];
            const uniqProvience = [...new Set(slectedProviece)];
            const uniqDist = [...new Set(slectedDistrict)];
            const uniqVillage = [...new Set(slectedVillage)];

            yield put({ type: SET_LOADER, payload: false });
            yield put({ type: SET_SOLAR_LOCAL_DEVICE, payload: sourceArray });
            yield put({
                type: SET_SOLAR_LOCAL_DEVICE_FILTER_COLUMN,
                payload: {
                    countryColumn: uniqCountry,
                    provienceColumn: uniqProvience,
                    districtColumn: uniqDist,
                    villageColumn: uniqVillage,
                },
            });
        } else {
            yield put({ type: SET_LOADER, payload: false });
            yield put({ type: SET_SOLAR_LOCAL_DEVICE, payload: [] }); // ✅ Set empty array on non-200 status
        }
    } catch (error) {
        yield put({ type: SET_LOADER, payload: false });
        yield put({ type: SET_SOLAR_LOCAL_DEVICE, payload: [] }); // ✅ Set empty array on error
        console.log("error is   ", error);
        if (error?.response?.data?.status === 302) {
            toast.error(error?.response?.data?.message || error.message);
            if (action.data?.navigate) {
                action.data.navigate("/");
            }
            window.location.reload();
        }

        if (error?.response?.data?.status !== 400) {
            toast.error(error?.response?.data?.message || error.message);
        }
    }
}

// Admin-related saga functions
function* getAdminsSaga(action) {
  try {
    const token = getHeaderWithToken();
    yield put({ type: SET_LOADER, payload: true });
    let response = yield axios.get(
      process.env.REACT_APP_BASE_URL + "/getAdmins",
      token
    );
    if (response.data.status === 200) {
      yield put({ type: SET_LOADER, payload: false });
      yield put({ type: SET_ADMINS, payload: response.data.data || [] }); // ✅ Ensure array
    } else {
      yield put({ type: SET_ADMINS, payload: [] }); // ✅ Set empty array on non-200 status
    }
  } catch (error) {
    yield put({ type: SET_LOADER, payload: false });
    yield put({ type: SET_ADMINS, payload: [] }); // ✅ Set empty array on error
    console.log("error is   ", error);
    if (error?.response?.data?.status === 302) {
      toast.error(error?.response?.data?.message || error.message);
      if (action.data?.navigate) {
        action.data.navigate("/");
      }
      window.location.reload();
    }
    if (error?.response?.data?.status !== 400) {
      toast.error(error?.response?.data?.message || error.message);
    }
  }
}

function* createAdminSaga(action) {
  try {
    const { adminData, navigate } = action.payload;
    const token = getHeaderWithToken();
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

      // Close the modal
      yield put(changeCreateModalStata({
        openState: "false",
        screenName: "Administrator"
      }));
    }
  } catch (error) {
    yield put({ type: SET_LOADER, payload: false });
    console.log("error is   ", error);
    if (error?.response?.data?.status === 302) {
      toast.error(error?.response?.data?.message || error.message);
      if (action.payload?.navigate) {
        action.payload.navigate("/");
      }
      window.location.reload();
    }
    if (error?.response?.data?.status !== 400) {
      toast.error(error?.response?.data?.message || error.message);
    }
  }
}

function* updateAdminSaga(action) {
  try {
    const { id, adminData, navigate } = action.payload;
    const token = getHeaderWithToken();
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

      // Close the modal
      yield put(changeCreateModalStata({
        openState: "false",
        screenName: "Administrator"
      }));
    }
  } catch (error) {
    yield put({ type: SET_LOADER, payload: false });
    console.log("error is   ", error);
    if (error?.response?.data?.status === 302) {
      toast.error(error?.response?.data?.message || error.message);
      if (action.payload?.navigate) {
        action.payload.navigate("/");
      }
      window.location.reload();
    }
    if (error?.response?.data?.status !== 400) {
      toast.error(error?.response?.data?.message || error.message);
    }
  }
}

function* deleteAdminSaga(action) {
  try {
    const { id, navigate } = action.payload;
    const token = getHeaderWithToken();
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
    console.log("error is   ", error);
    if (error?.response?.data?.status === 302) {
      toast.error(error?.response?.data?.message || error.message);
      if (action.payload?.navigate) {
        action.payload.navigate("/");
      }
      window.location.reload();
    }
    if (error?.response?.data?.status !== 400) {
      toast.error(error?.response?.data?.message || error.message);
    }
  }
}

// Single DashboardSaga function that includes all the takeEvery calls
function* DashboardSaga() {
  yield takeEvery(GET_SOLAR_CHARGER, getSolarCharger);
  yield takeEvery(GET_SOLAR_LOCAL_DEVICE, getSolarLocalDevice);
  yield takeEvery(GET_INTERNATIONAL_PARTNER, getPartner);
  yield takeEvery(GET_INTERNATIONAL_DONOR, getDonor);
  yield takeEvery(GET_MOBILE_DEVICE, getMobileDevice);
  yield takeEvery(GET_USER_DEVICE, getUserDevice);
  yield takeEvery(GET_NEW_DEVICE_LIST, getNewDeviceListSaga);
  yield takeEvery(CREATE_NEW_DEVICE, createNewDeviceSaga);
  yield takeEvery(UPLOAD_SOLAR_DATA, uploadSolarDataSaga);
  yield takeEvery(UPDATE_NEW_DEVICE, updateNewDeviceSaga);
  yield takeEvery(DELETE_NEW_DEVICE, deleteNewDeviceSaga);
  
  // Add the admin-related sagas
  yield takeEvery(GET_ADMINS, getAdminsSaga);
  yield takeEvery(CREATE_ADMIN, createAdminSaga);
  yield takeEvery(UPDATE_ADMIN, updateAdminSaga);
  yield takeEvery(DELETE_ADMIN, deleteAdminSaga);
}

export default DashboardSaga;







// /* eslint-disable require-yield */
// import { put, takeEvery, call } from "redux-saga/effects";
// import toast from "react-hot-toast";
// import axios from "axios";
// import {
//   GET_NEW_DEVICE_LIST,
//   SET_NEW_DEVICE_LIST,
//   CREATE_NEW_DEVICE,
//   GET_INTERNATIONAL_DONOR,
//   GET_INTERNATIONAL_PARTNER,
//   GET_MOBILE_DEVICE,
//   GET_SOLAR_CHARGER,
//   GET_SOLAR_LOCAL_DEVICE,
//   GET_USER_DEVICE,
//   SET_INTERNATIONAL_DONOR,
//   SET_INTERNATIONAL_PARTNER,
//   SET_MOBILE_DEVICE,
//   SET_SOLAR_CHARGER,
//   SET_SOLAR_LOCAL_DEVICE,
//   SET_SOLAR_LOCAL_DEVICE_FILTER_COLUMN,
//   SET_USER_DEVICE,
//   UPLOAD_SOLAR_DATA,
//   UPLOAD_SOLAR_DATA_SUCCESS,
//   UPLOAD_SOLAR_DATA_FAIL,
//   UPDATE_NEW_DEVICE,
//   DELETE_NEW_DEVICE,
//   // Admin-related constants
//   GET_ADMINS,
//   SET_ADMINS,
//   CREATE_ADMIN,
//   UPDATE_ADMIN,
//   DELETE_ADMIN,
//   // MQTT constants
//   GET_MQTT_STATUS,
//   SET_MQTT_STATUS,
//   GET_REALTIME_DATA,
//   SET_REALTIME_DATA
// } from "../Constant/DashboardConstant";
// import { SET_LOADER } from "../Constant/constant";
// import { getHeaderWithToken } from "../Utils";
// import { changeCreateModalStata } from "../Action/ConstantAction";

// // MQTT Status Saga
// function* getMQTTStatusSaga() {
//   try {
//     const token = getHeaderWithToken();
//     const response = yield call(
//       axios.get, 
//       process.env.REACT_APP_BASE_URL + "/getMQTTStatus", 
//       token
//     );
    
//     if (response.data.status === 200) {
//       yield put({
//         type: SET_MQTT_STATUS,
//         payload: response.data.data
//       });
//     }
//   } catch (error) {
//     console.error('Error fetching MQTT status:', error);
//     yield put({
//       type: SET_MQTT_STATUS,
//       payload: {
//         isConnected: false,
//         timestamp: new Date().toISOString(),
//         error: error.message
//       }
//     });
//   }
// }

// // Real-time Data Saga
// function* getRealtimeDataSaga(action) {
//   try {
//     const { deviceId } = action.payload;
//     const token = getHeaderWithToken();
    
//     let url = process.env.REACT_APP_BASE_URL + "/getRealtimeData";
//     if (deviceId) {
//       url += `?deviceId=${deviceId}`;
//     }
    
//     const response = yield call(axios.get, url, token);
    
//     if (response.data.status === 200) {
//       yield put({
//         type: SET_REALTIME_DATA,
//         payload: response.data.data
//       });
//     }
//   } catch (error) {
//     console.error('Error fetching real-time data:', error);
//     yield put({
//       type: SET_REALTIME_DATA,
//       payload: []
//     });
//   }
// }

// function* uploadSolarDataSaga(action) {
//   try {
//     yield put({ type: SET_LOADER, payload: true });
//     const token = getHeaderWithToken();
    
//     const response = yield call(
//       axios.post, 
//       process.env.REACT_APP_BASE_URL + "/createSolarCharger",
//       action.payload,
//       token
//     );
    
//     if (response.data.status === 200) {
//       yield put({ type: SET_LOADER, payload: false });
//       yield put({ 
//         type: UPLOAD_SOLAR_DATA_SUCCESS,
//         payload: response.data
//       });
//       yield put({ 
//         type: GET_SOLAR_LOCAL_DEVICE,
//         data: { navigate: action.payload.navigate }
//       });
//       toast.success(`Successfully uploaded ${response.data.inserted} records`);
//     } else {
//       throw new Error(response.data.message || "Upload failed");
//     }
//   } catch (error) {
//     yield put({ type: SET_LOADER, payload: false });
//     yield put({
//       type: UPLOAD_SOLAR_DATA_FAIL,
//       payload: error.message
//     });
    
//     console.error("Upload error:", error);
//     if (error?.response?.data?.status === 302) {
//       if (action.payload?.navigate) {
//         action.payload.navigate("/");
//       }
//       window.location.reload();
//     }
//     toast.error(error?.response?.data?.message || error.message);
//   }
// }

// function* getNewDeviceListSaga(action) {
//   try {
//     const token = getHeaderWithToken();
//     yield put({ type: SET_LOADER, payload: true });
//     let response = yield axios.get(
//       process.env.REACT_APP_BASE_URL + "/getNewDeviceList",
//       token
//     );
//     if (response.data.status === 200) {
//       yield put({ type: SET_LOADER, payload: false });
//       yield put({ type: SET_NEW_DEVICE_LIST, payload: response.data.info });
//     }
//   } catch (error) {
//     yield put({ type: SET_LOADER, payload: false });
//     console.log("error is   ", error);
//     if (error?.response?.data?.status === 302) {
//       toast.error(error?.response?.data?.message || error.message);
//       if (action.data?.navigate) {
//         action.data.navigate("/");
//       }
//       window.location.reload();
//     }
//     if (error?.response?.data?.status !== 400) {
//       toast.error(error?.response?.data?.message || error.message);
//     }
//   }
// }

// function* createNewDeviceSaga(action) {
//   try {
//     const token = getHeaderWithToken();
//     yield put({ type: SET_LOADER, payload: true });
//     let response = yield axios.post(
//       process.env.REACT_APP_BASE_URL + "/createNewDevice",
//       action.data.payload,
//       token
//     );
//     if (response.data.status === 200) {
//       yield put({ type: SET_LOADER, payload: false });
//       toast.success(response.data.message || "Device created successfully");
//       yield put({ type: GET_NEW_DEVICE_LIST, data: action.data });
//     }
//   } catch (error) {
//     yield put({ type: SET_LOADER, payload: false });
//     console.log("error is   ", error);
//     if (error?.response?.data?.status === 302) {
//       toast.error(error?.response?.data?.message || error.message);
//       if (action.data?.navigate) {
//         action.data.navigate("/");
//       }
//       window.location.reload();
//     }
//     if (error?.response?.data?.status !== 400) {
//       toast.error(error?.response?.data?.message || error.message);
//     }
//   }
// }

// function* updateNewDeviceSaga(action) {
//   try {
//     const { id, data, navigate } = action.payload;
//     const tokenConfig = getHeaderWithToken();

//     yield put({ type: SET_LOADER, payload: true });

//     const response = yield call(
//       axios.put,
//       `${process.env.REACT_APP_BASE_URL}/updateNewDevice/${id}`,
//       data,
//       tokenConfig
//     );

//     if (response.data.status === 200) {
//       yield put({ type: SET_LOADER, payload: false });
//       toast.success(response.data.message || "Device updated successfully");

//       yield put({ type: GET_NEW_DEVICE_LIST, data: { navigate } });

//       yield put(
//         changeCreateModalStata({
//           openState: "false",
//           screenName: "NewChargerController",
//         })
//       );
//     }
//   } catch (error) {
//     yield put({ type: SET_LOADER, payload: false });
//     console.error("Update error:", error);

//     if (error?.response?.data?.status === 302) {
//       if (action.payload?.navigate) {
//         action.payload.navigate("/");
//       }
//       window.location.reload();
//     }

//     toast.error(error?.response?.data?.message || "Failed to update device");
//   }
// }

// function* deleteNewDeviceSaga(action) {
//   try {
//     const { id, navigate } = action.payload;
//     const token = getHeaderWithToken();
//     yield put({ type: SET_LOADER, payload: true });
    
//     const response = yield call(
//       axios.delete,
//       `${process.env.REACT_APP_BASE_URL}/deleteNewDevice/${id}`,
//       token
//     );
    
//     if (response.data.status === 200) {
//       yield put({ type: SET_LOADER, payload: false });
//       toast.success(response.data.message || "Device deleted successfully");
//       yield put({ type: GET_NEW_DEVICE_LIST, data: { navigate } });
//     }
//   } catch (error) {
//     yield put({ type: SET_LOADER, payload: false });
//     console.error("Delete error:", error);
//     if (error?.response?.data?.status === 302) {
//       if (action.payload?.navigate) {
//         action.payload.navigate("/");
//       }
//       window.location.reload();
//     }
//     toast.error(error?.response?.data?.message || error.message);
//   }
// }

// function* getSolarCharger(action) {
//     const token = getHeaderWithToken();
//     try {
//         yield put({ type: SET_LOADER, payload: true });
//         let response = yield axios.get(
//             process.env.REACT_APP_BASE_URL + "/getSolarCharger",
//             token
//         );
//         if (response.data.status === 200) {
//             yield put({ type: SET_LOADER, payload: false });
//             yield put({ type: SET_SOLAR_CHARGER, payload: response.data.info });
//         }
//     } catch (error) {
//         yield put({ type: SET_LOADER, payload: false });
//         console.log("error is   ", error);
//         if (error?.response?.data?.status === 302) {
//             toast.error(error?.response?.data?.message || error.message);
//             if (action.data?.navigate) {
//                 action.data.navigate("/");
//             }
//             window.location.reload();
//         }
//         if (error?.response?.data?.status !== 400) {
//             toast.error(error?.response?.data?.message || error.message);
//         }
//     }
// }

// function* getPartner(action) {
//     try {
//         const token = getHeaderWithToken();
//         yield put({ type: SET_LOADER, payload: true });
//         let response = yield axios.get(
//             process.env.REACT_APP_BASE_URL + "/getInternationPartner",
//             token
//         );
//         if (response.data.status === 200) {
//             yield put({ type: SET_LOADER, payload: false });
//             yield put({ type: SET_INTERNATIONAL_PARTNER, payload: response.data.info });
//         }
//     } catch (error) {
//         yield put({ type: SET_LOADER, payload: false });
//         console.log("error is   ", error);
//         if (error?.response?.data?.status === 302) {
//             toast.error(error?.response?.data?.message || error.message);
//             if (action.data?.navigate) {
//                 action.data.navigate("/");
//             }
//             window.location.reload();
//         }

//         if (error?.response?.data?.status !== 400) {
//             toast.error(error?.response?.data?.message || error.message);
//         }
//     }
// }

// function* getDonor(action) {
//     try {
//         const token = getHeaderWithToken();
//         yield put({ type: SET_LOADER, payload: true });
//         let response = yield axios.get(
//             process.env.REACT_APP_BASE_URL + "/getInternationDonor",
//             token
//         );
//         if (response.data.status === 200) {
//             yield put({ type: SET_LOADER, payload: false });
//             yield put({ type: SET_INTERNATIONAL_DONOR, payload: response.data.info });
//         }
//     } catch (error) {
//         yield put({ type: SET_LOADER, payload: false });
//         console.log("error is   ", error);
//         if (error?.response?.data?.status === 302) {
//             toast.error(error?.response?.data?.message || error.message);
//             if (action.data?.navigate) {
//                 action.data.navigate("/");
//             }
//             window.location.reload();
//         }

//         if (error?.response?.data?.status !== 400) {
//             toast.error(error?.response?.data?.message || error.message);
//         }
//     }
// }

// function* getMobileDevice(action) {
//     try {
//         const token = getHeaderWithToken();
//         yield put({ type: SET_LOADER, payload: true });
//         let response = yield axios.get(
//             process.env.REACT_APP_BASE_URL + "/getMobileDevice",
//             token
//         );
//         if (response.data.status === 200) {
//             yield put({ type: SET_LOADER, payload: false });
//             yield put({ type: SET_MOBILE_DEVICE, payload: response.data.info });
//         }
//     } catch (error) {
//         yield put({ type: SET_LOADER, payload: false });
//         console.log("error is   ", error);
//         if (error?.response?.data?.status === 302) {
//             toast.error(error?.response?.data?.message || error.message);
//             if (action.data?.navigate) {
//                 action.data.navigate("/");
//             }
//             window.location.reload();
//         }

//         if (error?.response?.data?.status !== 400) {
//             toast.error(error?.response?.data?.message || error.message);
//         }
//     }
// }

// function* getUserDevice(action) {
//     try {
//         const token = getHeaderWithToken();
//         yield put({ type: SET_LOADER, payload: true });
//         let response = yield axios.get(
//             process.env.REACT_APP_BASE_URL + "/getUserDevice",
//             token
//         );
//         if (response.data.status === 200) {
//             yield put({ type: SET_LOADER, payload: false });
//             yield put({ type: SET_USER_DEVICE, payload: response.data.info });
//         }
//     } catch (error) {
//         yield put({ type: SET_LOADER, payload: false });
//         console.log("error is   ", error);
//         if (error?.response?.data?.status === 302) {
//             toast.error(error?.response?.data?.message || error.message);
//             if (action.data?.navigate) {
//                 action.data.navigate("/");
//             }
//             window.location.reload();
//         }

//         if (error?.response?.data?.status !== 400) {
//             toast.error(error?.response?.data?.message || error.message);
//         }
//     }
// }

// function* getSolarLocalDevice(action) {
//     try {
//         const token = getHeaderWithToken();
//         yield put({ type: SET_LOADER, payload: true });
//         let response = yield axios.get(
//             process.env.REACT_APP_BASE_URL + "getLocalDevDetail",
//             token
//         );
//         const sourceArray = response.data.info;
//         let slectedCountry,
//             slectedProviece,
//             slectedDistrict,
//             slectedVillage = [];
//         if (response.data.status === 200) {
//             if (sourceArray.length !== 0) {
//                 slectedCountry = yield sourceArray.map((currELem) => {
//                     return currELem.Country;
//                 });
//                 slectedProviece = yield sourceArray.map((currELem) => {
//                     return currELem.Province;
//                 });
//                 slectedDistrict = yield sourceArray.map((currELem) => {
//                     return currELem.District;
//                 });
//                 slectedVillage = yield sourceArray.map((currELem) => {
//                     return currELem.Village;
//                 });
//             }
//             const uniqCountry = [...new Set(slectedCountry)];
//             const uniqProvience = [...new Set(slectedProviece)];
//             const uniqDist = [...new Set(slectedDistrict)];
//             const uniqVillage = [...new Set(slectedVillage)];

//             yield put({ type: SET_LOADER, payload: false });
//             yield put({ type: SET_SOLAR_LOCAL_DEVICE, payload: response.data.info });
//             yield put({
//                 type: SET_SOLAR_LOCAL_DEVICE_FILTER_COLUMN,
//                 payload: {
//                     countryColumn: uniqCountry,
//                     provienceColumn: uniqProvience,
//                     districtColumn: uniqDist,
//                     villageColumn: uniqVillage,
//                 },
//             });
//         }
//     } catch (error) {
//         yield put({ type: SET_LOADER, payload: false });
//         console.log("error is   ", error);
//         if (error?.response?.data?.status === 302) {
//             toast.error(error?.response?.data?.message || error.message);
//             if (action.data?.navigate) {
//                 action.data.navigate("/");
//             }
//             window.location.reload();
//         }

//         if (error?.response?.data?.status !== 400) {
//             toast.error(error?.response?.data?.message || error.message);
//         }
//     }
// }

// // Admin-related saga functions
// function* getAdminsSaga(action) {
//   try {
//     const token = getHeaderWithToken();
//     yield put({ type: SET_LOADER, payload: true });
//     let response = yield axios.get(
//       process.env.REACT_APP_BASE_URL + "/getAdmins",
//       token
//     );
//     if (response.data.status === 200) {
//       yield put({ type: SET_LOADER, payload: false });
//       yield put({ type: SET_ADMINS, payload: response.data.data });
//     }
//   } catch (error) {
//     yield put({ type: SET_LOADER, payload: false });
//     console.log("error is   ", error);
//     if (error?.response?.data?.status === 302) {
//       toast.error(error?.response?.data?.message || error.message);
//       if (action.data?.navigate) {
//         action.data.navigate("/");
//       }
//       window.location.reload();
//     }
//     if (error?.response?.data?.status !== 400) {
//       toast.error(error?.response?.data?.message || error.message);
//     }
//   }
// }

// function* createAdminSaga(action) {
//   try {
//     const { adminData, navigate } = action.payload;
//     const token = getHeaderWithToken();
//     yield put({ type: SET_LOADER, payload: true });

//     let response = yield axios.post(
//       process.env.REACT_APP_BASE_URL + "/createAdmin",
//       adminData,
//       token
//     );

//     if (response.data.status === 200) {
//       yield put({ type: SET_LOADER, payload: false });
//       toast.success(response.data.message || "Admin created successfully");
//       yield put({ type: GET_ADMINS, data: { navigate } });

//       // Close the modal
//       yield put(changeCreateModalStata({
//         openState: "false",
//         screenName: "Administrator"
//       }));
//     }
//   } catch (error) {
//     yield put({ type: SET_LOADER, payload: false });
//     console.log("error is   ", error);
//     if (error?.response?.data?.status === 302) {
//       toast.error(error?.response?.data?.message || error.message);
//       if (action.payload?.navigate) {
//         action.payload.navigate("/");
//       }
//       window.location.reload();
//     }
//     if (error?.response?.data?.status !== 400) {
//       toast.error(error?.response?.data?.message || error.message);
//     }
//   }
// }

// function* updateAdminSaga(action) {
//   try {
//     const { id, adminData, navigate } = action.payload;
//     const token = getHeaderWithToken();
//     yield put({ type: SET_LOADER, payload: true });

//     let response = yield axios.put(
//       `${process.env.REACT_APP_BASE_URL}/updateAdmin/${id}`,
//       adminData,
//       token
//     );

//     if (response.data.status === 200) {
//       yield put({ type: SET_LOADER, payload: false });
//       toast.success(response.data.message || "Admin updated successfully");
//       yield put({ type: GET_ADMINS, data: { navigate } });

//       // Close the modal
//       yield put(changeCreateModalStata({
//         openState: "false",
//         screenName: "Administrator"
//       }));
//     }
//   } catch (error) {
//     yield put({ type: SET_LOADER, payload: false });
//     console.log("error is   ", error);
//     if (error?.response?.data?.status === 302) {
//       toast.error(error?.response?.data?.message || error.message);
//       if (action.payload?.navigate) {
//         action.payload.navigate("/");
//       }
//       window.location.reload();
//     }
//     if (error?.response?.data?.status !== 400) {
//       toast.error(error?.response?.data?.message || error.message);
//     }
//   }
// }

// function* deleteAdminSaga(action) {
//   try {
//     const { id, navigate } = action.payload;
//     const token = getHeaderWithToken();
//     yield put({ type: SET_LOADER, payload: true });

//     let response = yield axios.delete(
//       `${process.env.REACT_APP_BASE_URL}/deleteAdmin/${id}`,
//       token
//     );

//     if (response.data.status === 200) {
//       yield put({ type: SET_LOADER, payload: false });
//       toast.success(response.data.message || "Admin deleted successfully");
//       yield put({ type: GET_ADMINS, data: { navigate } });
//     }
//   } catch (error) {
//     yield put({ type: SET_LOADER, payload: false });
//     console.log("error is   ", error);
//     if (error?.response?.data?.status === 302) {
//       toast.error(error?.response?.data?.message || error.message);
//       if (action.payload?.navigate) {
//         action.payload.navigate("/");
//       }
//       window.location.reload();
//     }
//     if (error?.response?.data?.status !== 400) {
//       toast.error(error?.response?.data?.message || error.message);
//     }
//   }
// }

// // Single DashboardSaga function that includes all the takeEvery calls
// function* DashboardSaga() {
//   yield takeEvery(GET_SOLAR_CHARGER, getSolarCharger);
//   yield takeEvery(GET_SOLAR_LOCAL_DEVICE, getSolarLocalDevice);
//   yield takeEvery(GET_INTERNATIONAL_PARTNER, getPartner);
//   yield takeEvery(GET_INTERNATIONAL_DONOR, getDonor);
//   yield takeEvery(GET_MOBILE_DEVICE, getMobileDevice);
//   yield takeEvery(GET_USER_DEVICE, getUserDevice);
//   yield takeEvery(GET_NEW_DEVICE_LIST, getNewDeviceListSaga);
//   yield takeEvery(CREATE_NEW_DEVICE, createNewDeviceSaga);
//   yield takeEvery(UPLOAD_SOLAR_DATA, uploadSolarDataSaga);
//   yield takeEvery(UPDATE_NEW_DEVICE, updateNewDeviceSaga);
//   yield takeEvery(DELETE_NEW_DEVICE, deleteNewDeviceSaga);
  
//   // Add the admin-related sagas
//   yield takeEvery(GET_ADMINS, getAdminsSaga);
//   yield takeEvery(CREATE_ADMIN, createAdminSaga);
//   yield takeEvery(UPDATE_ADMIN, updateAdminSaga);
//   yield takeEvery(DELETE_ADMIN, deleteAdminSaga);

//   // Add MQTT sagas
//   yield takeEvery(GET_MQTT_STATUS, getMQTTStatusSaga);
//   yield takeEvery(GET_REALTIME_DATA, getRealtimeDataSaga);
// }

// export default DashboardSaga;