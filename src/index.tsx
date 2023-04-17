import { render } from 'react-dom';

// @ts-expect-error types/core-js doesn't include the type for this i guess
import at from 'core-js/actual/array/at';

import 'interface/static/bootstrap/css/bootstrap.css';

import Root from './Root';

// we are intentionally polyfilling `at` here when missing because we use
// it frequently and its addition to browsers is quite recent
if (Array.prototype.at === undefined) {
  // eslint-disable-next-line no-extend-native
  Array.prototype.at = at;
}

render(<Root />, document.getElementById('app-mount'));
