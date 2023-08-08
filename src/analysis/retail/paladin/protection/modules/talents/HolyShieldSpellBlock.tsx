import { formatNumber, formatPercentage } from 'common/format';
import TALENTS from 'common/TALENTS/paladin';
import HIT_TYPES from 'game/HIT_TYPES';
import MAGIC_SCHOOLS from 'game/MAGIC_SCHOOLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { AbsorbedEvent, DamageEvent } from 'parser/core/Events';
import BoringSpellValue from 'parser/ui/BoringSpellValue';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import * as React from 'react';

const PHYSICAL_DAMAGE = MAGIC_SCHOOLS.ids.PHYSICAL;

/**
 * Analyzer to track the number of spells blocked as a result of selecting the
 * Holy Shield talent.
 */
class HolyShieldSpellBlock extends Analyzer {
  spellsHitPlayerCount: number = 0;
  holyShieldProcsCount: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.HOLY_SHIELD_TALENT);
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.absorbed.by(SELECTED_PLAYER).spell(TALENTS.HOLY_SHIELD_TALENT),
      this.trackHolyShieldAbsorbs,
    );
    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.trackSpellsHitPlayer);
  }

  trackSpellsHitPlayer(event: DamageEvent) {
    if (event.ability.type !== PHYSICAL_DAMAGE) {
      this.spellsHitPlayerCount += 1;
      if (event.hitType === HIT_TYPES.BLOCKED_CRIT || event.hitType === HIT_TYPES.BLOCKED_NORMAL) {
        this.holyShieldProcsCount += 1;
      }
    }
  }

  trackHolyShieldAbsorbs(event: AbsorbedEvent) {
    if (event.ability.guid === TALENTS.HOLY_SHIELD_TALENT.id) {
      this.holyShieldProcsCount += 1;
    }
  }

  statistic(): React.ReactNode {
    return (
      <Statistic
        position={STATISTIC_ORDER.DEFAULT}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            Holy Shield blocked {formatNumber(this.holyShieldProcsCount)} out of{' '}
            {formatNumber(this.spellsHitPlayerCount)} spells.
            <br />
            This represents{' '}
            <em>{formatPercentage(this.holyShieldProcsCount / this.spellsHitPlayerCount)} %</em> of
            spells blocked.
          </>
        }
      >
        <BoringSpellValue
          spell={TALENTS.HOLY_SHIELD_TALENT.id}
          value={this.holyShieldProcsCount}
          label="Spells Blocked"
        />
      </Statistic>
    );
  }
}

export default HolyShieldSpellBlock;
