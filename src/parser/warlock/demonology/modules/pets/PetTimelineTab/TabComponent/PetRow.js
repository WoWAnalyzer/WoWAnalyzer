import React from 'react';
import PropTypes from 'prop-types';

import SPELLS from 'common/SPELLS';
import { SpellIcon } from 'interface';
import { Icon } from 'interface';
import { Tooltip } from 'interface';

const PetRow = props => {
  const { className, pets, start, totalWidth, secondWidth } = props;
  return (
    <div className={`events ${className || ''}`} style={{ width: totalWidth }}>
      {pets.map((pet, index) => {
        const iconLeft = (pet.spawn - start) / 1000 * secondWidth;
        const barLeft = (pet.spawn - start) / 1000 * secondWidth;
        const maxWidth = totalWidth - barLeft; // don't expand beyond the container width
        const width = Math.min(maxWidth, ((pet.realDespawn || pet.expectedDespawn) - pet.spawn) / 1000 * secondWidth);
        const isSummonAbilityKnown = Boolean(SPELLS[pet.summonAbility]);
        const hasTooltip = pet.meta.tooltip !== '';
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
                hasTooltip ? (
                  <Tooltip content={pet.meta.tooltip}>
                    <div>
                      <SpellIcon
                        id={pet.summonAbility}
                        className={pet.meta.iconClass}
                      />
                    </div>
                  </Tooltip>
                ) : (
                  <SpellIcon
                    id={pet.summonAbility}
                    className={pet.meta.iconClass}
                  />
                ))}
              {!isSummonAbilityKnown && (
                <Tooltip content={pet.name}>
                  <div>
                    <Icon icon="inv_misc_questionmark" />
                  </div>
                </Tooltip>
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
};

PetRow.propTypes = {
  className: PropTypes.string,
  pets: PropTypes.array,
  start: PropTypes.number.isRequired,
  totalWidth: PropTypes.number.isRequired,
  secondWidth: PropTypes.number.isRequired,
};

export default PetRow;
