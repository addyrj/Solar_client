import { DISABLE_FILTER_CONDITION, DISABLE_SORT_CONDITION, SET_APPLY_FILTER_CONDITION, SET_APPLY_SORT_CONDITION, SET_RANDOM_QUESTION } from "../Constant/constant"
import { FILTER_SOLAR_CHARGER, SET_INTERNATIONAL_DONOR, SET_INTERNATIONAL_PARTNER, SET_MOBILE_DEVICE, SET_SOLAR_CHARGER, SET_SOLAR_LOCAL_DEVICE, SET_SOLAR_LOCAL_DEVICE_FILTER_COLUMN, SET_USER_DEVICE ,SET_NEW_DEVICE_LIST, UPLOAD_SOLAR_DATA,UPLOAD_SOLAR_DATA_SUCCESS,UPLOAD_SOLAR_DATA_FAIL,UPDATE_NEW_DEVICE,DELETE_NEW_DEVICE,SET_ADMINS} from "../Constant/DashboardConstant"

const initialState = {
    randomQuestion: [],
    solarChager: [],
      admins: [],
    mainAdmins: [],
    newDeviceList: [],
    mainNewDeviceList: [],
    localDeviceDetail: [],
    mainLocalDeviceDetail: [],
    filterSolar: [],
    internationalPartner: [],
    mainInternationalPartner: [],
    internationalDonor: [],
    mainInternationalDonor: [],
    mobileDevice: [],
    mainMobileDevice: [],
    userDevice: [],
    mainUserDevice: [],
    columnId: "",
    conditionId: "",
    sortColumnId: "",
    sortConditionId: "",
    filterColumn: {
        countryColumn: [],
        provienceColumn: [],
        districtColumn: [],
        villageColumn: []
    }
}

