import React, { useEffect, useRef, useState, useCallback } from "react";
import styled from "styled-components";
import "../../Style/custom_main.css";
import { useLocation, useNavigate } from "react-router-dom";
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
import Loader from "../Components/Loader";
import { debounce } from "lodash";

// Import ECharts
import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import {
  LineChart,
  BarChart
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

// Register ECharts components
echarts.use([
  LineChart,
  BarChart,
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
  const navigate = useNavigate();
  const { uid } = location.state || {};
  const tableRef = useRef(null);

  const [filterData, setFilterData] = useState([]);
  const [sourceData, setSourceData] = useState([]);
  const [dataTable, setDataTable] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [deviceName, setDeviceName] = useState("No UID Available");

  const [selectDate, setSelectDate] = useState({
    today: moment(new Date()).format("YYYY-MM-DD"),
    last7Day: "",
    last30Day: "",
    last60Day: "",
    last90Day: "",
    initDate: "",
    endDay: "",
  });

  const [seriesState, setSeriesState] = useState({
    pvVoltage: true,
    pvCurrent: true,
    bVoltage: true,
    lVoltage: true,
    lCurrent: true,
    PVKWh: true,
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
        setDeviceName(deviceUID);
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
      toast.error("No device UID provided");
      navigate(-1);
    }
  }, [uid, navigate]);

  const handleRadioState = (value) => {
    setSelectDate({
      today: value === "today" ? moment(new Date()).format("YYYY-MM-DD") : "",
      last7Day: value === "last7" ? moment().subtract(7, 'days').format("YYYY-MM-DD") : "",
      last30Day: value === "last30" ? moment().subtract(30, 'days').format("YYYY-MM-DD") : "",
      last60Day: value === "last60" ? moment().subtract(60, 'days').format("YYYY-MM-DD") : "",
      last90Day: value === "last90" ? moment().subtract(90, 'days').format("YYYY-MM-DD") : "",
      initDate: "",
      endDay: "",
    });
  };

  // Function to prepare data for the chart
  const prepareChartData = useCallback((filterGraphData) => {
    if (!filterGraphData || !Array.isArray(filterGraphData)) {
      return [];
    }
    
    return filterGraphData
      .map(item => ({
        time: moment(item.RecordTime).format('YYYY-MM-DD HH:mm:ss'),
        pvVoltage: parseFloat(item.PvVolt) || 0,
        pvCurrent: parseFloat(item.PvCur) || 0,
        bVoltage: parseFloat(item.BatVoltage) || 0,
        lVoltage: parseFloat(item.LoadVoltage) || 0,
        lCurrent: parseFloat(item.LoadCurrent) || 0,
        PVKWh: parseFloat(item.PVKWh) || 0,
      }))
      .sort((a, b) => new Date(a.time) - new Date(b.time));
  }, []);

  // Function to create the chart option
  const createChartOption = useCallback((data, selectedSeries = seriesState) => {
    if (!data || data.length === 0) {
      return {
        title: {
          text: 'Solar Charger Data',
          textStyle: { color: '#fff' }
        },
        series: []
      };
    }

    const times = data.map(item => moment(item.time).format('MMM DD HH:mm'));
    
    const seriesConfig = [
      { key: 'pvVoltage', name: 'PV Voltage', show: selectedSeries.pvVoltage, unit: 'V' },
      { key: 'pvCurrent', name: 'PV Current', show: selectedSeries.pvCurrent, unit: 'A' },
      { key: 'bVoltage', name: 'Battery Voltage', show: selectedSeries.bVoltage, unit: 'V' },
      { key: 'lVoltage', name: 'Load Voltage', show: selectedSeries.lVoltage, unit: 'V' },
      { key: 'lCurrent', name: 'Load Current', show: selectedSeries.lCurrent, unit: 'A' },
      { key: 'PVKWh', name: 'PV KWh', show: selectedSeries.PVKWh, unit: 'kWh' },
    ];

    const series = seriesConfig
      .filter(config => config.show)
      .map((config, index) => ({
        name: config.name,
        type: 'line',
        data: data.map(item => item[config.key] || 0),
        smooth: true,
        symbol: 'circle',
        symbolSize: 4,
        lineStyle: { width: 2 },
        itemStyle: {
          color: index === 0 ? '#5470c6' :
                 index === 1 ? '#BF0000' :
                 index === 2 ? '#fac858' :
                 index === 3 ? '#ee6666' :
                 index === 4 ? '#73c0de' :
                 '#80ff00'
        }
      }));

    return {
      title: {
        text: `Solar Charger Data - ${deviceName}`,
        left: 'center',
        textStyle: { 
          color: '#fff', 
          fontSize: 16,
          fontWeight: 'bold'
        }
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(0,0,0,0.8)',
        borderColor: '#0052cc',
        borderWidth: 1,
        textStyle: { color: '#fff' },
        formatter: (params) => {
          let result = `<div style="margin: 0 0 10px; font-weight: bold; padding: 5px 0; border-bottom: 1px solid rgba(255,255,255,0.2)">
            ${params[0].axisValue}</div>`;
          params.forEach(param => {
            const config = seriesConfig.find(c => c.name === param.seriesName);
            const unit = config ? config.unit : '';
            result += `
              <div style="display: flex; align-items: center; margin: 5px 0; padding: 3px 0;">
                <span style="display: inline-block; width: 10px; height: 10px; background: ${param.color}; border-radius: 50%; margin-right: 8px;"></span>
                <span style="flex: 1;">${param.seriesName}:</span>
                <b style="margin-left: 10px;">${param.value} ${unit}</b>
              </div>
            `;
          });
          return result;
        }
      },
      legend: {
        data: seriesConfig.filter(config => config.show).map(config => config.name),
        textStyle: { color: '#fff' },
        top: 40,
        type: 'scroll',
        pageTextStyle: { color: '#fff' }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '12%',
        top: '18%',
        containLabel: true
      },
      toolbox: {
        feature: {
          saveAsImage: {
            title: 'Save Image',
            pixelRatio: 2,
            backgroundColor: 'transparent'
          },
          dataZoom: {
            yAxisIndex: 'none',
            title: {
              zoom: 'Zoom',
              back: 'Reset Zoom'
            }
          },
          restore: {
            title: 'Restore'
          },
          magicType: {
            type: ['line', 'bar'],
            title: {
              line: 'Line Chart',
              bar: 'Bar Chart'
            }
          }
        },
        top: 40,
        right: 20,
        iconStyle: {
          borderColor: '#fff'
        },
        emphasis: {
          iconStyle: {
            borderColor: '#0052cc'
          }
        }
      },
      dataZoom: [
        {
          type: 'inside',
          start: 0,
          end: 100,
          zoomOnMouseWheel: true,
          moveOnMouseMove: true
        },
        {
          show: true,
          type: 'slider',
          bottom: '3%',
          start: 0,
          end: 100,
          textStyle: { color: '#fff' },
          borderColor: '#666',
          fillerColor: 'rgba(0,82,204,0.3)',
          handleStyle: {
            color: '#0052cc',
            borderColor: '#fff'
          }
        }
      ],
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: times,
        axisLabel: {
          color: '#fff',
          rotate: 45,
          fontSize: 10,
          margin: 10
        },
        axisLine: { 
          lineStyle: { 
            color: '#fff' 
          } 
        },
        axisTick: {
          alignWithLabel: true
        }
      },
      yAxis: {
        type: 'value',
        axisLabel: { 
          color: '#fff',
          formatter: '{value}'
        },
        axisLine: { 
          lineStyle: { 
            color: '#fff' 
          } 
        },
        splitLine: { 
          lineStyle: { 
            color: 'rgba(255,255,255,0.1)' 
          } 
        },
        nameTextStyle: {
          color: '#fff'
        }
      },
      series,
      backgroundColor: 'transparent'
    };
  }, [deviceName, seriesState]);

  // Debounced update chart function
  const debouncedUpdateChart = useRef(
    debounce((data) => {
      const preparedData = prepareChartData(data);
      const option = createChartOption(preparedData);
      setChartOption(option);
      setFilterData(data);
    }, 300)
  ).current;

  const applyButton = async () => {
    const { today, last7Day, last30Day, last60Day, last90Day, initDate, endDay } = selectDate;
    
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
    else if (last90Day !== "") {
      const startDate = moment().subtract(90, 'days').startOf('day');
      filterGraphData = sourceData.filter((item) => {
        return moment(item.RecordTime).isSameOrAfter(startDate);
      });
    }
    else if (initDate && endDay) {
      filterGraphData = sourceData.filter((item) => {
        return (
          moment(item.RecordTime).isSameOrAfter(moment(initDate).startOf('day')) &&
          moment(item.RecordTime).isSameOrBefore(moment(endDay).endOf('day'))
        );
      });
    } else {
      toast.error("Please select a valid date range");
      return;
    }

    if (filterGraphData.length === 0) {
      toast.error("No data found for the selected date range");
      return;
    }

    debouncedUpdateChart(filterGraphData);
  };

  // Initialize with today's data when sourceData is loaded
  useEffect(() => {
    if (sourceData && sourceData.length > 0) {
      const dateTime = moment(new Date()).format("YYYY-MM-DD");
      const filterGraphData = sourceData.filter((item) => {
        return moment(item.RecordTime).format("YYYY-MM-DD") === dateTime;
      });
      
      debouncedUpdateChart(filterGraphData);
    }
  }, [sourceData, debouncedUpdateChart]);

  // Update chart when series state changes
  useEffect(() => {
    if (filterData.length > 0) {
      const preparedData = prepareChartData(filterData);
      const option = createChartOption(preparedData);
      setChartOption(option);
    }
  }, [seriesState, filterData, prepareChartData, createChartOption]);

  // Initialize DataTable
  useEffect(() => {
    if (filterData.length > 0 && tableRef.current) {
      if (dataTable) {
        dataTable.destroy();
      }
      
      window.JSZip = JSZip;
      const newDataTable = $(tableRef.current).DataTable({
        responsive: true,
        dom: 'Bfrtip',
        buttons: [
          {
            extend: 'csv',
            text: 'Export CSV',
            className: 'btn btn-primary btn-sm'
          },
          {
            extend: 'pdf',
            text: 'Export PDF',
            className: 'btn btn-primary btn-sm'
          },
          {
            extend: 'print',
            text: 'Print',
            className: 'btn btn-primary btn-sm'
          }
        ],
        pageLength: 10,
        lengthMenu: [[10, 25, 50, -1], [10, 25, 50, "All"]],
        order: [[7, 'desc']], // Sort by Recorded Time descending
        language: {
          search: "Search records:",
          lengthMenu: "Show _MENU_ entries",
          info: "Showing _START_ to _END_ of _TOTAL_ entries",
          paginate: {
            first: "First",
            last: "Last",
            next: "Next",
            previous: "Previous"
          }
        }
      });
      
      setDataTable(newDataTable);
    }

    return () => {
      if (dataTable) {
        dataTable.destroy();
      }
    };
  }, [filterData]);

  // Chart Error Boundary Component
  const ChartWithErrorBoundary = ({ option }) => {
    const [hasError, setHasError] = useState(false);

    if (hasError) {
      return (
        <div style={{
          height: '500px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          backgroundColor: 'rgba(255,0,0,0.1)',
          borderRadius: '5px',
          flexDirection: 'column'
        }}>
          <div>
            <i className="fa fa-exclamation-triangle fa-2x mb-2"></i>
            <p>Failed to load chart. Please try again.</p>
          </div>
        </div>
      );
    }

    return (
      <ReactEChartsCore
        echarts={echarts}
        option={option}
        style={{ height: '500px', width: '100%' }}
        onChartReady={(chart) => {
          chart.on('error', () => setHasError(true));
        }}
        opts={{ renderer: 'canvas' }}
      />
    );
  };

  // Series Toggle Component
  const SeriesToggle = () => (
    <div className="d-flex flex-wrap align-items-center mt-3 mb-3 p-3" style={{
      backgroundColor: 'rgba(0,0,0,0.2)',
      borderRadius: '5px',
      border: '1px solid rgba(255,255,255,0.1)'
    }}>
      <span className="mr-3 text-white" style={{ fontWeight: 'bold' }}>
        Show/Hide Metrics:
      </span>
      {Object.entries(seriesState).map(([key, value]) => (
        <div key={key} className="form-check form-check-inline mr-3">
          <input
            className="form-check-input"
            type="checkbox"
            checked={value}
            onChange={(e) => {
              setSeriesState(prev => ({
                ...prev,
                [key]: e.target.checked
              }));
            }}
            id={`series-${key}`}
            style={{ cursor: 'pointer' }}
          />
          <label 
            className="form-check-label text-white" 
            htmlFor={`series-${key}`}
            style={{ cursor: 'pointer', userSelect: 'none' }}
          >
            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
          </label>
        </div>
      ))}
    </div>
  );

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
                    color: "white",
                    padding: "15px"
                  }}>
                    {deviceName} Device Data
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ fontWeight: 'bold' }}>Current Date Range</td>
                  <td className="text-center" style={{ fontWeight: 'bold' }}>Select Date Range</td>
                  <td style={{ fontWeight: 'bold' }}>Actions</td>
                </tr>
                <tr>
                  <td>
                    <div style={{ 
                      padding: '10px',
                      backgroundColor: 'rgba(0,82,204,0.1)',
                      borderRadius: '5px',
                      border: '1px solid rgba(0,82,204,0.3)'
                    }}>
                      {selectDate.today !== ""
                        ? `Today (${selectDate.today})`
                        : selectDate.last7Day !== ""
                          ? "Last 7 Days"
                          : selectDate.last30Day !== ""
                            ? "Last 30 Days"
                            : selectDate.last60Day !== ""
                              ? "Last 60 Days"
                              : selectDate.last90Day !== ""
                                ? "Last 90 Days"
                                : selectDate.initDate !== ""
                                  ? `${selectDate.initDate} to ${selectDate.endDay}`
                                  : "No date selected"}
                    </div>
                  </td>
                  <td className="text-center">
                    <div className="d-flex align-items-center justify-content-center mb-3">
                      <div className="btn-group btn-group-toggle" data-toggle="buttons">
                        <label className="btn btn-outline-primary btn-sm" style={{ marginRight: '5px' }}>
                          <input
                            name="group1"
                            type="radio"
                            id="today"
                            value="today"
                            checked={selectDate.today !== ""}
                            onChange={(e) => handleRadioState(e.target.value)}
                          />
                          Today
                        </label>
                        <label className="btn btn-outline-primary btn-sm" style={{ marginRight: '5px' }}>
                          <input
                            name="group1"
                            type="radio"
                            id="last7"
                            value="last7"
                            checked={selectDate.last7Day !== ""}
                            onChange={(e) => handleRadioState(e.target.value)}
                          />
                          7 Days
                        </label>
                        <label className="btn btn-outline-primary btn-sm" style={{ marginRight: '5px' }}>
                          <input
                            name="group1"
                            type="radio"
                            id="last30"
                            value="last30"
                            checked={selectDate.last30Day !== ""}
                            onChange={(e) => handleRadioState(e.target.value)}
                          />
                          30 Days
                        </label>
                        <label className="btn btn-outline-primary btn-sm" style={{ marginRight: '5px' }}>
                          <input
                            name="group1"
                            type="radio"
                            id="last60"
                            value="last60"
                            checked={selectDate.last60Day !== ""}
                            onChange={(e) => handleRadioState(e.target.value)}
                          />
                          60 Days
                        </label>
                        <label className="btn btn-outline-primary btn-sm">
                          <input
                            name="group1"
                            type="radio"
                            id="last90"
                            value="last90"
                            checked={selectDate.last90Day !== ""}
                            onChange={(e) => handleRadioState(e.target.value)}
                          />
                          90 Days
                        </label>
                      </div>
                    </div>
                    <div className="d-flex align-items-center justify-content-center">
                      <div className="input-group" style={{ maxWidth: '400px' }}>
                        <input
                          className="form-control form-control-sm"
                          style={{ width: "150px" }}
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
                              last90Day: "",
                              initDate: e.target.value,
                            })
                          }
                        />
                        <span className="input-group-text" style={{ 
                          backgroundColor: '#0052cc', 
                          color: 'white',
                          borderColor: '#0052cc'
                        }}>
                          From
                        </span>
                        <input
                          className="form-control form-control-sm"
                          style={{ width: "150px" }}
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
                              last90Day: "",
                              endDay: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </td>
                  <td>
                    <button
                      onClick={applyButton}
                      className="buttonStyle"
                      disabled={sourceData.length === 0 || isLoading}
                      style={{
                        width: '100%',
                        padding: '10px 20px',
                        fontSize: '14px',
                        fontWeight: 'bold'
                      }}
                    >
                      {isLoading ? 'Loading...' : 'Apply Filter'}
                    </button>
                    <button
                      onClick={() => navigate(-1)}
                      className="buttonStyle"
                      style={{
                        width: '100%',
                        marginTop: '10px',
                        padding: '10px 20px',
                        fontSize: '14px',
                        backgroundColor: '#6c757d',
                        borderColor: '#6c757d'
                      }}
                    >
                      Back to Dashboard
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
                      <SeriesToggle />
                      {chartOption && Object.keys(chartOption).length > 0 ? (
                        <ChartWithErrorBoundary option={chartOption} />
                      ) : (
                        <NoData message="No chart data available" />
                      )}
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-12">
                    <div className="box">
                      <div className="box-body">
                        <div className="">
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="text-white">Data Records ({filterData.length} total)</h5>
                            <div id="toolbar"></div>
                          </div>
                          <table
                            ref={tableRef}
                            className="table text-fade table-bordered table-hover margin-top-10 w-p100"
                            style={{ width: "100%" }}
                          >
                            <thead>
                              <tr className="text-dark" style={{ backgroundColor: '#0052cc' }}>
                                <th style={{ color: 'white' }}>S.No</th>
                                <th style={{ color: 'white' }}>UID</th>
                                <th style={{ color: 'white' }}>PV Voltage (V)</th>
                                <th style={{ color: 'white' }}>PV Current (A)</th>
                                <th style={{ color: 'white' }}>Battery Voltage (V)</th>
                                <th style={{ color: 'white' }}>Load Voltage (V)</th>
                                <th style={{ color: 'white' }}>Load Current (A)</th>
                                <th style={{ color: 'white' }}>PV KWh</th>
                                <th style={{ color: 'white' }}>Recorded Time</th>
                              </tr>
                            </thead>
                            {filterData.length === 0 ? (
                              <tbody>
                                <tr>
                                  <td colSpan={9} className="text-center py-5">
                                    <NoData message="No data for selected date range" />
                                  </td>
                                </tr>
                              </tbody>
                            ) : (
                              <tbody>
                                {filterData.map((item, index) => (
                                  <tr key={index}>
                                    <td className="text-dark" style={{ fontSize: "14px" }}>
                                      {index + 1}
                                    </td>
                                    <td>{item.UID}</td>
                                    <td>{parseFloat(item.PvVolt).toFixed(2)}</td>
                                    <td>{parseFloat(item.PvCur).toFixed(2)}</td>
                                    <td>{parseFloat(item.BatVoltage).toFixed(2)}</td>
                                    <td>{parseFloat(item.LoadVoltage).toFixed(2)}</td>
                                    <td>{parseFloat(item.LoadCurrent).toFixed(2)}</td>
                                    <td>{parseFloat(item.PVKWh).toFixed(3)}</td>
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
    border: none;
    border-radius: 5px;
    font-weight: bold;
    transition: all 0.3s ease;
    cursor: pointer;
    
    &:hover:not(:disabled) {
      background-color: #004bb5;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }
    
    &:active:not(:disabled) {
      transform: translateY(0);
    }
    
    &:disabled {
      background: #cccccc;
      cursor: not-allowed;
      opacity: 0.6;
      transform: none;
      box-shadow: none;
    }
  }
  .seriesLabelStyle {
    min-width: 150px !important;
  }
  
  // DataTable custom styles
  .dataTables_wrapper {
    margin-top: 20px;
  }
  
  .dt-buttons .btn {
    margin-right: 5px;
    margin-bottom: 5px;
  }
  
  .dataTables_filter input {
    background-color: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: white;
    padding: 5px 10px;
    border-radius: 4px;
    
    &:focus {
      outline: none;
      border-color: #0052cc;
      box-shadow: 0 0 0 0.2rem rgba(0, 82, 204, 0.25);
    }
  }
  
  .dataTables_length select {
    background-color: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: white;
    padding: 5px;
    border-radius: 4px;
  }
  
  .dataTables_info {
    color: rgba(255, 255, 255, 0.7);
  }
  
  .dataTables_paginate .paginate_button {
    background-color: rgba(255, 255, 255, 0.1) !important;
    border: 1px solid rgba(255, 255, 255, 0.3) !important;
    color: white !important;
    margin-left: 2px;
    
    &:hover:not(.disabled) {
      background-color: #0052cc !important;
      border-color: #0052cc !important;
    }
    
    &.current {
      background-color: #0052cc !important;
      border-color: #0052cc !important;
    }
  }
  
  // Custom scrollbar
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  
  ::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 4px;
  }
  
  ::-webkit-scrollbar-thumb {
    background: #0052cc;
    border-radius: 4px;
    
    &:hover {
      background: #004bb5;
    }
  }
`;

export default ShowGraph;