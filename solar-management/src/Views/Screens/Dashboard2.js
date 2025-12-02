// // dashboard2.js
// import React, { useEffect, useState } from "react";
// import styled from "styled-components";
// import { chartList } from "../Constant/MainFile";
// import { canvasChatOption } from "../../JavaScript/ChartMain";
// import ReactEChartsCore from 'echarts-for-react/lib/core';
// import * as echarts from 'echarts/core';
// import {
//   LineChart,
//   BarChart,
//   PieChart,
//   ScatterChart,
//   RadarChart,
//   GaugeChart
// } from 'echarts/charts';
// import {
//   TitleComponent,
//   TooltipComponent,
//   GridComponent,
//   DatasetComponent,
//   TransformComponent,
//   LegendComponent,
//   ToolboxComponent,
//   DataZoomComponent
// } from 'echarts/components';
// import { CanvasRenderer } from 'echarts/renderers';
// import Cookies from "universal-cookie";
// import ChartModal from "../Components/Modal/ChartModal";
// import Modal from "react-modal";
// import { useDispatch, useSelector } from "react-redux";
// import { chhoseGraphState, setLoader } from "../../Database/Action/ConstantAction";
// import { graphModalStyle } from "../../Style/ModalStyle";
// import { filterSolarCharger, getSolarCharger } from "../../Database/Action/DashboardAction";
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
//   CanvasRenderer
// ]);

// const Dashboard2 = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const [checkThme, setCheckTheme] = useState("dark");
//   const cookies = new Cookies();

//   const graphState = useSelector((state) => state.ConstantReducer.graphState);
//   const filterModelState = useSelector((state) => state.ConstantReducer.filterModelState);
//   const solarChager = useSelector((state) => state.DashboardReducer.solarChager);
//   const filterSolarData = useSelector((state) => state.DashboardReducer.filterSolar);

//   const [solarData, setSolarData] = useState([]);
//   const [filterSolar, setFilter] = useState([]);
//   const [solarUniqueId, setSolarUnniqueId] = useState("0");
//   const [eventCount, setEventCount] = useState("1");
//   const [searchInput, setSearchInput] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 10;
//   const uniqueUIDs = [...new Set(solarData.map(item => item.UID))];
//   const totalPages = Math.ceil(uniqueUIDs.length / itemsPerPage);
//   const paginatedUIDs = uniqueUIDs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);


//   const locationFilter = (uid) => {
//     dispatch(setLoader(true));
//     setSolarUnniqueId(uid);
//     setEventCount("1");
//   };

//   useEffect(() => {
//     dispatch(getSolarCharger({ navigate }));
//   }, [dispatch]);

//   useEffect(() => {
//     setSolarData(solarChager);
//     if (solarChager.length !== 0) {
//       setSolarUnniqueId(solarChager[0]?.UID);
//     }
//   }, [solarChager]);

//   useEffect(() => {
//     setFilter(filterSolarData);
//   }, [filterSolarData]);

//   useEffect(() => {
//     if (solarUniqueId !== "0") {
//       const eventSource = new EventSource(
//         process.env.REACT_APP_BASE_URL + `event/${solarUniqueId}/${eventCount === '0' ? "0" : "1"}`
//       );

//       if (typeof EventSource !== "undefined") {
//         console.log("EventSource connected");
//       } else {
//         console.log("EventSource error");
//         dispatch(setLoader(false));
//       }

//       eventSource.onmessage = (event) => {
//         const data = JSON.parse(event.data);
//         if (data.length !== 0) {
//           setEventCount("0");
//           dispatch(filterSolarCharger(data.message));
//         }
//         dispatch(setLoader(false));
//       };

//       eventSource.onerror = () => {
//         eventSource.close();
//       };

//       return () => {
//         eventSource.close();
//       };
//     }
//   }, [solarUniqueId]);

//   useEffect(() => {
//     setCheckTheme(cookies.get("solorTheme"));
//   }, [checkThme]);

//   const handleSearch = (e) => {
//     const value = e.target.value.toLowerCase();
//     setSearchInput(value);

//     if (!value) {
//       setSolarData(solarChager);
//     } else {
//       const filtered = solarChager.filter(
//         (item) =>
//           item.UID.toLowerCase().includes(value) ||
//           item.Location.toLowerCase().includes(value)
//       );
//       setSolarData(filtered);
//     }
//   };

//   return (
//     <Wrapper>
//       {filterSolar.length === 0 && <Loader />}
//       <Modal
//         isOpen={graphState}
//         onRequestClose={() => dispatch(chhoseGraphState(false))}
//         style={graphModalStyle}
//         contentLabel="Example Modal"
//       >
//         <ChartModal />
//       </Modal>

//       <div className="content-wrapper">
//         <div className="container-full">
//           <section className="content">
//             <div className="col-12 mb-20">


//               <div className="row row-cols-1 mt-4">
//                 <div className="col-sm" style={{ flexBasis: "20%", maxWidth: "20%" }}>

//                   {/* <div className="card cardBackgorund">
//                     <h4 className="fw-500" style={{ textAlign: "center", marginTop: "5px", color: "white" }}>
//                       All Unique Devices
//                     </h4>
//                   </div> */}

// <input
//   type="text"
//   placeholder="Search Unique Id"
//   value={searchInput}
//   onChange={handleSearch}
//   style={{
//     width: "80%",
//     margin: "0px 10px 16px 16px",
//     display: "block",
//     padding: "15px 40px 15px 15px",
//     borderRadius: "3px",
//     background: `#0052cc url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' fill='%23a1a4b5' viewBox='0 0 24 24'><path d='M10 2a8 8 0 105.293 14.293l4.707 4.707 1.414-1.414-4.707-4.707A8 8 0 0010 2zm0 2a6 6 0 110 12 6 6 0 010-12z'/></svg>") no-repeat right 10px center`,
//     backgroundSize: "18px",
//     border: "none",
//     outline: "none",
//     color: "white",
//   }}
//   className="white-placeholder"
// />



