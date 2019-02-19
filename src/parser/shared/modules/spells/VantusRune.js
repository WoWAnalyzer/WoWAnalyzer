import React from 'react';

import SpellLink from 'common/SpellLink';
import Icon from 'common/Icon';
import { formatNumber } from 'common/format';

import SmallStatisticBox, { STATISTIC_ORDER } from 'interface/others/SmallStatisticBox';

import Analyzer from 'parser/core/Analyzer';
import HealingDone from 'parser/shared/modules/HealingDone';
import DamageDone from 'parser/shared/modules/DamageDone';
import DamageTaken from 'parser/shared/modules/DamageTaken';

// https://www.wowhead.com/uncategorized-spells/name:Vantus+Rune:?filter=29:21;42:2;0:80100
const VANTUS_RUNE_VERSATILITY = 277;
const VERSATILITY_PER_PERCENT_THROUGHPUT = 85 * 100;
const VERSATILITY_PER_PERCENT_DAMAGE_REDUCTION = VERSATILITY_PER_PERCENT_THROUGHPUT * 2;
const VANTUS_RUNE_PERCENTAGE_THROUGHPUT = VANTUS_RUNE_VERSATILITY / VERSATILITY_PER_PERCENT_THROUGHPUT;
const VANTUS_RUNE_PERCENTAGE_DAMAGE_REDUCTION = VANTUS_RUNE_VERSATILITY / VERSATILITY_PER_PERCENT_DAMAGE_REDUCTION;

/**
 * @property {HealingDone} healingDone
 * @property {DamageDone} damageDone
 * @property {DamageTaken} damageTaken
 */
class VantusRune extends Analyzer {
  static dependencies = {
    healingDone: HealingDone,
    damageDone: DamageDone,
    damageTaken: DamageTaken,
  };

  activeRune = null;
  constructor(...args) {
    super(...args);
    const boss = this.owner.boss;

    /** @var {number|null} */
    const vantusRuneBuffId = boss ? boss.fight.vantusRuneBuffId : null;
    if (vantusRuneBuffId) {
      const match = this.selectedCombatant.getBuff(vantusRuneBuffId);
      if (match !== undefined) {
        this.activeRune = match;
      }
    }
    this.active = this.activeRune !== null;
  }

  statistic() {
    const fightDuration = this.owner.fightDuration;

    const damageDone = this.damageDone.total.effective - (this.damageDone.total.effective / (1 + VANTUS_RUNE_PERCENTAGE_THROUGHPUT));
    const healingDone = this.healingDone.total.effective - (this.healingDone.total.effective / (1 + VANTUS_RUNE_PERCENTAGE_THROUGHPUT));
    const damageReduced = (this.damageTaken.total.effective / (1 - VANTUS_RUNE_PERCENTAGE_DAMAGE_REDUCTION)) - this.damageTaken.total.effective;

    return (
      <SmallStatisticBox
        position={STATISTIC_ORDER.UNIMPORTANT()}
        icon={(
          <SpellLink id={this.activeRune.ability.guid} icon={false}>
            <Icon icon={this.activeRune.ability.abilityIcon} />
          </SpellLink>
        )}
        value={damageDone > healingDone ? `${formatNumber(damageDone / fightDuration * 1000)} DPS` : `${formatNumber(healingDone / fightDuration * 1000)} HPS`}
        label="Vantus Rune gain"
        tooltip={`The throughput gain from using a Vantus Rune. You gained ${formatNumber(damageDone / fightDuration * 1000)} damage per second (DPS) and ${formatNumber(healingDone / fightDuration * 1000)} healing per second (HPS), and reduced your damage taken by ${formatNumber(damageReduced / fightDuration * 1000)} per second (DRPS).`}
      />
    );
  }
}

export default VantusRune;
