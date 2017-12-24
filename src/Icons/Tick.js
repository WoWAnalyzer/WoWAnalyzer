import React from 'react';

// https://thenounproject.com/search/?q=tick&i=1318207
// Created by Landan Lloyd from the Noun Project
// Rewrote the path since the viewbox was a mess
const Icon = ({ ...other }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" {...other}>
    <path d="M 5.701 23.894 C 4.24 22.837 2.199 23.163 1.141 24.624 C 0.083 26.085 0.411 28.126 1.871 29.184 C 6.96 32.869 11.124 38.618 14.539 46.197 C 15.688 48.746 19.3 48.767 20.478 46.231 C 27.135 31.905 36.787 18.058 48.359 8.153 C 49.728 6.98 49.888 4.919 48.715 3.548 C 47.543 2.178 45.481 2.018 44.111 3.191 C 33.372 12.385 24.283 24.61 17.478 37.569 C 14.203 31.848 10.328 27.245 5.701 23.894 Z" />
  </svg>
);

export default Icon;
