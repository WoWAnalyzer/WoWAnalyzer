import React from 'react';
import PropTypes from 'prop-types';

import SpellIcon from 'common/SpellIcon';

import PETS from '../../PET_INFO';

const WILD_IMP_GUIDS = [
  PETS.WILD_IMP_HOG.guid,
  PETS.WILD_IMP_INNER_DEMONS.guid,
];
const PETS_AFFECTED_BY_DEMONIC_TYRANT = [
  ...WILD_IMP_GUIDS,
  PETS.DREADSTALKER.guid,
  PETS.VILEFIEND.guid,
  PETS.GRIMOIRE_FELGUARD.guid,
];

class PetRow extends React.PureComponent {
  static propTypes = {
    className: PropTypes.string,
    hasDemonicConsumption: PropTypes.bool,
    tyrantCasts: PropTypes.array,
    pets: PropTypes.array,
    start: PropTypes.number.isRequired,
    totalWidth: PropTypes.number.isRequired,
    secondWidth: PropTypes.number.isRequired,
  };

  render() {
    const { className, hasDemonicConsumption, tyrantCasts, pets, start, totalWidth, secondWidth } = this.props;
    return (
      <div className={`events ${className || ''}`} style={{ width: totalWidth }}>
        {pets.map((pet, index) => {
          const iconLeft = (pet.spawn - start) / 1000 * secondWidth;
          const barLeft = (pet.spawn - start) / 1000 * secondWidth;
          const maxWidth = totalWidth - barLeft; // don't expand beyond the container width
          const width = Math.min(maxWidth, ((pet.realDespawn || pet.expectedDespawn) - pet.spawn) / 1000 * secondWidth);
          const isEmpowered = PETS_AFFECTED_BY_DEMONIC_TYRANT.includes(pet.guid) && tyrantCasts.some(cast => pet.spawn <= cast && cast <= (pet.realDespawn || pet.expectedDespawn));
          const isWildImp = WILD_IMP_GUIDS.includes(pet.guid);
          let iconClass;
          let iconTooltip;
          if (pet.shouldImplode) {
            iconClass = 'inefficient';
            iconTooltip = 'This Wild Imp was later imploded';
          }
          // Pet is empowered by Demonic Tyrant if:
          //  - it's not a Wild Imp (Dreadstalkers, Vilefiend, Grimoire: Felguard)
          //  - it's a Wild Imp without Demonic Consumption talent (Demonic Consumption kills Wild Imps)
          else if (isEmpowered && (!isWildImp || (isWildImp && !hasDemonicConsumption))) {
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