//                   <div
//                     className="card h-p100"
//                     style={
//                       filterModelState === false && graphState === false
//                         ? {
//                           height: "600px",
//                           width: "80%",
//                           alignSelf: "center",
//                           marginLeft: "15px",
//                           position: "relative",
//                           zIndex: "1",
//                         }
//                         : {
//                           height: "600px",
//                           width: "80%",
//                           alignSelf: "center",
//                           marginLeft: "15px",
//                           position: "relative",
//                           zIndex: "-1",
//                         }
//                     }
//                   >
//                     <ul className="sm sm-blue" style={{ backgroundColor: "inherit" }}>
//                       {paginatedUIDs.map((uid, index) => (
//                         <li key={`${uid}-${index}`}>
//                           <a
//                             className="fw-500"
//                             href="#"
//                             onClick={() => locationFilter(uid)}
//                             style={checkThme === "light" ? { color: "black" } : { color: "white" }}
//                           >
//                             {uid}
//                           </a>
//                         </li>
//                       ))}

//                       <li style={{ textAlign: "center", padding: "10px 0" }}>
//                         <PaginationButton
//                           onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
//                           disabled={currentPage === 1}
//                         >
//                           Prev
//                         </PaginationButton>
//                         <span style={{ margin: "0 8px", color: checkThme === "light" ? "black" : "white" }}>
//                           {currentPage} / {totalPages}
//                         </span>
//                         <PaginationButton
//                           onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
//                           disabled={currentPage === totalPages}
//                         >
//                           Next
//                         </PaginationButton>
//                       </li>

//                     </ul>

//                   </div>
//                 </div>

//                 <div className="col-sm" style={{ flexBasis: "80%", maxWidth: "80%" }}>
//                   <table className="table table-bordered">
//                     <thead>
//                       <tr>
//                         <th colSpan={3} className="tableHeader">Unique Id--{filterSolar[0]?.Location}</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {/* <tr>
//                         <td style={{ textDecoration: "underline" }}>Total Records Avalible for - {filterSolar[0]?.UID}</td>

//                         <td>Time</td>
//                         <td>Unique ID</td>
//                       </tr> */}
//                       <tr>
//                         <td
//                           className="record_style"
//                           onClick={() => navigate("/show_graph", { state: { sourceData: filterSolar } })}
//                         >
//                           {filterSolar?.length} Records view in graph
//                         </td>
//                         <td>
//                           Last uploaded Time:- {moment(filterSolar[0]?.Time).format("YYYY-MM-DD HH:mm:ss")}<br />
//                           Last Recorded Time:- {moment(filterSolar[0]?.RecordTime).format("YYYY-MM-DD HH:mm:ss")}
//                         </td>
//                         <td>{filterSolar[0]?.UID}</td>
//                       </tr>
//                     </tbody>
//                   </table>

//                   <div className="col-12 mb-20">
//                     {/* <div className="row">
//                       <div className="col-sm-11"></div>
//                       <div className="col-sm-1">
//                         <div className="icon-style" onClick={() => dispatch(chhoseGraphState(true))}>
//                           <i className="fa-solid fa-spin fa-cogs text-white" />
//                         </div>
//                       </div>
//                     </div> */}

//                     <div className="row row-cols-1 row-cols-lg-4 graphlayout mt-4">
//                       {chartList.map((item, index) => (
//                         <div
//                           key={index}
//                           className="card chart-card"
//                         >
//                           <ReactEChartsCore
//                             echarts={echarts}
//                             option={canvasChatOption(filterSolar, item)}
//                             notMerge={true}
//                             lazyUpdate={true}
//                             theme={checkThme === "light" ? "light" : "dark"}
//                             style={{ height: '100%', width: '100%' }}
//                           />
//                           <h5 className="fw-500 text-center">{item.title}</h5>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 </div>
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
//     color: white; /* text color */
//     &::placeholder {
//       color: #a1a4b5; 

//     }
//   }
//   table, th, td {
//     border: 1px solid black;
//     border-collapse: collapse;
//   }
//   ul {
//     width: 100% !important;
//     height: 100% !important;
//     position: relative !important;
//     overflow-y: scroll;
//     overflow-x: hidden;
//     display: inline-block;
//     padding-bottom: 30px;
//   }
//   ul li {
//     width: 100%;
//     padding: 8px 16px;
//     border-bottom: 1px solid #a1a4b5;

//     &:hover {
//       width: 100%;
//     }
//   }
//   ul li:last-child {
//     border-bottom: none;
//   }
//   .graphlayout {
//     display: flex;
//     flex-wrap: wrap;
//     align-items: center;
//     justify-content: center;
//     margin: 10px 5px;
//   }
//   .cardBackgorund {
//     display: flex;
//     width: 80%;
//     align-self: center;
//     margin-left: 15px;
//     padding: 7px;
//     background: ${({ theme }) => theme.colors.themeColor};
//   }
//   .tableHeader {
//     text-align: center;
//     background: ${({ theme }) => theme.colors.themeColor};
//     font-size: 18px;
//     font-weight: bold;
//     color: white;
//   }
//   .icon-style {
//     width: 30px;
//     height: 30px;
//     display: flex;
//     align-items: center;
//     justify-content: center;
//     margin-top: 10px;
//     cursor: pointer;
//     background: ${({ theme }) => theme.colors.themeColor};
//   }
//   .record_style {
//     cursor: pointer;
//     text-decoration: underline;
//     font-weight: bold;
//     color: #0052cc;
//     font-size: 16px;
//     &:hover,
//     &:active {
//       color: red;
//     }
//   }
//   .chart-card {
//     margin: 10px;
//     width: 300px;
//     height: 200px;
//     cursor: pointer;
//     display: flex;
//     flex-direction: column;
//     padding: 10px;
//   }
//   .echarts-for-react {
//     height: 150px !important;
//     width: 100% !important;
//     min-height: 150px;
//   }
// `;
// const PaginationButton = styled.button`
//   background: ${({ theme }) => theme.colors.themeColor};
//   color: white;
//   border: none;
//   padding: 6px 12px;
//   border-radius: 5px;
//   cursor: pointer;
//   // margin: 0 4px;
//   font-weight: bold;
//   transition: background 0.2s;

