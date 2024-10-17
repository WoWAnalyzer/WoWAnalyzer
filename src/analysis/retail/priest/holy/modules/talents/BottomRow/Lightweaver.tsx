import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { HealEvent, CastEvent } from 'parser/core/Events';
import SPELLS from 'common/SPELLS/';
import TALENTS, { TALENTS_PRIEST } from 'common/TALENTS/priest';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { formatPercentage } from 'common/format';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import { SpellLink } from 'interface';
import { calculateEffectiveHealing, calculateOverhealing } from 'parser/core/EventCalculateLib';
import { getHeal } from '../../../normalizers/CastLinkNormalizer';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../../Guide';
import GradiatedPerformanceBar from 'interface/guide/components/GradiatedPerformanceBar';
import { LW_CAST_TIME_DECREASE, LW_HEALING_BONUS, LW_OVERHEAL_THRESHOLD } from '../../../constants';
import EOLAttrib from '../../core/EchoOfLightAttributor';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';

/**
 * Flash Heal reduces the cast time of your next Heal
 * within 20 sec by 30% and increases its healing done by 15%.
 *
 * Stacks up to 2 times.
 */

//Example log: /report/kVQd4LrBb9RW2h6K/9-Heroic+The+Primal+Council+-+Wipe+5+(5:04)/Delipriest/standard/statistics
class Lightweaver extends Analyzer {
  static dependencies = {
    eolAttrib: EOLAttrib,
  };
  protected eolAttrib!: EOLAttrib;
  healingDoneFromTalent = 0;
  overhealingDoneFromTalent = 0;

  totalHealCasts = 0;
  unbuffedHealCasts = 0;
  highOverhealHealCasts = 0;

  totalFlashHealCasts = 0;
  wastedBuffFlashHealCasts = 0;
  highOverhealFlashHealCasts = 0;

  eolContrib = 0;

