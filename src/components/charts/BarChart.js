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
  ArcElement,
  BarElement
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { faker } from '@faker-js/faker';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

function BarChart(props) {
  const {
    legendText,
    chartLabels,
    chartDataset
  } = props;

  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: 10,
    },
    scales: {
      yAxes: [{
          ticks: {
              fontSize: 10
          }
      }]
    },
    plugins: {
      legend: {
        position: 'top',
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
    <Bar
      options={options}
      data={data}
    />
  );
}

export default BarChart;
