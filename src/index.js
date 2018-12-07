import React from 'react';
import { render } from 'react-dom';

import { install as installErrorLogger } from 'common/errorLogger';
import { install as installAnalytics } from 'common/analytics';
import 'interface/static/bootstrap/css/bootstrap.css';

import Root from './Root';

installErrorLogger();
installAnalytics();

render(<Root />, document.getElementById('app-mount'));
