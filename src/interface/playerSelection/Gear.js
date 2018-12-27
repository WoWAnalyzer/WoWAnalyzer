import React from 'react';
import PropTypes from 'prop-types';

import Icon from 'common/Icon';
import ItemLink from 'common/ItemLink';
import ITEM_QUALITIES from 'game/ITEM_QUALITIES';
import ItemIcon from 'common/ItemIcon';
import SpellIcon from 'common/SpellIcon';

const EXCLUDED_ITEM_SLOTS = [3, 17]; // Some Tabards have a higher ilvl than 1 so exclude them from the avg ilvl (not sure about shirts, but including them)

class Gear extends React.PureComponent {
  static propTypes = {
    gear: PropTypes.array.isRequired,
    player: PropTypes.object.isRequired,
  };

  render() {
    const { gear, player } = this.props;

    const artifact = gear.find(item => item.quality === 6);
    const relics = artifact && artifact.gems ? artifact.gems : [];
    // eslint-disable-next-line no-restricted-syntax
    const filteredGear = gear.filter(g => g.itemLevel !== 0 && !EXCLUDED_ITEM_SLOTS.find(x => x === gear.indexOf(g)));
    const averageIlvl = filteredGear.reduce( ( total, item ) => total + item.itemLevel, 0 ) / filteredGear.length;

    return (
      <>
        <div className="player-gear">
          <div className="player-gear-header"><span className={player.spec.className.replace(' ', '')}><b>{player.name}</b></span><br /><b>Item Level:</b> {averageIlvl.toFixed(1)}</div>
          {[...gear, ...relics]
            .filter(item => item.id !== 0)
            .map(item => {
              // Items seem to turn epic from 340 item level, but WCL doesn't show this properly
              let quality = item.itemLevel >= 340 ? ITEM_QUALITIES.EPIC : item.quality;
              if (!quality) {
                quality = ITEM_QUALITIES.EPIC; // relics don't have a quality, but they're always epic
              }

              const gearSlot = gear.indexOf(item);

              return (
                <>
                  <>
                    {
                      item.gems && item.gems.map(gem => {
                        return (
                          <div key={gem.id} style={{gridArea: `item-slot-${gearSlot}-gem`}}>
                            <ItemIcon
                              id={gem.id}
                              className="gem"
                            />
                          </div>
                        );
                      }) 
                    }
                  </>
                  <>
                    {
                      item.permanentEnchant &&
                      <div style={{gridArea: `item-slot-${gearSlot}-enchant`}}>
                        <SpellIcon
                          id={item.permanentEnchant}
                          className="gem"
                        />
                      </div>
                    }
                  </>
                  <div style={{ display: 'inline-block', textAlign: 'center', gridArea: `item-slot-${gearSlot}` }} className={`item-slot-${gearSlot}`}>
                    <ItemLink
                      id={item.id}
                      quality={quality}
                      details={item}
                      style={{ display: 'block', fontSize: '46px', lineHeight: 1 }}
                      icon={false}
                    >
                      <Icon icon={item.icon} style={{ border: '2px solid currentColor' }} />
                      <div className="gear-ilvl">{item.itemLevel}</div>
                    </ItemLink>
                  </div>
                </>
              );
            })}
        </div>
      </>
    );
  }
}

export default Gear;
