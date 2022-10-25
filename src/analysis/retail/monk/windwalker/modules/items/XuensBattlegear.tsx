import { t } from '@lingui/macro';
import SPELLS from 'common/SPELLS';
import HIT_TYPES from 'game/HIT_TYPES';
import { SpellIcon } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';

const FISTS_OF_FURY_COOLDOWN_REDUCTION_MS = 5000;

class XuensBattlegear extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    abilityTracker: AbilityTracker,
  };

  protected spellUsable!: SpellUsable;
  protected abilityTracker!: AbilityTracker;

  effectiveFistsOfFuryReductionMs = 0;
  wastedFistsOfFuryReductionMs = 0;
  buffedHits = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasLegendary(SPELLS.XUENS_BATTLEGEAR);
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.RISING_SUN_KICK_DAMAGE),
      this.onRisingSunKickHit,
    );
  }

  onRisingSunKickHit(event: DamageEvent) {
    if (this.selectedCombatant.hasBuff(SPELLS.PRESSURE_POINT.id)) {
      this.buffedHits += 1;
    }
    const isCrit = event.hitType === HIT_TYPES.CRIT || event.hitType === HIT_TYPES.BLOCKED_CRIT;
    if (!isCrit) {
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

  get wastedReductionPerMinute() {
    return (this.wastedFistsOfFuryReductionMs / this.owner.fightDuration) * 60;
  }

  get totalHits() {
    return this.abilityTracker.getAbility(SPELLS.RISING_SUN_KICK_DAMAGE.id).damageHits;
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

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        'You are wasting cooldown reduction by casting Rising Sun Kick while having Fists of Fury available',
      )
        .icon(SPELLS.XUENS_BATTLEGEAR.icon)
        .actual(
          t({
            id: 'monk.windwalker.suggestions.xuensBattlegear.cdrWasted',
            message: `${actual.toFixed(2)} seconds of wasted cooldown reduction per minute`,
          }),
        )
        .recommended(`${recommended} is recommended`),
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE()}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
      >
        <BoringSpellValueText spellId={SPELLS.XUENS_BATTLEGEAR.id}>
          <span>
            <SpellIcon
              id={SPELLS.FISTS_OF_FURY_CAST.id}
              style={{
                height: '1.3em',
                marginTop: '-1.em',
              }}
            />{' '}
            {(this.effectiveFistsOfFuryReductionMs / 1000).toFixed(1)}{' '}
            <small>Seconds reduced</small>
            <br />
            <SpellIcon
              id={TALENTS_MONK.RISING_SUN_KICK_TALENT.id}
              style={{
                height: '1.3em',
                marginTop: '-1.em',
              }}
            />{' '}
            {this.buffedHits} / {this.totalHits} <small>Buffed / Total hits</small>
          </span>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default XuensBattlegear;
