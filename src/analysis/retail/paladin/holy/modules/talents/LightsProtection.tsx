import SPELLS from 'common/SPELLS';
import { TALENTS_PALADIN } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import { ReactNode } from 'react';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { formatNumber } from 'common/format';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { LIGHTS_PROTECTION_DAMAGE_REDUCTION } from '../../constants';

class LightsProtection extends Analyzer {
  totalDamagePrevented = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_PALADIN.LIGHTS_PROTECTION_TALENT);

    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this._onDamageTaken);
  }

  _combatantHasBeacon() {
    return this.selectedCombatant.hasBuff(SPELLS.BEACON_OF_LIGHT_CAST_AND_BUFF.id);
  }

  _onDamageTaken(event: DamageEvent) {
    if (!this._combatantHasBeacon()) {
      this.totalDamagePrevented +=
        (LIGHTS_PROTECTION_DAMAGE_REDUCTION * event.amount) /
        (1 - LIGHTS_PROTECTION_DAMAGE_REDUCTION);
    }
  }

  get DRPS() {
    return (this.totalDamagePrevented / this.owner.fightDuration) * 1000;
  }

  statistic(): ReactNode {
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={<p>Estimated damage reduced: {formatNumber(this.totalDamagePrevented)}</p>}
      >
        <TalentSpellText talent={TALENTS_PALADIN.LIGHTS_PROTECTION_TALENT}>
          <div>
            {formatNumber(this.DRPS)} <small>estimated DRPS</small>
          </div>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default LightsProtection;
