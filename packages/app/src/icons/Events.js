import React from 'react';

// https://thenounproject.com/search/?q=rows&i=1819800
// Grid Many Rows by Justin White from the Noun Project
const Icon = ({ ...other }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" className="icon" {...other}>
    <g transform="rotate(90 27 32)">
      <rect width="6" height="54" />
      <rect width="6" height="54" x="12" />
      <rect width="6" height="54" x="24" />
      <rect width="6" height="54" x="36" />
      <rect width="6" height="54" x="48" />
    </g>
  </svg>
);

export default Icon;
