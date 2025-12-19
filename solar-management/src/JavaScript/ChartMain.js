export const medianChartOption = {
    series: [67],
    options: {
        chart: {
            height: 350,
            type: "radialBar",
            offsetY: -10,
        },
        plotOptions: {
            radialBar: {
                startAngle: -135,
                endAngle: 135,
                dataLabels: {
                    name: {
                        fontSize: "16px",
                        color: undefined,
                        offsetY: 120,
                    },
                    value: {
                        offsetY: 76,
                        fontSize: "22px",
                        color: undefined,
                        formatter: function (val) {
                            return val + "%";
                        },
                    },
                },
            },
        },
        fill: {
            type: "gradient",
            gradient: {
                shade: "dark",
                shadeIntensity: 0.15,
                inverseColors: false,
                opacityFrom: 1,
                opacityTo: 1,
                stops: [0, 50, 65, 91],
            },
        },
        stroke: {
            dashArray: 4,
        },
        labels: ["Median Ratio"],
    },
};

// ✅ FIXED: Use public folder paths
export const chartOptionList = [
    // {
    //     id: 1,
    //     path: "/images/charts/chart1.png", 
    //     title: "Canvas Chart",
    // },
    // {
    //     id: 2,
    //     path: "/images/charts/chart2.png",
    //     title: "Gradient Circle Chart",
    // },
    // {
    //     id: 3,
    //     path: "/images/charts/chart3.png",
    //     title: "Strocked Chart",
    // },
    // {
    //     id: 4,
    //     path: "/images/charts/chart4.png",
    //     title: "Semi Circle Chart",
    // },
    // {
    //     id: 5,
    //     path: "/images/charts/chart5.png",
    //     title: "Semi Circle Chart",
    // },
    // {
    //     id: 6,
    //     path: "/images/charts/chart6.png",
    //     title: "Radia Chart",
    // },
    // {
    //     id: 7,
    //     path: "/images/charts/chart7.png",
    //     title: "Pie Chart",
    // },
    // {
    //     id: 8,
    //     path: "/images/charts/chart8.png",
    //     title: "Filled Cicle Chart",
    // },
];

// ✅ FIXED: Safe data access with defensive programming
export const canvasChatOption = (data, chartData) => {
    // ✅ Validate inputs
    if (!data || !Array.isArray(data) || data.length === 0) {
        console.warn('No data available for chart');
        return {
            series: [{
                type: "gauge",
                min: 0,
                max: 40,
                data: [{ value: 0 }]
            }]
        };
    }

    if (!chartData || !chartData.id) {
        console.warn('Invalid chart data');
        return null;
    }

    const firstRecord = data[0] || {};
    
    // ✅ Helper to get safe value
    const getSafeValue = (val) => {
        const num = parseFloat(val);
        return isNaN(num) ? 0 : num;
    };

    // ✅ Get value based on chart ID
    const getChartValue = () => {
        switch(chartData.id) {
            case 1: return getSafeValue(firstRecord.PvVolt);
            case 2: return getSafeValue(firstRecord.PvCur);
            case 3: return getSafeValue(firstRecord.PVKWh);
            case 4: return getSafeValue(firstRecord.Temperature);
            case 5: return getSafeValue(firstRecord.BatVoltage);
            case 6: return getSafeValue(firstRecord.BatCurrent);
            case 7: return getSafeValue(firstRecord.LoadVoltage);
            case 8: return getSafeValue(firstRecord.LoadCurrent);
            default: return 0;
        }
    };

    // ✅ Get unit based on chart ID
    const getUnit = () => {
        const units = { 1: 'V', 2: 'A', 3: 'W', 4: 'C', 5: 'V', 6: 'A', 7: 'V', 8: 'A' };
        return units[chartData.id] || '';
    };

    let option = {
        series: [
            {
                type: "gauge",
                min: 0,
                max: 40,
                axisLine: {
                    lineStyle: {
                        width: 10,
                        color: [
                            [0.3, "#ff9920"],
                            [0.7, "#51ce8a"],
                            [1, "#fc696a"],
                        ],
                    },
                },
                pointer: {
                    itemStyle: {
                        color: "auto",
                    },
                },
                splitLine: {
                    distance: -75,
                    length: 20,
                    lineStyle: {
                        color: "#fff",
                        width: 0,
                    },
                },
                axisLabel: {
                    color: "inherit",
                    distance: 40,
                    fontSize: 10,
                },
                detail: {
                    valueAnimation: true,
                    formatter: `{value} ${getUnit()}`,
                    fontSize: 15,
                    color: "inherit",
                    offsetCenter: [0, "75%"],
                },
                data: [
                    {
                        value: getChartValue(),
                        fontSize: 10,
                    },
                ],
            },
        ],
    };
    return option;
};

