import React from 'react';
import { render } from 'react-dom';
import { install } from 'common/errorLogger';

import './static/bootstrap/css/bootstrap.css';

import Root from './Root';

install();

render(<Root />, document.getElementById('app-mount'));
