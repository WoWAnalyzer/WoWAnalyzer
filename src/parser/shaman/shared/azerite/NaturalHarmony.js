import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { TooltipElement } from 'common/Tooltip';
import { formatPercentage } from 'common/format';
import { calculateAzeriteEffects } from 'common/stats';

import Analyzer from 'parser/core/Analyzer';
import StatTracker from 'parser/shared/modules/StatTracker';

import HasteIcon from 'interface/icons/Haste';
import UptimeIcon from 'interface/icons/Uptime';
import CriticalStrikeIcon from 'interface/icons/CriticalStrike';
import MasteryIcon from 'interface/icons/Mastery';
import AzeritePowerStatistic from 'interface/statistics/AzeritePowerStatistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText/index';

const NaturalHarmonyStats = traits => Object.values(traits).reduce((total, ilvl) => {
  const statForPiece = calculateAzeriteEffects(SPELLS.NATURAL_HARMONY_TRAIT.id, ilvl)[0];
  return statForPiece + total;
}, 0);

class NaturalHarmony extends Analyzer {
  naturalHarmonyStatValue = 0;

  static dependencies = {
    statTracker: StatTracker,
  };

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.NATURAL_HARMONY_TRAIT.id);
    if (!this.active) {
      return;
    }

    this.naturalHarmonyStatValue = NaturalHarmonyStats(this.selectedCombatant.traitsBySpellId[SPELLS.NATURAL_HARMONY_TRAIT.id]);

    this.statTracker.add(SPELLS.NATURAL_HARMONY_FIRE_BUFF.id, {
      crit: this.naturalHarmonyStatValue,
    });

    this.statTracker.add(SPELLS.NATURAL_HARMONY_NATURE_BUFF.id, {
      haste: this.naturalHarmonyStatValue,
    });

    this.statTracker.add(SPELLS.NATURAL_HARMONY_FROST_BUFF.id, {
      mastery: this.naturalHarmonyStatValue,
    });
  }

  get critBuffUptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.NATURAL_HARMONY_FIRE_BUFF.id) / this.owner.fightDuration;
  }

  get hasteBuffUptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.NATURAL_HARMONY_NATURE_BUFF.id) / this.owner.fightDuration;
  }

  get masteryBuffUptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.NATURAL_HARMONY_FROST_BUFF.id) / this.owner.fightDuration;
  }

  get averageCrit() {
    return (this.naturalHarmonyStatValue * this.critBuffUptime).toFixed(0);
  }

  get averageHaste() {
    return (this.naturalHarmonyStatValue * this.hasteBuffUptime).toFixed(0);
  }

  get averageMastery() {
    return (this.naturalHarmonyStatValue * this.masteryBuffUptime).toFixed(0);
  }

  statistic() {
    return (
      <AzeritePowerStatistic
        size="flexible"
        tooltip={(
          <div>
            Grants {this.naturalHarmonyStatValue} critical strike via <SpellLink id={SPELLS.NATURAL_HARMONY_FIRE_BUFF.id} /> for 12 seconds after casting a fire spell.<br />
            Grants {this.naturalHarmonyStatValue} haste via <SpellLink id={SPELLS.NATURAL_HARMONY_NATURE_BUFF.id} /> for 12 seconds after casting a nature spell.<br />
            Grants {this.naturalHarmonyStatValue} mastery via <SpellLink id={SPELLS.NATURAL_HARMONY_FROST_BUFF.id} /> for 12 seconds after casting a frost spell.
          </div>
        )}
      >
        <BoringSpellValueText spell={SPELLS.NATURAL_HARMONY_TRAIT}>
          <CriticalStrikeIcon /> <TooltipElement content={(
            <div>
              <UptimeIcon /> {formatPercentage(this.critBuffUptime, 2)}% uptime
            </div>
          )}
          > {this.averageCrit} <small>average Crit gained</small></TooltipElement><br />
          <HasteIcon /> <TooltipElement content={(
            <div>
              <UptimeIcon /> {formatPercentage(this.hasteBuffUptime, 2)}% uptime
            </div>
          )}
          >{this.averageHaste} <small>average Haste gained</small></TooltipElement><br />
          <MasteryIcon /> <TooltipElement content={(
            <div>
              <UptimeIcon /> {formatPercentage(this.masteryBuffUptime, 2)}% uptime
            </div>
          )}
          >{this.averageMastery} <small>average Mastery gained</small></TooltipElement>
        </BoringSpellValueText>
      </AzeritePowerStatistic>
    );
  }
}

export default NaturalHarmony;
