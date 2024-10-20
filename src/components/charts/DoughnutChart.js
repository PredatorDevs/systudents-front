import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { faker } from '@faker-js/faker';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
);

function DoughnutChart(props) {
  const {
    legendText,
    chartLabels,
    chartDataset
  } = props;

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: 10,
    },
    plugins: {
      emptyDoughnut: {
        color: 'rgba(255, 128, 0, 0.5)',
        width: 2,
        radiusDecrease: 20
      },
      legend: {
        position: 'left',
        align: "center",
        labels: {
          font: {
            size: 10
          }
        }
      },
      title: {
        display: true,
        text: legendText || 'Mi gráfica',
      },
    },
  };

  const labels = chartLabels || ['Green', 'Yellow', 'Blue'];

  const data = {
    labels,
    datasets: chartDataset || [],
  };

  return (
    <Doughnut
      options={options}
      data={data}
    />
  );
}

export default DoughnutChart;