//   &:hover:not(:disabled) {
//     background: ${({ theme }) => theme.colors.themeColorHover || "#004bb5"};
//   }

//   &:disabled {
//     background: #cccccc;
//     cursor: not-allowed;
//   }
// `;



// export default Dashboard2;
import React, { useEffect, useState, useCallback, useMemo } from "react";
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
  const filterModelState = useSelector((state) => state.ConstantReducer.filterModelState);
  const solarChager = useSelector((state) => state.DashboardReducer.solarChager);
  const filterSolarData = useSelector((state) => state.DashboardReducer.filterSolar);

  // ✅ Initialize with empty arrays to prevent undefined errors
  const [solarData, setSolarData] = useState([]);
  const [filterSolar, setFilter] = useState([]);
  const [solarUniqueId, setSolarUnniqueId] = useState("0");
  const [eventCount, setEventCount] = useState("1");
  const [searchInput, setSearchInput] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // ✅ Safe array operations with null checks
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
    dispatch(setLoader(true));
    setSolarUnniqueId(uid);
    setEventCount("1");
  }, [dispatch]);

  useEffect(() => {
    dispatch(getSolarCharger({ navigate }));
  }, [dispatch, navigate]);

  useEffect(() => {
    // ✅ Safe assignment with null check
    setSolarData(solarChager || []);
    if (solarChager && solarChager.length !== 0) {
      setSolarUnniqueId(solarChager[0]?.UID || "0");
    }
  }, [solarChager]);

  useEffect(() => {
    // ✅ Safe assignment with null check
    setFilter(filterSolarData || []);
  }, [filterSolarData]);

  useEffect(() => {
    if (solarUniqueId !== "0") {
      const eventSource = new EventSource(
        process.env.REACT_APP_BASE_URL + `event/${solarUniqueId}/${eventCount === '0' ? "0" : "1"}`
      );

      if (typeof EventSource !== "undefined") {
        console.log("EventSource connected");
      } else {
        console.log("EventSource error");
        dispatch(setLoader(false));
      }

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data && data.length !== 0) {
            setEventCount("0");
            dispatch(filterSolarCharger(data.message || []));
          }
          dispatch(setLoader(false));
        } catch (error) {
          console.error("Error parsing event data:", error);
          dispatch(setLoader(false));
        }
      };

      eventSource.onerror = () => {
        eventSource.close();
      };

      return () => {
        eventSource.close();
      };
    }
  }, [solarUniqueId, eventCount, dispatch]);

  useEffect(() => {
    setCheckTheme(cookies.get("solorTheme"));
  }, [checkThme]);

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
  }, [solarChager]);

  // ✅ Safe data access
  const currentFilterSolar = filterSolar || [];
  const firstRecord = currentFilterSolar[0] || {};

  return (
    <Wrapper>
      {/* ✅ Safe length check */}
      {currentFilterSolar.length === 0 && <Loader />}
      <Modal
        isOpen={graphState}
        onRequestClose={() => dispatch(chhoseGraphState(false))}
        style={graphModalStyle}
        contentLabel="Example Modal"
      >
        <ChartModal />
      </Modal>

      <div className="content-wrapper">
        <div className="container-full">
          <section className="content">
            <div className="col-12 mb-20">
              <div className="row row-cols-1 mt-4">
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
                      {/* ✅ Safe mapping with null check */}
                      {(paginatedUIDs || []).map((uid, index) => (
                        <li key={`${uid}-${index}`}>
                          <a
                            className="fw-500"
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              locationFilter(uid);
                            }}
                            style={checkThme === "light" ? { color: "black" } : { color: "white" }}
                          >
                            {uid}
                          </a>
                        </li>
                      ))}

                      <li style={{ textAlign: "center", padding: "10px 0" }}>
                        <PaginationButton
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                        >
                          Prev
                        </PaginationButton>
                        <span style={{ margin: "0 8px", color: checkThme === "light" ? "black" : "white" }}>
                          {currentPage} / {totalPages}
                        </span>
                        <PaginationButton
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                        >
                          Next
                        </PaginationButton>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="col-sm" style={{ flexBasis: "80%", maxWidth: "80%" }}>
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th colSpan={3} className="tableHeader">
                          {/* ✅ Safe property access */}
                          Unique Id--{firstRecord?.Location || 'No Location'}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td
                          className="record_style"
                          onClick={() => navigate("/show_graph", { state: { sourceData: currentFilterSolar } })}
                        >
                          {/* ✅ Safe length access */}
                          {currentFilterSolar.length} Records view in graph
                        </td>
                        <td>
                          Last uploaded Time:- {firstRecord?.Time ? 
                            moment(firstRecord.Time).format("YYYY-MM-DD HH:mm:ss") : 
                            'N/A'
                          }<br />
                          Last Recorded Time:- {firstRecord?.RecordTime ? 
                            moment(firstRecord.RecordTime).format("YYYY-MM-DD HH:mm:ss") : 
                            'N/A'
                          }
                        </td>
                        <td>{firstRecord?.UID || 'No UID'}</td>
                      </tr>
                    </tbody>
                  </table>

                  <div className="col-12 mb-20">
                    <div className="row row-cols-1 row-cols-lg-4 graphlayout mt-4">
                      {chartList.map((item, index) => (
                        <div
                          key={index}
                          className="card chart-card"
                        >
                          <ReactEChartsCore
                            echarts={echarts}
                            option={canvasChatOption(currentFilterSolar, item)}
                            notMerge={true}
                            lazyUpdate={true}
                            theme={checkThme === "light" ? "light" : "dark"}
                            style={{ height: '100%', width: '100%' }}
                          />
                          <h5 className="fw-500 text-center">{item.title}</h5>
                        </div>
                      ))}
                    </div>
                  </div>
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
    padding: 8px 16px;
    border-bottom: 1px solid #a1a4b5;

    &:hover {
      width: 100%;
    }
  }
  ul li:last-child {
    border-bottom: none;
  }
  .graphlayout {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    margin: 10px 5px;
  }
  .cardBackgorund {
    display: flex;
    width: 80%;
    align-self: center;
    margin-left: 15px;
    padding: 7px;
    background: ${({ theme }) => theme.colors.themeColor};
  }
  .tableHeader {
    text-align: center;
    background: ${({ theme }) => theme.colors.themeColor};
    font-size: 18px;
    font-weight: bold;
    color: white;
  }
  .icon-style {
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 10px;
    cursor: pointer;
    background: ${({ theme }) => theme.colors.themeColor};
  }
  .record_style {
    cursor: pointer;
    text-decoration: underline;
    font-weight: bold;
    color: #0052cc;
    font-size: 16px;
    &:hover,
    &:active {
      color: red;
    }
  }
  .chart-card {
    margin: 10px;
    width: 300px;
    height: 200px;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    padding: 10px;
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
  transition: background 0.2s;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.themeColorHover || "#004bb5"};
  }

  &:disabled {
    background: #cccccc;
    cursor: not-allowed;
  }
