import React from 'react';
import { shallow } from 'enzyme';

import CyclingVideo from './CyclingVideo';

const FAKE_VIDEOS = [
  '1',
  '2',
  '3',
];

describe('CyclingVideo', () => {
  it('matches snapshot', () => {
    const tree = shallow(
      <CyclingVideo videos={FAKE_VIDEOS} randomValue={0} />
    );
    expect(tree).toMatchSnapshot();
  });
  it('passes unrecognized props', () => {
    const tree = shallow(
      <CyclingVideo videos={FAKE_VIDEOS} randomValue={0} style={{ color: 'red' }} />
    );
    expect(tree).toMatchSnapshot();
  });
  it('uses the random value to determine at which video to start', () => {
    {
      const comp = shallow(
        <CyclingVideo videos={FAKE_VIDEOS} randomValue={0} />
      );
      expect(comp.find('source').prop('src')).toBe('1');
    }
    {
      const comp = shallow(
        <CyclingVideo videos={FAKE_VIDEOS} randomValue={0.5} />
      );
      expect(comp.find('source').prop('src')).toBe('2');
    }
    {
      const comp = shallow(
        <CyclingVideo videos={FAKE_VIDEOS} randomValue={0.999} />
      );
      expect(comp.find('source').prop('src')).toBe('3');
    }
  });
  it('starts the next video when the current ends', () => {
    const comp = shallow(
      <CyclingVideo videos={FAKE_VIDEOS} randomValue={0} />
    );
    expect(comp.find('source').prop('src')).toBe('1'); // sanity
    comp.simulate('ended');
    expect(comp.find('source').prop('src')).toBe('2');
  });
  it('restarts when at the end of the list', () => {
    const comp = shallow(
      <CyclingVideo videos={FAKE_VIDEOS} randomValue={0.999} />
    );
    expect(comp.find('source').prop('src')).toBe('3'); // sanity
    comp.simulate('ended');
    expect(comp.find('source').prop('src')).toBe('1');
  });
});
