import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import styled from "styled-components";
import { chartList } from "../Constant/MainFile";
import { canvasChatOption } from "../../JavaScript/ChartMain";
import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import {
  LineChart,
  BarChart,
  PieChart,
  ScatterChart,
  RadarChart,
  GaugeChart
} from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  LegendComponent,
  ToolboxComponent,
  DataZoomComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import Cookies from "universal-cookie";
import ChartModal from "../Components/Modal/ChartModal";
import Modal from "react-modal";
import { useDispatch, useSelector } from "react-redux";
import { chhoseGraphState, setLoader } from "../../Database/Action/ConstantAction";
import { graphModalStyle } from "../../Style/ModalStyle";
import { filterSolarCharger, getSolarCharger } from "../../Database/Action/DashboardAction";
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
  CanvasRenderer
]);

const Dashboard2 = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [checkThme, setCheckTheme] = useState("dark");
  const cookies = new Cookies();

  const graphState = useSelector((state) => state.ConstantReducer.graphState);
  const solarChager = useSelector((state) => state.DashboardReducer.solarChager);
  const filterSolarData = useSelector((state) => state.DashboardReducer.filterSolar);

  // ✅ State management
  const [solarData, setSolarData] = useState([]);
  const [filterSolar, setFilter] = useState([]);
  const [solarUniqueId, setSolarUnniqueId] = useState("0");
  const [eventCount, setEventCount] = useState("1");
  const [searchInput, setSearchInput] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [isChartReady, setIsChartReady] = useState(false);
  const [eventSourceError, setEventSourceError] = useState(false);
  
  // Add a ref to track the current device data
  const currentDeviceDataRef = useRef([]);
  
  const itemsPerPage = 9;
  
  // ✅ Safe array operations
  const uniqueUIDs = useMemo(() => 
    [...new Set((solarData || []).map(item => item?.UID).filter(Boolean))],
    [solarData]
  );
  
  const totalPages = Math.ceil((uniqueUIDs || []).length / itemsPerPage);
  const paginatedUIDs = useMemo(() => 
    (uniqueUIDs || []).slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
    [uniqueUIDs, currentPage, itemsPerPage]
  );

  const locationFilter = useCallback((uid) => {
    setIsDataLoading(true);
    setIsChartReady(false);
    setEventSourceError(false);
    dispatch(setLoader(true));
    setSolarUnniqueId(uid);
    setEventCount("1");
    // Clear previous data immediately when switching devices
    dispatch(filterSolarCharger([]));
  }, [dispatch]);

  // ✅ Initial data fetch
  useEffect(() => {
    dispatch(getSolarCharger({ navigate }));
  }, [dispatch, navigate]);

  // ✅ Update solar data from Redux
  useEffect(() => {
    setSolarData(solarChager || []);
    if (solarChager && solarChager.length !== 0) {
      // Only set default if not already set
      if (solarUniqueId === "0") {
        setSolarUnniqueId(solarChager[0]?.UID || "0");
      }
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

  // ✅ Device data fetch - FIXED: No infinite loop
  useEffect(() => {
    if (solarUniqueId === "0") return;

    let isComponentMounted = true;
    let timeoutId = null;

    const fetchDeviceData = async () => {
      try {
        setIsDataLoading(true);
        setIsChartReady(false);
        setEventSourceError(false);
        dispatch(setLoader(true));
        
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/getSolarChargerByUID/${solarUniqueId}`
        );
        
        if (!isComponentMounted) return;
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Fetched device data for:", solarUniqueId, data);
        
        if (data && data.status === 200 && data.data) {
          setEventCount("0");
          dispatch(filterSolarCharger(data.data));
        } else {
          throw new Error("Invalid data structure received");
        }
        
      } catch (error) {
        console.error("Error fetching device data:", error);
        if (isComponentMounted) {
          setEventSourceError(true);
          setIsDataLoading(false);
          setIsChartReady(false);
          dispatch(setLoader(false));
        }
      }
    };

    // Set timeout for data loading
    timeoutId = setTimeout(() => {
      if (isComponentMounted && isDataLoading) {
        console.error("Data loading timeout - 30 seconds exceeded");
        setEventSourceError(true);
        setIsDataLoading(false);
        setIsChartReady(false);
        dispatch(setLoader(false));
      }
    }, 30000);

    // Initial fetch
    fetchDeviceData();

    // Cleanup
    return () => {
      isComponentMounted = false;
      clearTimeout(timeoutId);
    };
  }, [solarUniqueId, dispatch]);

  // ✅ Theme management
  useEffect(() => {
    setCheckTheme(cookies.get("solorTheme") || "dark");
  }, [cookies]);

  // ✅ Search handler
  const handleSearch = useCallback((e) => {
    const value = e.target.value.toLowerCase();
    setSearchInput(value);

    if (!value) {
      setSolarData(solarChager || []);
    } else {
      const filtered = (solarChager || []).filter(
        (item) =>
          item?.UID?.toLowerCase().includes(value) ||
          item?.Location?.toLowerCase().includes(value)
      );
      setSolarData(filtered || []);
    }
    setCurrentPage(1);
  }, [solarChager]);

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
          uid: solarUniqueId
        } 
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
                <div className="col-sm" style={{ flexBasis: "20%", maxWidth: "20%" }}>
                  <input
                    type="text"
                    placeholder="Search Unique Id"
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
                    <ul className="sm sm-blue" style={{ backgroundColor: "inherit", overflowY: "hidden", padding: "0" }}>
                      {(paginatedUIDs || []).map((uid, index) => (
                        <li key={`${uid}-${index}`}>
                          <a
                            className="fw-500"
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              locationFilter(uid);
                            }}
                            style={{
                              color: checkThme === "light" ? "black" : "white",
                              fontWeight: solarUniqueId === uid ? "bold" : "normal",
                              backgroundColor: solarUniqueId === uid ? "rgba(0, 82, 204, 0.2)" : "transparent",
                              display: "block",
                              padding: "10px 16px",
                              textDecoration: "none"
                            }}
                          >
                            {uid}
                          </a>
                        </li>
                      ))}

                      {paginatedUIDs.length === 0 && (
                        <li style={{ textAlign: "center", padding: "20px", color: checkThme === "light" ? "black" : "white" }}>
                          No devices found
                        </li>
                      )}

                      {paginatedUIDs.length > 0 && (
                        <li style={{ textAlign: "center", padding: "10px 0", position: "sticky", bottom: 0, backgroundColor: checkThme === "light" ? "#f8f9fa" : "#343a40" }}>
                          <PaginationButton
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                          >
                            Prev
                          </PaginationButton>
                          <span style={{ margin: "0 8px", color: checkThme === "light" ? "black" : "white" }}>
                            {currentPage} / {totalPages || 1}
                          </span>
                          <PaginationButton
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages || totalPages === 0}
                          >
                            Next
                          </PaginationButton>
                        </li>
                      )}
                    </ul>
                  </div>
                </div>

                {/* Main content area */}
                <div className="col-sm" style={{ flexBasis: "80%", maxWidth: "80%" }}>
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th colSpan={3} className="tableHeader">
                          Unique Id: {solarUniqueId || 'No Location'}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td
                          className={hasData ? "record_style" : "record_style_disabled"}
                          onClick={handleViewGraph}
                          style={{ 
                            cursor: hasData ? "pointer" : "not-allowed", 
                            opacity: hasData ? 1 : 0.5,
                            padding: "15px"
                          }}
                        >
                          {currentFilterSolar.length} Records {hasData ? "view in graph" : "(no data)"}
                        </td>
                        <td style={{ padding: "15px" }}>
                          {hasData ? (
                            <>
                              Last uploaded Time: {firstRecord?.Time ? 
                                moment(firstRecord.Time).format("YYYY-MM-DD HH:mm:ss") : 
                                'N/A'
                              }<br />
                              Last Recorded Time: {firstRecord?.RecordTime ? 
                                moment(firstRecord.RecordTime).format("YYYY-MM-DD HH:mm:ss") : 
                                'N/A'
                              }
                            </>
                          ) : (
                            "No data available"
                          )}
                        </td>
                        <td style={{ padding: "15px" }}>
                          {solarUniqueId || 'No UID'}
                          {hasData && (
                            <div style={{ fontSize: "12px", marginTop: "5px", color: "#666" }}>
                              Location: {firstRecord?.Location || 'N/A'}
                            </div>
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  {eventSourceError && !isDataLoading && (
                    <div style={{
                      padding: "15px",
                      backgroundColor: "#ff562f",
                      color: "white",
                      borderRadius: "5px",
                      marginBottom: "20px",
                      textAlign: "center"
                    }}>
                      Failed to load data. Please check your connection and try again.
                      <button 
                        onClick={() => locationFilter(solarUniqueId)}
                        style={{
                          marginLeft: "10px",
                          background: "white",
                          color: "#ff562f",
                          border: "none",
                          padding: "5px 10px",
                          borderRadius: "3px",
                          cursor: "pointer"
                        }}
                      >
                        Retry
                      </button>
                    </div>
                  )}

                  {isDataLoading && !eventSourceError && (
                    <div style={{
                      padding: "20px",
                      backgroundColor: "#0052cc",
                      color: "white",
                      borderRadius: "5px",
                      marginBottom: "20px",
                      textAlign: "center"
                    }}>
                      Loading device data for {solarUniqueId}...
                    </div>
                  )}

                  {isChartReady && hasData && (
                    <div className="col-12 mb-20">
                      <div className="row row-cols-1 row-cols-lg-4 graphlayout mt-4">
                        {chartList.map((item, index) => {
                          const chartOption = canvasChatOption(currentFilterSolar, item);
                          
                          if (!chartOption) return null;
                          
                          return (
                            <div
                              key={`${item.id}-${index}`}
                              className="card chart-card"
                              style={{
                                border: "1px solid #ddd",
                                borderRadius: "8px",
                                overflow: "hidden"
                              }}
                            >
                              <div style={{ height: "150px", width: "100%" }}>
                                <ReactEChartsCore
                                  echarts={echarts}
                                  option={chartOption}
                                  notMerge={true}
                                  lazyUpdate={true}
                                  theme={checkThme === "light" ? "light" : "dark"}
                                  style={{ height: '100%', width: '100%' }}
                                  opts={{ renderer: 'canvas' }}
                                />
                              </div>
                              <h5 className="fw-500 text-center" style={{ 
                                margin: "10px 0",
                                padding: "5px",
                                fontSize: "14px"
                              }}>
                                {item.title}
                              </h5>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {!isDataLoading && !eventSourceError && !hasData && solarUniqueId !== "0" && (
                    <div style={{
                      padding: "40px",
                      textAlign: "center",
                      color: checkThme === "light" ? "black" : "white",
                      fontSize: "18px"
                    }}>
                      No data available for device {solarUniqueId}. Please select another device or wait for data to be received.
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
  table, th, td {
    border: 1px solid #dee2e6;
    border-collapse: collapse;
  }
  ul {
    width: 100% !important;
    height: 500px;
    position: relative !important;
    overflow-y: auto;
    overflow-x: hidden;
    display: block;
    padding-bottom: 50px;
  }
  ul li {
    width: 100%;
    padding: 0;
    border-bottom: 1px solid #a1a4b5;
    transition: background-color 0.2s;
    list-style: none;

    &:hover {
      width: 100%;
      background-color: rgba(0, 82, 204, 0.1);
    }
  }
  ul li:last-child {
    border-bottom: none;
  }
  .graphlayout {
    display: flex;
    flex-wrap: wrap;
    align-items: stretch;
    justify-content: flex-start;
    margin: 10px 5px;
    gap: 15px;
  }
  .tableHeader {
    text-align: center;
    background: ${({ theme }) => theme.colors.themeColor};
    font-size: 18px;
    font-weight: bold;
    color: white;
    padding: 15px;
  }
  .record_style {
    cursor: pointer;
    text-decoration: underline;
    font-weight: bold;
    color: #0052cc;
    font-size: 16px;
    transition: all 0.2s;
    &:hover,
    &:active {
      color: red;
      background-color: rgba(0, 82, 204, 0.05);
    }
  }
  .record_style_disabled {
    text-decoration: none;
    font-weight: bold;
    color: #999;
    font-size: 16px;
  }
  .chart-card {
    flex: 1;
    min-width: 280px;
    max-width: 320px;
    height: 220px;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    transition: transform 0.2s, box-shadow 0.2s;
    
    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
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
  padding: 8px 16px;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  transition: background 0.2s, transform 0.1s;
  margin: 0 5px;

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