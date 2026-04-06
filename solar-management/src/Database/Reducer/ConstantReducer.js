//ConstantReducer.js
import { CHANGE_API_STATE, CHANGE_CREATE_MODAL_SATATE, CHANGE_FILTER_SEARCH_MODEL_STATE, CHANGE_GRAPH_STATE, CHANGE_MODAL_STATE, MY_API_ERROR, SET_APPLY_FILTER_CONDITION, SET_FILTER_DATA, SET_LOADER, SET_THEME_COLOR } from "../Constant/constant";
import toast from "react-hot-toast"
const initialState = {
    loader: false,
    modalState: {
        openState: false,
        content: "",
        column: [],
        data: [],
        screenName: ''
    },
    headerColor: '',
    headerTextColor: '',
    bodyColor: '',
    graphState: false,
    filterModelState: false,
    filterSearchData: [],
    filterConData: {
        filterData: [],
        screenName: ''
    },
    apistate: "0",
    createModastate: {
        openState: false,
        screenName: "",
        actionState: ""
    }
}
const ConstantReducer = (state = initialState, action) => {
    switch (action.type) {
        case SET_LOADER:
            return {
                ...state,
                loader: action.payload
            }

        case MY_API_ERROR:
            console.log("error is     ", action.payload);
            return {
                ...state,
                loader: false
            }

        case CHANGE_MODAL_STATE:
            const { openState, content, data, dataColumn, screenName } = action.payload;
            return {
                ...state,
                modalState: {
                    openState: openState,
                    content: content,
                    column: dataColumn,
                    data: data,
                    screenName: screenName
                }
            }

        case SET_THEME_COLOR:
            const { title, color } = action.payload;
            if (title === "1") {
                return {
                    ...state,
                    headerColor: color
                }
            } else if (title === "2") {
                return {
                    ...state,
                    bodyColor: color
                }
            } else if (title === "3") {
                return {
                    ...state,
                    headerTextColor: color
                }
            } else {
                return { ...state }
            }
        case CHANGE_GRAPH_STATE:
            return {
                ...state,
                graphState: action.payload
            }

        case CHANGE_FILTER_SEARCH_MODEL_STATE:
            return {
                ...state,
                filterModelState: action.payload
            }

        case SET_FILTER_DATA:
            return {
                ...state,
                filterSearchData: action.payload
            }
        case CHANGE_API_STATE:
            const { apistate } = state;
            return {
                ...state,
                apistate: apistate === "0" ? "1" : "0"

            }
        case CHANGE_CREATE_MODAL_SATATE:
            return {
                ...state,
                createModastate: {
                    openState: action.payload.openState,
                    screenName: action.payload.screenName,
                    actionState: action.payload.actionState
                }
            }

        default:
            return state;
    }
}

export default ConstantReducer