import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import Root from './Root';

describe('Root', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<Root />, div);
  });
  it('matches snapshot', () => {
    expect(<Root />).toMatchSnapshot();
    const tree = renderer.create(
      <Root />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

});
