// rootReducer.js
import { combineReducers } from "redux";
import DashboardReducer from "./Reducer/DashboardReducer";
import ConstantReducer from "./Reducer/ConstantReducer";
import DemoReducer from "./Reducer/DemoReducer";

export default combineReducers({
    DashboardReducer,
    ConstantReducer,
    DemoReducer,
})