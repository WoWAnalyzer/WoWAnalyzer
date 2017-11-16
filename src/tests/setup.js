import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import 'jest-enzyme'; // better matchers

Enzyme.configure({
  adapter: new Adapter(),
});
