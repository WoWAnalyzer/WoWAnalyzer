import React from 'react';
import PropTypes from 'prop-types';

import Icon from 'common/Icon';
import SpellLink from 'common/SpellLink';
import ESSENCES from 'common/SPELLS/bfa/essences';
import { makeSpellApiUrl } from 'common/makeApiUrl';

const FALLBACK_ICON = 'inv_misc_questionmark';

class Essence extends React.PureComponent {
  static propTypes = {
    essences: PropTypes.object.isRequired,
  };

  essences = this.props.essences || {};

  state = {
    essences: Object.values(ESSENCES),
  };

  componentDidMount() {
    this.loadMissingIcons();
  }

  componentDidUpdate() {
    this.loadMissingIcons();
  }

  render() {
    return (
      <>
        <h3>
          Heart of Azeroth Essences
        </h3>
        <div className="essences">
          <div className="essence-row">
            {Object.values(this.essences).map((essence, index) => {
              const quality = this.convertRankIntoQuality(essence.rank);
              const height = index === 0 ? '60px' : '45px';
              return (
                <div key={essence.spellID} style={{ display: 'inline-block', textAlign: 'center' }}>
                  <SpellLink
                    id={essence.spellID}
                    details={essence.spellID}
                    style={{ margin: '5px', display: 'block', fontSize: '46px', lineHeight: 1 }}
                    icon={false}
                  >
                    <Icon icon={essence ? essence.icon : FALLBACK_ICON} style={{ border: '3px solid', height: height }} className={quality} />
                  </SpellLink>
                </div>
              );
            })}
          </div>
        </div>
      </>
    );
  }

  loadMissingIcons() {
    // load missing essence-icons and add them to the components state after it got fetched
    const missingIcons = [];
    const essences = Object.values(this.essences);
    essences.forEach(essence => {
      const foundEssence = this.state.essences.find(e => e.id === parseInt(essence.spellID, 10));

      if (!foundEssence && !missingIcons.find(i => i.id === essence.spellID)) {
        missingIcons.push({ id: essence.spellID, icon: FALLBACK_ICON, name: 'Unknown' });
      }
    });

    Object.keys(missingIcons).forEach(e => {
      const traitId = parseInt(missingIcons[e].id, 10);
      fetch(makeSpellApiUrl(traitId))
        .then(response => response.json())
        .then(data => {
          const newTrait = {
            id: traitId,
            name: data.name,
            icon: data.icon,
          };

          const newEssence = [...this.state.essence, newTrait];
          this.setState({
            essence: newEssence,
          });
        })
        .catch(err => {
        }); // ignore errors
    });
  }

  convertRankIntoQuality(rank) {
    switch (rank) {
      default:
      case 1:
        return 'uncommon';
      case 2:
        return 'rare';
      case 3:
        return 'epic';
      case 4:
        return 'legendary';
    }
  }
}

export default Essence;
