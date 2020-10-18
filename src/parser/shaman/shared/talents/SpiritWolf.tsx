import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatThousands, formatNumber } from 'common/format';

import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import { Trans } from '@lingui/macro';
import SpellLink from 'common/SpellLink';

const SPIRIT_WOLF_DAMAGE_REDUCTION_PER_STACK = 0.05;

class SpiritWolf extends Analyzer {
  damageReduced = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.SPIRIT_WOLF_TALENT.id);

    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.damageTaken);
  }

  damageTaken(event: DamageEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.SPIRIT_WOLF_BUFF.id)) {
      return;
    }
    const stacks = this.selectedCombatant.getBuff(SPELLS.SPIRIT_WOLF_BUFF.id)?.stacks;
    if (!stacks) {
      return;
    }
    const damageTaken = event.amount + (event.absorbed || 0);
    this.damageReduced += damageTaken / (1 - (SPIRIT_WOLF_DAMAGE_REDUCTION_PER_STACK * stacks)) * (SPIRIT_WOLF_DAMAGE_REDUCTION_PER_STACK * stacks);
  }

  get totalDrps() {
    return this.damageReduced / this.owner.fightDuration * 1000;
  }

  statistic() {
    return (
      <StatisticBox
        position={STATISTIC_ORDER.OPTIONAL(45)}
        category={STATISTIC_CATEGORY.TALENTS}
        icon={<SpellIcon id={SPELLS.SPIRIT_WOLF_TALENT.id} />}
        value={`≈${formatNumber(this.totalDrps)} DRPS`}
        label={<Trans id="shaman.shared.damageReduced.label">Estimated damage reduced</Trans>}
        tooltip={(
          <Trans id="shaman.shared.damageReduced.tooltip">
            The total estimated damage reduced was {formatThousands(this.damageReduced)}.<br /><br />
            
            This is the lowest possible value. This value is pretty accurate for this log if you are looking at the actual gain over not having <SpellLink id={SPELLS.SPIRIT_WOLF_TALENT.id} /> bonus at all, but the gain may end up higher when taking interactions with other damage reductions into account.
          </Trans>
        )}
      />
    );
  }

}

export default SpiritWolf;
