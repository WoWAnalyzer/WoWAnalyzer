import React from 'react';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { AbsorbedEvent, DamageEvent} from 'parser/core/Events';
import SPELLS from 'common/SPELLS';
import MAGIC_SCHOOLS from 'game/MAGIC_SCHOOLS';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { formatNumber, formatPercentage } from 'common/format';
import BoringSpellValue from 'parser/ui/BoringSpellValue';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import HIT_TYPES from 'game/HIT_TYPES';

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
    this.active = this.selectedCombatant.hasTalent(SPELLS.HOLY_SHIELD_TALENT.id);
    if (!this.active) {
      return;
    }
    this.addEventListener(Events.absorbed.by(SELECTED_PLAYER).spell(SPELLS.HOLY_SHIELD_TALENT), this.trackHolyShieldAbsorbs);
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
    if (event.ability.guid === SPELLS.HOLY_SHIELD_TALENT.id) {
      this.holyShieldProcsCount += 1;
    }
  }

  statistic(): React.ReactNode {
    return (
      <Statistic
        position={STATISTIC_ORDER.DEFAULT}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={(
          <>
            Holy Shield blocked {formatNumber(this.holyShieldProcsCount)} out of {formatNumber(this.spellsHitPlayerCount)} spells.<br />
            This represents <em>{formatPercentage(this.holyShieldProcsCount/this.spellsHitPlayerCount)} %</em> of spells blocked.
          </>
        )}
        >
          <BoringSpellValue
            spell={SPELLS.HOLY_SHIELD_TALENT}
            value={this.holyShieldProcsCount}
            label="Spells Blocked"
          />
      </Statistic>
    );
  }
}

export default HolyShieldSpellBlock;
