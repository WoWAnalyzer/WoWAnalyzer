import type { JSX } from 'react';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { HealEvent, CastEvent } from 'parser/core/Events';
import SPELLS from 'common/SPELLS/';
import { GoodColor } from 'interface/guide';
import TALENTS, { TALENTS_PRIEST } from 'common/TALENTS/priest';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { formatPercentage } from 'common/format';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import { SpellLink } from 'interface';
import { calculateEffectiveHealing, calculateOverhealing } from 'parser/core/EventCalculateLib';
import {
  getBindingFromHeal,
  getHeal,
  getTrailFromHeal,
} from '../../../normalizers/CastLinkNormalizer';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../../Guide';
import GradiatedPerformanceBar from 'interface/guide/components/GradiatedPerformanceBar';
import { LW_CAST_TIME_DECREASE, LW_HEALING_BONUS, LW_OVERHEAL_THRESHOLD } from '../../../constants';
import EOLAttrib from '../../core/EchoOfLightAttributor';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';

type HealingSources = 'trailHealing' | 'bindingHealing' | 'healHealing';

class Lightweaver extends Analyzer {
  static dependencies = {
    eolAttrib: EOLAttrib,
  };
  protected eolAttrib!: EOLAttrib;

  overhealingDoneFromTalent = 0;

  totalHealCasts = 0;
  unbuffedHealCasts = 0;
  highOverhealHealCasts = 0;

  totalFlashHealCasts = 0;
  wastedBuffFlashHealCasts = 0;
  highOverhealFlashHealCasts = 0;

  trailHealing = 0;
  bindingHealing = 0;
  healHealing = 0;

  eolContrib = 0;

  get totalHealing() {
    return this.healHealing + this.eolContrib + this.trailHealing + this.bindingHealing;
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

  private calculateHealing(healEvent: HealEvent, castEvent: CastEvent) {
    const events: [HealingSources, HealEvent | undefined][] = [
      ['trailHealing', getTrailFromHeal(castEvent)],
      ['bindingHealing', getBindingFromHeal(castEvent)],
      ['healHealing', healEvent],
    ];

    //iterate through each source of lightweaver healing. (trail, binding, heal)
    events.forEach(([key, event]) => {
      if (event) {
        this[key] += calculateEffectiveHealing(event, LW_HEALING_BONUS);
        this.eolContrib += this.eolAttrib.getEchoOfLightAmpAttrib(event, LW_HEALING_BONUS);
        this.overhealingDoneFromTalent += calculateOverhealing(event, LW_HEALING_BONUS);
      }
    });
  }

  onHealCast(event: CastEvent) {
    // linked heal event exists
    const healEvent = getHeal(event);
    if (!healEvent) {
      return;
    }

    this.totalHealCasts += 1;

    if (!this.selectedCombatant.hasBuff(SPELLS.LIGHTWEAVER_TALENT_BUFF)) {
      this.unbuffedHealCasts += 1;
      // return early so we are not counting unbuffed heals for high overheal count
      return;
    }

    this.calculateHealing(healEvent, event);

    if (this.isHighOverheal(healEvent)) {
      this.highOverhealHealCasts += 1;
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
        <SpellLink spell={TALENTS.PRAYER_OF_HEALING_TALENT} /> casts.
      </p>
    );

    const goodHeals = {
      count: this.goodHeals,
      label: 'Good Heal Casts',
    };

    const highOverhealHealCasts = {
      count: this.highOverhealHealCasts,
      label: 'High-overheal Buffed Prayer of Healing Casts',
    };

    const unbuffedHealCasts = {
      count: this.unbuffedHealCasts,
      label: 'Prayer of Healing casts with no Lightweaver Buff',
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
      label: 'Flash Heal casts with four stacks of Lightweaver already',
    };

    const data = (
      <div>
        <strong>
          <SpellLink spell={TALENTS.PRAYER_OF_HEALING_TALENT} /> cast breakdown
        </strong>
        <small>
          <ul>
            <li>
              <span style={{ color: GoodColor }}>Green</span> is a good cast, where
              <SpellLink spell={TALENTS_PRIEST.LIGHTWEAVER_TALENT} /> is applied.
            </li>
          </ul>
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
          four stacks of <SpellLink spell={TALENTS.LIGHTWEAVER_TALENT} /> already active.
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
        (this.healHealing +
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
            {/* oxlint-disable-next-line @wowanalyzer/no-br */}
            {`${overhealingTooltipString}% overhealing`} <br />
            {/* oxlint-disable-next-line @wowanalyzer/no-br */}
            <br />
            <div>Breakdown:</div>
            <div>
              <SpellLink spell={TALENTS_PRIEST.LIGHTWEAVER_TALENT} />:{' '}
              <ItemPercentHealingDone amount={this.healHealing} />{' '}
            </div>
            <div>
              <SpellLink spell={SPELLS.ECHO_OF_LIGHT_MASTERY} />:{' '}
              {/* oxlint-disable-next-line @wowanalyzer/no-br */}
              <ItemPercentHealingDone amount={this.eolContrib} /> <br />
            </div>
            <div>
              <SpellLink spell={SPELLS.TRAIL_OF_LIGHT_TALENT_HEAL} />:{' '}
              {/* oxlint-disable-next-line @wowanalyzer/no-br */}
              <ItemPercentHealingDone amount={this.trailHealing} /> <br />
            </div>
            <div>
              <SpellLink spell={SPELLS.BINDING_HEALS_TALENT_HEAL} />:{' '}
              {/* oxlint-disable-next-line @wowanalyzer/no-br */}
              <ItemPercentHealingDone amount={this.bindingHealing} /> <br />
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
