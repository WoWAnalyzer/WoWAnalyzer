import React from 'react';
import { Link } from 'react-router-dom';

const Ad = () => (
  <div className="text-center">
    <Link to="/premium">
      <img
        src="/img/728.jpg"
        alt="WoWAnalyzer Premium - Did we help? Support us and unlock cool perks."
        style={{ maxWidth: '100%' }}
      />
    </Link>
  </div>
);

export default Ad;
