import React from 'react';

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import ItemDamageDone from 'interface/ItemDamageDone';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import GlobalCooldown from 'parser/shared/modules/GlobalCooldown';
import { VIPERS_VENOM_DAMAGE_MODIFIER } from 'parser/hunter/survival/constants';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import Events, { ApplyBuffEvent, CastEvent, DamageEvent } from 'parser/core/Events';
import Spell from 'common/SPELLS/Spell';

/**
 * Raptor Strike (or Mongoose Bite) has a chance to make your next Serpent Sting cost no Focus and deal an additional 250% initial damage.
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/ZRALzNbMpqka1fTB#fight=17&type=auras&source=329&translate=true&ability=268552
 */

class VipersVenom extends Analyzer {
  static dependencies = {
    globalCooldown: GlobalCooldown,
  };

  buffedSerpentSting = false;
  bonusDamage = 0;
  procs = 0;
  lastProcTimestamp = 0;
  accumulatedTimeFromBuffToCast = 0;
  currentGCD = 0;
  wastedProcs = 0;
  spellKnown: Spell = SPELLS.RAPTOR_STRIKE;

  protected globalCooldown!: GlobalCooldown;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(SPELLS.VIPERS_VENOM_TALENT.id);

    if (this.active && this.selectedCombatant.hasTalent(SPELLS.MONGOOSE_BITE_TALENT.id)) {
      this.spellKnown = SPELLS.MONGOOSE_BITE_TALENT;
    }

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SERPENT_STING_SV), this.onCast);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.SERPENT_STING_SV), this.onDamage);
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.VIPERS_VENOM_BUFF), this.onApplyBuff);
    this.addEventListener(Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.VIPERS_VENOM_BUFF), this.onRefreshBuff);
  }

  get averageTimeBetweenBuffAndUsage() {
    return this.accumulatedTimeFromBuffToCast / this.procs / 1000;
  }

  onCast(event: CastEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.VIPERS_VENOM_BUFF.id)) {
      return;
    }
    this.buffedSerpentSting = true;
    this.currentGCD = this.globalCooldown.getGlobalCooldownDuration(event.ability.guid);
    this.accumulatedTimeFromBuffToCast += event.timestamp - this.lastProcTimestamp - this.currentGCD;
  }

  onDamage(event: DamageEvent) {
    if (this.buffedSerpentSting) {
      this.bonusDamage += calculateEffectiveDamage(event, VIPERS_VENOM_DAMAGE_MODIFIER);
      this.buffedSerpentSting = false;
    }
  }

  onApplyBuff(event: ApplyBuffEvent) {
    this.procs += 1;
    this.lastProcTimestamp = event.timestamp;
  }

  onRefreshBuff() {
    this.wastedProcs += 1;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(1)}
        size="flexible"
        tooltip={(
          <>
            <ul>
              <li>Average time between gaining Viper's Venom buff and using it was <b>{this.averageTimeBetweenBuffAndUsage.toFixed(2)}</b> seconds. This accounts for the GCD after the {this.spellKnown.name} proccing Viper's Venom.
                {this.wastedProcs > 0 && <li>You wasted {this.wastedProcs} procs by gaining a new proc, whilst your current proc was still active.</li>}
              </li>
            </ul>
          </>
        )}
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spell={SPELLS.VIPERS_VENOM_TALENT}>
          <>
            <ItemDamageDone amount={this.bonusDamage} /><br />
            {this.procs} / {this.wastedProcs + this.procs} <small>procs used</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default VipersVenom;
