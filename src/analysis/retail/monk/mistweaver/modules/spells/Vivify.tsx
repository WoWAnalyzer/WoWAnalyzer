// Based on Clearcasting Implementation done by @Blazyb
import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import HIT_TYPES from 'game/HIT_TYPES';
import { SpellLink } from 'interface';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { BoxRowEntry, PerformanceBoxRow } from 'interface/guide/components/PerformanceBoxRow';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, HealEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import Statistic from 'parser/ui/Statistic';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { DANCING_MIST_CHANCE, RAPID_DIFFUSION_DURATION } from '../../constants';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../Guide';
import { getVivifiesPerCast, isFromVivify } from '../../normalizers/CastLinkNormalizer';
import UpliftedSpirits from './UpliftedSpirits';

const RAPID_DIFFUSION_SPELLS = [
  TALENTS_MONK.ENVELOPING_MIST_TALENT,
  TALENTS_MONK.RISING_SUN_KICK_TALENT,
];
const BASE_AVERAGE_REMS = 2.22;

class Vivify extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    upliftedSpirits: UpliftedSpirits,
  };

  protected spellUsable!: SpellUsable;
  protected upliftedSpirits!: UpliftedSpirits;
  casts: number = 0;

  mainTargetHitsToCount: number = 0;
  mainTargetHealing: number = 0;
  mainTargetOverhealing: number = 0;

  cleaveHits: number = 0;
  cleaveHealing: number = 0;
  cleaveOverhealing: number = 0;

  gomHealing: number = 0;
  gomOverhealing: number = 0;
  lastCastTarget: number = 0;

  expectedAverageReMs: number = 0;
  rdCasts: number = 0;

  risingMistActive: boolean;
  dancingMistActive: boolean;
  rapidDiffusionActive: boolean;

  castEntries: BoxRowEntry[] = [];

  constructor(options: Options) {
    super(options);
    this.risingMistActive = this.selectedCombatant.hasTalent(TALENTS_MONK.RISING_MIST_TALENT);
    this.dancingMistActive = this.selectedCombatant.hasTalent(TALENTS_MONK.DANCING_MISTS_TALENT);
    this.rapidDiffusionActive = this.selectedCombatant.hasTalent(
      TALENTS_MONK.RAPID_DIFFUSION_TALENT,
    );
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.VIVIFY), this.vivCast);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(RAPID_DIFFUSION_SPELLS),
      this.rapidDiffusionReMs,
    );
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.VIVIFY), this.handleViv);
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.GUSTS_OF_MISTS),
      this.handleMastery,
    );
  }

  get averageRemPerVivify() {
    return this.cleaveHits / this.casts || 0;
  }

  get suggestionThresholds() {
    return {
      actual: this.casts > 0 ? this.averageRemPerVivify : 0,
      isLessThan: {
        minor: this.casts > 0 ? this.estimatedAverageReMs : 0,
        average: this.casts > 0 ? this.estimatedAverageReMs - 0.5 : 0,
        major: this.casts > 0 ? this.estimatedAverageReMs - 1 : 0,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  get estimatedAverageReMs() {
    if (this.risingMistActive) {
      this.expectedAverageReMs = BASE_AVERAGE_REMS * 2;
    } else {
      this.expectedAverageReMs = BASE_AVERAGE_REMS;
    }
    if (this.dancingMistActive) {
      this.expectedAverageReMs += this.averageReMsFromDancingMist;
    }
    if (this.rapidDiffusionActive) {
      this.expectedAverageReMs += this.averageReMsFromRapidDiffusion;
    }
    return this.expectedAverageReMs;
  }

  get averageReMsFromRapidDiffusion() {
    const fightLengthSec = this.owner.fightDuration;
    return (
      (RAPID_DIFFUSION_DURATION *
        this.selectedCombatant.getTalentRank(TALENTS_MONK.RAPID_DIFFUSION_TALENT)) /
      (fightLengthSec / this.rdCasts)
    );
  }

  get averageReMsFromDancingMist() {
    return (
      this.expectedAverageReMs *
      (DANCING_MIST_CHANCE *
        this.selectedCombatant.getTalentRank(TALENTS_MONK.DANCING_MISTS_TALENT))
    );
  }

  rapidDiffusionReMs(event: CastEvent) {
    this.rdCasts += 1;
  }

  vivCast(event: CastEvent) {
    this.casts += 1;
    this.mainTargetHitsToCount += 1;
    this.lastCastTarget = event.targetID || 0;
    this._tallyCastEntry(event);
  }

  handleViv(event: HealEvent) {
    if (this.lastCastTarget === event.targetID && this.mainTargetHitsToCount > 0) {
      this.mainTargetHealing += event.amount + (event.absorbed || 0);
      this.mainTargetOverhealing += event.overheal || 0;
      this.mainTargetHitsToCount -= 1;
    } else {
      this.cleaveHealing += event.amount + (event.absorbed || 0);
      this.cleaveOverhealing += event.overheal || 0;
      this.cleaveHits += 1;
    }
  }

  handleMastery(event: HealEvent) {
    if (isFromVivify(event)) {
      this.gomHealing += (event.amount || 0) + (event.absorbed || 0);
      this.gomOverhealing += event.overheal || 0;
    }
  }

  get guideSubsection(): JSX.Element {
    const styleObj = {
      fontSize: 20,
    };
    const styleObjInner = {
      fontSize: 15,
    };
    const explanation = (
      <p>
        <SpellLink id={SPELLS.VIVIFY} /> quickly becomes your best healing spell when you have high
        counts of <SpellLink id={TALENTS_MONK.RENEWING_MIST_TALENT} /> out on the raid via{' '}
        <SpellLink id={TALENTS_MONK.INVIGORATING_MISTS_TALENT} />, and will be a major portion of
        your healing when used correctly. <SpellLink id={SPELLS.VIVIFY} />
        's effectiveness goes hand in hand with your{' '}
        <SpellLink id={TALENTS_MONK.RENEWING_MIST_TALENT} /> count - the more you have out at a
        given time, the more healing and better mana efficiency this spell has. This further
        emphasizes the importance of casting your rotational abilities in{' '}
        <SpellLink id={TALENTS_MONK.RISING_SUN_KICK_TALENT} /> and{' '}
        <SpellLink id={TALENTS_MONK.RENEWING_MIST_TALENT} /> as often as possible.
      </p>
    );
    const data = (
      <div>
        <RoundedPanel>
          <div>
            <strong>
              <SpellLink id={SPELLS.VIVIFY} /> casts
            </strong>{' '}
            <small>
              {' '}
              - Blue is a perfect cast with 10 or more{' '}
              <SpellLink id={TALENTS_MONK.RENEWING_MIST_TALENT} /> HoTs out, Green is a good cast
              with 8 or more, Yellow is an ok cast at or above your expected average, and Red is a
              bad cast at low renewing mist count. Mouseover to see the count for each cast.
            </small>
            <PerformanceBoxRow values={this.castEntries} />
          </div>
          <div style={styleObj}>
            <small style={styleObjInner}>
              <SpellLink id={TALENTS_MONK.INVIGORATING_MISTS_TALENT} /> -{' '}
            </small>
            <strong>{this.averageRemPerVivify.toFixed(1)}</strong>{' '}
            <small>
              average cleaves per <SpellLink id={SPELLS.VIVIFY} />
            </small>
          </div>
        </RoundedPanel>
      </div>
    );

    return explanationAndDataSubsection(explanation, data, GUIDE_CORE_EXPLANATION_PERCENT);
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You are casting <SpellLink id={SPELLS.VIVIFY.id} /> with low counts of{' '}
          <SpellLink id={TALENTS_MONK.RENEWING_MIST_TALENT.id} /> out on the raid. To ensure you are
          gaining the maximum <SpellLink id={SPELLS.VIVIFY.id} /> healing, keep{' '}
          <SpellLink id={TALENTS_MONK.RENEWING_MIST_TALENT.id} /> on cooldown.
        </>,
      )
        .icon(SPELLS.VIVIFY.icon)
        .actual(`${this.averageRemPerVivify.toFixed(2) + ' '} Renewing Mists per Vivify`)
        .recommended(`${recommended.toFixed(2)} Renewing Mists are recommended per Vivify`),
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(20)}
        size="flexible"
        tooltip={
          <>
            Healing Breakdown:
            <ul>
              <li>
                {formatNumber(this.mainTargetHealing + this.cleaveHealing)} overall healing from
                <SpellLink id={SPELLS.VIVIFY.id} />.
              </li>
              <li>
                {formatNumber(this.cleaveHealing)} portion of your{' '}
                <SpellLink id={SPELLS.VIVIFY.id} /> healing to{' '}
                <SpellLink id={TALENTS_MONK.RENEWING_MIST_TALENT.id} /> targets.
              </li>
            </ul>
          </>
        }
      >
        <TalentSpellText talent={TALENTS_MONK.RENEWING_MIST_TALENT}>
          <>
            {this.averageRemPerVivify.toFixed(2)}{' '}
            <small>
              Average Cleaves per <SpellLink id={SPELLS.VIVIFY.id} />
            </small>
          </>
        </TalentSpellText>
      </Statistic>
    );
  }

  private _tallyCastEntry(event: CastEvent) {
    const vivifyHits = getVivifiesPerCast(event) as HealEvent[];
    let vivifyGoodCrits = 0;
    let vivifyWastedCrits = 0;
    if (this.upliftedSpirits.active) {
      vivifyHits.forEach((event) => {
        if (event.hitType === HIT_TYPES.CRIT) {
          if (this.spellUsable.isOnCooldown(this.upliftedSpirits.activeTalent.id)) {
            vivifyGoodCrits += 1;
          } else {
            vivifyWastedCrits += 1;
          }
        }
      });
    }
    const rems = vivifyHits.length - 1;
    let value = QualitativePerformance.Fail;
    if (rems >= 10) {
      value = QualitativePerformance.Perfect;
    } else if (rems >= 8) {
      value = QualitativePerformance.Good;
    } else if (rems >= 6) {
      value = QualitativePerformance.Ok;
    }

    const tooltip = (
      <>
        @ <strong>{this.owner.formatTimestamp(event.timestamp)}</strong>, ReMs:{' '}
        <strong>{rems}</strong>
        <br />
        {this.upliftedSpirits.active && (
          <>
            <SpellLink id={this.upliftedSpirits.activeTalent.id} /> Cooldown Reduction:{' '}
            {vivifyGoodCrits > 0 && <>{vivifyGoodCrits}s </>}
            {vivifyWastedCrits > 0 && <>{vivifyWastedCrits}s wasted</>}
            {vivifyGoodCrits + vivifyWastedCrits === 0 && <>0s</>}
          </>
        )}
      </>
    );
    this.castEntries.push({ value, tooltip });
  }
}

export default Vivify;
