import React from 'react';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import 'jest-enzyme'; // better matchers

Enzyme.configure({
  adapter: new Adapter(),
});

if (process.env.CI) {
  // Hide all console output
  console.log = jest.fn();
  console.warn = jest.fn();
  console.error = jest.fn();
}

// Link doesn't like being outside of a Router, and we don't really need to test its implementation anyway
jest.mock('react-router-dom', () => ({
  Link: props => <link {...props} />,
  Route: props => <route {...props} />,
  Switch: props => <switch {...props} />,
  withRouter: Component => props => <routerified><Component {...props} /></routerified>,
}));
// react-vis needs browser interface or it crashes
jest.mock('react-vis/dist/make-vis-flexible.js');
