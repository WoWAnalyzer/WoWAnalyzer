import React from 'react';
import PropTypes from 'prop-types';

import { formatPercentage } from 'common/format';

const Gauge = ({ value }) => (
  <div className="flex" style={{ textAlign: 'center', marginTop: 12 }}>
    <div className="flex-main text-right text-muted" style={{ paddingTop: 23, paddingRight: 8, fontSize: 12 }}>
      Low
    </div>
    <div className="flex-sub" style={{ position: 'relative' }}>
      <svg width="98" height="85" viewBox="19 19 101 88" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ height: 'auto', fill: 'none' }}>
          <path d="M101.459 101.459C119.033 83.8858 119.033 55.3934 101.459 37.8198C83.8859 20.2462 55.3934 20.2462 37.8198 37.8198C20.2463 55.3934 20.2463 83.8858 37.8198 101.459" stroke="#f8b700" strokeWidth="8" strokeLinecap="round" />
          <path fillRule="evenodd" clipRule="evenodd" d="M68.6396 28.6396H70.6396V32.6396H68.6396V28.6396Z" fill="#f8b700" />
          <path fillRule="evenodd" clipRule="evenodd" d="M87.7656 32.8389L89.5485 33.7451L87.7368 37.3097L85.9539 36.4035L87.7656 32.8389Z" fill="#f8b700" />
          <path fillRule="evenodd" clipRule="evenodd" d="M101.207 50.1829L100.077 48.5324L103.378 46.2732L104.508 47.9236L101.207 50.1829Z" fill="#f8b700" />
          <path fillRule="evenodd" clipRule="evenodd" d="M106.622 67.3762L106.417 65.3868L110.398 64.9765L110.603 66.966L106.622 67.3762Z" fill="#f8b700" />
          <path fillRule="evenodd" clipRule="evenodd" d="M103.658 84.4276L104.376 82.5609L108.11 83.9969L107.392 85.8635L103.658 84.4276Z" fill="#f8b700" />
          <path fillRule="evenodd" clipRule="evenodd" d="M52.0547 32.5298L50.2627 33.4179L52.039 37.0019L53.831 36.1137L52.0547 32.5298Z" fill="#f8b700" />
          <path fillRule="evenodd" clipRule="evenodd" d="M36.1157 45.9784L34.965 47.6142L38.2354 49.9147L39.3861 48.2789L36.1157 45.9784Z" fill="#f8b700" />
          <path fillRule="evenodd" clipRule="evenodd" d="M28.8926 64.968L28.6883 66.9576L32.6626 67.3657L32.8669 65.3761L28.8926 64.968Z" fill="#f8b700" />
          <path fillRule="evenodd" clipRule="evenodd" d="M31.3486 84.3921L32.0806 86.2533L35.8031 84.7895L35.0711 82.9282L31.3486 84.3921Z" fill="#f8b700" />
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
            transform: `rotate(${-140 + 280 * 0.1}deg)`,
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