`;

export default Dashboard2;



// // // dashboard2.js
// // import React, { useEffect, useState } from "react";
// // import styled from "styled-components";
// // import { chartList } from "../Constant/MainFile";
// // import { canvasChatOption } from "../../JavaScript/ChartMain";
// // import ReactEChartsCore from 'echarts-for-react/lib/core';
// // import * as echarts from 'echarts/core';
// // import {
// //   LineChart,
// //   BarChart,
// //   PieChart,
// //   ScatterChart,
// //   RadarChart,
// //   GaugeChart
// // } from 'echarts/charts';
// // import {
// //   TitleComponent,
// //   TooltipComponent,
// //   GridComponent,
// //   DatasetComponent,
// //   TransformComponent,
// //   LegendComponent,
// //   ToolboxComponent,
// //   DataZoomComponent
// // } from 'echarts/components';
// // import { CanvasRenderer } from 'echarts/renderers';
// // import Cookies from "universal-cookie";
// // import ChartModal from "../Components/Modal/ChartModal";
// // import Modal from "react-modal";
// // import { useDispatch, useSelector } from "react-redux";
// // import { chhoseGraphState, setLoader } from "../../Database/Action/ConstantAction";
// // import { graphModalStyle } from "../../Style/ModalStyle";
// // import { filterSolarCharger, getSolarCharger } from "../../Database/Action/DashboardAction";
// // import { useNavigate } from "react-router-dom";
// // import moment from "moment";
// // import Loader from "../Components/Loader";

// // // Register ECharts components
// // echarts.use([
// //   LineChart,
// //   BarChart,
// //   PieChart,
// //   ScatterChart,
// //   RadarChart,
// //   GaugeChart,
// //   TitleComponent,
// //   TooltipComponent,
// //   GridComponent,
// //   DatasetComponent,
// //   TransformComponent,
// //   LegendComponent,
// //   ToolboxComponent,
// //   DataZoomComponent,
// //   CanvasRenderer
// // ]);

// // const Dashboard2 = () => {
// //   const dispatch = useDispatch();
// //   const navigate = useNavigate();
// //   const [checkThme, setCheckTheme] = useState("dark");
// //   const cookies = new Cookies();

// //   const graphState = useSelector((state) => state.ConstantReducer.graphState);
// //   const filterModelState = useSelector((state) => state.ConstantReducer.filterModelState);
// //   const solarChager = useSelector((state) => state.DashboardReducer.solarChager);
// //   const filterSolarData = useSelector((state) => state.DashboardReducer.filterSolar);

// //   const [solarData, setSolarData] = useState([]);
// //   const [filterSolar, setFilter] = useState([]);
// //   const [solarUniqueId, setSolarUnniqueId] = useState("0");
// //   const [eventCount, setEventCount] = useState("1");
// //   const [searchInput, setSearchInput] = useState("");
// //   const [currentPage, setCurrentPage] = useState(1);
// //   const itemsPerPage = 10;
// //   const uniqueUIDs = [...new Set(solarData.map(item => item.UID))];
// //   const totalPages = Math.ceil(uniqueUIDs.length / itemsPerPage);
// //   const paginatedUIDs = uniqueUIDs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);


// //   const locationFilter = (uid) => {
// //     dispatch(setLoader(true));
// //     setSolarUnniqueId(uid);
// //     setEventCount("1");
// //   };

// //   useEffect(() => {
// //     dispatch(getSolarCharger({ navigate }));
// //   }, [dispatch]);

// //   useEffect(() => {
// //     setSolarData(solarChager);
// //     if (solarChager.length !== 0) {
// //       setSolarUnniqueId(solarChager[0]?.UID);
// //     }
// //   }, [solarChager]);

// //   useEffect(() => {
// //     setFilter(filterSolarData);
// //   }, [filterSolarData]);

// //   useEffect(() => {
// //     if (solarUniqueId !== "0") {
// //       const eventSource = new EventSource(
// //         process.env.REACT_APP_BASE_URL + `event/${solarUniqueId}/${eventCount === '0' ? "0" : "1"}`
// //       );

// //       if (typeof EventSource !== "undefined") {
// //         console.log("EventSource connected");
// //       } else {
// //         console.log("EventSource error");
// //         dispatch(setLoader(false));
// //       }

// //       eventSource.onmessage = (event) => {
// //         const data = JSON.parse(event.data);
// //         if (data.length !== 0) {
// //           setEventCount("0");
// //           dispatch(filterSolarCharger(data.message));
// //         }
// //         dispatch(setLoader(false));
// //       };

// //       eventSource.onerror = () => {
// //         eventSource.close();
// //       };

// //       return () => {
// //         eventSource.close();
// //       };
// //     }
// //   }, [solarUniqueId]);

// //   useEffect(() => {
// //     setCheckTheme(cookies.get("solorTheme"));
// //   }, [checkThme]);

// //   const handleSearch = (e) => {
// //     const value = e.target.value.toLowerCase();
// //     setSearchInput(value);

// //     if (!value) {
// //       setSolarData(solarChager);
// //     } else {
// //       const filtered = solarChager.filter(
// //         (item) =>
// //           item.UID.toLowerCase().includes(value) ||
// //           item.Location.toLowerCase().includes(value)
// //       );
// //       setSolarData(filtered);
// //     }
// //   };

// //   return (
// //     <Wrapper>
// //       {filterSolar.length === 0 && <Loader />}
// //       <Modal
// //         isOpen={graphState}
// //         onRequestClose={() => dispatch(chhoseGraphState(false))}
// //         style={graphModalStyle}
// //         contentLabel="Example Modal"
// //       >
// //         <ChartModal />
// //       </Modal>

// //       <div className="content-wrapper">
// //         <div className="container-full">
// //           <section className="content">
// //             <div className="col-12 mb-20">


// //               <div className="row row-cols-1 mt-4">
// //                 <div className="col-sm" style={{ flexBasis: "20%", maxWidth: "20%" }}>

// //                   {/* <div className="card cardBackgorund">
// //                     <h4 className="fw-500" style={{ textAlign: "center", marginTop: "5px", color: "white" }}>
// //                       All Unique Devices
// //                     </h4>
// //                   </div> */}

// // <input
// //   type="text"
// //   placeholder="Search Unique Id"
// //   value={searchInput}
// //   onChange={handleSearch}
// //   style={{
// //     width: "80%",
// //     margin: "0px 10px 16px 16px",
// //     display: "block",
// //     padding: "15px 40px 15px 15px",
// //     borderRadius: "3px",
// //     background: `#0052cc url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' fill='%23a1a4b5' viewBox='0 0 24 24'><path d='M10 2a8 8 0 105.293 14.293l4.707 4.707 1.414-1.414-4.707-4.707A8 8 0 0010 2zm0 2a6 6 0 110 12 6 6 0 010-12z'/></svg>") no-repeat right 10px center`,
// //     backgroundSize: "18px",
// //     border: "none",
// //     outline: "none",
// //     color: "white",
// //   }}
// //   className="white-placeholder"
// // />



