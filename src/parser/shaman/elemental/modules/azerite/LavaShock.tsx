import React from 'react';

import SPELLS from 'common/SPELLS';
import Analyzer from 'parser/core/Analyzer';
import { formatNumber } from 'common/format';
import { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';
import { calculateAzeriteEffects } from 'common/stats';
import calculateBonusAzeriteDamage from 'parser/core/calculateBonusAzeriteDamage';
import StatTracker from 'parser/shared/modules/StatTracker';
import BoringSpellValue from 'interface/statistics/components/BoringSpellValue';
import { DamageEvent } from 'parser/core/Events';
import Statistic from 'interface/statistics/Statistic';
import { Trans } from '@lingui/macro';

const ES_SP_COEFFICIENT = 2.1; // taken from Simcraft SpellDataDump (250% -> 210% in 8.1)

class LavaShock extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };

  protected readonly statTracker!: StatTracker;
  protected procs = 0;
  protected damageGained = 0;
  protected traitBonus = 0;

  constructor(options: any) {
    super(options);
    this.active = this.selectedCombatant.hasTrait(SPELLS.LAVA_SHOCK.id);
    if (!this.active) {
      return;
    }
    this.traitBonus = this.selectedCombatant.traitsBySpellId[
      SPELLS.LAVA_SHOCK.id
    ].reduce(
      (sum: number, rank: number) =>
        sum + calculateAzeriteEffects(SPELLS.LAVA_SHOCK.id, rank)[0],
      0,
    );
  }

  on_byPlayer_damage(event: DamageEvent) {
    if (event.ability.guid !== SPELLS.EARTH_SHOCK.id) {
      return;
    }
    const buff: any = this.selectedCombatant.getBuff(SPELLS.LAVA_SHOCK_BUFF.id);

    if (buff === undefined) {
      return;
    }
    const [bonusDamage] = calculateBonusAzeriteDamage(
      event,
      [(buff.stacks || 0) * this.traitBonus],
      ES_SP_COEFFICIENT,
      this.statTracker.currentIntellectRating,
    );
    this.damageGained += bonusDamage;
    this.procs += 1;
  }

  statistic() {
    return (
      <Statistic position={STATISTIC_ORDER.OPTIONAL()} size="small">
        <BoringSpellValue
          spell={SPELLS.LAVA_SHOCK}
          value={<Trans>{formatNumber(this.damageGained)} Damage</Trans>}
          label={<Trans>Damage done</Trans>}
        />
      </Statistic>
    );
  }
}

export default LavaShock;
