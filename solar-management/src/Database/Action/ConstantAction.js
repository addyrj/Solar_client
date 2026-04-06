//constantAction.js
import { APPLY_FILTER_CONDITION, APPLY_SORT_CONDITION, CHANGE_API_STATE, CHANGE_CREATE_MODAL_SATATE, CHANGE_FILTER_SEARCH_MODEL_STATE, CHANGE_GRAPH_STATE, CHANGE_MODAL_STATE, CHANGE_THEME_COLOR, DISABLE_FILTER_CONDITION, DISABLE_SORT_CONDITION, GET_FILTER_SEARCH_DATA, SET_APPLY_SORT_CONDITION, SET_LOADER } from "../Constant/constant"

export const changeModalState = (item) => {
    return {
        type: CHANGE_MODAL_STATE,
        payload: item
    }
}

export const setLoader = (item) => {
    return {
        type: SET_LOADER,
        payload: item
    }
}

export const applyFilter = (item) => {
    return {
        type: APPLY_FILTER_CONDITION,
        data: item
    }
}

export const applySort = (item) => {
    return {
        type: APPLY_SORT_CONDITION,
        data: item
    }
}

export const changeTheme = (item) => {
    return {
        type: CHANGE_THEME_COLOR,
        data: item
    }
}

export const chhoseGraphState = (item) => {
    return {
        type: CHANGE_GRAPH_STATE,
        payload: item
    }
}

export const changeFilterSearchModelState = (item) => {
    return {
        type: CHANGE_FILTER_SEARCH_MODEL_STATE,
        payload: item
    }
}

export const filterSearchData = (item) => {
    return {
        type: GET_FILTER_SEARCH_DATA,
        data: item
    }
}

export const disableFilterCondition = (item) => {
    return {
        type: DISABLE_FILTER_CONDITION,
        payload: item
    }
}

export const disableSortCondition = (item) => {
    return {
        type: DISABLE_SORT_CONDITION,
        payload: item
    }
}

export const changeApistate = () => {
    return {
        type: CHANGE_API_STATE
    }
}

export const changeCreateModalStata = (item) => {
    return {
        type: CHANGE_CREATE_MODAL_SATATE,
        payload: item
    }
}