// //                   <div
// //                     className="card h-p100"
// //                     style={
// //                       filterModelState === false && graphState === false
// //                         ? {
// //                           height: "600px",
// //                           width: "80%",
// //                           alignSelf: "center",
// //                           marginLeft: "15px",
// //                           position: "relative",
// //                           zIndex: "1",
// //                         }
// //                         : {
// //                           height: "600px",
// //                           width: "80%",
// //                           alignSelf: "center",
// //                           marginLeft: "15px",
// //                           position: "relative",
// //                           zIndex: "-1",
// //                         }
// //                     }
// //                   >
// //                     <ul className="sm sm-blue" style={{ backgroundColor: "inherit" }}>
// //                       {paginatedUIDs.map((uid, index) => (
// //                         <li key={`${uid}-${index}`}>
// //                           <a
// //                             className="fw-500"
// //                             href="#"
// //                             onClick={() => locationFilter(uid)}
// //                             style={checkThme === "light" ? { color: "black" } : { color: "white" }}
// //                           >
// //                             {uid}
// //                           </a>
// //                         </li>
// //                       ))}

// //                       <li style={{ textAlign: "center", padding: "10px 0" }}>
// //                         <PaginationButton
// //                           onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
// //                           disabled={currentPage === 1}
// //                         >
// //                           Prev
// //                         </PaginationButton>
// //                         <span style={{ margin: "0 8px", color: checkThme === "light" ? "black" : "white" }}>
// //                           {currentPage} / {totalPages}
// //                         </span>
// //                         <PaginationButton
// //                           onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
// //                           disabled={currentPage === totalPages}
// //                         >
// //                           Next
// //                         </PaginationButton>
// //                       </li>

// //                     </ul>

// //                   </div>
// //                 </div>

// //                 <div className="col-sm" style={{ flexBasis: "80%", maxWidth: "80%" }}>
// //                   <table className="table table-bordered">
// //                     <thead>
// //                       <tr>
// //                         <th colSpan={3} className="tableHeader">Unique Id--{filterSolar[0]?.Location}</th>
// //                       </tr>
// //                     </thead>
// //                     <tbody>
// //                       {/* <tr>
// //                         <td style={{ textDecoration: "underline" }}>Total Records Avalible for - {filterSolar[0]?.UID}</td>

