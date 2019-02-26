import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="container">
    <h1>404: Content not found</h1>

    <Link to="/">Go back home</Link>
  </div>
);

export default NotFound;
