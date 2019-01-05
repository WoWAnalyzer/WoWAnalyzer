import React from 'react';
import PropTypes from 'prop-types';

import Icon from 'common/Icon';
import SpellLink from 'common/SpellLink';
import AZERITE_SPELLS from 'common/SPELLS/bfa/azeritetraits';

const FALLBACK_ICON = 'inv_misc_questionmark';
const ITEM_SLOT = {
  0: "Helm",
  2: "Shoulders",
  4: "Chest",
};

class Azerite extends React.PureComponent {
  static propTypes = {
    azerite: PropTypes.object.isRequired,
  };

  state = {
    azerite: Object.values(AZERITE_SPELLS),
  };

  componentDidMount() {
    this.loadMissingIcons();
  }

  componentDidUpdate() {
    this.loadMissingIcons();
  }

  render() {
    const azerite = this.props.azerite;

    return (
      <>
        <h3>
          Azerite Powers
        </h3>
        <div className="azerite-traits">
          {Object.keys(azerite).map(slotId => (
            <div className="azerite-traits-column" key={slotId}>
              <div className="azerite-slot-title">{ITEM_SLOT[slotId]}</div>
              {
              azerite[slotId].map(spellId => {
                const spell = this.state.azerite.find(e => e.id === spellId);
                return (
                  <div key={spellId} style={{ display: 'inline-block', textAlign: 'center' }}>
                    <SpellLink
                      id={spellId}
                      details={spellId}
                      style={{ margin: '5px', display: 'block', fontSize: '46px', lineHeight: 1 }}
                      icon={false}
                    >
                      <Icon icon={spell ? spell.icon : FALLBACK_ICON} style={{ border: '3px solid currentColor' }} />
                    </SpellLink>
                  </div>  
                );
              })
            }
            </div>
          ))}
        </div>
      </>
    );
  }

  loadMissingIcons() {
    // load missing azerite-icons and add them to the components state after it got fetched
    const missingIcons = [];
    const traits = Object.values(this.props.azerite).reduce((acc, val) => acc.concat(val), []);
    traits.forEach(traitId => {
      const trait = this.state.azerite.find(e => e.id === parseInt(traitId, 10));
  
      if (!trait && !missingIcons.find(i => i.id === traitId)) {
        missingIcons.push({ id: traitId, icon: FALLBACK_ICON, name: 'Unknown' });
      }
    });
  
    Object.keys(missingIcons).forEach(e => {
      const traitId = parseInt(missingIcons[e].id, 10);
      fetch(`https://eu.api.battle.net/wow/spell/${traitId}?locale=en_GB&apikey=n6q3eyvqh2v4gz8t893mjjgxsf9kjdgz`)
        .then(response => response.json())
        .then(data => {
          const newTrait = {
            id: traitId,
            name: data.name,
            icon: data.icon,
          };
  
          const newAzerite = [...this.state.azerite, newTrait];
          this.setState({
            azerite: newAzerite,
          });
        })
        .catch(err => {}); // ignore errors
    });
  }
}

export default Azerite;
