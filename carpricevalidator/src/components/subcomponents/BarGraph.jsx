import ReactEcharts from "echarts-for-react"

const options = {
  grid: { top: 20, right: 40, bottom: 20, left: 40 },
  xAxis: {
    type: "category",
    data: ["Item 1", "Item 2", "Item 3", "Item 4", "Item 5"]
  },
  yAxis: {
    type: "value"
  },
  series: [
    {
      data: [400, 300, 350, 200, 280],
      type: "bar",
      smooth: true
    }
  ],
  tooltip: {
    trigger: "axis"
  }
}

function BarGraph() {
  return (
    <ReactEcharts
      option={options}
      style={{ width: "600px", height: "300px" }}
    ></ReactEcharts>
  )
}

export default BarGraph
