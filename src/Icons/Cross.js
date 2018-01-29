import React from 'react';

// https://thenounproject.com/term/cross/1147331/
// Created by Andrey from the Noun Project
const Icon = ({ ...other }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="15 15 70 70" {...other}>
    <g style={{ strokeLinecap: 'round', strokeMiterlimit: 10, strokeWidth: 10 }}>
      <line x1="21.19" y1="21.19" x2="78.81" y2="78.81"/>
      <line x1="78.81" y1="21.19" x2="21.19" y2="78.81"/>
    </g>
  </svg>
);

export default Icon;
