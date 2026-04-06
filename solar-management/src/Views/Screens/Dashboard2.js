import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import styled from "styled-components";
import { chartList } from "../Constant/MainFile";
import { canvasChatOption } from "../../JavaScript/ChartMain";
import ReactEChartsCore from "echarts-for-react/lib/core";
import * as echarts from "echarts/core";
import {
  LineChart,
  BarChart,
  PieChart,
  ScatterChart,
  RadarChart,
  GaugeChart,
} from "echarts/charts";
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  LegendComponent,
  ToolboxComponent,
  DataZoomComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import Cookies from "universal-cookie";
import ChartModal from "../Components/Modal/ChartModal";
import Modal from "react-modal";
import { useDispatch, useSelector } from "react-redux";
import {
  chhoseGraphState,
  setLoader,
} from "../../Database/Action/ConstantAction";
import { graphModalStyle } from "../../Style/ModalStyle";
import {
  filterSolarCharger,
  getSolarCharger,
} from "../../Database/Action/DashboardAction";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import Loader from "../Components/Loader";

// Register ECharts components
echarts.use([
  LineChart,
  BarChart,
  PieChart,
  ScatterChart,
  RadarChart,
  GaugeChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  LegendComponent,
  ToolboxComponent,
  DataZoomComponent,
  CanvasRenderer,
]);

