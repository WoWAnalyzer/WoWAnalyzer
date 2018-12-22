import React from 'react';
import PropTypes from 'prop-types';

import Icon from 'common/Icon';
import SpellLink from 'common/SpellLink';
import { makeSpellApiUrl } from 'common/makeApiUrl';

// Use all available AzeriteTraits
import General from 'common/SPELLS/bfa/azeritetraits/general';
import Hunter from 'common/SPELLS/bfa/azeritetraits/hunter';
import Paladin from 'common/SPELLS/bfa/azeritetraits/paladin';
import Shaman from 'common/SPELLS/bfa/azeritetraits/shaman';
import Warlock from 'common/SPELLS/bfa/azeritetraits/warlock';
import Monk from 'common/SPELLS/bfa/azeritetraits/monk';
import DeathKnight from 'common/SPELLS/bfa/azeritetraits/deathknight';
import Priest from 'common/SPELLS/bfa/azeritetraits/priest';
import Druid from 'common/SPELLS/bfa/azeritetraits/druid';
import Unused from 'common/SPELLS/bfa/azeritetraits/__UNUSED';

const AZERITE_SPELLS = Object.values({...General, ...Hunter, ...Paladin, ...Shaman, ...Warlock, ...Monk, ...DeathKnight, ...Priest, ...Druid, ...Unused});
const FALLBACK_ICON = 'inv_misc_questionmark';

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
      const trait = this.state.azerite.find(e => e.id === Number(traitId));

      if (!trait) {
        missingIcons.push({ id: traitId, icon: FALLBACK_ICON, name: 'Unknown' });
      }
    });

    Object.keys(missingIcons).forEach(e => {
      const traitId = Number(missingIcons[e].id);
      fetch(makeSpellApiUrl(traitId))
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

  render() {
    const azerite = this.props.azerite;

    return (
      <>
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
              spellId = Number(spellId);
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
              );
            })}
          </div>
        </div>
      </>
    );
  }
}

export default Gear;
