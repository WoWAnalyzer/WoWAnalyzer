import type { JSX } from 'react';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { HealEvent, CastEvent } from 'parser/core/Events';
import SPELLS from 'common/SPELLS/';
import TALENTS from 'common/TALENTS/priest';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { formatPercentage } from 'common/format';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import { SpellLink } from 'interface';
import { getHeal } from '../../../normalizers/CastLinkNormalizer';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../../Guide';
import GradiatedPerformanceBar from 'interface/guide/components/GradiatedPerformanceBar';
import { LW_CAST_TIME_DECREASE, LW_OVERHEAL_THRESHOLD } from '../../../constants';
import EOLAttrib from '../../core/EchoOfLightAttributor';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';

/**
 * Lightweaver
 * Flash Heal reduces the cast time of your next Prayer of Healing within 20 sec by 30% and increases its healing done by 18%.
 * Can accumulate up to 4 charges.
 */

class Lightweaver extends Analyzer {
  static dependencies = {
    eolAttrib: EOLAttrib,
  };
  protected eolAttrib!: EOLAttrib;

  overhealingDoneFromTalent = 0;

  totalFlashHealCasts = 0;
  wastedBuffFlashHealCasts = 0;
  highOverhealFlashHealCasts = 0;

  trailHealing = 0;
  bindingHealing = 0;
  prayerHealing = 0; // direct healing from the buffed Prayer of Healing

  eolContrib = 0;

  get totalHealing() {
    return this.prayerHealing + this.eolContrib + this.trailHealing + this.bindingHealing;
  }

  constructor(options: Options) {
    super(options);

    if (!this.selectedCombatant.hasTalent(TALENTS.LIGHTWEAVER_TALENT)) {
      this.active = false;
      return;
    }

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

  onFlashHealCast(event: CastEvent) {
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

  get goodFlashHeals() {
    return (
      this.totalFlashHealCasts - this.wastedBuffFlashHealCasts - this.highOverhealFlashHealCasts
    );
  }

  get guideSubsection(): JSX.Element {
    if (!this.selectedCombatant.hasTalent(TALENTS.LIGHTWEAVER_TALENT)) {
      return <></>;
    }
    const explanation = (
      <p>
        <b>
          <SpellLink spell={TALENTS.LIGHTWEAVER_TALENT} />
        </b>{' '}
        is a strong buff that you should be playing around to buff your{' '}
        <SpellLink spell={TALENTS.PRAYER_OF_HEALING_TALENT} /> casts. Try not to overcap your{' '}
        <SpellLink spell={TALENTS.LIGHTWEAVER_TALENT} /> stacks to avoid wasting mana.
      </p>
    );

    const goodFlashHeals = {
      count: this.goodFlashHeals,
      label: 'Good Flash Heal Casts',
    };

    const highOverhealFlashHeals = {
      count: this.highOverhealFlashHealCasts,
      label: 'High‑overheal Flash Heal Casts',
    };

    const wastedBuffFlashHeals = {
      count: this.wastedBuffFlashHealCasts,
      label: 'Flash Heal casts with four stacks of Lightweaver already',
    };

    const data = (
      <div>
        <strong>
          <SpellLink spell={SPELLS.FLASH_HEAL} /> cast breakdown
        </strong>
        <small>
          {' '}
          – Green is a good cast. Yellow is a cast with very high overheal, and Red is a cast with
          four stacks of <SpellLink spell={TALENTS.LIGHTWEAVER_TALENT} /> already active.
        </small>
        <GradiatedPerformanceBar
          good={goodFlashHeals}
          ok={highOverhealFlashHeals}
          bad={wastedBuffFlashHeals}
        />
      </div>
    );

    return explanationAndDataSubsection(explanation, data, GUIDE_CORE_EXPLANATION_PERCENT);
  }

  statistic() {
    const overhealingTooltipString = formatPercentage(
      this.overhealingDoneFromTalent /
        (this.prayerHealing +
          this.trailHealing +
          this.bindingHealing +
          this.overhealingDoneFromTalent),
    );

    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            <div>{`${overhealingTooltipString}% overhealing`}</div>
            <div style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}>Breakdown:</div>
            <div>
              <SpellLink spell={TALENTS.LIGHTWEAVER_TALENT} />:{' '}
              <ItemPercentHealingDone amount={this.prayerHealing} />
            </div>
            <div>
              <SpellLink spell={SPELLS.ECHO_OF_LIGHT_MASTERY} />:{' '}
              <ItemPercentHealingDone amount={this.eolContrib} />
            </div>
            <div>
              <SpellLink spell={SPELLS.TRAIL_OF_LIGHT_TALENT_HEAL} />:{' '}
              <ItemPercentHealingDone amount={this.trailHealing} />
            </div>
            <div>
              <SpellLink spell={SPELLS.BINDING_HEALS_TALENT_HEAL} />:{' '}
              <ItemPercentHealingDone amount={this.bindingHealing} />
            </div>
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS.LIGHTWEAVER_TALENT}>
          <div>
            <ItemHealingDone amount={this.totalHealing} /> <small> from just the heal amp</small>
          </div>
          <div>
            <ItemHealingDone amount={this.totalHealing / LW_CAST_TIME_DECREASE} />{' '}
            <small> from both the heal amp and doing that healing in less time</small>
          </div>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Lightweaver;
