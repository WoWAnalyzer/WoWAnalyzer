import React from 'react';
import PropTypes from 'prop-types';

import SpellIcon from 'common/SpellIcon';

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
                  className={pet.meta.iconClass}
                  data-tip={pet.meta.tooltip}
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
