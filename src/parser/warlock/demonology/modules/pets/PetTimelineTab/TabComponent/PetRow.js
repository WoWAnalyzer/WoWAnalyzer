import React from 'react';
import PropTypes from 'prop-types';

import SPELLS from 'common/SPELLS';
import Icon from 'common/Icon';
import Tooltip from 'common/Tooltip';
import SpellLink from 'common/SpellLink';

import { isRandomPet, isWildImp } from '../../helpers';
import PETS from '../../PETS';
import './PetRow.scss';

export default class PetRow extends React.PureComponent {
  static propTypes = {
    pets: PropTypes.array.isRequired,
    top: PropTypes.number.isRequired,
  };

  renderIcon(pet, index) {
    if (!pet.isSummonAbilityKnown) {
      return (
        <div
          key={`icon-${pet.guid}-${index}`}
          style={{
            left: pet.left,
            zIndex: 10,
          }}
        >
          <Tooltip content={pet.name}>
            <Icon
              icon="inv_misc_questionmark"
              alt="Summon ability not recognized"
            />
          </Tooltip>
        </div>
      );
    }

    const icon = (
      <SpellLink
        key={`icon-${pet.guid}-${index}`}
        id={pet.summonAbility}
        className={`cast ${pet.meta.iconClass || ''}`}
        icon={false}
        style={{
          left: pet.left,
          zIndex: 10,
        }}
      >
        <Icon
          icon={SPELLS[pet.summonAbility].icon}
          alt={SPELLS[pet.summonAbility].name}
        />
      </SpellLink>
    );

    const hasTooltip = pet.meta.tooltip !== '';

    if (hasTooltip) {
      return (
        <Tooltip content={pet.meta.tooltip}>
          {icon}
        </Tooltip>
      );
    }
    return icon;
  }

  renderDuration(pet, index) {
    const defaultColor = 'rgba(248, 183, 0, 0.9)';
    const dreadstalkerColor = 'rgba(248, 183, 0, 0.75)'; // slightly lower opacity, can overlap once during Tyrant
    const canOverlap = isRandomPet(pet.guid) || isWildImp(pet.guid); // random pets and Wild Imps can overlap a lot
    const overlapColor = 'rgba(248, 183, 0, 0.3)';

    let result = '';
    if (pet.guid === PETS.DREADSTALKER.guid) {
      result = dreadstalkerColor;
    } else if (canOverlap) {
      result = overlapColor;
    } else {
      result = defaultColor;
    }

    return (
      <div
        key={`duration-${pet.guid}-${index}`}
        className="gcd"
        style={{
          left: pet.left,
          width: pet.petDuration,
          background: result,
        }}
      />
    );
  }

  render() {
    const { pets, top } = this.props;
    return (
      <div className="pet-row" style={{ borderBottom: 'none', marginBottom: 0, top: `${top}px` }}>
        {pets.map((pet, index) => (
          <React.Fragment key={`pet-${pet.summonAbility}-${index}`}>
            {this.renderIcon(pet, index)}
            {this.renderDuration(pet, index)}
          </React.Fragment>
        ))}
      </div>
    );
  }
}
