import { VIPERS_VENOM_DAMAGE_MODIFIER } from 'analysis/retail/hunter/survival/constants';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/hunter';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import Events, { ApplyBuffEvent, CastEvent, DamageEvent } from 'parser/core/Events';
import GlobalCooldown from 'parser/shared/modules/GlobalCooldown';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

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
  spellKnown = SPELLS.RAPTOR_STRIKE;

  protected globalCooldown!: GlobalCooldown;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.VIPERS_VENOM_TALENT.id);

    if (this.active && this.selectedCombatant.hasTalent(TALENTS.MONGOOSE_BITE_TALENT.id)) {
      this.spellKnown = TALENTS.MONGOOSE_BITE_TALENT;
    }

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SERPENT_STING_SV),
      this.onCast,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.SERPENT_STING_SV),
      this.onDamage,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.VIPERS_VENOM_BUFF),
      this.onApplyBuff,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.VIPERS_VENOM_BUFF),
      this.onRefreshBuff,
    );
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
    this.accumulatedTimeFromBuffToCast +=
      event.timestamp - this.lastProcTimestamp - this.currentGCD;
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
        tooltip={
          <>
            <ul>
              <li>
                Average time between gaining Viper's Venom buff and using it was{' '}
                <b>{this.averageTimeBetweenBuffAndUsage.toFixed(2)}</b> seconds. This accounts for
                the GCD after the {this.spellKnown.name} proccing Viper's Venom.
                {this.wastedProcs > 0 && (
                  <li>
                    You wasted {this.wastedProcs} procs by gaining a new proc, whilst your current
                    proc was still active.
                  </li>
                )}
              </li>
            </ul>
          </>
        }
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spellId={TALENTS.VIPERS_VENOM_TALENT.id}>
          <>
            <ItemDamageDone amount={this.bonusDamage} />
            <br />
            {this.procs} / {this.wastedProcs + this.procs} <small>procs used</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default VipersVenom;