const DashboardReducer = (state = initialState, action) => {
    switch (action.type) {
        case SET_RANDOM_QUESTION:
            return {
                ...state,
                randomQuestion: action.payload
            }
            
        case SET_NEW_DEVICE_LIST:
            return {
                ...state,
                newDeviceList: action.payload,
                mainNewDeviceList: action.payload
            }

        case SET_SOLAR_CHARGER:
            return {
                ...state,
                solarChager: action.payload
            }

        case SET_SOLAR_LOCAL_DEVICE:
            return {
                ...state,
                localDeviceDetail: action.payload,
                mainLocalDeviceDetail: action.payload
            }

        case SET_SOLAR_LOCAL_DEVICE_FILTER_COLUMN:
            const { countryColumn, provienceColumn, districtColumn, villageColumn } = action.payload;
            return {
                ...state,
                filterColumn: {
                    countryColumn: countryColumn,
                    provienceColumn: provienceColumn,
                    districtColumn: districtColumn,
                    villageColumn: villageColumn
                }
            }

        case FILTER_SOLAR_CHARGER:
            return {
                ...state,
                filterSolar: action.payload
            }

        case SET_INTERNATIONAL_DONOR:
            return {
                ...state,
                internationalDonor: action.payload,
                mainInternationalDonor: action.payload
            }
            
        case SET_INTERNATIONAL_PARTNER:
            return {
                ...state,
                internationalPartner: action.payload,
                mainInternationalPartner: action.payload
            }

        case SET_MOBILE_DEVICE:
            return {
                ...state,
                mobileDevice: action.payload,
                mainMobileDevice: action.payload
            }
            
        case SET_USER_DEVICE:
            return {
                ...state,
                userDevice: action.payload,
                mainUserDevice: action.payload
            }
            
        case SET_APPLY_FILTER_CONDITION:
            const { screenName, filterData, columnId, conditionId } = action.payload;

            if (screenName === "ChargerController") {
                return {
                    ...state,
                    localDeviceDetail: filterData,
                    columnId: columnId,
                    conditionId: conditionId
                }
            } else if (screenName === "NewChargerController") {
                return {
                    ...state,
                    newDeviceList: filterData,
                    columnId: columnId,
                    conditionId: conditionId
                }
            } else if (screenName === "InternationalDonor") {
                return {
                    ...state,
                    internationalDonor: filterData,
                    columnId: columnId,
                    conditionId: conditionId
                }
            } else if (screenName === "InternationalPartner") {
                return {
                    ...state,
                    internationalPartner: filterData,
                    columnId: columnId,
                    conditionId: conditionId
                }
            } else if (screenName === "MobileDevice") {
                return {
                    ...state,
                    mobileDevice: filterData,
                    columnId: columnId,
                    conditionId: conditionId
                }
            } else if (screenName === "Administrator") {
                return {
                    ...state,
                    userDevice: filterData,
                    columnId: columnId,
                    conditionId: conditionId
                }
            } else {
                return {
                    ...state
                }
            }

        case DISABLE_FILTER_CONDITION:
            const { mainData, activity } = action.payload;

            if (activity === "ChargerController") {
                return {
                    ...state,
                    localDeviceDetail: mainData,
                    columnId: "",
                    conditionId: ""
                }
            } else if (activity === "NewChargerController") {
                return {
                    ...state,
                    newDeviceList: mainData,
                    columnId: "",
                    conditionId: ""
                }
            } else if (activity === "InternationalDonor") {
                return {
                    ...state,
                    internationalDonor: mainData,
                    columnId: "",
                    conditionId: ""
                }
            } else if (activity === "InternationalPartner") {
                return {
                    ...state,
                    internationalPartner: mainData,
                    columnId: "",
                    conditionId: ""
                }
            } else if (activity === "MobileDevice") {
                return {
                    ...state,
                    mobileDevice: mainData,
                    columnId: "",
                    conditionId: ""
                }
            } else if (activity === "Administrator") {
                return {
                    ...state,
                    userDevice: mainData,
                    columnId: "",
                    conditionId: ""
                }
            } else {
                return {
                    ...state
                }
            }

        case SET_APPLY_SORT_CONDITION:
            const { activityName, sortData, sortColumnId, sortConditionId } = action.payload;
            console.log("sort data reducer is     ", activityName, sortData)
            
            if (activityName === "ChargerController") {
                return {
                    ...state,
                    localDeviceDetail: sortData,
                    sortColumnId: sortColumnId,
                    sortConditionId: sortConditionId
                }
            } else if (activityName === "NewChargerController") {
                return {
                    ...state,
                    newDeviceList: sortData,
                    sortColumnId: sortColumnId,
                    sortConditionId: sortConditionId
                }
            } else if (activityName === "InternationalDonor") {
                return {
                    ...state,
                    internationalDonor: sortData,
                    sortColumnId: sortColumnId,
                    sortConditionId: sortConditionId
                }
            } else if (activityName === "InternationalPartner") {
                return {
                    ...state,
                    internationalPartner: sortData,
                    sortColumnId: sortColumnId,
                    sortConditionId: sortConditionId
                }
            } else if (activityName === "MobileDevice") {
                return {
                    ...state,
                    mobileDevice: sortData,
                    sortColumnId: sortColumnId,
                    sortConditionId: sortConditionId
                }
            } else if (activityName === "Administrator") {
                return {
                    ...state,
                    userDevice: sortData,
                    sortColumnId: sortColumnId,
                    sortConditionId: sortConditionId
                }
            } else {
                return {
                    ...state
                }
            }

        case DISABLE_SORT_CONDITION:
            const { mainSortData, sortActivity } = action.payload;
            console.log("disable sort button data is     ", mainSortData)

            if (sortActivity === "ChargerController") {
                return {
                    ...state,
                    localDeviceDetail: mainSortData,
                    sortColumnId: "",
                    sortConditionId: ""
                }
            } else if (sortActivity === "NewChargerController") {
                return {
                    ...state,
                    newDeviceList: mainSortData,
                    sortColumnId: "",
                    sortConditionId: ""
                }
            } else if (sortActivity === "InternationalDonor") {
                return {
                    ...state,
                    internationalDonor: mainSortData,
                    sortColumnId: "",
                    sortConditionId: ""
                }
            } else if (sortActivity === "InternationalPartner") {
                return {
                    ...state,
                    internationalPartner: mainSortData,
                    sortColumnId: "",
                    sortConditionId: ""
                }
            } else if (sortActivity === "MobileDevice") {
                return {
                    ...state,
                    mobileDevice: mainSortData,
                    sortColumnId: "",
                    sortConditionId: ""
                }
            } else if (sortActivity === "Administrator") {
                return {
                    ...state,
                    userDevice: mainSortData,
                    sortColumnId: "",
                    sortConditionId: ""
                }
            } else {
                return {
                    ...state
                }
            }

        case UPDATE_NEW_DEVICE:
            return {
                ...state,
                // You might want to add loading states here
            };

        case DELETE_NEW_DEVICE:
            return {
                ...state,
                // You might want to add loading states here
            };

        case UPLOAD_SOLAR_DATA:
            return {
                ...state,
                uploadSolarLoading: true,
                uploadSolarError: null
            };
            
        case UPLOAD_SOLAR_DATA_SUCCESS:
            return {
                ...state,
                uploadSolarLoading: false,
                uploadSolarError: null
            };
            
        case UPLOAD_SOLAR_DATA_FAIL:
            return {
                ...state,
                uploadSolarLoading: false,
                uploadSolarError: action.payload
            };
  
case SET_ADMINS:
  return {
    ...state,
    admins: action.payload,
    mainAdmins: action.payload
  }



        default:
            return state;
    }
}

export default DashboardReducer
