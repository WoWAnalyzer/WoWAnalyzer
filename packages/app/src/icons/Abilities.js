import React from 'react';

// https://thenounproject.com/search/?q=abilities&i=1553895
// abilities by sachin modgekar from the Noun Project
const Icon = ({ ...other }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="30 25 150 150" className="icon" {...other}>
    {/* note the icon was modified, see the link above for the original */}
    <circle cx="104.492" cy="82.7" r="18.794" />
    <circle cx="103.881" cy="37.187" r="13.903" />
    <circle cx="142.945" cy="54.277" r="13.903" />
    <circle cx="157.594" cy="94.562" r="13.902" />
    <circle cx="50.168" cy="94.562" r="13.902" />
    <circle cx="64.817" cy="54.277" r="13.903" />
    <path d="M104.492,104c-16.435,0-29.757,13.323-29.757,29.759v25.977h59.514v-25.977C134.248,117.323,120.927,104,104.492,104z" />
  </svg>
);

export default Icon;
