import React from "react";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

// Register required Chart.js components
ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend
);

const NeighborhoodGraphs = ({
  isOpen,
  onClose,
  neighborhood,
  rentalPrices = [],
  airbnbPrices = [],
}) => {
  if (!isOpen) return null;

  const combinedGraphData = {
    labels: ["December", "March", "June"], // Example months
    datasets: [
      {
        label: "Rental Prices",
        data: rentalPrices,
        borderColor: "blue",
        backgroundColor: "rgba(0, 0, 255, 0.2)",
        fill: true,
      },
      {
        label: "Airbnb Prices",
        data: airbnbPrices,
        borderColor: "green",
        backgroundColor: "rgba(0, 255, 0, 0.2)",
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: `${neighborhood} - Price Trends`,
      },
      legend: {
        position: "top",
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Months",
        },
      },
      y: {
        title: {
          display: true,
          text: "Price",
        },
      },
    },
  };

  return (
    <div className="graphs-container">
      <div className="graphs-header">
        <h3>{neighborhood} - Data Visualization</h3>
        <button onClick={onClose} className="close-button">
          Close
        </button>
      </div>
      <div className="graph">
        <Line data={combinedGraphData} options={options} />
      </div>
    </div>
  );
};

export default NeighborhoodGraphs;
