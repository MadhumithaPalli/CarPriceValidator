import ReactEcharts from "echarts-for-react"

function LineGraph(prop) {
  const values = prop.data.price
  const keys = prop.data.feature

  const options = {
    xAxis: {
      type: 'category',
      data: keys,
      nameLocation: "center",
      name: "mileage",
      nameGap: 30
    },
    yAxis: {
      type: 'value',
      max: values[0],
      min: values[values.length - 1],
      name: "price",
      nameGap: 60
    },
    series: [
      {
        data: values,
        type: 'line'
      }
    ],
    tooltip: {
      trigger: "item"
    }
  };

  return (
    <ReactEcharts
      option={options}
      style={{ width: "100%", height: "400px" }}
    ></ReactEcharts>
  )
}

export default LineGraph
