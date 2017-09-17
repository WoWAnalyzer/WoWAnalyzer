import React from 'react';
import PropTypes from 'prop-types';
import { Line as LineChart, defaults } from 'react-chartjs-2';

import './Chart.css';

const DAY_LABELS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

defaults.global.defaultFontColor = '#fff';

function formatTime(date) {
  const minutes = date.getMinutes();
  const hours = date.getHours();
  return `${hours < 10 ? `0${hours}` : hours}:${minutes < 10 ? `0${minutes}` : minutes}`;
}
function formatDay(date) {
  const day = date.getDay();
  return DAY_LABELS[day];
}

const Chart = ({ data, options, timeSpanMinutes }) => {
  const labelsPerHour = 720 / timeSpanMinutes;
  const dayLabels = timeSpanMinutes > 1440;
  let previousDay = null;

  const defaultOptions = {
    maintainAspectRatio: false,
    elements: {
      line: {
        tension: 0,
        borderWidth: 1,
      },
      point: {
        radius: 0,
        hitRadius: 10,
        hoverRadius: 10,
      },
    },
    tooltips: {
      mode: 'nearest',
      callbacks: {
        title: (item, data) => {
          const date = data.labels[item[0].index];
          return `${formatDay(date)} ${formatTime(date)}`;
        },
      },
    },
    scales: {
      xAxes: [{
        ticks: {
          callback: (date) => {
            if (dayLabels) {
              const day = date.getDay();
              // By only showing the label on the first hour of day we only really show the first label if there's enough space
              const firstHour = date.getHours() === 0;
              if (firstHour && (previousDay === null || day !== previousDay)) {
                previousDay = day;
                return formatDay(date);
              }
            } else {
              const minutes = date.getMinutes();
              if (minutes === 0 || (labelsPerHour >= 2 && minutes === 30) || (labelsPerHour >= 4 && (minutes === 15 || minutes === 45))) {
                return formatTime(date);
              }
            }
            return null;
          },
          autoSkip: false,
          maxRotation: 0,
        },
        gridLines: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      }],
      yAxes: [{
        display: true,
        ticks: {
          beginAtZero: true,
        },
        gridLines: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      }],
    },
  };

  let mergedOptions;
  if (typeof options === 'function') {
    mergedOptions = options(defaultOptions);
  } else {
    mergedOptions = {
      ...defaultOptions,
      ...options,
    };
  }

  return (
    <LineChart
      data={data}
      options={mergedOptions}
      height={350}
      redraw
    />
  );
};
Chart.propTypes = {
  data: PropTypes.object,
  options: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
  timeSpanMinutes: PropTypes.number,
};

export default Chart;