const Dashboard2 = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [checkThme, setCheckTheme] = useState("dark");
  const cookies = new Cookies();

  const graphState = useSelector((state) => state.ConstantReducer.graphState);
  const solarChager = useSelector(
    (state) => state.DashboardReducer.solarChager,
  );
  const filterSolarData = useSelector(
    (state) => state.DashboardReducer.filterSolar,
  );

  // ✅ State management
  const [solarData, setSolarData] = useState([]);
  const [filterSolar, setFilter] = useState([]);
  const currentDeviceDataRef = useRef([]);
  const [solarUniqueId, setSolarUnniqueId] = useState("0");
  const [eventCount, setEventCount] = useState("1");
  const [searchInput, setSearchInput] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [isChartReady, setIsChartReady] = useState(false);

  const itemsPerPage = 10;

  // ✅ Safe array operations
  const uniqueUIDs = useMemo(
    () => [
      ...new Set((solarData || []).map((item) => item?.UID).filter(Boolean)),
    ],
    [solarData],
  );

  const totalPages = Math.ceil((uniqueUIDs || []).length / itemsPerPage);
  const paginatedUIDs = useMemo(
    () =>
      (uniqueUIDs || []).slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage,
      ),
    [uniqueUIDs, currentPage, itemsPerPage],
  );

  const locationFilter = useCallback(
    (uid) => {
      setIsDataLoading(true);
      setIsChartReady(false);
      dispatch(setLoader(true));
      setSolarUnniqueId(uid);
      setEventCount("1");
      // Clear previous data immediately when switching devices
      dispatch(filterSolarCharger([]));
    },
    [dispatch],
  );

  // ✅ Initial data fetch
  useEffect(() => {
    dispatch(getSolarCharger({ navigate }));
  }, [dispatch, navigate]);
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  // ✅ Update solar data from Redux
  useEffect(() => {
    setSolarData(solarChager || []);
    if (solarChager && solarChager.length !== 0) {
      setSolarUnniqueId(solarChager[0]?.UID || "0");
    }
  }, [solarChager]);

  // ✅ Update filter data and mark charts as ready
  useEffect(() => {
    const newFilterData = filterSolarData || [];
    setFilter(newFilterData);

    // Update the ref with current device data
    currentDeviceDataRef.current = newFilterData;

    if (newFilterData.length > 0) {
      setIsDataLoading(false);
      setIsChartReady(true);
      dispatch(setLoader(false));
    }
  }, [filterSolarData, dispatch]);

  // ✅ Device data fetch - WITHOUT TIMEOUT
  useEffect(() => {
    if (solarUniqueId === "0") return;

    let isComponentMounted = true;

    const fetchDeviceData = async () => {
      try {
        setIsDataLoading(true);
        setIsChartReady(false);
        dispatch(setLoader(true));

        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/getSolarChargerByUID/${solarUniqueId}`,
        );

        if (!isComponentMounted) return;

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data && data.status === 200 && data.data) {
          setEventCount("0");
          dispatch(filterSolarCharger(data.data));
        } else {
          throw new Error("Invalid data structure received");
        }
      } catch (error) {
        console.error("Error fetching device data:", error);
        if (isComponentMounted) {
          setIsDataLoading(false);
          setIsChartReady(false);
          dispatch(setLoader(false));
        }
      }
    };

    // Initial fetch
    fetchDeviceData();

    // Cleanup
    return () => {
      isComponentMounted = false;
    };
  }, [solarUniqueId, dispatch]);

  // ✅ Theme management
  useEffect(() => {
    setCheckTheme(cookies.get("solorTheme") || "dark");
  }, [cookies]);

  // ✅ Search handler
  const handleSearch = useCallback(
    (e) => {
      const value = e.target.value.toLowerCase();
      setSearchInput(value);

      if (!value) {
        setSolarData(solarChager || []);
      } else {
        const filtered = (solarChager || []).filter(
          (item) =>
            item?.UID?.toLowerCase().includes(value) ||
            item?.Location?.toLowerCase().includes(value),
        );
        setSolarData(filtered || []);
      }
      setCurrentPage(1);
    },
    [solarChager],
  );

  // ✅ Safe data access
  const currentFilterSolar = filterSolar || [];
  const firstRecord = currentFilterSolar[0] || {};
  const hasData = currentFilterSolar.length > 0;

  // ✅ Handle navigation to graph page
  const handleViewGraph = useCallback(() => {
    if (hasData) {
      navigate("/show_graph", {
        state: {
          sourceData: currentFilterSolar,
          uid: solarUniqueId,
        },
      });
    }
  }, [hasData, currentFilterSolar, solarUniqueId, navigate]);

  return (
    <Wrapper>
      {isDataLoading && <Loader />}

      <Modal
        isOpen={graphState}
        onRequestClose={() => dispatch(chhoseGraphState(false))}
        style={graphModalStyle}
        contentLabel="Chart Options Modal"
      >
        <ChartModal />
      </Modal>

      <div className="content-wrapper">
        <div className="container-full">
          <section className="content">
            <div className="col-12 mb-20">
              <div className="row row-cols-1 mt-4">
                {/* Sidebar with device list */}
                <div
                  className="col-sm"
                  style={{ flexBasis: "20%", maxWidth: "20%" }}
                >
                  <input
                    type="text"
                    placeholder="Search UID & Location"
                    value={searchInput}
                    onChange={handleSearch}
                    style={{
                      width: "75%",
                      margin: "0px 8px 16px 0px",
                      display: "block",
                      padding: "15px 16px 15px 9px",
                      borderRadius: "3px",
                      background: `#0052cc url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' fill='%23a1a4b5' viewBox='0 0 24 24'><path d='M10 2a8 8 0 105.293 14.293l4.707 4.707 1.414-1.414-4.707-4.707A8 8 0 0010 2zm0 2a6 6 0 110 12 6 6 0 010-12z'/></svg>") no-repeat right 10px center`,
                      backgroundSize: "18px",
                      border: "none",
                      outline: "none",
                      color: "white",
                    }}
                    className="white-placeholder"
                  />

                  <div
                    className="card h-p100"
                    style={{
                      width: "75%",
                      alignSelf: "center",
                      position: "relative",
                      zIndex: "1",
                    }}
                  >
                    <ul
                      className="sm sm-blue"
                      style={{
                        backgroundColor: "inherit",
                        overflowY: "hidden",
                        padding: "0",
                      }}
                    >
                      {(paginatedUIDs || []).map((uid, index) => {
                        // Find the device data for this UID to get location
                        const deviceData = solarData.find(
                          (item) => item?.UID === uid,
                        );
                        const location = deviceData?.Location || uid; // Fallback to UID if no location
                        const isSelected = solarUniqueId === uid;

                        return (
                          <li key={`${uid}-${index}`}>
                            <a
                              className="fw-500"
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                if (!isSelected) {
                                  locationFilter(uid);
                                }
                              }}
                              style={{
                                color:
                                  checkThme === "light" ? "black" : "white",
                                fontWeight: isSelected ? "bold" : "normal",
                                backgroundColor: isSelected
                                  ? "rgba(0, 82, 204, 0.3)"
                                  : "transparent",
                                display: "block",
                                padding: "10px 16px",
                                textDecoration: "none",
                                cursor: isSelected ? "default" : "pointer",
                                opacity: isSelected ? 0.8 : 1,
                                pointerEvents: isSelected ? "none" : "auto",
                              }}
                              title={
                                isSelected
                                  ? "Currently selected"
                                  : `Click to select ${location}`
                              }
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                }}
                              >
                                <span style={{ fontWeight: "bold" }}>
                                  {location}
                                  {isSelected && (
                                    <span
                                      style={{
                                        marginLeft: "8px",
                                        fontSize: "10px",
                                        backgroundColor: "#0052cc",
                                        color: "white",
                                        padding: "2px 6px",
                                        borderRadius: "10px",
                                      }}
                                    >
                                      ✓ Active
                                    </span>
                                  )}
                                </span>
                                {isSelected && isDataLoading && (
                                  <span
                                    className="spinner-border spinner-border-sm"
                                    style={{
                                      color: "white",
                                      width: "12px",
                                      height: "12px",
                                      marginLeft: "8px",
                                    }}
                                  ></span>
                                )}
                              </div>
                              <div
                                style={{
                                  fontSize: "11px",
                                  opacity: isSelected ? 0.5 : 0.7,
                                  marginTop: "2px",
                                  fontWeight: "normal",
                                  wordBreak: "break-all",
                                  fontStyle: isSelected ? "italic" : "normal",
                                }}
                              >
                                UID: {uid}
                                {isSelected && (
                                  <div
                                    style={{
                                      fontSize: "10px",
                                      color: "#4CAF50",
                                      marginTop: "2px",
                                    }}
                                  >
                                    {isDataLoading
                                      ? "Loading data..."
                                      : "✓ Data loaded"}
                                  </div>
                                )}
                              </div>
                            </a>
                          </li>
                        );
                      })}

                      {paginatedUIDs.length === 0 && (
                        <li
                          style={{
                            textAlign: "center",
                            padding: "20px",
                            color: checkThme === "light" ? "black" : "white",
                          }}
                        >
                          No devices found
                        </li>
                      )}

                      {paginatedUIDs.length > 0 && (
                        <li
                          style={{
                            textAlign: "center",
                            padding: "10px 0",
                            borderTop: "1px solid rgba(255,255,255,0.1)",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "5px",
                            }}
                          >
                            <PaginationButton
                              onClick={() =>
                                setCurrentPage((prev) => Math.max(prev - 1, 1))
                              }
                              disabled={currentPage === 1}
                              style={{ padding: "4px 10px", fontSize: "12px" }}
                            >
                              ← Prev
                            </PaginationButton>
                            <span
                              style={{
                                margin: "0 8px",
                                color:
                                  checkThme === "light" ? "black" : "white",
                                fontSize: "12px",
                                minWidth: "60px",
                              }}
                            >
                              {currentPage} / {totalPages || 1}
                            </span>
                            <PaginationButton
                              onClick={() =>
                                setCurrentPage((prev) =>
                                  Math.min(prev + 1, totalPages),
                                )
                              }
                              disabled={
                                currentPage === totalPages || totalPages === 0
                              }
                              style={{ padding: "4px 10px", fontSize: "12px" }}
                            >
                              Next →
                            </PaginationButton>
                          </div>
                          <div
                            style={{
                              fontSize: "11px",
                              color: checkThme === "light" ? "#666" : "#aaa",
                              marginTop: "5px",
                            }}
                          >
                            Showing{" "}
                            {Math.min(
                              (currentPage - 1) * itemsPerPage + 1,
                              uniqueUIDs.length,
                            )}
                            -
                            {Math.min(
                              currentPage * itemsPerPage,
                              uniqueUIDs.length,
                            )}{" "}
                            of {uniqueUIDs.length}
                          </div>
                        </li>
                      )}
                    </ul>
                  </div>
                </div>

                {/* Main content area */}
                <div
                  className="col-sm"
                  style={{ flexBasis: "80%", maxWidth: "80%" }}
                >
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th colSpan={3} className="tableHeader">
                          Device Location -{" "}
                          {firstRecord?.Location ||
                            solarUniqueId ||
                            "No Location"}
                          <div
                            style={{
                              fontSize: "12px",
                              fontWeight: "normal",
                              marginTop: "5px",
                            }}
                          >
                            UID: {solarUniqueId || "N/A"} | Last Update:{" "}
                            {firstRecord?.RecordTime
                              ? moment(firstRecord.RecordTime).format(
                                  "HH:mm:ss",
                                )
                              : "N/A"}
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="text-center">
                          <div
                            style={{
                              padding: "10px",
                              backgroundColor: "rgba(0,82,204,0.1)",
                              borderRadius: "5px",
                              border: "1px solid rgba(0,82,204,0.3)",
                            }}
                          >
                            <strong>{currentFilterSolar.length}</strong> Records
                            <br />
                            <small>
                              {hasData ? (
                                <span
                                  onClick={handleViewGraph}
                                  style={{
                                    cursor: "pointer",
                                    color: "#0052cc",
                                    color: "#BF0000",
                                    textDecoration: "underline",
                                  }}
                                >
                                  Click to view detailed graph
                                </span>
                              ) : (
                                <span style={{ color: "#999" }}>
                                  No data available
                                </span>
                              )}
                            </small>
                          </div>
                        </td>
                        <td>
                          <div style={{ fontSize: "14px" }}>
                            <strong>Last Upload:</strong>{" "}
                            {firstRecord?.Time
                              ? moment(firstRecord.Time).format(
                                  "M/D/YYYY, h:mm:ss A",
                                )
                              : "N/A"}
                            <br />
                            <strong>Last Record:</strong>{" "}
                            {firstRecord?.RecordTime
                              ? moment(firstRecord.RecordTime).format(
                                  "M/D/YYYY, h:mm:ss A",
                                )
                              : "N/A"}
                          </div>
                        </td>
                        <td className="text-center">
                          <div style={{ fontSize: "14px" }}>
                            <strong>
                              Current Values:- SolarPower={firstRecord?.PVKWh}
                            </strong>
                            <br />
                            PV: {firstRecord?.PvVolt || 0}V /{" "}
                            {firstRecord?.PvCur || 0}A<br />
                            Battery: {firstRecord?.BatVoltage || 0}V<br />
                            Load: {firstRecord?.LoadVoltage || 0}V /{" "}
                            {firstRecord?.LoadCurrent || 0}A
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Only show loading message when data is loading */}
                  {isDataLoading && (
                    <div
                      style={{
                        padding: "20px",
                        backgroundColor: "#0052cc",
                        color: "white",
                        borderRadius: "5px",
                        marginBottom: "20px",
                        textAlign: "center",
                      }}
                    >
                      Loading device data for {solarUniqueId}...
                    </div>
                  )}

                  {isChartReady && hasData && (
                    <div className="col-12 mb-20">
                      <div className="row row-cols-1 row-cols-lg-4 graphlayout mt-4">
                        {chartList.map((item, index) => {
                          const chartOption = canvasChatOption(
                            currentFilterSolar,
                            item,
                          );

                          if (!chartOption) return null;

                          return (
                            <div
                              key={`${item.id}-${index}`}
                              className="card chart-card"
                            >
                              <ReactEChartsCore
                                echarts={echarts}
                                option={chartOption}
                                notMerge={true}
                                lazyUpdate={true}
                                theme={checkThme === "light" ? "light" : "dark"}
                                style={{ height: "100%", width: "100%" }}
                                opts={{ renderer: "canvas" }}
                              />
                              <h5 className="fw-500 text-center">
                                {item.title}
                              </h5>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {!isDataLoading && !hasData && solarUniqueId !== "0" && (
                    <div
                      style={{
                        padding: "40px",
                        textAlign: "center",
                        color: checkThme === "light" ? "black" : "white",
                        fontSize: "18px",
                      }}
                    >
                      No data available for device {solarUniqueId}. Please
                      select another device or wait for data to be received.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </Wrapper>
  );
};

const Wrapper = styled.section`
  input.white-placeholder {
    color: white;
    &::placeholder {
      color: #a1a4b5;
    }
  }
  table,
  th,
  td {
    border: 1px solid black;
    border-collapse: collapse;
  }
  ul {
    width: 100% !important;
    height: 100% !important;
    position: relative !important;
    overflow-y: scroll;
    overflow-x: hidden;
    display: inline-block;
    padding-bottom: 30px;
  }
  ul li {
    width: 100%;
    border-bottom: 1px solid #a1a4b5;
    transition: background-color 0.2s;

    &:hover {
      background-color: rgba(0, 82, 204, 0.1);
    }

    &:last-child {
      border-bottom: none;
      background-color: transparent;
      &:hover {
        background-color: transparent;
      }
    }
  }

  // Spinner animation
  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .spinner-border {
    animation: spin 1s linear infinite;
    border: 2px solid currentColor;
    border-right-color: transparent;
    border-radius: 50%;
    display: inline-block;
  }

  .spinner-border-sm {
    width: 1rem;
    height: 1rem;
    border-width: 0.2em;
  }

  // Add disabled state styles
  .disabled-item {
    opacity: 0.6;
    cursor: not-allowed !important;

    &:hover {
      background-color: transparent !important;
    }
  }

  .graphlayout {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    margin: 10px 5px;
  }
  .tableHeader {
    text-align: center;
    background: ${({ theme }) => theme.colors.themeColor};
    font-size: 18px;
    font-weight: bold;
    color: white;
  }
  .record_style {
    cursor: pointer;
    text-decoration: underline;
    font-weight: bold;
    color: #0052cc;
    font-size: 16px;
    transition: color 0.2s;
    &:hover,
    &:active {
      color: red;
    }
  }
  .record_style_disabled {
    text-decoration: none;
    font-weight: bold;
    color: #999;
    font-size: 16px;
  }
  .chart-card {
    margin: 10px;
    width: 280px;
    height: 220px;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    padding: 10px;
    transition:
      transform 0.2s,
      box-shadow 0.2s;

    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
  }
  .echarts-for-react {
    height: 150px !important;
    width: 100% !important;
    min-height: 150px;
  }
`;

const PaginationButton = styled.button`
  background: ${({ theme }) => theme.colors.themeColor};
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  transition:
    background 0.2s,
    transform 0.1s;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.themeColorHover || "#004bb5"};
    transform: scale(1.05);
  }

  &:active:not(:disabled) {
    transform: scale(0.95);
  }

  &:disabled {
    background: #cccccc;
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

export default Dashboard2;




// import React, {
//   useEffect,
//   useState,
//   useCallback,
//   useMemo,
//   useRef,
// } from "react";
// import styled from "styled-components";
// import { chartList } from "../Constant/MainFile";
// import { canvasChatOption } from "../../JavaScript/ChartMain";
// import ReactEChartsCore from "echarts-for-react/lib/core";
// import * as echarts from "echarts/core";
// import {
//   LineChart,
//   BarChart,
//   PieChart,
//   ScatterChart,
//   RadarChart,
//   GaugeChart,
// } from "echarts/charts";
// import {
//   TitleComponent,
//   TooltipComponent,
//   GridComponent,
//   DatasetComponent,
//   TransformComponent,
//   LegendComponent,
//   ToolboxComponent,
//   DataZoomComponent,
// } from "echarts/components";
// import { CanvasRenderer } from "echarts/renderers";
// import Cookies from "universal-cookie";
// import ChartModal from "../Components/Modal/ChartModal";
// import Modal from "react-modal";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   chhoseGraphState,
//   setLoader,
// } from "../../Database/Action/ConstantAction";
// import { graphModalStyle } from "../../Style/ModalStyle";
// import {
//   filterSolarCharger,
//   getSolarCharger,
// } from "../../Database/Action/DashboardAction";
// import { useNavigate } from "react-router-dom";
// import moment from "moment";
// import Loader from "../Components/Loader";

// // Register ECharts components
// echarts.use([
//   LineChart,
//   BarChart,
//   PieChart,
//   ScatterChart,
//   RadarChart,
//   GaugeChart,
//   TitleComponent,
//   TooltipComponent,
//   GridComponent,
//   DatasetComponent,
//   TransformComponent,
//   LegendComponent,
//   ToolboxComponent,
//   DataZoomComponent,
//   CanvasRenderer,
// ]);

// const Dashboard2 = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const [checkThme, setCheckTheme] = useState("dark");
//   const cookies = new Cookies();

//   const graphState = useSelector((state) => state.ConstantReducer.graphState);
//   const solarChager = useSelector(
//     (state) => state.DashboardReducer.solarChager,
//   );
//   const filterSolarData = useSelector(
//     (state) => state.DashboardReducer.filterSolar,
//   );

//   // ✅ State management
//   const [solarData, setSolarData] = useState([]);
//   const [filterSolar, setFilter] = useState([]);
//   const currentDeviceDataRef = useRef([]);
//   const [solarUniqueId, setSolarUnniqueId] = useState("0");
//   const [eventCount, setEventCount] = useState("1");
//   const [searchInput, setSearchInput] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [isDataLoading, setIsDataLoading] = useState(true);
//   const [isChartReady, setIsChartReady] = useState(false);

//   const itemsPerPage = 10;

//   // ✅ Safe array operations
//   const uniqueUIDs = useMemo(
//     () => [
//       ...new Set((solarData || []).map((item) => item?.UID).filter(Boolean)),
//     ],
//     [solarData],
//   );

//   const totalPages = Math.ceil((uniqueUIDs || []).length / itemsPerPage);
//   const paginatedUIDs = useMemo(
//     () =>
//       (uniqueUIDs || []).slice(
//         (currentPage - 1) * itemsPerPage,
//         currentPage * itemsPerPage,
//       ),
//     [uniqueUIDs, currentPage, itemsPerPage],
//   );

//   const locationFilter = useCallback(
//     (uid) => {
//       setIsDataLoading(true);
//       setIsChartReady(false);
//       dispatch(setLoader(true));
//       setSolarUnniqueId(uid);
//       setEventCount("1");
//       // Clear previous data immediately when switching devices
//       dispatch(filterSolarCharger([]));
//     },
//     [dispatch],
//   );

//   // ✅ Initial data fetch
//   useEffect(() => {
//     dispatch(getSolarCharger({ navigate }));
//   }, [dispatch, navigate]);
//   const formatDate = (dateString) => {
//     if (!dateString) return "N/A";

//     return new Date(dateString).toLocaleString("en-US", {
//       year: "numeric",
//       month: "numeric",
//       day: "numeric",
//       hour: "numeric",
//       minute: "2-digit",
//       second: "2-digit",
//       hour12: true,
//     });
//   };

//   // ✅ Update solar data from Redux
//   useEffect(() => {
//     setSolarData(solarChager || []);
//     if (solarChager && solarChager.length !== 0) {
//       setSolarUnniqueId(solarChager[0]?.UID || "0");
//     }
//   }, [solarChager]);

//   // ✅ Update filter data and mark charts as ready
//   useEffect(() => {
//     const newFilterData = filterSolarData || [];
//     setFilter(newFilterData);

//     // Update the ref with current device data
//     currentDeviceDataRef.current = newFilterData;

//     if (newFilterData.length > 0) {
//       setIsDataLoading(false);
//       setIsChartReady(true);
//       dispatch(setLoader(false));
//     }
//   }, [filterSolarData, dispatch]);

//   // ✅ Device data fetch - WITHOUT TIMEOUT
//   useEffect(() => {
//     if (solarUniqueId === "0") return;

//     let isComponentMounted = true;

//     const fetchDeviceData = async () => {
//       try {
//         setIsDataLoading(true);
//         setIsChartReady(false);
//         dispatch(setLoader(true));

//         const response = await fetch(
//           `${process.env.REACT_APP_BASE_URL}/getSolarChargerByUID/${solarUniqueId}`,
//         );

//         if (!isComponentMounted) return;

//         if (!response.ok) {
//           throw new Error(`HTTP error! status: ${response.status}`);
//         }

//         const data = await response.json();

//         if (data && data.status === 200 && data.data) {
//           setEventCount("0");
//           dispatch(filterSolarCharger(data.data));
//         } else {
//           throw new Error("Invalid data structure received");
//         }
//       } catch (error) {
//         console.error("Error fetching device data:", error);
//         if (isComponentMounted) {
//           setIsDataLoading(false);
//           setIsChartReady(false);
//           dispatch(setLoader(false));
//         }
//       }
//     };

//     // Initial fetch
//     fetchDeviceData();

//     // Cleanup
//     return () => {
//       isComponentMounted = false;
//     };
//   }, [solarUniqueId, dispatch]);

//   // ✅ Theme management
//   useEffect(() => {
//     setCheckTheme(cookies.get("solorTheme") || "dark");
//   }, [cookies]);

//   // ✅ Search handler
//   const handleSearch = useCallback(
//     (e) => {
//       const value = e.target.value.toLowerCase();
//       setSearchInput(value);

//       if (!value) {
//         setSolarData(solarChager || []);
//       } else {
//         const filtered = (solarChager || []).filter(
//           (item) =>
//             item?.UID?.toLowerCase().includes(value) ||
//             item?.Location?.toLowerCase().includes(value),
//         );
//         setSolarData(filtered || []);
//       }
//       setCurrentPage(1);
//     },
//     [solarChager],
//   );

//   // ✅ Safe data access
//   const currentFilterSolar = filterSolar || [];
//   const firstRecord = currentFilterSolar[0] || {};
//   const hasData = currentFilterSolar.length > 0;

//   // ✅ Handle navigation to graph page
//   const handleViewGraph = useCallback(() => {
//     if (hasData) {
//       navigate("/show_graph", {
//         state: {
//           sourceData: currentFilterSolar,
//           uid: solarUniqueId,
//         },
//       });
//     }
//   }, [hasData, currentFilterSolar, solarUniqueId, navigate]);

//   return (
//     <Wrapper checkThme={checkThme}>
//       {isDataLoading && <Loader />}

//       <Modal
//         isOpen={graphState}
//         onRequestClose={() => dispatch(chhoseGraphState(false))}
//         style={graphModalStyle}
//         contentLabel="Chart Options Modal"
//       >
//         <ChartModal />
//       </Modal>

//       <div className="content-wrapper">
//         <div className="container-full">
//           <section className="content">
//             <div className="col-12">
//               <div className="row row-cols-1 mt-4">
//                 {/* Sidebar with device list */}
//                 <SidebarWrapper>
//                   <SearchInput
//                     type="text"
//                     placeholder="Search UID & Location"
//                     value={searchInput}
//                     onChange={handleSearch}
//                     checkThme={checkThme}
//                   />

//                   <DeviceCard>
//                     <DeviceList>
//                       {(paginatedUIDs || []).map((uid, index) => {
//                         // Find the device data for this UID to get location
//                         const deviceData = solarData.find(
//                           (item) => item?.UID === uid,
//                         );
//                         const location = deviceData?.Location || uid; // Fallback to UID if no location
//                         const isSelected = solarUniqueId === uid;

//                         return (
//                           <DeviceItem key={`${uid}-${index}`}>
//                             <DeviceLink
//                               href="#"
//                               onClick={(e) => {
//                                 e.preventDefault();
//                                 if (!isSelected) {
//                                   locationFilter(uid);
//                                 }
//                               }}
//                               checkThme={checkThme}
//                               isSelected={isSelected}
//                             >
//                               <DeviceInfo>
//                                 <DeviceName isSelected={isSelected}>
//                                   {location}
//                                   {isSelected && <ActiveBadge>✓ Active</ActiveBadge>}
//                                 </DeviceName>
//                                 {isSelected && isDataLoading && <Spinner />}
//                               </DeviceInfo>
//                               <DeviceUID isSelected={isSelected}>
//                                 UID: {uid}
//                                 {isSelected && (
//                                   <DataStatus isSelected={isSelected}>
//                                     {isDataLoading
//                                       ? "Loading data..."
//                                       : "✓ Data loaded"}
//                                   </DataStatus>
//                                 )}
//                               </DeviceUID>
//                             </DeviceLink>
//                           </DeviceItem>
//                         );
//                       })}

//                       {paginatedUIDs.length === 0 && (
//                         <NoDevicesMessage checkThme={checkThme}>
//                           No devices found
//                         </NoDevicesMessage>
//                       )}

//                       {paginatedUIDs.length > 0 && (
//                         <PaginationContainer>
//                           <PaginationControls>
//                             <PaginationButton
//                               onClick={() =>
//                                 setCurrentPage((prev) => Math.max(prev - 1, 1))
//                               }
//                               disabled={currentPage === 1}
//                             >
//                               ← Prev
//                             </PaginationButton>
//                             <PageInfo checkThme={checkThme}>
//                               {currentPage} / {totalPages || 1}
//                             </PageInfo>
//                             <PaginationButton
//                               onClick={() =>
//                                 setCurrentPage((prev) =>
//                                   Math.min(prev + 1, totalPages),
//                                 )
//                               }
//                               disabled={
//                                 currentPage === totalPages || totalPages === 0
//                               }
//                             >
//                               Next →
//                             </PaginationButton>
//                           </PaginationControls>
//                           <PageRangeInfo checkThme={checkThme}>
//                             Showing{" "}
//                             {Math.min(
//                               (currentPage - 1) * itemsPerPage + 1,
//                               uniqueUIDs.length,
//                             )}
//                             -
//                             {Math.min(
//                               currentPage * itemsPerPage,
//                               uniqueUIDs.length,
//                             )}{" "}
//                             of {uniqueUIDs.length}
//                           </PageRangeInfo>
//                         </PaginationContainer>
//                       )}
//                     </DeviceList>
//                   </DeviceCard>
//                 </SidebarWrapper>

//                 {/* Main content area */}
//                 <MainContentWrapper>
//                   <StyledTable>
//                     <thead>
//                       <TableHeaderRow>
//                         <TableHeaderCell colSpan={3}>
//                           Device Location -{" "}
//                           {firstRecord?.Location ||
//                             solarUniqueId ||
//                             "No Location"}
//                           <DeviceMeta>
//                             UID: {solarUniqueId || "N/A"} | Last Update:{" "}
//                             {firstRecord?.RecordTime
//                               ? moment(firstRecord.RecordTime).format(
//                                   "HH:mm:ss",
//                                 )
//                               : "N/A"}
//                           </DeviceMeta>
//                         </TableHeaderCell>
//                       </TableHeaderRow>
//                     </thead>
//                     <tbody>
//                       <TableBodyRow>
//                         <TableDataCell center>
//                           <InfoBox>
//                             <strong>{currentFilterSolar.length}</strong> Records
//                             <br />
//                             <small>
//                               {hasData ? (
//                                 <ViewGraphLink onClick={handleViewGraph}>
//                                   Click to view detailed graph
//                                 </ViewGraphLink>
//                               ) : (
//                                 <NoDataText>No data available</NoDataText>
//                               )}
//                             </small>
//                           </InfoBox>
//                         </TableDataCell>
//                         <TableDataCell>
//                           <DataInfo>
//                             <strong>Last Upload:</strong>{" "}
//                             {firstRecord?.Time
//                               ? moment(firstRecord.Time).format(
//                                   "M/D/YYYY, h:mm:ss A",
//                                 )
//                               : "N/A"}
//                             <br />
//                             <strong>Last Record:</strong>{" "}
//                             {firstRecord?.RecordTime
//                               ? moment(firstRecord.RecordTime).format(
//                                   "M/D/YYYY, h:mm:ss A",
//                                 )
//                               : "N/A"}
//                           </DataInfo>
//                         </TableDataCell>
//                         <TableDataCell center>
//                           <DataInfo>
//                             <strong>
//                               Current Values:- SolarPower={firstRecord?.PVKWh}
//                             </strong>
//                             <br />
//                             PV: {firstRecord?.PvVolt || 0}V /{" "}
//                             {firstRecord?.PvCur || 0}A<br />
//                             Battery: {firstRecord?.BatVoltage || 0}V<br />
//                             Load: {firstRecord?.LoadVoltage || 0}V /{" "}
//                             {firstRecord?.LoadCurrent || 0}A
//                           </DataInfo>
//                         </TableDataCell>
//                       </TableBodyRow>
//                     </tbody>
//                   </StyledTable>

//                   {/* Only show loading message when data is loading */}
//                   {isDataLoading && (
//                     <LoadingMessage>
//                       Loading device data for {solarUniqueId}...
//                     </LoadingMessage>
//                   )}

//                   {isChartReady && hasData && (
//                     <ChartContainer>
//                       <ChartGrid>
//                         {chartList.map((item, index) => {
//                           const chartOption = canvasChatOption(
//                             currentFilterSolar,
//                             item,
//                           );

//                           if (!chartOption) return null;

//                           return (
//                             <ChartCard key={`${item.id}-${index}`}>
//                               <ReactEChartsCore
//                                 echarts={echarts}
//                                 option={chartOption}
//                                 notMerge={true}
//                                 lazyUpdate={true}
//                                 theme={checkThme === "light" ? "light" : "dark"}
//                                 style={{ height: "100%", width: "100%" }}
//                                 opts={{ renderer: "canvas" }}
//                               />
//                               <ChartTitle>{item.title}</ChartTitle>
//                             </ChartCard>
//                           );
//                         })}
//                       </ChartGrid>
//                     </ChartContainer>
//                   )}

//                   {!isDataLoading && !hasData && solarUniqueId !== "0" && (
//                     <NoDataMessage checkThme={checkThme}>
//                       No data available for device {solarUniqueId}. Please
//                       select another device or wait for data to be received.
//                     </NoDataMessage>
//                   )}
//                 </MainContentWrapper>
//               </div>
//             </div>
//           </section>
//         </div>
//       </div>
//     </Wrapper>
//   );
// };

// const Wrapper = styled.section`
//   input.white-placeholder {
//     color: white;
//     &::placeholder {
//       color: #a1a4b5;
//     }
//   }
//   table,
//   th,
//   td {
//     border: 1px solid black;
//     border-collapse: collapse;
//   }
// `;

// const SidebarWrapper = styled.div`
//   flex-basis: 20%;
//   max-width: 20%;
// `;

// const SearchInput = styled.input`
//   width: 75%;
//   margin: 0px 8px 16px 0px;
//   display: block;
//   padding: 15px 16px 15px 9px;
//   border-radius: 3px;
//   background: #0052cc url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' fill='%23a1a4b5' viewBox='0 0 24 24'><path d='M10 2a8 8 0 105.293 14.293l4.707 4.707 1.414-1.414-4.707-4.707A8 8 0 0010 2zm0 2a6 6 0 110 12 6 6 0 010-12z'/></svg>") no-repeat right 10px center;
//   background-size: 18px;
//   border: none;
//   outline: none;
//   color: white;
// `;

// const DeviceCard = styled.div`
//   width: 75%;
//   align-self: center;
//   position: relative;
//   z-index: 1;
// `;

// const DeviceList = styled.ul`
//   width: 100% !important;
//   height: 100% !important;
//   position: relative !important;
//   overflow-y: scroll;
//   overflow-x: hidden;
//   display: inline-block;
//   padding-bottom: 30px;
//   background-color: inherit;
//   padding: 0;
// `;

// const DeviceItem = styled.li`
//   width: 100%;
//   border-bottom: 1px solid #a1a4b5;
//   transition: background-color 0.2s;

//   &:hover {
//     background-color: rgba(0, 82, 204, 0.1);
//   }

//   &:last-child {
//     border-bottom: none;
//     background-color: transparent;
//     &:hover {
//       background-color: transparent;
//     }
//   }
// `;

// const DeviceLink = styled.a`
//   display: block;
//   padding: 10px 16px;
//   text-decoration: none;
//   cursor: ${({ isSelected }) => (isSelected ? "default" : "pointer")};
//   opacity: ${({ isSelected }) => (isSelected ? 0.8 : 1)};
//   pointer-events: ${({ isSelected }) => (isSelected ? "none" : "auto")};
//   color: ${({ checkThme, isSelected }) => 
//     isSelected ? "inherit" : (checkThme === "light" ? "black" : "white")};
//   font-weight: ${({ isSelected }) => (isSelected ? "bold" : "normal")};
//   background-color: ${({ isSelected }) =>
//     isSelected ? "rgba(0, 82, 204, 0.3)" : "transparent"};
// `;

// const DeviceInfo = styled.div`
//   display: flex;
//   align-items: center;
//   justify-content: space-between;
// `;

// const DeviceName = styled.span`
//   font-weight: bold;
// `;

// const ActiveBadge = styled.span`
//   margin-left: 8px;
//   font-size: 10px;
//   background-color: #0052cc;
//   color: white;
//   padding: 2px 6px;
//   border-radius: 10px;
// `;

// const Spinner = styled.span`
//   animation: spin 1s linear infinite;
//   border: 2px solid currentColor;
//   border-right-color: transparent;
//   border-radius: 50%;
//   display: inline-block;
//   width: 12px;
//   height: 12px;
//   color: white;
//   margin-left: 8px;

//   @keyframes spin {
//     0% {
//       transform: rotate(0deg);
//     }
//     100% {
//       transform: rotate(360deg);
//     }
//   }
// `;

// const DeviceUID = styled.div`
//   font-size: 11px;
//   opacity: ${({ isSelected }) => (isSelected ? 0.5 : 0.7)};
//   margin-top: 2px;
//   font-weight: normal;
//   word-break: break-all;
//   font-style: ${({ isSelected }) => (isSelected ? "italic" : "normal")};
// `;

// const DataStatus = styled.div`
//   font-size: 10px;
//   color: #4caf50;
//   margin-top: 2px;
// `;

// const NoDevicesMessage = styled.li`
//   text-align: center;
//   padding: 20px;
//   color: ${({ checkThme }) => (checkThme === "light" ? "black" : "white")};
//   list-style: none;
// `;

// const PaginationContainer = styled.li`
//   text-align: center;
//   padding: 10px 0;
//   border-top: 1px solid rgba(255, 255, 255, 0.1);
//   list-style: none;
// `;

// const PaginationControls = styled.div`
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   gap: 5px;
// `;

// const PageInfo = styled.span`
//   margin: 0 8px;
//   color: ${({ checkThme }) => (checkThme === "light" ? "black" : "white")};
//   font-size: 12px;
//   min-width: 60px;
// `;

// const PageRangeInfo = styled.div`
//   font-size: 11px;
//   color: ${({ checkThme }) => (checkThme === "light" ? "#666" : "#aaa")};
//   margin-top: 5px;
// `;

// const PaginationButton = styled.button`
//   background: ${({ theme }) => theme.colors.themeColor};
//   color: white;
//   border: none;
//   padding: 4px 10px;
//   border-radius: 5px;
//   cursor: pointer;
//   font-weight: bold;
//   font-size: 12px;
//   transition:
//     background 0.2s,
//     transform 0.1s;

//   &:hover:not(:disabled) {
//     background: ${({ theme }) => theme.colors.themeColorHover || "#004bb5"};
//     transform: scale(1.05);
//   }

//   &:active:not(:disabled) {
//     transform: scale(0.95);
//   }

//   &:disabled {
//     background: #cccccc;
//     cursor: not-allowed;
//     opacity: 0.6;
//   }
// `;

// const MainContentWrapper = styled.div`
//   flex-basis: 80%;
//   max-width: 80%;
// `;

// const StyledTable = styled.table`
//   width: 100%;
//   border-collapse: collapse;
//   margin-bottom: 20px;
// `;

// const TableHeaderRow = styled.tr``;

// const TableHeaderCell = styled.th`
//   text-align: center;
//   background: ${({ theme }) => theme.colors.themeColor};
//   font-size: 18px;
//   font-weight: bold;
//   color: white;
//   padding: 12px;
// `;

// const DeviceMeta = styled.div`
//   font-size: 12px;
//   font-weight: normal;
//   margin-top: 5px;
// `;

// const TableBodyRow = styled.tr``;

// const TableDataCell = styled.td`
//   padding: 10px;
//   text-align: ${({ center }) => (center ? "center" : "left")};
//   vertical-align: middle;
// `;

// const InfoBox = styled.div`
//   padding: 10px;
//   background-color: rgba(0, 82, 204, 0.1);
//   border-radius: 5px;
//   border: 1px solid rgba(0, 82, 204, 0.3);
// `;

// const ViewGraphLink = styled.span`
//   cursor: pointer;
//   color: #bf0000;
//   text-decoration: underline;
//   transition: color 0.2s;

//   &:hover {
//     color: #ff0000;
//   }
// `;

// const NoDataText = styled.span`
//   color: #999;
// `;

// const DataInfo = styled.div`
//   font-size: 14px;
// `;

// const LoadingMessage = styled.div`
//   padding: 20px;
//   background-color: #0052cc;
//   color: white;
//   border-radius: 5px;
//   margin-bottom: 20px;
//   text-align: center;
// `;

// const ChartContainer = styled.div`
//   margin-bottom: 20px;
// `;

// const ChartGrid = styled.div`
//   display: flex;
//   flex-wrap: wrap;
//   align-items: center;
//   justify-content: center;
//   margin: 10px 5px;
// `;

// const ChartCard = styled.div`
//   margin: 10px;
//   width: 280px;
//   height: 220px;
//   cursor: pointer;
//   display: flex;
//   flex-direction: column;
//   padding: 10px;
//   transition:
//     transform 0.2s,
//     box-shadow 0.2s;

//   &:hover {
//     transform: translateY(-5px);
//     box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
//   }

//   .echarts-for-react {
//     height: 150px !important;
//     width: 100% !important;
//     min-height: 150px;
//   }
// `;

// const ChartTitle = styled.h5`
//   font-weight: 500;
//   text-align: center;
//   margin-top: 10px;
//   margin-bottom: 0;
// `;

// const NoDataMessage = styled.div`
//   padding: 40px;
//   text-align: center;
//   color: ${({ checkThme }) => (checkThme === "light" ? "black" : "white")};
//   font-size: 18px;
// `;

// export default Dashboard2;