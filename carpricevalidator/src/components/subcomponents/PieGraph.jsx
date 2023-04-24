import ReactEcharts from "echarts-for-react"

function PieGraph(prop) {
  const make = prop.data.make
  const model = prop.data.model

  const options = {
    legend: {
      top: '5%',
      left: 'center'
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 15,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: make.ratio, name: 'Median Price for ' + make.name.toUpperCase() },
          { value: model.ratio, name: 'Price for ' + model.name.toUpperCase() },
        ]
      }
    ]
  };

  return (
    <ReactEcharts
      option={options}
      style={{ width: "100%", height: "400px" }}
    ></ReactEcharts>
  )
}

export default PieGraph
