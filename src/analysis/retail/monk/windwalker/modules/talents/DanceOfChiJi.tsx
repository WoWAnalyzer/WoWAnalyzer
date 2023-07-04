import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import { SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/EventFilter';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import { TALENTS_MONK } from 'common/TALENTS';

const DAMAGE_MODIFIER = 1;
const STORM_EARTH_AND_FIRE_CAST_BUFFER = 200;

class DANCE_OF_CHI_JI extends Analyzer {
  buffedCast: boolean = false;
  damageGain: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.DANCE_OF_CHI_JI_TALENT);
    this.addEventListener(
      Events.damage
        .by(SELECTED_PLAYER | SELECTED_PLAYER_PET)
        .spell(SPELLS.SPINNING_CRANE_KICK_DAMAGE),
      this.onSpinningCraneKickDamage,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER | SELECTED_PLAYER_PET).spell(SPELLS.SPINNING_CRANE_KICK),
      this.onSpinningCraneKickCast,
    );
  }

  onSpinningCraneKickDamage(event: DamageEvent) {
    const bonusDamage = this.buffedCast ? calculateEffectiveDamage(event, DAMAGE_MODIFIER) : 0;
    this.damageGain += bonusDamage;
  }

  onSpinningCraneKickCast(event: CastEvent) {
    if (
      this.selectedCombatant.hasBuff(
        SPELLS.DANCE_OF_CHI_JI_BUFF.id,
        null,
        STORM_EARTH_AND_FIRE_CAST_BUFFER,
      )
    ) {
      this.buffedCast = true;
      event.meta = event.meta || {};
      event.meta.isEnhancedCast = true;
      const reason = (
        <>
          This cast was empowered by <SpellLink spell={SPELLS.DANCE_OF_CHI_JI_BUFF} />
        </>
      );
      event.meta.enhancedCastReason = event.meta.enhancedCastReason ? (
        <>
          {event.meta.enhancedCastReason}
          <br />
          {reason}
        </>
      ) : (
        reason
      );
    } else {
      // GCD is shorter than the duration SCK deals damage, and new SCK casts override any ongoing SCK cast, so this prevents a directly following from being marked as benefitting
      this.buffedCast = false;
    }
  }

  get dps() {
    return (this.damageGain / this.owner.fightDuration) * 1000;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(11)}
        size="flexible"
        tooltip={<>Total damage increase: {formatNumber(this.damageGain)}</>}
      >
        <BoringSpellValueText spell={TALENTS_MONK.DANCE_OF_CHI_JI_TALENT}>
          <img src="/img/sword.png" alt="Damage" className="icon" /> {formatNumber(this.dps)} DPS{' '}
          <small>
            {formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.damageGain))} % of
            total
          </small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default DANCE_OF_CHI_JI;
