import React from 'react';

import RESOURCE_TYPES from 'game/RESOURCE_TYPES';

import SPELLS from 'common/SPELLS';
import { formatNumber } from 'common/format';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';

import { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import SpellLink from 'common/SpellLink';
import Events from 'parser/core/Events';
import TalentStatisticBox from 'interface/others/TalentStatisticBox';
import { TooltipElement } from 'common/Tooltip';

class CallTheThunder extends Analyzer {
  overcapPrevented = 0;
  maelstromAtPreviousEnergize = 0;

  earthShockCasts = 0;
  earthQuakeCasts = 0;

  earthShockDamage = 0;
  earthQuakeDamage = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.CALL_THE_THUNDER_TALENT.id);

    this.addEventListener(Events.energize.by(SELECTED_PLAYER), this.onEnergize);

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.EARTH_SHOCK), this.onEarthShockOrEarthquakeCast);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.EARTHQUAKE), this.onEarthShockOrEarthquakeCast);
    
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.EARTH_SHOCK), this.onEarthShockOrEarthquakeDamage);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.EARTHQUAKE_DAMAGE), this.onEarthShockOrEarthquakeDamage);
  }

  get bonusEarthShockCasts() {
    return Math.floor(this.earthShockCasts - (this.earthShockCasts * 50 / 60));
  }

  get bonusEarthquakeCasts() {
    return Math.floor(this.earthQuakeCasts - (this.earthQuakeCasts * 50 / 60));
  }

  get bonusEarthShockDps() {
    return ((this.earthShockDamage / this.earthShockCasts) * this.bonusEarthShockCasts) / (this.owner.fightDuration / 1000);
  }

  get bonusEarthquakeDps() {
    return ((this.earthQuakeDamage / this.earthQuakeCasts) * this.bonusEarthquakeCasts) / (this.owner.fightDuration / 1000);
  }

  onEnergize(event) {
    if (event.resourceChangeType === RESOURCE_TYPES.MAELSTROM.id) {
      event.classResources.forEach((resource) => {
        if (resource.type === RESOURCE_TYPES.MAELSTROM.id) {
          if (resource.amount > 100 && this.maelstromAtPreviousEnergize <= 100) {
            this.overcapPrevented += resource.amount - this.maelstromAtPreviousEnergize;
          }
          this.maelstromAtPreviousEnergize = resource.amount;
        }
      });
    }
  }

  onEarthShockOrEarthquakeDamage(event) {
    if (event.ability.guid === SPELLS.EARTH_SHOCK.id) {
      this.earthShockDamage += event.amount;
    } else if (event.ability.guid === SPELLS.EARTHQUAKE_DAMAGE.id) {
      this.earthQuakeDamage += event.amount;
    }
  }

  onEarthShockOrEarthquakeCast(event) {
    if (event.ability.guid === SPELLS.EARTH_SHOCK.id) {
      this.earthShockCasts++;
    } else if (event.ability.guid === SPELLS.EARTHQUAKE.id) {
      this.earthQuakeCasts++;
    }
  }

  statistic() {
    return (
      <TalentStatisticBox
        talent={SPELLS.CALL_THE_THUNDER_TALENT.id}
        position={STATISTIC_ORDER.OPTIONAL(30)}
        value={(
          <>
            {formatNumber(this.overcapPrevented)} <small>maelstrom waste prevented</small><br />
            <TooltipElement content={(
              <><img src="/img/sword.png" alt="Damage" className="icon" />{" ≈"}{formatNumber(this.bonusEarthShockDps)} bonus DPS</>
            )}> {this.bonusEarthShockCasts} <small>Bonus <SpellLink id={SPELLS.EARTH_SHOCK.id} /> casts</small></TooltipElement><br />
            <TooltipElement content={(
              <><img src="/img/sword.png" alt="Damage" className="icon" />{" ≈"}{formatNumber(this.bonusEarthquakeDps)} bonus DPS</>
            )}> {this.bonusEarthquakeCasts} <small>Bonus <SpellLink id={SPELLS.EARTHQUAKE.id} /> casts</small></TooltipElement>
          </>
        )}
        tooltip={(
          <>
            Maelstrom waste prevented assumes you would spend maelstrom while at 100 without this talent.<br />
            Bonus DPS values provided are estimates and are definitely higher than the actual gain.
          </>
        )}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL();
}

export default CallTheThunder;
