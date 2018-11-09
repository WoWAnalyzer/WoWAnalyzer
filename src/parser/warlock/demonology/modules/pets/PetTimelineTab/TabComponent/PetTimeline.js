import React from 'react';
import PropTypes from 'prop-types';
import GeminiScrollbar from 'react-gemini-scrollbar';
import ReactTooltip from 'react-tooltip';
import 'gemini-scrollbar/gemini-scrollbar.css';

import { formatDuration } from 'common/format';
import SpellLink from 'common/SpellLink';

import PetRow from './PetRow';
import KeyCastsRow from './KeyCastsRow';
import DeathEvents from './DeathEvents';

import './PetTimeline.css';

class PetTimeline extends React.PureComponent {
  static propTypes = {
    start: PropTypes.number.isRequired,
    end: PropTypes.number.isRequired,
    deaths: PropTypes.array.isRequired,
    resurrections: PropTypes.array.isRequired,
    petTimeline: PropTypes.object,
  };

  constructor() {
    super();
    this.handleMouseWheel = this.handleMouseWheel.bind(this);
    this.state = {
      zoom: 2,
    };
  }

  handleMouseWheel(e) {
    // This translate vertical scrolling into horizontal scrolling
    if (!this.gemini || !this.gemini.scrollbar) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();
    if (e.detail > 0) {
      // noinspection JSSuspiciousNameCombination
      this.gemini.scrollbar._viewElement.scrollLeft -= e.deltaY;
    } else {
      // noinspection JSSuspiciousNameCombination
      this.gemini.scrollbar._viewElement.scrollLeft += e.deltaY;
    }
  }

  componentDidMount() {
    this.componentDidUpdate();
  }

  componentDidUpdate() {
    ReactTooltip.rebuild();
  }

  get pets() {
    const { petTimeline } = this.props;
    return petTimeline.groupPetsBySummonAbility();
  }

  gemini = null;
  render() {
    const { start, end, deaths, resurrections } = this.props;
    const pets = this.pets;
    const duration = end - start;
    const seconds = Math.ceil(duration / 1000);

    const secondWidth = 80 / this.state.zoom;
    const skipInterval = Math.ceil(40 / secondWidth);

    // 9 for the scrollbar height
    // 4 for margin
    // 36 for the ruler
    // 28 for each timeline row
    const rows = Object.keys(pets).length;
    const totalHeight = 9 + 4 + 36 + 28 * rows;

    const totalWidth = seconds * secondWidth;

    return (
      <div className="spell-timeline flex">
        <div className="flex-sub legend">
          <div className="lane ruler-lane">
            <div className="btn-group">
              {[1, 2, 3, 5, 10].map(zoom => (
                <button key={zoom} className={`btn btn-default btn-xs ${zoom === this.state.zoom ? 'active' : ''}`} onClick={() => this.setState({ zoom })}>{zoom}x</button>
              ))}
            </div>
          </div>
          {Object.keys(pets).map(spellId => (
            <div className="lane" key={spellId}>
              {spellId !== 'unknown' && <SpellLink id={spellId} />}
              {spellId === 'unknown' && <dfn data-tip="Most likely a permanent pet">Unknown</dfn>}
            </div>
          ))}
        </div>
        <GeminiScrollbar
          className="timeline flex-main"
          style={{ height: totalHeight }}
          onWheel={this.handleMouseWheel}
          ref={comp => {
            this.gemini = comp;
          }}
        >
          <div className={`ruler interval-${skipInterval}`} style={{ width: totalWidth }}>
            {seconds > 0 && [...Array(seconds)].map((_, second) => {
              if (second % skipInterval !== 0) {
                // Skip every second second when the text width becomes larger than the container
                return null;
              }
              return (
                <div key={second} className="lane" style={{ width: secondWidth * skipInterval }}>
                  {formatDuration(second)}
                </div>
              );
            })}
          </div>
          {Object.keys(pets).map(spellId => (
            <PetRow
              key={spellId}
              className="lane"
              pets={pets[spellId].pets}
              start={start}
              totalWidth={totalWidth}
              secondWidth={secondWidth}
            />
          ))}
          <DeathEvents
            start={start}
            secondWidth={secondWidth}
            deaths={deaths}
            resurrections={resurrections}
            invalidated={deaths.length + resurrections.length}
          />
        </GeminiScrollbar>
      </div>
    );
  }
}

export default PetTimeline;
