import SPELLS from 'common/SPELLS';
import HIT_TYPES from 'game/HIT_TYPES';
import { SpellIcon } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import { ThresholdStyle } from 'parser/core/ParseResults';
import SpellUsable from 'analysis/retail/monk/windwalker/modules/core/SpellUsable';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import { TALENTS_MONK } from 'common/TALENTS';

const FISTS_OF_FURY_COOLDOWN_REDUCTION_MS = 4000;
const SPINNING_CRANE_KICK_REDUCTION_PER_TARGET_MS = 500;
const SPINNING_CRANE_KICK_MAX_REDUCTION_MS = 2500;
const XUENS_BATTLEGEAR_TRIGGER_SPELLS = [
  SPELLS.RISING_SUN_KICK_DAMAGE,
  SPELLS.RUSHING_WIND_KICK_DAMAGE,
  SPELLS.GLORY_OF_THE_DAWN_DAMAGE,
];

type PreAppliedXuensBattlegearDamageEvent = DamageEvent & {
  preAppliedXuensBattlegearReductionMs?: number;
};

class XuensBattlegear extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;

  effectiveFistsOfFuryReductionMs = 0;
  wastedFistsOfFuryReductionMs = 0;
  private spinningCraneKickTargetIds = new Set<number>();
  private spinningCraneKickReductionMs = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.XUENS_BATTLEGEAR_TALENT);
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(XUENS_BATTLEGEAR_TRIGGER_SPELLS),
      this.onTriggerDamage,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SPINNING_CRANE_KICK),
      this.onSpinningCraneKickCast,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.SPINNING_CRANE_KICK_DAMAGE),
      this.onSpinningCraneKickDamage,
    );
  }

  onTriggerDamage(event: DamageEvent) {
    const isCrit = event.hitType === HIT_TYPES.CRIT || event.hitType === HIT_TYPES.BLOCKED_CRIT;
    if (!isCrit) {
      return;
    }
    const preAppliedReductionMs = (event as PreAppliedXuensBattlegearDamageEvent)
      .preAppliedXuensBattlegearReductionMs;
    if (preAppliedReductionMs !== undefined) {
      this.effectiveFistsOfFuryReductionMs += preAppliedReductionMs;
      this.wastedFistsOfFuryReductionMs +=
        FISTS_OF_FURY_COOLDOWN_REDUCTION_MS - preAppliedReductionMs;
      return;
    }
    if (!this.spellUsable.isOnCooldown(SPELLS.FISTS_OF_FURY_CAST.id)) {
      this.wastedFistsOfFuryReductionMs += FISTS_OF_FURY_COOLDOWN_REDUCTION_MS;
    } else {
      const reductionMs = this.spellUsable.reduceCooldown(
        SPELLS.FISTS_OF_FURY_CAST.id,
        FISTS_OF_FURY_COOLDOWN_REDUCTION_MS,
      );
      this.effectiveFistsOfFuryReductionMs += reductionMs;
      this.wastedFistsOfFuryReductionMs += FISTS_OF_FURY_COOLDOWN_REDUCTION_MS - reductionMs;
    }
  }

  onSpinningCraneKickCast() {
    this.spinningCraneKickTargetIds.clear();
    this.spinningCraneKickReductionMs = 0;
  }

  onSpinningCraneKickDamage(event: DamageEvent) {
    if (this.spinningCraneKickReductionMs >= SPINNING_CRANE_KICK_MAX_REDUCTION_MS) {
      return;
    }
    if (this.spinningCraneKickTargetIds.has(event.targetID)) {
      return;
    }

    this.spinningCraneKickTargetIds.add(event.targetID);
    this.spinningCraneKickReductionMs += SPINNING_CRANE_KICK_REDUCTION_PER_TARGET_MS;

    if (!this.spellUsable.isOnCooldown(SPELLS.FISTS_OF_FURY_CAST.id)) {
      this.wastedFistsOfFuryReductionMs += SPINNING_CRANE_KICK_REDUCTION_PER_TARGET_MS;
      return;
    }

    const reductionMs = this.spellUsable.reduceCooldown(
      SPELLS.FISTS_OF_FURY_CAST.id,
      SPINNING_CRANE_KICK_REDUCTION_PER_TARGET_MS,
    );
    this.effectiveFistsOfFuryReductionMs += reductionMs;
    this.wastedFistsOfFuryReductionMs += SPINNING_CRANE_KICK_REDUCTION_PER_TARGET_MS - reductionMs;
  }

  get wastedReductionPerMinute() {
    return (this.wastedFistsOfFuryReductionMs / this.owner.fightDuration) * 60;
  }

  get suggestionThresholds() {
    return {
      actual: this.wastedReductionPerMinute,
      isGreaterThan: {
        minor: 2,
        average: 4,
        major: 6,
      },
      style: ThresholdStyle.DECIMAL,
    };
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE()}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spell={TALENTS_MONK.XUENS_BATTLEGEAR_TALENT}>
          <span>
            <SpellIcon
              spell={SPELLS.FISTS_OF_FURY_CAST}
              style={{
                height: '1.3em',
                marginTop: '-1.em',
              }}
            />{' '}
            {(this.effectiveFistsOfFuryReductionMs / 1000).toFixed(1)}{' '}
            <small>Seconds reduced</small>
          </span>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default XuensBattlegear;
