import ReactEcharts from "echarts-for-react"

function BarGraph(prop) {
  const values = Object.values(prop.data)
  const keys = Object.keys(prop.data)

  const options = {
    xAxis: {
      type: "category",
      data: keys
    },
    yAxis: {
      type: "value",
      min: (Math.min(...values)/1.01).toFixed(2),
      max: Math.max(...values)
    },
    series: [
      {
        data: values,
        sort: 'asc',
        type: "bar",
        smooth: true,
      }
    ],
    tooltip: {
      trigger: "axis"
    }
  }

  return (
    <ReactEcharts
      option={options}
      style={{ width: "600px", height: "300px" }}
    ></ReactEcharts>
  )
}

export default BarGraph