export const chrtListOpt2 = [
    // {
    //     id: 1,
    //     path: "/images/charts/chart1.png",
    //     title: "Canvas Chart 1",
    // },
    // {
    //     id: 2,
    //     path: "/images/charts/chart1.png",
    //     title: "Canvas Chart 2",
    // },
    // {
    //     id: 3,
    //     path: "/images/charts/chart1.png",
    //     title: "Canvas Chart 3",
    // },
    // {
    //     id: 4,
    //     path: "/images/charts/chart1.png",
    //     title: "Canvas Chart 4",
    // },
    // {
    //     id: 5,
    //     path: "/images/charts/chart1.png",
    //     title: "Canvas Chart 5",
    // },
    // {
    //     id: 6,
    //     path: "/images/charts/chart1.png",
    //     title: "Canvas Chart 6",
    // },
    // {
    //     id: 7,
    //     path: "/images/charts/chart1.png",
    //     title: "Canvas Chart 7",
    // },
    // {
    //     id: 8,
    //     path: "/images/charts/chart1.png",
    //     title: "Canvas Chart 8",
    // },
];

// ✅ FIXED: Safe data processing in sourcerChartOption
export const sourcerChartOption = (filterData, selectDate, seriesState) => {
    let graphData = [];
    let startTime = "";
    let endTime = "";

    // ✅ Validate filterData
    if (!filterData || !Array.isArray(filterData) || filterData.length === 0) {
        console.warn('No filter data available');
        graphData = [];
    } else {
        const getSafeValue = (val) => {
            const num = parseFloat(val);
            return isNaN(num) ? 0 : num;
        };

        if (seriesState) {
            const { pvVoltage, pvCurrent, bVoltage, bCurrent, lVoltage, lCurrent, temp } = seriesState;
            
            graphData = filterData.map((item) => {
                if (!item || !item.RecordTime) return null;
                
                let value = 0;
                if (pvVoltage) value = getSafeValue(item.PvVolt);
                else if (pvCurrent) value = getSafeValue(item.PvCur);
                else if (bVoltage) value = getSafeValue(item.BatVoltage);
                else if (bCurrent) value = getSafeValue(item.BatCurrent);
                else if (lVoltage) value = getSafeValue(item.LoadVoltage);
                else if (lCurrent) value = getSafeValue(item.LoadCurrent);
                else if (temp) value = getSafeValue(item.Temperature);
                else value = getSafeValue(item.PvVolt);
                
                return [new Date(item.RecordTime).getTime(), value];
            }).filter(Boolean); // Remove null values
        } else {
            graphData = filterData.map((item) => {
                if (!item || !item.Time) return null;
                return [new Date(item.Time).getTime(), getSafeValue(item.PvVolt)];
            }).filter(Boolean);
        }

        // ✅ Date range handling
        if (selectDate) {
            const { today, yesterday, last2Day, last7Day, initDate, endDay } = selectDate;
            
            if (today) {
                startTime = new Date().setHours(0, 0, 0, 0);
                endTime = new Date().setHours(23, 59, 59, 999);
            } else if (yesterday) {
                let date = new Date();
                date.setDate(date.getDate() - 1);
                startTime = date.setHours(0, 0, 0, 0);
                endTime = new Date().getTime();
            } else if (last2Day) {
                let date = new Date();
                date.setDate(date.getDate() - 2);
                startTime = date.getTime();
                endTime = new Date().getTime();
            } else if (last7Day) {
                let date = new Date();
                date.setDate(date.getDate() - 7);
                startTime = date.getTime();
                endTime = new Date().getTime();
            } else if (initDate && endDay) {
                startTime = new Date(initDate).getTime();
                endTime = new Date(endDay).getTime();
            } else {
                startTime = new Date().setHours(0, 0, 0, 0);
                endTime = new Date().setHours(23, 59, 59, 999);
            }
        } else {
            startTime = new Date().setHours(0, 0, 0, 0);
            endTime = new Date().setHours(23, 59, 59, 999);
        }
    }

    let barChartOption = {
        series: [{
            data: graphData
        }],
        options: {
            chart: {
                id: 'area-datetime',
                type: 'area',
                height: 350,
                zoom: {
                    autoScaleYaxis: true
                }
            },
            annotations: {
                yaxis: [{
                    y: 30,
                    borderColor: '#999',
                    label: {
                        show: true,
                        text: 'Support',
                        style: {
                            color: "#fff",
                            background: '#00E396'
                        }
                    }
                }],
                xaxis: [{
                    x: endTime,
                    borderColor: '#999',
                    yAxisIndex: 0,
                    label: {
                        show: true,
                        text: 'Rally',
                        style: {
                            color: "#fff",
                            background: '#775DD0'
                        }
                    }
                }]
            },
            dataLabels: {
                enabled: false
            },
            markers: {
                size: 0,
                style: 'hollow',
            },
            xaxis: {
                type: 'datetime',
                min: startTime,
                max: endTime,
                tickAmount: 6,
            },
            tooltip: {
                x: {
                    format: 'dd MMM yyyy HH:mm'
                }
            },
            fill: {
                type: 'gradient',
                gradient: {
                    shadeIntensity: 1,
                    opacityFrom: 0.7,
                    opacityTo: 0.9,
                    stops: [0, 100]
                }
            },
        },
        selection: 'one_year',
    };
    
    return barChartOption;
}