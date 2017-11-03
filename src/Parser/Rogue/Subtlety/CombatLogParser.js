import React from 'react';

import Icon from 'common/Icon';
import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import StatisticBox from 'Main/StatisticBox';

import ShadowDance from './Modules/Features/ShadowDance';
import CastEfficiency from './Modules/Features/CastEfficiency';

function formatThousands(number) {
  return (`${Math.round(number || 0)}`).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
}

function formatNumber(number) {
  if (number > 1000000) {
    return `${(number / 1000000).toFixed(2)}m`;
  }
  if (number > 10000) {
    return `${Math.round(number / 1000)}k`;
  }
  return formatThousands(number);
}

function formatPercentage(percentage) {
  return (Math.round((percentage || 0) * 10000) / 100).toFixed(2);
}

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    shadowDance: ShadowDance,
    castEfficiency: CastEfficiency,
  };

  generateResults() {
    const results = super.generateResults();

    const fightDuration = this.fightDuration;

    results.statistics = [
      <StatisticBox
        icon={<Icon icon="class_rogue" alt="Damage Per Second" />}
        value={`${formatNumber(this.modules.damageDone.total.effective / fightDuration * 1000)} DPS`}
        label={(
          <dfn data-tip={`The total damage done recorded was ${formatThousands(this.modules.damageDone.total.effective)}.`}>
            Damage done
          </dfn>
        )}
      />,
      <StatisticBox
        icon={<SpellIcon id={SPELLS.SHADOW_BLADES.id} />}
        value={`${formatPercentage((this.modules.combatants.selected.getBuffUptime(SPELLS.SHADOW_BLADES.id) / this.fightDuration))} %`}
        label={(
          <dfn data-tip={'Shadow Blades up time'}>
            Shadow Blades up time
          </dfn>
        )}
      />,

      <StatisticBox
        icon={<SpellIcon id={SPELLS.SHADOW_DANCE.id} />}
        value={`${formatPercentage((this.modules.combatants.selected.getBuffUptime(SPELLS.SHADOW_DANCE_BUFF.id) / this.fightDuration))} %`}
        label={(
          <dfn data-tip={'Shadow Dance up time'}>
            Shadow Dance up time
          </dfn>
        )}
      />,

      <StatisticBox
        icon={<SpellIcon id={SPELLS.SYMBOLS_OF_DEATH.id} />}
        value={`${formatPercentage((this.modules.combatants.selected.getBuffUptime(SPELLS.SYMBOLS_OF_DEATH.id) / this.fightDuration))} %`}
        label={(
          <dfn data-tip={'Symbols of Death up time'}>
            Symbols of Death up time
          </dfn>
        )}
      />,

      this.modules.combatants.selected.hasTalent(SPELLS.DARK_SHADOW_TALENT.id) && this.modules.shadowDance.active && (
        <StatisticBox
          icon={<SpellIcon id={SPELLS.EVISCERATE.id} />}
          value={`${formatPercentage(this.modules.shadowDance.totalEviscerateDamageInShadowDance / (this.modules.shadowDance.totalShadowDanceCast * 2))} %`}
          label={(
            <dfn data-tip={`Your Eviscerate casts in Shadow Dance / (Shadow Dance casts * 2). Your actual / max possible casts is ${this.modules.shadowDance.totalEviscerateDamageInShadowDance}/${this.modules.shadowDance.totalShadowDanceCast * 2}. This number includes Eviscerates cast from Death from Above. Subtlety rogue should cast as many as possible (usually 2 times) Eviscerates in a Shadow Dance to get benefit from 30% damage increasing of Dark Shadow talent.`}>
              Actual/Possible Eviscerates in Shadow Dance
            </dfn>
          )}
        />),

      // Dark Shadow increase 30% damage during Shadow Dance
      this.modules.combatants.selected.hasTalent(SPELLS.DARK_SHADOW_TALENT.id) && this.modules.shadowDance.active && (
        <StatisticBox
          icon={<SpellIcon id={SPELLS.DARK_SHADOW_TALENT.id} />}
          value={`${formatNumber(this.modules.shadowDance.totalDamageDoneInShadowDance * 0.3 / 1.3 * 1000 / this.fightDuration)} DPS`}
          label={(
            <dfn data-tip={`Total damage increase is ${formatNumber(this.modules.shadowDance.totalDamageDoneInShadowDance * 0.3 / 1.3)} in ${this.modules.shadowDance.totalShadowDanceCast} Shadow Dance casts. Dark Shadow increase 30% damage during Shadow Dance.`}>
              Increased from Dark Shadow talent
            </dfn>
          )}
        />),

      ...results.statistics,
    ];
    return results;
  }
}

export default CombatLogParser;
