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
