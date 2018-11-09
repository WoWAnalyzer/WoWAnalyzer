import React from 'react';
import PropTypes from 'prop-types';

import SpellIcon from 'common/SpellIcon';
import Icon from 'common/Icon';

import PETS from '../../PET_INFO';

const PETS_AFFECTED_BY_DEMONIC_TYRANT = [
  PETS.WILD_IMP_HOG.guid,
  PETS.DREADSTALKER.guid,
  PETS.VILEFIEND.guid,
  PETS.GRIMOIRE_FELGUARD.guid,
  PETS.WILD_IMP_INNER_DEMONS.guid,
];

class PetRow extends React.PureComponent {
  static propTypes = {
    className: PropTypes.string,
    tyrantCasts: PropTypes.array,
    pets: PropTypes.array,
    start: PropTypes.number.isRequired,
    totalWidth: PropTypes.number.isRequired,
    secondWidth: PropTypes.number.isRequired,
  };

  render() {
    const { className, tyrantCasts, pets, start, totalWidth, secondWidth } = this.props;
    return (
      <div className={`events ${className || ''}`} style={{ width: totalWidth }}>
        {pets.map((pet, index) => {
          const iconLeft = (pet.spawn - start) / 1000 * secondWidth;
          const barLeft = (pet.spawn - start) / 1000 * secondWidth;
          const maxWidth = totalWidth - barLeft; // don't expand beyond the container width
          const width = Math.min(maxWidth, ((pet.realDespawn || pet.expectedDespawn) - pet.spawn) / 1000 * secondWidth);
          const isEmpowered = PETS_AFFECTED_BY_DEMONIC_TYRANT.includes(pet.guid) && tyrantCasts.some(cast => pet.spawn <= cast && cast <= (pet.realDespawn || pet.expectedDespawn));
          let iconClass;
          let iconTooltip;
          if (pet.shouldImplode) {
            iconClass = 'inefficient';
            iconTooltip = 'This Wild Imp was later imploded';
          }
          else if (isEmpowered) {
            iconClass = 'empowered';
            iconTooltip = 'This pet was later empowered with Demonic Tyrant';
          }
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
                <SpellIcon
                  id={pet.summonAbility}
                  className={iconClass}
                  data-tip={iconTooltip}
                />
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