// //                         <td>Time</td>
// //                         <td>Unique ID</td>
// //                       </tr> */}
// //                       <tr>
// //                         <td
// //                           className="record_style"
// //                           onClick={() => navigate("/show_graph", { state: { sourceData: filterSolar } })}
// //                         >
// //                           {filterSolar?.length} Records view in graph
// //                         </td>
// //                         <td>
// //                           Last uploaded Time:- {moment(filterSolar[0]?.Time).format("YYYY-MM-DD HH:mm:ss")}<br />
// //                           Last Recorded Time:- {moment(filterSolar[0]?.RecordTime).format("YYYY-MM-DD HH:mm:ss")}
// //                         </td>
// //                         <td>{filterSolar[0]?.UID}</td>
// //                       </tr>
// //                     </tbody>
// //                   </table>

// //                   <div className="col-12 mb-20">
// //                     {/* <div className="row">
// //                       <div className="col-sm-11"></div>
// //                       <div className="col-sm-1">
// //                         <div className="icon-style" onClick={() => dispatch(chhoseGraphState(true))}>
// //                           <i className="fa-solid fa-spin fa-cogs text-white" />
// //                         </div>
// //                       </div>
// //                     </div> */}

// //                     <div className="row row-cols-1 row-cols-lg-4 graphlayout mt-4">
// //                       {chartList.map((item, index) => (
// //                         <div
// //                           key={index}
// //                           className="card chart-card"
// //                         >
// //                           <ReactEChartsCore
// //                             echarts={echarts}
// //                             option={canvasChatOption(filterSolar, item)}
// //                             notMerge={true}
// //                             lazyUpdate={true}
// //                             theme={checkThme === "light" ? "light" : "dark"}
// //                             style={{ height: '100%', width: '100%' }}
// //                           />
// //                           <h5 className="fw-500 text-center">{item.title}</h5>
// //                         </div>
// //                       ))}
// //                     </div>
// //                   </div>
// //                 </div>
// //               </div>
// //             </div>
// //           </section>
// //         </div>
// //       </div>
// //     </Wrapper>
// //   );
// // };

// // const Wrapper = styled.section`
// //   input.white-placeholder {
// //     color: white; /* text color */
// //     &::placeholder {
// //       color: #a1a4b5; 

// //     }
// //   }
// //   table, th, td {
// //     border: 1px solid black;
// //     border-collapse: collapse;
// //   }
// //   ul {
// //     width: 100% !important;
// //     height: 100% !important;
// //     position: relative !important;
// //     overflow-y: scroll;
// //     overflow-x: hidden;
// //     display: inline-block;
// //     padding-bottom: 30px;
// //   }
// //   ul li {
// //     width: 100%;
// //     padding: 8px 16px;
// //     border-bottom: 1px solid #a1a4b5;

// //     &:hover {
// //       width: 100%;
// //     }
// //   }
// //   ul li:last-child {
// //     border-bottom: none;
// //   }
// //   .graphlayout {
// //     display: flex;
// //     flex-wrap: wrap;
// //     align-items: center;
// //     justify-content: center;
// //     margin: 10px 5px;
// //   }
// //   .cardBackgorund {
// //     display: flex;
// //     width: 80%;
// //     align-self: center;
// //     margin-left: 15px;
// //     padding: 7px;
// //     background: ${({ theme }) => theme.colors.themeColor};
// //   }
// //   .tableHeader {
// //     text-align: center;
// //     background: ${({ theme }) => theme.colors.themeColor};
// //     font-size: 18px;
// //     font-weight: bold;
// //     color: white;
// //   }
// //   .icon-style {
// //     width: 30px;
// //     height: 30px;
// //     display: flex;
// //     align-items: center;
// //     justify-content: center;
// //     margin-top: 10px;
// //     cursor: pointer;
// //     background: ${({ theme }) => theme.colors.themeColor};
// //   }
// //   .record_style {
// //     cursor: pointer;
// //     text-decoration: underline;
// //     font-weight: bold;
// //     color: #0052cc;
// //     font-size: 16px;
// //     &:hover,
// //     &:active {
// //       color: red;
// //     }
// //   }
// //   .chart-card {
// //     margin: 10px;
// //     width: 300px;
// //     height: 200px;
// //     cursor: pointer;
// //     display: flex;
// //     flex-direction: column;
// //     padding: 10px;
// //   }
// //   .echarts-for-react {
// //     height: 150px !important;
// //     width: 100% !important;
// //     min-height: 150px;
// //   }
// // `;
// // const PaginationButton = styled.button`
// //   background: ${({ theme }) => theme.colors.themeColor};
// //   color: white;
// //   border: none;
// //   padding: 6px 12px;
// //   border-radius: 5px;
// //   cursor: pointer;
// //   // margin: 0 4px;
// //   font-weight: bold;
// //   transition: background 0.2s;

// //   &:hover:not(:disabled) {
// //     background: ${({ theme }) => theme.colors.themeColorHover || "#004bb5"};
// //   }

// //   &:disabled {
// //     background: #cccccc;
// //     cursor: not-allowed;
// //   }
// // `;

// import React, { useEffect, useState, useCallback, useMemo } from "react";
// import styled from "styled-components";
// import { chartList } from "../Constant/MainFile";
// import { canvasChatOption } from "../../JavaScript/ChartMain";
// import ReactEChartsCore from 'echarts-for-react/lib/core';
// import * as echarts from 'echarts/core';
// import {
//   LineChart,
//   BarChart,
//   PieChart,
//   ScatterChart,
//   RadarChart,
//   GaugeChart
// } from 'echarts/charts';
// import {
//   TitleComponent,
//   TooltipComponent,
//   GridComponent,
//   DatasetComponent,
//   TransformComponent,
//   LegendComponent,
//   ToolboxComponent,
//   DataZoomComponent
// } from 'echarts/components';
// import { CanvasRenderer } from 'echarts/renderers';
// import Cookies from "universal-cookie";
// import ChartModal from "../Components/Modal/ChartModal";
// import Modal from "react-modal";
// import { useDispatch, useSelector } from "react-redux";
// import { chhoseGraphState, setLoader } from "../../Database/Action/ConstantAction";
// import { graphModalStyle } from "../../Style/ModalStyle";
// import { filterSolarCharger, getSolarCharger } from "../../Database/Action/DashboardAction";
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
//   CanvasRenderer
// ]);

