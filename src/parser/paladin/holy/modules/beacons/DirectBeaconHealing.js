import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import UpArrowIcon from 'interface/icons/UpArrow';
import PlusIcon from 'interface/icons/Plus';
import Analyzer from 'parser/core/Analyzer';

import Abilities from '../Abilities';
import PaladinAbilityTracker from '../core/PaladinAbilityTracker';
import { BEACON_TRANSFERING_ABILITIES } from '../../constants';

class DirectBeaconHealing extends Analyzer {
  static dependencies = {
    abilityTracker: PaladinAbilityTracker,
    abilities: Abilities,
  };

  get beaconTransferingAbilities() {
    return this.abilities.activeAbilities
      .filter(ability => BEACON_TRANSFERING_ABILITIES[ability.spell.id] !== undefined);
  }
  get totalFoLHLOnBeaconPercentage() {
    const abilityTracker = this.abilityTracker;
    const getCastCount = spellId => abilityTracker.getAbility(spellId);

    let casts = 0;
    let castsOnBeacon = 0;

    this.beaconTransferingAbilities
      .filter(ability => [SPELLS.FLASH_OF_LIGHT.id, SPELLS.HOLY_LIGHT.id].includes(ability.spell.id))
      .forEach(ability => {
        const castCount = getCastCount(ability.spell.id);
        casts += castCount.healingHits || 0;
        castsOnBeacon += castCount.healingBeaconHits || 0;
      });

    return castsOnBeacon / casts;
  }
  get totalOtherSpellsOnBeaconPercentage() {
    const abilityTracker = this.abilityTracker;
    const getCastCount = spellId => abilityTracker.getAbility(spellId);

    let casts = 0;
    let castsOnBeacon = 0;

    this.beaconTransferingAbilities
      .filter(ability => ![SPELLS.FLASH_OF_LIGHT.id, SPELLS.HOLY_LIGHT.id].includes(ability.spell.id))
      .forEach(ability => {
        const castCount = getCastCount(ability.spell.id);
        casts += castCount.healingHits || 0;
        castsOnBeacon += castCount.healingBeaconHits || 0;
      });

    return castsOnBeacon / casts;
  }
  get totalHealsOnBeaconPercentage() {
    const abilityTracker = this.abilityTracker;
    const getCastCount = spellId => abilityTracker.getAbility(spellId);

    let casts = 0;
    let castsOnBeacon = 0;

    this.beaconTransferingAbilities.forEach(ability => {
      const castCount = getCastCount(ability.spell.id);
      casts += castCount.healingHits || 0;
      castsOnBeacon += castCount.healingBeaconHits || 0;
    });

    return castsOnBeacon / casts;
  }

  get suggestionThresholds() {
    return {
      actual: this.totalHealsOnBeaconPercentage,
      isGreaterThan: {
        minor: 0.2,
        average: 0.25,
        major: 0.35,
      },
      style: 'percentage',
    };
  }
  suggestions(when) {
    when(this.suggestionThresholds.actual).isGreaterThan(this.suggestionThresholds.isGreaterThan.minor)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest('You cast a lot of direct heals on beacon targets. Direct healing beacon targets is inefficient. Try to only cast on beacon targets when they would otherwise die.')
          .icon('ability_paladin_beaconoflight')
          .actual(`${formatPercentage(actual)}% of all your healing spell casts were on a beacon target`)
          .recommended(`<${formatPercentage(recommended)}% is recommended`)
          .regular(this.suggestionThresholds.isGreaterThan.average).major(this.suggestionThresholds.isGreaterThan.major);
      });
  }
  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(50)}
        size="small"
        // tooltip={`The amount of heals cast on beacon targets. ${formatPercentage(totalFolsAndHlsOnBeacon / totalFolsAndHls)} % of your Flash of Lights and Holy Lights were cast on a beacon target. You cast ${beaconFlashOfLights} Flash of Lights and ${beaconHolyLights} Holy Lights on beacon targets.`}
      >
        <div className="pad">
          <div className="pull-right">
            <PlusIcon />{' '}
            <UpArrowIcon style={{ transform: 'rotate(90deg)' }} />{' '}
            <SpellIcon id={SPELLS.BEACON_OF_LIGHT_CAST_AND_BUFF.id} />
          </div>
          <label>Direct beacon healing</label>

          <div className="value pull-left">{formatPercentage(this.totalHealsOnBeaconPercentage, 0)}%</div>

          <div className="flex pull-right text-center" style={{ whiteSpace: 'nowrap' }}>
            <div className="flex-main" style={{ marginRight: 15 }}>
              <small>HL/FoL</small>
              <div className="value" style={{ fontSize: '1em' }}>{formatPercentage(this.totalFoLHLOnBeaconPercentage, 0)}%</div>
            </div>
            <div className="flex-main">
              <small>Other spells</small>
              <div className="value" style={{ fontSize: '1em' }}>{formatPercentage(this.totalOtherSpellsOnBeaconPercentage, 0)}%</div>
            </div>
          </div>
        </div>
      </Statistic>
    );
  }
}

export default DirectBeaconHealing;
