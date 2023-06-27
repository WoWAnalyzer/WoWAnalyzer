
import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import SPECS from 'game/SPECS';
import { SpellLink } from 'interface';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';
import Events, { CastEvent, SummonEvent, DamageEvent } from 'parser/core/Events';
import SUGGESTION_IMPORTANCE from 'parser/core/ISSUE_IMPORTANCE';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

/*
 * If Rune of Power is substantially better than the rest of the row, enable
 * ROP talent suggestion. At time of writing, it's a substantial increase over
 * incanters flow for fire and arcane in all situations.
 */
const SUGGEST_ROP = {
  [SPECS.FROST_MAGE.id]: false,
  [SPECS.ARCANE_MAGE.id]: true,
  [SPECS.FIRE_MAGE.id]: true,
};

const DAMAGE_BONUS = 0.4;
const RUNE_DURATION = 12;

// FIXME due to interactions with Ignite, the damage boost number will be underrated for Fire Mages. Still fine for Arcane and Frost.
class RuneOfPower extends Analyzer {
  hasROP = false;
  damage = 0;
  totalRunes = 0;
  overlappedRunes = 0;

  constructor(options: Options) {
    super(options);

    if (this.selectedCombatant.hasTalent(TALENTS.RUNE_OF_POWER_TALENT)) {
      this.hasROP = true;
      this.addEventListener(
        Events.cast
          .by(SELECTED_PLAYER)
          .spell([
            TALENTS.RUNE_OF_POWER_TALENT,
            TALENTS.COMBUSTION_TALENT,
            TALENTS.ICY_VEINS_TALENT,
            TALENTS.ARCANE_SURGE_TALENT,
          ]),
        this.onCast,
      );
      this.addEventListener(
        Events.summon
          .by(SELECTED_PLAYER)
          .spell([SPELLS.RUNE_OF_POWER_AUTOCAST, TALENTS.RUNE_OF_POWER_TALENT]),
        this.onRune,
      );
      this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onPlayerDamage);
    }
  }

  onCast(event: CastEvent) {
    if (this.selectedCombatant.hasBuff(SPELLS.RUNE_OF_POWER_BUFF.id)) {
      this.overlappedRunes += 1;
    }
  }

  onRune(event: SummonEvent) {
    this.totalRunes += 1;
  }

  onPlayerDamage(event: DamageEvent) {
    if (this.selectedCombatant.hasBuff(SPELLS.RUNE_OF_POWER_BUFF.id)) {
      this.damage += calculateEffectiveDamage(event, DAMAGE_BONUS);
    }
  }

  get damagePercent() {
    return this.owner.getPercentageOfTotalDamageDone(this.damage);
  }

  get damageIncreasePercent() {
    return this.damagePercent / (1 - this.damagePercent);
  }

  get uptimeMS() {
    return this.selectedCombatant.getBuffUptime(SPELLS.RUNE_OF_POWER_BUFF.id);
  }

  get roundedSecondsPerCast() {
    return this.uptimeMS / this.totalRunes / 1000;
  }

  get overlappedRunesThresholds() {
    return {
      actual: this.overlappedRunes,
      isGreaterThan: {
        major: 0,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  get roundedSecondsSuggestionThresholds() {
    return {
      actual: this.roundedSecondsPerCast,
      isLessThan: {
        minor: RUNE_DURATION,
        average: RUNE_DURATION - 1,
        major: RUNE_DURATION - 2,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  showSuggestion = true;
  suggestions(when: When) {
    if (!this.hasROP) {
      when(SUGGEST_ROP[this.selectedCombatant.specId])
        .isTrue()
        .addSuggestion((suggest) =>
          suggest(
            <>
              It is highly recommended to talent into{' '}
              <SpellLink id={TALENTS.RUNE_OF_POWER_TALENT.id} /> when playing this spec. While it
              can take some practice to master, when played correctly it outputs substantially more
              DPS than <SpellLink id={TALENTS.INCANTERS_FLOW_TALENT.id} /> or.
            </>,
          )
            .icon(TALENTS.RUNE_OF_POWER_TALENT.icon)
            .staticImportance(SUGGESTION_IMPORTANCE.REGULAR),
        );
      return;
    }

    if (!this.showSuggestion) {
      return;
    }

    when(this.overlappedRunesThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You cast <SpellLink id={TALENTS.RUNE_OF_POWER_TALENT.id} /> or an ability that
          automatically casts <SpellLink id={TALENTS.RUNE_OF_POWER_TALENT.id} /> (Like{' '}
          <SpellLink id={TALENTS.ICY_VEINS_TALENT.id} />,{' '}
          <SpellLink id={TALENTS.COMBUSTION_TALENT.id} />, or{' '}
          <SpellLink id={TALENTS.ARCANE_SURGE_TALENT.id} />) while you still had a Rune down. Make
          sure you are not overlapping your <SpellLink id={TALENTS.RUNE_OF_POWER_TALENT.id} /> so
          you can get the most out of the damage buff that it provides.
        </>,
      )
        .icon(TALENTS.RUNE_OF_POWER_TALENT.icon)
        .actual(`${formatNumber(actual)} overlapped runes`)
        .recommended(`${formatNumber(recommended)} is recommended`),
    );

    if (this.totalRunes > 0) {
      when(this.roundedSecondsSuggestionThresholds).addSuggestion((suggest, actual, recommended) =>
        suggest(
          <>
            You sometimes aren't standing in your <SpellLink id={TALENTS.RUNE_OF_POWER_TALENT.id} />{' '}
            for its full duration. Try to only use it when you know you won't have to move for the
            duration of the effect.
          </>,
        )
          .icon(TALENTS.RUNE_OF_POWER_TALENT.icon)
          .actual(
            <>
              Average {this.roundedSecondsPerCast.toFixed(1)}s standing in each Rune of Power
            </>,
          )
          .recommended(`the full duration of ${formatNumber(RUNE_DURATION)}s is recommended`),
      );
    }
  }

  statistic() {
    if (this.hasROP) {
      return (
        <Statistic
          size="flexible"
          category={STATISTIC_CATEGORY.TALENTS}
          tooltip={
            <>
              This is the portion of your total damage attributable to Rune of Power's boost.
              Expressed as an increase vs never using Rune of Power, this is a{' '}
              <strong>{formatPercentage(this.damageIncreasePercent)}% damage increase</strong>. Note
              that this number does <em>not</em> factor in the opportunity cost of casting Rune of
              Power instead of another damaging spell.
            </>
          }
        >
          <BoringSpellValueText spellId={TALENTS.RUNE_OF_POWER_TALENT.id}>
            <>
              {formatPercentage(this.damagePercent, 0)}%{' '}
              <small>Damage added by Rune of Power</small>
              <br />
              {formatNumber(this.roundedSecondsPerCast)}s{' '}
              <small>Average time in Rune per cast</small>
            </>
          </BoringSpellValueText>
        </Statistic>
      );
    } else {
      return null;
    }
  }
}

export default RuneOfPower;
