import React from 'react';
import PropTypes from 'prop-types';

import Icon from 'common/Icon';
import SpellLink from 'common/SpellLink';

// Use all available AzeriteTraits
import General from 'common/SPELLS/BFA/AzeriteTraits/General';
import Hunter from 'common/SPELLS/BFA/AzeriteTraits/Hunter';
import Paladin from 'common/SPELLS/BFA/AzeriteTraits/Paladin';
import Shaman from 'common/SPELLS/BFA/AzeriteTraits/Shaman';
import Warlock from 'common/SPELLS/BFA/AzeriteTraits/Warlock';
import Monk from 'common/SPELLS/BFA/AzeriteTraits/Monk';
import DeathKnight from 'common/SPELLS/BFA/AzeriteTraits/DeathKnight';
import Priest from 'common/SPELLS/BFA/AzeriteTraits/Priest';
import Druid from 'common/SPELLS/BFA/AzeriteTraits/Druid';
import Unused from 'common/SPELLS/BFA/AzeriteTraits/__UNUSED';

const AZERITE_SPELLS = Object.values({...General, ...Hunter, ...Paladin, ...Shaman, ...Warlock, ...Monk, ...DeathKnight, ...Priest, ...Druid, ...Unused});
const FALLBACK_ICON = 'quest_khadgar';

class Gear extends React.PureComponent {
  static propTypes = {
    azerite: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      azerite: AZERITE_SPELLS,
    };

    this.loadMissingIcons = this.loadMissingIcons.bind(this);
  }

  componentDidMount() {
    this.loadMissingIcons(this.props.azerite);
  }

  loadMissingIcons() {
    // load missing azerite-icons and add them to the components state after it got fetched
    const missingIcons = [];
    Object.keys(this.props.azerite).forEach(traitId => {
      const trait = this.state.azerite.find(e => e.id === parseInt(traitId, 10));

      if (!trait) {
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
        });
    });
  }

  render() {
    const azerite = this.props.azerite;

    return (
      <React.Fragment>
        <div className="row">
          <div className="col-md-12">
            <h2>
              Azerite Powers
            </h2>
          </div>
        </div>
        <div className="row">
          <div className="col-md-12 hpadding-lg-30">{/* some bonus padding so it looks to be aligned with the icon for stats */}
            {Object.keys(azerite).map(spellId => {
              spellId = parseInt(spellId, 10);
              const spell = this.state.azerite.find(e => e.id === spellId);
              return (
                <div key={spellId} style={{ display: 'inline-block', textAlign: 'center' }}>
                  {azerite[spellId].length}x
                  <SpellLink
                    id={spellId}
                    details={spellId}
                    style={{ margin: '5px', display: 'block', fontSize: '46px', lineHeight: 1 }}
                    icon={false}
                  >
                    <Icon icon={spell ? spell.icon : FALLBACK_ICON} style={{ border: '3px solid currentColor' }} />
                  </SpellLink>
                </div>  
              )}
            )}
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default Gear;