// // ✅ Move cookies instance outside component
// const cookies = new Cookies();

// const Dashboard2 = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const [checkThme, setCheckTheme] = useState("dark");

//   const graphState = useSelector((state) => state.ConstantReducer.graphState);
//   const solarChager = useSelector((state) => state.DashboardReducer?.solarChager || []);
//   const filterSolarData = useSelector((state) => state.DashboardReducer?.filterSolar || []);

//   const [solarData, setSolarData] = useState([]);
//   const [filterSolar, setFilter] = useState([]);
//   const [solarUniqueId, setSolarUnniqueId] = useState("0");
//   const [eventCount, setEventCount] = useState("1");
//   const [searchInput, setSearchInput] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 10;
  
//   // Safe array mapping with default empty array
//   const uniqueUIDs = useMemo(() => 
//     [...new Set((solarData || []).map(item => item.UID))],
//     [solarData]
//   );
  
//   const totalPages = Math.ceil(uniqueUIDs.length / itemsPerPage);
//   const paginatedUIDs = useMemo(() => 
//     uniqueUIDs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
//     [uniqueUIDs, currentPage, itemsPerPage]
//   );

//   // Memoized locationFilter to prevent unnecessary re-renders
//   const locationFilter = useCallback((uid) => {
//     dispatch(setLoader(true));
//     setSolarUnniqueId(uid);
//     setEventCount("1");
//   }, [dispatch]);

//   // ✅ Load theme ONCE on mount
//   useEffect(() => {
//     const theme = cookies.get("solorTheme");
//     if (theme) {
//       setCheckTheme(theme);
//     }
//   }, []); // Empty dependency array - runs once

//   // Load solar charger data only once on component mount
//   useEffect(() => {
//     dispatch(getSolarCharger({ navigate }));
//   }, [dispatch, navigate]);

//   // Update solarData when solarChager changes
//   useEffect(() => {
//     setSolarData(solarChager);
//     if (solarChager && solarChager.length !== 0) {
//       setSolarUnniqueId(solarChager[0]?.UID || "0");
//     }
//   }, [solarChager]);

//   // Update filter when filterSolarData changes
//   useEffect(() => {
//     setFilter(filterSolarData);
//   }, [filterSolarData]);

//   // EventSource effect - fixed dependencies
//   useEffect(() => {
//     if (solarUniqueId !== "0") {
//       const eventSource = new EventSource(
//         process.env.REACT_APP_BASE_URL + `event/${solarUniqueId}/${eventCount === '0' ? "0" : "1"}`
//       );

//       if (typeof EventSource !== "undefined") {
//         console.log("EventSource connected");
//       } else {
//         console.log("EventSource error");
//         dispatch(setLoader(false));
//       }

//       eventSource.onmessage = (event) => {
//         try {
//           const data = JSON.parse(event.data);
//           if (data && data.length !== 0) {
//             setEventCount("0");
//             dispatch(filterSolarCharger(data.message || []));
//           }
//           dispatch(setLoader(false));
//         } catch (error) {
//           console.error("Error parsing event data:", error);
//           dispatch(setLoader(false));
//         }
//       };

//       eventSource.onerror = () => {
//         eventSource.close();
//       };

//       return () => {
//         eventSource.close();
//       };
//     }
//   }, [solarUniqueId, eventCount, dispatch]);

//   // Search handler
//   const handleSearch = useCallback((e) => {
//     const value = e.target.value.toLowerCase();
//     setSearchInput(value);

//     if (!value) {
//       setSolarData(solarChager || []);
//     } else {
//       const filtered = (solarChager || []).filter(
//         (item) =>
//           item?.UID?.toLowerCase().includes(value) ||
//           item?.Location?.toLowerCase().includes(value)
//       );
//       setSolarData(filtered);
//     }
//   }, [solarChager]);

//   // Safe data access
//   const currentFilterSolar = filterSolar || [];
//   const firstRecord = currentFilterSolar[0] || {};

//   return (
//     <Wrapper>
//       {currentFilterSolar.length === 0 && <Loader />}
//       <Modal
//         isOpen={graphState}
//         onRequestClose={() => dispatch(chhoseGraphState(false))}
//         style={graphModalStyle}
//         contentLabel="Example Modal"
//       >
//         <ChartModal />
//       </Modal>

//       <div className="content-wrapper">
//         <div className="container-full">
//           <section className="content">
//             <div className="col-12 mb-20">
//               <div className="row row-cols-1 mt-4">
//                 <div className="col-sm" style={{ flexBasis: "20%", maxWidth: "20%" }}>
//                   <input
//                     type="text"
//                     placeholder="Search Unique Id"
//                     value={searchInput}
//                     onChange={handleSearch}
//                     style={{
//                       width: "75%",
//                       margin: "0px 8px 16px 0px",
//                       display: "block",
//                       padding: "15px 16px 15px 9px",
//                       borderRadius: "3px",
//                       background: `#0052cc url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' fill='%23a1a4b5' viewBox='0 0 24 24'><path d='M10 2a8 8 0 105.293 14.293l4.707 4.707 1.414-1.414-4.707-4.707A8 8 0 0010 2zm0 2a6 6 0 110 12 6 6 0 010-12z'/></svg>") no-repeat right 10px center`,
//                       backgroundSize: "18px",
//                       border: "none",
//                       outline: "none",
//                       color: "white",
//                     }}
//                     className="white-placeholder"
//                   />

