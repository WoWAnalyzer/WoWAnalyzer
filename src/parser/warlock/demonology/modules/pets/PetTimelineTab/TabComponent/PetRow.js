import React from 'react';
import PropTypes from 'prop-types';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import Icon from 'common/Icon';

class PetRow extends React.PureComponent {
  static propTypes = {
    className: PropTypes.string,
    pets: PropTypes.array,
    start: PropTypes.number.isRequired,
    totalWidth: PropTypes.number.isRequired,
    secondWidth: PropTypes.number.isRequired,
  };

  render() {
    const { className, pets, start, totalWidth, secondWidth } = this.props;
    return (
      <div className={`events ${className || ''}`} style={{ width: totalWidth }}>
        {pets.map((pet, index) => {
          const iconLeft = (pet.spawn - start) / 1000 * secondWidth;
          const barLeft = (pet.spawn - start) / 1000 * secondWidth;
          const maxWidth = totalWidth - barLeft; // don't expand beyond the container width
          const width = Math.min(maxWidth, ((pet.realDespawn || pet.expectedDespawn) - pet.spawn) / 1000 * secondWidth);
          const isSummonAbilityKnown = !!SPELLS[pet.summonAbility];
          return (
            <>
              <div
                key={`${index}-icon`}
                style={{
                  left: iconLeft,
                  top: -1,
                  zIndex: 10,
                }}
              >
                {isSummonAbilityKnown && (
                  <SpellIcon
                    id={pet.summonAbility}
                    className={pet.meta.iconClass}
                    data-tip={pet.meta.tooltip}
                  />
                )}
                {!isSummonAbilityKnown && (
                  <Icon
                    icon="inv_misc_questionmark"
                    data-tip={pet.name}
                  />
                )}
              </div>
              <div
                key={`${index}-duration`}
                style={{
                  left: barLeft,
                  width,
                  background: 'rgba(150, 150, 150, 0.4)',
                }}
                data-effect="float"
              />
            </>
          );
        })}
      </div>
    );
  }
}

export default PetRow;
