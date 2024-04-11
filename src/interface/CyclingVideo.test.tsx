import renderer from 'react-test-renderer';
import { fireEvent, render, screen } from '@testing-library/react';

import CyclingVideo from './CyclingVideo';

const FAKE_VIDEOS = ['1', '2', '3'];

describe('CyclingVideo', () => {
  beforeAll(() => {
    // see https://github.com/facebook/react/issues/10389
    Object.defineProperty(HTMLMediaElement.prototype, 'muted', {
      set: vi.fn(),
    });
  });

  it('matches snapshot', () => {
    const tree = renderer.create(<CyclingVideo videos={FAKE_VIDEOS} randomValue={0} />).toJSON();
    expect(tree).toMatchSnapshot();
  });
  it('passes unrecognized props', () => {
    const tree = renderer
      .create(<CyclingVideo videos={FAKE_VIDEOS} randomValue={0} style={{ color: 'red' }} />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
  describe('randomValue prop', () => {
    it('renders first video when 0 is passed', () => {
      render(<CyclingVideo videos={FAKE_VIDEOS} randomValue={0} data-testid="cycling-video" />);
      const sources = screen.getByTestId('cycling-video').getElementsByTagName('source');
      expect(sources).toHaveLength(1);
      expect(sources[0].src).toEqual('http://localhost:3000/1');
    });

    it('renders second video when 0.5 is passed', () => {
      render(<CyclingVideo videos={FAKE_VIDEOS} randomValue={0.5} data-testid="cycling-video" />);
      const sources = screen.getByTestId('cycling-video').getElementsByTagName('source');
      expect(sources).toHaveLength(1);
      expect(sources[0].src).toEqual('http://localhost:3000/2');
    });

    it('renders third video when 0.999 is passed', () => {
      render(<CyclingVideo videos={FAKE_VIDEOS} randomValue={0.999} data-testid="cycling-video" />);
      const sources = screen.getByTestId('cycling-video').getElementsByTagName('source');
      expect(sources).toHaveLength(1);
      expect(sources[0].src).toEqual('http://localhost:3000/3');
    });
  });
  it('starts the next video when the current ends', () => {
    render(<CyclingVideo videos={FAKE_VIDEOS} randomValue={0} data-testid="cycling-video" />);
    const sourcesBefore = screen.getByTestId('cycling-video').getElementsByTagName('source');
    expect(sourcesBefore).toHaveLength(1);
    expect(sourcesBefore[0].src).toEqual('http://localhost:3000/1'); // sanity
    fireEvent.ended(screen.getByTestId('cycling-video'));
    const sourcesAfter = screen.getByTestId('cycling-video').getElementsByTagName('source');
    expect(sourcesAfter).toHaveLength(1);
    expect(sourcesAfter[0].src).toEqual('http://localhost:3000/2');
  });
  it('restarts when at the end of the list', () => {
    render(<CyclingVideo videos={FAKE_VIDEOS} randomValue={0.999} data-testid="cycling-video" />);
    const sourcesBefore = screen.getByTestId('cycling-video').getElementsByTagName('source');
    expect(sourcesBefore).toHaveLength(1);
    expect(sourcesBefore[0].src).toEqual('http://localhost:3000/3'); // sanity
    fireEvent.ended(screen.getByTestId('cycling-video'));
    const sourcesAfter = screen.getByTestId('cycling-video').getElementsByTagName('source');
    expect(sourcesAfter).toHaveLength(1);
    expect(sourcesAfter[0].src).toEqual('http://localhost:3000/1');
  });
});
