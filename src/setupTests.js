/* eslint-disable react/display-name */
import 'jest-canvas-mock';
import '@testing-library/jest-dom';

// Fixes tests in Jest 27: https://github.com/prisma/prisma/issues/8558#issuecomment-1006100001
global.setImmediate = (fun) => setTimeout(fun, 0);

if (process.env.CI) {
  // Hide all console output
  console.log = jest.fn();
  console.warn = jest.fn();
  console.error = jest.fn();
}

// Link doesn't like being outside of a Router, and we don't really need to test its implementation anyway
jest.mock('react-router-dom', () => ({
  Link: (props) => <link {...props} />,
  Route: (props) => <route {...props} />,
  Switch: (props) => <switch {...props} />,
  withRouter: (Component) => (props) =>
    (
      <routerified>
        <Component {...props} />
      </routerified>
    ),
}));

jest.mock('@lingui/core', () => ({
  i18n: {
    _: (props) => JSON.stringify(props),
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    loadLocaleData: () => {},
  },
}));
jest.mock('@lingui/react', () => ({
  Trans: (props) => <trans {...props} />,
  I18nProvider: (props) => <i18n-provider {...props} />,
}));