//                   <div
//                     className="card h-p100"
//                     style={{
//                       width: "75%",
//                       alignSelf: "center",
//                       position: "relative",
//                       zIndex: "1",
//                     }}
//                   >
//                     <ul className="sm sm-blue" style={{ backgroundColor: "inherit", overflowY: "hidden", padding: "0" }}>
//                       {paginatedUIDs.map((uid, index) => (
//                         <li key={`${uid}-${index}`}>
//                           <a
//                             className="fw-500"
//                             href="#"
//                             onClick={(e) => {
//                               e.preventDefault();
//                               locationFilter(uid);
//                             }}
//                             style={checkThme === "light" ? { color: "black" } : { color: "white" }}
//                           >
//                             {uid}
//                           </a>
//                         </li>
//                       ))}

//                       <li style={{ textAlign: "center", padding: "10px 0" }}>
//                         <PaginationButton
//                           onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
//                           disabled={currentPage === 1}
//                         >
//                           Prev
//                         </PaginationButton>
//                         <span style={{ margin: "0 8px", color: checkThme === "light" ? "black" : "white" }}>
//                           {currentPage} / {totalPages}
//                         </span>
//                         <PaginationButton
//                           onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
//                           disabled={currentPage === totalPages}
//                         >
//                           Next
//                         </PaginationButton>
//                       </li>
//                     </ul>
//                   </div>
//                 </div>

//                 <div className="col-sm" style={{ flexBasis: "80%", maxWidth: "80%" }}>
//                   <table className="table table-bordered">
//                     <thead>
//                       <tr>
//                         <th colSpan={3} className="tableHeader">
//                           Unique Id--{firstRecord?.Location || 'No Location'}
//                         </th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       <tr>
//                         <td
//                           className="record_style"
//                           onClick={() => navigate("/show_graph", { state: { sourceData: currentFilterSolar } })}
//                         >
//                           {currentFilterSolar.length} Records view in graph
//                         </td>
//                         <td>
//                           Last uploaded Time:- {firstRecord?.Time ? 
//                             moment(firstRecord.Time).format("YYYY-MM-DD HH:mm:ss") : 
//                             'N/A'
//                           }<br />
//                           Last Recorded Time:- {firstRecord?.RecordTime ? 
//                             moment(firstRecord.RecordTime).format("YYYY-MM-DD HH:mm:ss") : 
//                             'N/A'
//                           }
//                         </td>
//                         <td>{firstRecord?.UID || 'No UID'}</td>
//                       </tr>
//                     </tbody>
//                   </table>

//                   <div className="col-12 mb-20">
//                     <div className="row row-cols-1 row-cols-lg-4 graphlayout mt-4">
//                       {chartList.map((item, index) => (
//                         <div
//                           key={index}
//                           className="card chart-card"
//                         >
//                           <ReactEChartsCore
//                             echarts={echarts}
//                             option={canvasChatOption(currentFilterSolar, item)}
//                             notMerge={true}
//                             lazyUpdate={true}
//                             theme={checkThme === "light" ? "light" : "dark"}
//                             style={{ height: '100%', width: '100%' }}
//                           />
//                           <h5 className="fw-500 text-center">{item.title}</h5>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 </div>
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
//   table, th, td {
//     border: 1px solid black;
//     border-collapse: collapse;
//   }
//   ul {
//     width: 100% !important;
//     height: 100% !important;
//     position: relative !important;
//     overflow-y: scroll;
//     overflow-x: hidden;
//     display: inline-block;
//     padding-bottom: 30px;
//   }
//   ul li {
//     width: 100%;
//     padding: 8px 16px;
//     border-bottom: 1px solid #a1a4b5;

//     &:hover {
//       width: 100%;
//     }
//   }
//   ul li:last-child {
//     border-bottom: none;
//   }
//   .graphlayout {
//     display: flex;
//     flex-wrap: wrap;
//     align-items: center;
//     justify-content: center;
//     margin: 10px 5px;
//   }
//   .cardBackgorund {
//     display: flex;
//     width: 80%;
//     align-self: center;
//     margin-left: 15px;
//     padding: 7px;
//     background: ${({ theme }) => theme.colors.themeColor};
//   }
//   .tableHeader {
//     text-align: center;
//     background: ${({ theme }) => theme.colors.themeColor};
//     font-size: 18px;
//     font-weight: bold;
//     color: white;
//   }
//   .icon-style {
//     width: 30px;
//     height: 30px;
//     display: flex;
//     align-items: center;
//     justify-content: center;
//     margin-top: 10px;
//     cursor: pointer;
//     background: ${({ theme }) => theme.colors.themeColor};
//   }
//   .record_style {
//     cursor: pointer;
//     text-decoration: underline;
//     font-weight: bold;
//     color: #0052cc;
//     font-size: 16px;
//     &:hover,
//     &:active {
//       color: red;
//     }
//   }
//   .chart-card {
//     margin: 10px;
//     width: 300px;
//     height: 200px;
//     cursor: pointer;
//     display: flex;
//     flex-direction: column;
//     padding: 10px;
//   }
//   .echarts-for-react {
//     height: 150px !important;
//     width: 100% !important;
//     min-height: 150px;
//   }
// `;

// const PaginationButton = styled.button`
//   background: ${({ theme }) => theme.colors.themeColor};
//   color: white;
//   border: none;
//   padding: 6px 12px;
//   border-radius: 5px;
//   cursor: pointer;
//   font-weight: bold;
//   transition: background 0.2s;

//   &:hover:not(:disabled) {
//     background: ${({ theme }) => theme.colors.themeColorHover || "#004bb5"};
//   }

//   &:disabled {
//     background: #cccccc;
//     cursor: not-allowed;
//   }
// `;

// export default Dashboard2;