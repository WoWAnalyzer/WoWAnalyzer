import React from 'react';
import PropTypes from 'prop-types';
import Chartist from 'chartist';
import ChartistGraph from 'react-chartist';
import 'chartist-plugin-legend';

import './Chart.css';

const DAY_LABELS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const Chart = ({ data, options, timeSpanMinutes }) => {
  const labelsPerHour = 720 / timeSpanMinutes;
  const dayLabels = timeSpanMinutes > 1440;
  let previousDay = null;
  return (
    <ChartistGraph
      data={data}
      options={{
        low: 0,
        showPoint: false,
        fullWidth: true,
        height: '350px',
        lineSmooth: Chartist.Interpolation.simple({
        }),
        axisX: {
          labelInterpolationFnc: function skipLabels(date) {
            if (dayLabels) {
              const day = date.getDay();
              // By only showing the label on the first hour of day we only really show the first label if there's enough space
              const firstHour = date.getHours() === 0;
              if (firstHour && (previousDay === null || day !== previousDay)) {
                previousDay = day;
                return DAY_LABELS[day];
              }
            } else {
              const minutes = date.getMinutes();
              if (minutes === 0 || (labelsPerHour >= 2 && minutes === 30) || (labelsPerHour >= 4 && (minutes === 15 || minutes === 45))) {
                const hours = date.getHours();
                return `${hours < 10 ? `0${hours}` : hours}:${minutes < 10 ? `0${minutes}` : minutes}`;
              }
            }
            return null;
          },
          offset: 15,
        },
        axisY: {
          onlyInteger: true,
          offset: 60,
        },
        plugins: [
          Chartist.plugins.legend({
            classNames: data.series.map(serie => serie.className),
          }),
        ],
        ...options,
      }}
      type="Line"
    />
  );
};
Chart.propTypes = {
  data: PropTypes.object,
  options: PropTypes.object,
  timeSpanMinutes: PropTypes.number,
};

export default Chart;
