import React, { useEffect, useState } from "react";
import { Bar, Line, Scatter } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, LineElement, PointElement, ScatterController } from 'chart.js';
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import 'chartjs-adapter-moment';  // Ensure this import is present

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  ScatterController
);

const regionNameMap = {
  'region1': 'North Zone',
  'region2': 'South Zone',
  'region3': 'East Zone',
  'region4': 'West Zone',
  // Add more mappings as needed
};

const DengueVisualization = () => {
  const [barChartData, setBarChartData] = useState({ labels: [], datasets: [] });
  const [lineChartData, setLineChartData] = useState({ labels: [], datasets: [] });
  const [scatterPlotData, setScatterPlotData] = useState({ datasets: [] });
  const [deathsOverTimeData, setDeathsOverTimeData] = useState({ labels: [], datasets: [] });
  const [activeChart, setActiveChart] = useState('bar'); // State to control which chart is displayed

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dengueCollection = collection(db, "dengueData");
        const dengueSnapshot = await getDocs(dengueCollection);
        const dataList = dengueSnapshot.docs.map(doc => doc.data()) || []; // Default to empty array if undefined

        if (dataList.length === 0) {
          console.warn("No data available.");
          return;
        }

        // Prepare data for Bar Chart
        const regions = [...new Set(dataList.map(data => data.region))] || [];
        const correctedRegions = regions.map(region => regionNameMap[region] || region); // Map region names
        const casesByRegion = correctedRegions.map(region => {
          return dataList
            .filter(data => regionNameMap[data.region] === region || data.region === region)
            .reduce((total, data) => total + (data.cases || 0), 0);
        });

        setBarChartData({
          labels: correctedRegions,
          datasets: [
            {
              label: 'Cases by Region',
              data: casesByRegion,
              backgroundColor: correctedRegions.map((_, index) => `rgba(${index * 50}, 99, 132, 0.2)`),
              borderColor: correctedRegions.map((_, index) => `rgba(${index * 50}, 99, 132, 1)`),
              borderWidth: 1,
              datalabels: {
                display: true,
                color: '#000',
                anchor: 'end',
                align: 'top',
                formatter: (value) => value.toLocaleString(),
              },
            },
          ],
        });

        // Prepare data for Line Chart (Cases Over Time)
        const dates = [...new Set(dataList.map(data => data.date))].sort() || [];
        const casesByDate = dates.map(date => {
          return dataList
            .filter(data => data.date === date)
            .reduce((total, data) => total + (data.cases || 0), 0);
        });

        setLineChartData({
          labels: dates,
          datasets: [
            {
              label: 'Cases Over Time',
              data: casesByDate,
              fill: false,
              borderColor: 'rgb(75, 192, 192)',
              tension: 0.1,
            },
          ],
        });

        // Prepare data for Scatter Plot (Cases vs Deaths)
        const scatterData = dataList.map(data => ({
          x: data.cases,
          y: data.deaths,
        }));

        setScatterPlotData({
          datasets: [
            {
              label: 'Cases vs Deaths',
              data: scatterData,
              backgroundColor: 'rgba(75, 192, 192, 0.5)',
              borderColor: 'rgb(75, 192, 192)',
              borderWidth: 1,
              pointRadius: 5,
            },
          ],
        });

        // Prepare data for Line Chart (Deaths Over Time)
        const deathsByDate = dates.map(date => {
          return dataList
            .filter(data => data.date === date)
            .reduce((total, data) => total + (data.deaths || 0), 0);
        });

        setDeathsOverTimeData({
          labels: dates,
          datasets: [
            {
              label: 'Deaths Over Time',
              data: deathsByDate,
              fill: false,
              borderColor: 'rgb(255, 99, 132)',
              tension: 0.1,
            },
          ],
        });

      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-4 bg-white rounded-md shadow-md">
      <h2 className="text-xl font-bold mb-4">Dengue Data Visualization</h2>

      <div className="mb-4">
        <button 
          onClick={() => setActiveChart('bar')} 
          className={`py-2 px-4 mr-2 rounded ${activeChart === 'bar' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Bar Chart
        </button>
        <button 
          onClick={() => setActiveChart('line')} 
          className={`py-2 px-4 mr-2 rounded ${activeChart === 'line' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Cases Over Time
        </button>
        <button 
          onClick={() => setActiveChart('scatter')} 
          className={`py-2 px-4 mr-2 rounded ${activeChart === 'scatter' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Scatter Plot
        </button>
        <button 
          onClick={() => setActiveChart('deathsOverTime')} 
          className={`py-2 px-4 rounded ${activeChart === 'deathsOverTime' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Deaths Over Time
        </button>
      </div>

      {activeChart === 'bar' && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-2">Comparison of Dengue Cases by Region</h3>
          <div style={{ height: '400px', width: '100%' }}>
            <Bar 
              data={barChartData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  tooltip: {
                    callbacks: {
                      label: (tooltipItem) => `Cases: ${tooltipItem.raw.toLocaleString()}`,
                    },
                  },
                  datalabels: {
                    display: true,
                    color: '#000',
                    anchor: 'end',
                    align: 'top',
                    formatter: (value) => value.toLocaleString(),
                  },
                },
                scales: {
                  x: {
                    grid: {
                      display: false,
                    },
                  },
                  y: {
                    grid: {
                      color: 'rgba(0, 0, 0, 0.1)',
                    },
                  },
                },
              }} 
            />
          </div>
        </div>
      )}

      {activeChart === 'line' && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-2">Dengue Cases Over Time</h3>
          <div style={{ height: '400px', width: '100%' }}>
            <Line 
              data={lineChartData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  tooltip: {
                    callbacks: {
                      label: (tooltipItem) => `Cases: ${tooltipItem.raw.toLocaleString()}`,
                    },
                  },
                },
              }} 
            />
          </div>
        </div>
      )}

      {activeChart === 'scatter' && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-2">Dengue Cases vs. Deaths</h3>
          <div style={{ height: '400px', width: '100%' }}>
            <Scatter 
              data={scatterPlotData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  tooltip: {
                    callbacks: {
                      label: (tooltipItem) => `Cases: ${tooltipItem.raw.x.toLocaleString()}, Deaths: ${tooltipItem.raw.y.toLocaleString()}`,
                    },
                  },
                },
                scales: {
                  x: {
                    title: {
                      display: true,
                      text: 'Number of Cases',
                    },
                  },
                  y: {
                    title: {
                      display: true,
                      text: 'Number of Deaths',
                    },
                  },
                },
              }} 
            />
          </div>
        </div>
      )}

      {activeChart === 'deathsOverTime' && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-2">Dengue Deaths Over Time</h3>
          <div style={{ height: '400px', width: '100%' }}>
            <Line 
              data={deathsOverTimeData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  tooltip: {
                    callbacks: {
                      label: (tooltipItem) => `Deaths: ${tooltipItem.raw.toLocaleString()}`,
                    },
                  },
                },
              }} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DengueVisualization;
