import React from 'react';
import PropTypes from 'prop-types';

import { formatPercentage } from 'common/format';

const Gauge = ({ value }) => (
  <div className="flex" style={{ textAlign: 'center', marginTop: 12 }}>
    <div className="flex-main text-right text-muted" style={{ paddingTop: 23, paddingRight: 8, fontSize: 12 }}>
      Low
    </div>
    <div className="flex-sub" style={{ position: 'relative' }}>
      <svg width="98" height="85" viewBox="0 0 98 85" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ height: 'auto', fill: 'none' }}>
        <path
          d="M80.8198 80.8198C98.3934 63.2462 98.3934 34.7537 80.8198 17.1802C63.2462 -0.393437 34.7538 -0.393437 17.1802 17.1802C-0.393397 34.7537 -0.393397 63.2462 17.1802 80.8198"
          stroke="#f8b700"
          strokeWidth="8"
          strokeLinecap="round"
        />
      </svg>

      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: 32,
          height: 32,
          transform: 'translate(-50%, -50%)',
          marginTop: -13,
        }}
      >
        <svg
          width="10"
          height="32"
          viewBox="0 0 10 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            height: 'auto',
            fill: 'none',
            margin: 0,
            transformOrigin: '5px 27px',
            transform: `rotate(${-140 + 280 * value}deg)`,
          }}
        >
          <path d="M9 27C9 29.2091 7.20914 31 5 31C2.79086 31 1 29.2091 1 27C1 24.7909 2.79086 23 5 23C7.20914 23 9 24.7909 9 27Z" stroke="#f8b700" strokeWidth="2" />
          <path fillRule="evenodd" clipRule="evenodd" d="M6 0L6 23H4L4 0L6 0Z" fill="#f8b700" />
        </svg>
      </div>

      <div style={{ marginTop: -15, fontSize: '1.2em' }}>
        {formatPercentage(value, 0)}%
      </div>
    </div>
    <div className="flex-main text-left text-muted" style={{ paddingTop: 23, paddingLeft: 8, fontSize: 12 }}>
      High
    </div>
  </div>
);
Gauge.propTypes = {
  value: PropTypes.number.isRequired,
};

export default Gauge;