  constructor(options: Options) {
    super(options);

    if (!this.selectedCombatant.hasTalent(TALENTS.LIGHTWEAVER_TALENT)) {
      this.active = false;
      return;
    }
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.GREATER_HEAL),
      this.onHealCast,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.FLASH_HEAL),
      this.onFlashHealCast,
    );
  }

  isHighOverheal(event: HealEvent) {
    const rawHealing = (event.amount || 0) + (event.overheal || 0) + (event.absorbed || 0);
    if (rawHealing === 0) {
      return false;
    }
    return (event.overheal || 0) / rawHealing >= LW_OVERHEAL_THRESHOLD;
  }

  onHealCast(event: CastEvent) {
    // linked heal event exists
    const healEvent = getHeal(event);
    if (healEvent) {
      this.totalHealCasts += 1;
      if (this.selectedCombatant.hasBuff(SPELLS.LIGHTWEAVER_TALENT_BUFF)) {
        // calculate effective healing from bonus
        this.healingDoneFromTalent += calculateEffectiveHealing(healEvent, LW_HEALING_BONUS);
        this.eolContrib += this.eolAttrib.getEchoOfLightAmpAttrib(healEvent, LW_HEALING_BONUS);
        this.overhealingDoneFromTalent = calculateOverhealing(healEvent, LW_HEALING_BONUS);
      } else {
        this.unbuffedHealCasts += 1;
        // return early so we are not counting unbuffed heals for high overheal count
        return;
      }

      if (this.isHighOverheal(healEvent)) {
        this.highOverhealHealCasts += 1;
      }
    }
  }

  onFlashHealCast(event: CastEvent) {
    // linked heal event exists
    const healEvent = getHeal(event);
    if (healEvent) {
      this.totalFlashHealCasts += 1;
      if (this.selectedCombatant.getBuffStacks(SPELLS.LIGHTWEAVER_TALENT_BUFF.id) < 2) {
        if (this.isHighOverheal(healEvent)) {
          this.highOverhealFlashHealCasts += 1;
        }
      } else {
        this.wastedBuffFlashHealCasts += 1;
      }
    }
  }

  get goodHeals() {
    return this.totalHealCasts - this.unbuffedHealCasts - this.highOverhealHealCasts;
  }

  get goodFlashHeals() {
    return (
      this.totalFlashHealCasts - this.wastedBuffFlashHealCasts - this.highOverhealFlashHealCasts
    );
  }

  get guideSubsection(): JSX.Element {
    // if player isn't running lightweaver, don't show guide section
    if (!this.selectedCombatant.hasTalent(TALENTS.LIGHTWEAVER_TALENT)) {
      return <></>;
    }
    const explanation = (
      <p>
        <b>
          <SpellLink spell={TALENTS.LIGHTWEAVER_TALENT} />
        </b>{' '}
        is a strong buff that you should be playing around to buff your{' '}
        <SpellLink spell={SPELLS.GREATER_HEAL} /> casts. Focus on alternating your{' '}
        <SpellLink spell={SPELLS.FLASH_HEAL} /> and <SpellLink spell={SPELLS.GREATER_HEAL} /> casts
        to avoid wasting stacks of this buff. It is best to also move between different targets to
        optimize the <SpellLink spell={TALENTS.TRAIL_OF_LIGHT_TALENT} /> talent.
      </p>
    );

    const goodHeals = {
      count: this.goodHeals,
      label: 'Good Heal Casts',
    };

    const highOverhealHealCasts = {
      count: this.highOverhealHealCasts,
      label: 'High-overheal Buffed Heal Casts',
    };

    const unbuffedHealCasts = {
      count: this.unbuffedHealCasts,
      label: 'Heal casts with no Lightweaver Buff',
    };

    const goodFlashHeals = {
      count: this.goodFlashHeals,
      label: 'Good Flash Heal Casts',
    };

    const highOverhealFlashHealCasts = {
      count: this.highOverhealFlashHealCasts,
      label: 'High-overheal Flash Heal Casts',
    };

    const wastedBuffFlashHealCasts = {
      count: this.wastedBuffFlashHealCasts,
      label: 'Flash Heal casts with two stacks of Lightweaver already',
    };

    const data = (
      <div>
        <strong>
          <SpellLink spell={SPELLS.GREATER_HEAL} /> cast breakdown
        </strong>
        <small>
          {' '}
          - Green is a good cast. Yellow is a cast with very high overheal, and Red is a cast with
          no <SpellLink spell={TALENTS.LIGHTWEAVER_TALENT} /> buff.
        </small>
        <GradiatedPerformanceBar
          good={goodHeals}
          ok={highOverhealHealCasts}
          bad={unbuffedHealCasts}
        />

        <strong>
          <SpellLink spell={SPELLS.FLASH_HEAL} /> cast breakdown
        </strong>
        <small>
          {' '}
          - Green is a good cast. Yellow is a cast with very high overheal, and Red is a cast with
          two stacks of <SpellLink spell={TALENTS.LIGHTWEAVER_TALENT} /> already active.
        </small>
        <GradiatedPerformanceBar
          good={goodFlashHeals}
          ok={highOverhealFlashHealCasts}
          bad={wastedBuffFlashHealCasts}
        />
      </div>
    );

    return explanationAndDataSubsection(explanation, data, GUIDE_CORE_EXPLANATION_PERCENT);
  }

  statistic() {
    const overhealingTooltipString = formatPercentage(
      this.overhealingDoneFromTalent /
        (this.healingDoneFromTalent + this.overhealingDoneFromTalent),
    );

    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            {`${overhealingTooltipString}% overhealing`} <br />
            <br />
            <div>Breakdown: </div>
            <div>
              <SpellLink spell={TALENTS_PRIEST.LIGHTWEAVER_TALENT} />:{' '}
              <ItemPercentHealingDone amount={this.healingDoneFromTalent}></ItemPercentHealingDone>{' '}
            </div>
            <div>
              <SpellLink spell={SPELLS.ECHO_OF_LIGHT_MASTERY} />:{' '}
              <ItemPercentHealingDone amount={this.eolContrib}></ItemPercentHealingDone> <br />
            </div>
            <br />
            <div>
              Notably this module currently is missing the contributions to{' '}
              <SpellLink spell={TALENTS_PRIEST.BINDING_HEALS_TALENT} /> and{' '}
              <SpellLink spell={TALENTS_PRIEST.TRAIL_OF_LIGHT_TALENT} />, which can undervalue it.
            </div>
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS.LIGHTWEAVER_TALENT}>
          <div>
            <ItemHealingDone amount={this.healingDoneFromTalent + this.eolContrib} />{' '}
            <small> from just the heal amp</small>
          </div>
          <div>
            <ItemHealingDone
              amount={(this.healingDoneFromTalent + this.eolContrib) / LW_CAST_TIME_DECREASE}
            />{' '}
            <small> from both the heal amp and doing that healing in less time</small>
          </div>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}
export default Lightweaver;
