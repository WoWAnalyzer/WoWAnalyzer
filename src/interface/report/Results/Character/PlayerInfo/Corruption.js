import React from 'react';
import PropTypes from 'prop-types';
import SpellLink from 'common/SpellLink';
import CORRUPTIONS from 'common/SPELLS/bfa/corruption';
import { makeSpellApiUrl } from 'common/makeApiUrl';
import SpellIcon from 'common/SpellIcon';

const FALLBACK_ICON = 'inv_misc_questionmark';

class Corruption extends React.PureComponent {
  static propTypes = {
    corruptions: PropTypes.object.isRequired,
  };

  corruptions = this.props.corruptions || {};

  state = {
    corruptions: Object.values(CORRUPTIONS),
  };

  componentDidMount() {
    this.loadMissingIcons();
  }

  componentDidUpdate() {
    this.loadMissingIcons();
  }

  render() {
    let totalCorruption = 0;
    for (const corr in this.corruptions) {
      if (this.corruptions.hasOwnProperty(corr)) {
        totalCorruption += this.corruptions[corr].corruption * this.corruptions[corr].count;
      }
    }
    return (
      <>
        <h3>
          Corruptions - ({totalCorruption} Total)
        </h3>
        <div className="corruption">
          <div className="corruption-row">
            {Object.entries(this.corruptions).map(corruption => {
              return (
                <div key={corruption} style={{ display: 'inline-block', textAlign: 'center' }}>
                  <SpellLink
                    id={corruption[0]}
                    details={corruption[0]}
                    style={{ margin: '5px', display: 'block', fontSize: '46px', lineHeight: 1 }}
                    icon={false}
                  >
                    <SpellIcon id={corruption[0]} noLink style={{ border: '3px solid', height: '60px' }} />
                  </SpellLink>
                  <div>{corruption[1].count}x {corruption[1].rank === '' ? '' : <>T{corruption[1].rank}</>}</div>
                </div>
              );
            })}
          </div>
        </div>
      </>
    );
  }

  loadMissingIcons() {
    // load missing corruption-icons and add them to the components state after it got fetched
    const missingIcons = [];
    const corruptions = Object.values(this.corruptions);
    corruptions.forEach(corruption => {
      const foundCorruption = this.state.corruptions.find(e => e.id === parseInt(corruption.spellID, 10));

      if (!foundCorruption && !missingIcons.find(i => i.id === corruption.spellID)) {
        missingIcons.push({ id: corruption.spellID, icon: FALLBACK_ICON, name: 'Unknown' });
      }
    });

    Object.keys(missingIcons).forEach(e => {
      const spellId = parseInt(missingIcons[e].id, 10);
      fetch(makeSpellApiUrl(spellId))
        .then(response => response.json())
        .then(data => {
          const newTrait = {
            id: spellId,
            name: data.name,
            icon: data.icon,
          };

          const newCorruption = [...this.state.corruption, newTrait];
          this.setState({
            corruption: newCorruption,
          });
        })
        .catch(err => {
        }); // ignore errors
    });
  }

}

export default Corruption;
