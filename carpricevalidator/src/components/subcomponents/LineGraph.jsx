import ReactEcharts from "echarts-for-react"

function LineGraph(prop) {
  const values = prop.data.price
  const keys = prop.data.feature

  const options = {
    xAxis: {
      type: 'category',
      data: keys
    },
    yAxis: {
      type: 'value',
      max: values[0],
      min: values[values.length - 1]
    },
    series: [
      {
        data: values,
        type: 'line'
      }
    ]
  };

  return (
    <ReactEcharts
      option={options}
      style={{ width: "600px", height: "300px" }}
    ></ReactEcharts>
  )
}

export default LineGraph
