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

// chartjs doesn't like being tested, so mock it and save us a world of trouble
jest.mock('react-chartjs-2');
// Link doesn't like being outside of a Router, and we don't really need to test its implementation anyway
jest.mock('react-router-dom');
// react-vis needs browser interface or it crashes
jest.mock('react-vis/dist/make-vis-flexible.js');
