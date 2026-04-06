/* eslint-disable require-yield */
//ConstantSaga.js
import { put, takeEvery } from "redux-saga/effects";
import toast from "react-hot-toast";
import {
    APPLY_FILTER_CONDITION,
    APPLY_SORT_CONDITION,
    CHANGE_THEME_COLOR,
    GET_FILTER_SEARCH_DATA,
    SET_APPLY_FILTER_CONDITION,
    SET_APPLY_SORT_CONDITION,
    SET_FILTER_DATA,
    SET_THEME_COLOR,
} from "../Constant/constant";
import isEmpty from "lodash.isempty";

function* filterList(action) {
    let checkData = [];
    const { columnId, conditionId, allData, filterValue, screenName } =
        action.data;
    console.log("scrren name is    saga   ", action.data);

    checkData = yield allData.filter((item) => {
        const filterSourceData = item[columnId];
        console.log(filterSourceData);
        if (conditionId === 2) {
            return String(filterSourceData).trim() === String(filterValue).trim();
        } else if (conditionId === 3) {
            return String(filterSourceData).trim() != String(filterValue).trim();
        } else if (conditionId === 4) {
            return filterSourceData < filterValue;
        } else if (conditionId === 5) {
            return filterSourceData <= filterValue;
        } else if (conditionId === 6) {
            return filterSourceData > filterValue;
        } else if (conditionId === 7) {
            return filterSourceData <= filterValue;
        } else if (conditionId === 9) {
            return String(filterSourceData).toUpperCase().startsWith(String(filterValue).toUpperCase());
        } else if (conditionId === 10) {
            return String(filterSourceData).toUpperCase().endsWith(String(filterValue).toUpperCase());
        } else {
            return [];
        }
    });
    yield put({
        type: SET_APPLY_FILTER_CONDITION,
        payload: {
            filterData: checkData,
            screenName: screenName,
            columnId: columnId,
            conditionId: conditionId,
        },
    });
}

function* sortingList(action) {
    let checkData;
    const { columnId, conditionId, allData, screenName } = action.data;

    console.log("sorting modal element is      ", action.data);

    const sortingProduct = (a, b) => {
        if (conditionId === 2) {
            return a[columnId] - b[columnId];
        }
        if (conditionId === 3) {
            return b[columnId] - a[columnId];
        }
        if (conditionId === 4) {
            return String(a[columnId]).trim().localeCompare(String(b[columnId]).trim());
        }
        if (conditionId === 5) {
            return String(b[columnId]).trim().localeCompare(String(a[columnId]).trim());
        }
    };

    checkData = yield allData.sort(sortingProduct);

    yield put({
        type: SET_APPLY_SORT_CONDITION,
        payload: {
            sortData: checkData,
            activityName: screenName,
            sortColumnId: columnId,
            sortConditionId: conditionId,
        },
    });
}

function* chnageThmeColor(action) {
    const { title, color } = action.data;
    console.log("title is     ", title);
    if (isEmpty(title)) {
        toast.error("Failed select theme section");
    } else if (isEmpty(color)) {
        toast.error("Failed select color");
    } else {
        yield put({ type: SET_THEME_COLOR, payload: action.data });
    }
}

function* filterSearch(action) {
    let filterData = [];
    const {
        sourceData,
        countryState,
        countryData,
        provienceState,
        provienceData,
        districtState,
        districtData,
        villageState,
        villageData,
    } = action.data;

    if (countryState === true) {
        filterData = yield sourceData.filter((item) => {
            return item.Country == countryData;
        });
    }

    if (provienceState === true) {
        if (filterData.length !== 0) {
            filterData = yield filterData.filter((item) => {
                return item.Province == provienceData;
            });
        } else {
            filterData = yield sourceData.filter((item) => {
                return item.Province == provienceData;
            });
        }
    }

    if (districtState === true) {
        if (filterData.length !== 0) {
            filterData = yield filterData.filter((item) => {
                return item.District == districtData;
            });
        } else {
            filterData = yield sourceData.filter((item) => {
                return item.District == districtData;
            });
        }
    }

    if (villageState === true) {
        if (filterData.length !== 0) {
            filterData = yield filterData.filter((item) => {
                return item.Village == villageData;
            });
        } else {
            filterData = yield sourceData.filter((item) => {
                return item.Village == villageData;
            });
        }
    }

    yield put({ type: SET_FILTER_DATA, payload: filterData });
}

function* ConstantSaga() {
    yield takeEvery(APPLY_FILTER_CONDITION, filterList);
    yield takeEvery(APPLY_SORT_CONDITION, sortingList);
    yield takeEvery(CHANGE_THEME_COLOR, chnageThmeColor);
    yield takeEvery(GET_FILTER_SEARCH_DATA, filterSearch);
}

export default ConstantSaga;
