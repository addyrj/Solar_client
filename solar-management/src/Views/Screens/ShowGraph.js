import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import "../../Style/custom_main.css";
import { useLocation, useNavigate } from "react-router-dom"; // Add useNavigate
import moment from "moment";
import NoData from "../Components/NoData";
import { initDatatable } from "../../JavaScript/Datatables";
import "datatables.net-responsive";
import "datatables.net-buttons";
import JSZip from "jszip";
import "datatables.net-buttons/js/buttons.colVis";
import "datatables.net-buttons/js/buttons.html5";
import "datatables.net-buttons/js/buttons.print";
import toast from "react-hot-toast";
import $ from "jquery";
import Loader from "../Components/Loader"; // Add Loader component

// Import ECharts (keep existing imports)
import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import {
  LineChart
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

// Register ECharts components (keep existing)
echarts.use([
  LineChart,
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

const ShowGraph = () => {
  const location = useLocation();
  const navigate = useNavigate(); // Add navigate hook
  const { uid } = location.state || {}; // Change to get uid instead of sourceData
  const tableRef = useRef(null);

  const [filterData, setFilterData] = useState([]);
  const [sourceData, setSourceData] = useState([]); // Add state for sourceData
  const [dataTable, setDataTable] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // Add loading state
  const [deviceName, setDeviceName] = useState("No UID Available"); // Add device name state

  const [selectDate, setSelectDate] = useState({
    today: moment(new Date()).format("YYYY-MM-DD"),
    last7Day: "",
    last30Day: "",
    last60Day: "",
    initDate: "",
    endDay: "",
  });

  const [seriesState, setSeriesState] = useState({
    pvVoltage: true,
    pvCurrent: false,
    lVoltage: false,
    lCurrent: false,
    bVoltage: false,
    PVKWh: false,
    temp: false,
  });

  const [chartOption, setChartOption] = useState({});

  // Function to fetch device data by UID
  const fetchDeviceData = async (deviceUID) => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/getSolarChargerByUID/${deviceUID}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data && data.status === 200 && data.data) {
        setSourceData(data.data);
        setDeviceName(deviceUID); // Set the device name
        setIsLoading(false);
        return data.data;
      } else {
        throw new Error("Invalid data structure received");
      }
      
    } catch (error) {
      console.error("Error fetching device data:", error);
      setIsLoading(false);
      toast.error("Failed to load device data");
      return [];
    }
  };

  // Fetch data when component mounts or uid changes
  useEffect(() => {
    if (uid) {
      fetchDeviceData(uid);
    } else {
      // If no uid is provided, navigate back or show error
      toast.error("No device UID provided");
      navigate(-1); // Go back to previous page
    }
  }, [uid, navigate]);

  const handleRadioState = (value) => {
    setSelectDate({
      today: value === "today" ? moment(new Date()).format("YYYY-MM-DD") : "",
      last7Day: value === "last7" ? moment().subtract(7, 'days').format("YYYY-MM-DD") : "",
      last30Day: value === "last30" ? moment().subtract(30, 'days').format("YYYY-MM-DD") : "",
      last60Day: value === "last60" ? moment().subtract(60, 'days').format("YYYY-MM-DD") : "",
      initDate: "",
      endDay: "",
    });
  };

  // Function to prepare data for the stacked line chart (keep existing)
  const prepareStackedLineData = (filterGraphData) => {
    const timeMap = {};
    
    filterGraphData.forEach(item => {
      const timeKey = moment(item.RecordTime).format('YYYY-MM-DD HH:mm:ss');
      
      if (!timeMap[timeKey]) {
        timeMap[timeKey] = {
          time: timeKey,
          pvVoltage: 0,
          pvCurrent: 0,
          bVoltage: 0,
          lVoltage: 0,
          lCurrent: 0,
          PVKWh: 0,
          temp: 0
        };
      }
      
      timeMap[timeKey].pvVoltage = item.PvVolt / 1;
      timeMap[timeKey].pvCurrent = item.PvCur / 1;
      timeMap[timeKey].bVoltage = item.BatVoltage / 1;
      timeMap[timeKey].lVoltage = item.LoadVoltage / 1;
      timeMap[timeKey].lCurrent = item.LoadCurrent / 1;
      timeMap[timeKey].PVKWh = item.PVKWh / 1;
      timeMap[timeKey].temp = item.Temperature / 1;
    });
    
    const sortedData = Object.values(timeMap).sort((a, b) => 
      new Date(a.time) - new Date(b.time)
    );
    
    return sortedData;
  };

  // Function to create the stacked line chart option (keep existing)
  const createStackedLineOption = (data) => {
    const times = data.map(item => moment(item.time).format('MMM DD HH:mm'));
    
    return {
      title: {
        text: 'Solar Charger Data',
        textStyle: {
          color: '#fff'
        }
      },
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: ['PV Voltage', 'PV Current', 'Battery Voltage', 'Load Voltage', 'Load Current', 'PV KWh', 'Temperature'],
        textStyle: {
          color: '#fff'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      toolbox: {
        feature: {
          saveAsImage: {
            title: 'Save as Image'
          }
        }
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: times,
        axisLabel: {
          color: '#fff'
        }
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          color: '#fff'
        }
      },
      series: [
        {
          name: 'PV Voltage',
          type: 'line',
          stack: 'Total',
          data: data.map(item => item.pvVoltage)
        },
        {
          name: 'PV Current',
          type: 'line',
          stack: 'Total',
          data: data.map(item => item.pvCurrent)
        },
        {
          name: 'Battery Voltage',
          type: 'line',
          stack: 'Total',
          data: data.map(item => item.bVoltage)
        },
        {
          name: 'Load Voltage',
          type: 'line',
          stack: 'Total',
          data: data.map(item => item.lVoltage)
        },
        {
          name: 'Load Current',
          type: 'line',
          stack: 'Total',
          data: data.map(item => item.lCurrent)
        },
        {
          name: 'PV KWh',
          type: 'line',
          stack: 'Total',
          data: data.map(item => item.PVKWh)
        },
        {
          name: 'Temperature',
          type: 'line',
          stack: 'Total',
          data: data.map(item => item.temp)
        }
      ]
    };
  };

  const applyButton = async () => {
    const { today, last7Day, last30Day, last60Day, initDate, endDay } = selectDate;
    
    let filterGraphData = [];
    
    if (today !== "") {
      const dateTime = moment(today).format("YYYY-MM-DD");
      filterGraphData = sourceData.filter((item) => {
        return moment(item.RecordTime).format("YYYY-MM-DD") === dateTime;
      });
    } 
    else if (last7Day !== "") {
      const startDate = moment().subtract(7, 'days').startOf('day');
      filterGraphData = sourceData.filter((item) => {
        return moment(item.RecordTime).isSameOrAfter(startDate);
      });
    }
    else if (last30Day !== "") {
      const startDate = moment().subtract(30, 'days').startOf('day');
      filterGraphData = sourceData.filter((item) => {
        return moment(item.RecordTime).isSameOrAfter(startDate);
      });
    }
    else if (last60Day !== "") {
      const startDate = moment().subtract(60, 'days').startOf('day');
      filterGraphData = sourceData.filter((item) => {
        return moment(item.RecordTime).isSameOrAfter(startDate);
      });
    }
    else if (initDate && endDay) {
      filterGraphData = sourceData.filter((item) => {
        return (
          moment(item.RecordTime).isSameOrAfter(moment(initDate)) &&
          moment(item.RecordTime).isSameOrBefore(moment(endDay))
        );
      });
    } else {
      toast.error("Please select a valid date range");
      return;
    }

    // Prepare data for the stacked line chart
    const preparedData = prepareStackedLineData(filterGraphData);
    const chartOption = createStackedLineOption(preparedData);
    
    setChartOption(chartOption);
    setFilterData(filterGraphData);
  };

  useEffect(() => {
    // Initialize with today's data when sourceData is loaded
    if (sourceData && sourceData.length > 0) {
      const dateTime = moment(new Date()).format("YYYY-MM-DD");
      const filterGraphData = sourceData.filter((item) => {
        return moment(item.RecordTime).format("YYYY-MM-DD") === dateTime;
      });
      
      // Prepare data for the stacked line chart
      const preparedData = prepareStackedLineData(filterGraphData);
      const chartOption = createStackedLineOption(preparedData);
      
      setChartOption(chartOption);
      setFilterData(filterGraphData);
    }
  }, [sourceData]);

  useEffect(() => {
    // Initialize DataTable when filterData changes
    if (filterData.length > 0 && tableRef.current) {
      if (dataTable) {
        dataTable.destroy();
      }
      
      window.JSZip = JSZip;
      const newDataTable = $(tableRef.current).DataTable({
        responsive: true,
        dom: 'Bfrtip',
        buttons: [
          'copy', 'csv', 'excel', 'pdf', 'print'
        ]
      });
      
      setDataTable(newDataTable);
    }

    return () => {
      if (dataTable) {
        dataTable.destroy();
      }
    };
  }, [filterData]);

  return (
    <Wrapper>
      <div className="content-wrapper">
        <div className="container-full">
          <section className="content">
            {isLoading && <Loader />}
            
            <table className="table border-0" style={{ border: "none", borderWidth: "0px" }}>
              <thead>
                <tr>
                  <th colSpan={3} style={{
                    textAlign: "center",
                    backgroundColor: "#0052cc",
                    fontSize: "18px",
                    fontWeight: "bold",
                    color: "white"
                  }}>
                    {deviceName} Device Data
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Current Date</td>
                  <td className="text-center">Select Date</td>
                  <td>Action</td>
                </tr>
                <tr>
                  <td>
                    {selectDate.today !== ""
                      ? selectDate.today
                      : selectDate.last7Day !== ""
                        ? "Last 7 Days"
                        : selectDate.last30Day !== ""
                          ? "Last 30 Days"
                          : selectDate.last60Day !== ""
                            ? "Last 60 Days"
                            : selectDate.initDate !== ""
                              ? `${selectDate.initDate} - ${selectDate.endDay}`
                              : "No date selected"}
                  </td>
                  <td className="text-center">
                    <div className="d-flex align-items-center justify-content-center">
                      <input
                        name="group1"
                        type="radio"
                        id="today"
                        value="today"
                        checked={selectDate.today !== ""}
                        onChange={(e) => handleRadioState(e.target.value)}
                      />
                      <label htmlFor="today" style={{ marginRight: "10px" }}>
                        Today
                      </label>
                      <input
                        name="group1"
                        type="radio"
                        id="last7"
                        value="last7"
                        checked={selectDate.last7Day !== ""}
                        onChange={(e) => handleRadioState(e.target.value)}
                      />
                      <label htmlFor="last7" style={{ marginRight: "10px" }}>
                        Last 7 Days
                      </label>
                      <input
                        name="group1"
                        type="radio"
                        id="last30"
                        value="last30"
                        checked={selectDate.last30Day !== ""}
                        onChange={(e) => handleRadioState(e.target.value)}
                      />
                      <label htmlFor="last30" style={{ marginRight: "10px" }}>
                        Last 30 Days
                      </label>
                      <input
                        name="group1"
                        type="radio"
                        id="last60"
                        value="last60"
                        checked={selectDate.last60Day !== ""}
                        onChange={(e) => handleRadioState(e.target.value)}
                      />
                      <label htmlFor="last60" style={{ marginRight: "10px" }}>
                        Last 60 Days
                      </label>
                    </div>
                    <div className="d-flex align-items-center justify-content-center mt-2">
                      <input
                        className="form-control"
                        style={{ width: "180px", marginRight: "10px" }}
                        id="example-date"
                        type="date"
                        value={selectDate.initDate}
                        onChange={(e) =>
                          setSelectDate({
                            ...selectDate,
                            today: "",
                            last7Day: "",
                            last30Day: "",
                            last60Day: "",
                            initDate: e.target.value,
                          })
                        }
                      />
                      From
                      <input
                        className="form-control"
                        style={{ width: "180px", marginLeft: "10px" }}
                        id="example-date"
                        type="date"
                        value={selectDate.endDay}
                        onChange={(e) =>
                          setSelectDate({
                            ...selectDate,
                            today: "",
                            last7Day: "",
                            last30Day: "",
                            last60Day: "",
                            endDay: e.target.value,
                          })
                        }
                      />
                    </div>
                  </td>
                  <td>
                    <button
                      onClick={applyButton}
                      className="buttonStyle"
                      disabled={sourceData.length === 0 || isLoading}
                    >
                      Apply
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
            
            {sourceData.length === 0 && !isLoading ? (
              <div className="col-xxl-12 col-xl-12 col-12">
                <div className="box performance">
                  <NoData message="No data available for this device" />
                </div>
              </div>
            ) : (
              <>
                <div className="col-xxl-12 col-xl-12 col-12">
                  <div className="box performance">
                    <div className="col-12 mb-20">
                      {chartOption && Object.keys(chartOption).length > 0 ? (
                        <ReactEChartsCore
                          echarts={echarts}
                          option={chartOption}
                          style={{ height: '500px', width: '100%' }}
                        />
                      ) : (
                        <NoData />
                      )}
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-12">
                    <div className="box">
                      <div className="box-body">
                        <div className="">
                          <div id="toolbar"></div>
                          <table
                            ref={tableRef}
                            className="table text-fade table-bordered table-hover margin-top-10 w-p100"
                            style={{ width: "100%" }}
                          >
                            <thead>
                              <tr className="text-dark">
                                <th>S.No</th>
                                <th>UID</th>
                                <th>Pv Voltage</th>
                                <th>PV Current</th>
                                <th>Battery Voltage</th>
                                <th>Load Current</th>
                                <th>PVKWh</th>
                                <th>Temp</th>
                                <th>Recorded Time</th>
                              </tr>
                            </thead>
                            {filterData.length === 0 ? (
                              <tbody>
                                <tr>
                                  <td colSpan={9}>
                                    <NoData />
                                  </td>
                                </tr>
                              </tbody>
                            ) : (
                              <tbody>
                                {filterData.map((item, index) => (
                                  <tr key={index}>
                                    <td className="text-dark" style={{ fontSize: "16px" }}>
                                      <input
                                        className="form-check-input"
                                        type="checkbox"
                                        value={item.ID}
                                        id={item.ID}
                                      />
                                      {index + 1}
                                    </td>
                                    <td>{item.UID}</td>
                                    <td>{item.PvVolt}</td>
                                    <td>{item.PvCur}</td>
                                    <td>{item.BatVoltage}</td>
                                    <td>{item.BatCurrent}</td>
                                    <td>{item.PVKWh}</td>
                                    <td>{item.Temperature}</td>
                                    <td>{moment(item.RecordTime).format("DD/MM/YYYY HH:mm:ss")}</td>
                                  </tr>
                                ))}
                              </tbody>
                            )}
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </Wrapper>
  );
};

const Wrapper = styled.section`
  .performance {
    height: 100% !important;
  }
  .graphlayout {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 10px 5px;
  }
  .chartStyle {
    margin: 20px 0;
  }
  .apexcharts-menu {
    background-color: #f26b0f;
  }
  .apexcharts-menu-item {
    font-size: 12px;
    font-weight: bold;
    z-index: 1;
  }
  .settingStyle {
    cursor: pointer;
    &:active,
    &:hover {
      background-color: #0052cc;
      border: 1px solid white;
      padding: 5px;
    }
  }
  .buttonStyle {
    background: ${({ theme }) => theme.colors.themeColor};
    padding: 10px 30px;
    color: white;
    width: 150px;
    margin: 5px;
    &:hover,
    &:active {
      background-color: transparent;
      border: none;
      color: white;
      cursor: pointer;
      border: 1px solid;
      border-color: ${({ theme }) => theme.colors.themeColor};
      transform: scale(0.96);
    }
    
    &:disabled {
      background: #cccccc;
      cursor: not-allowed;
      opacity: 0.6;
    }
  }
  .seriesLabelStyle {
    min-width: 150px !important;
  }
`;

export default ShowGraph;