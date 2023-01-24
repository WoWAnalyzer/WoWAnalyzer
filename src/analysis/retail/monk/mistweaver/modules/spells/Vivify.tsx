// Based on Clearcasting Implementation done by @Blazyb
import { t } from '@lingui/macro';
import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, HealEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import Statistic from 'parser/ui/Statistic';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { DANCING_MIST_CHANCE, RAPID_DIFFUSION_DURATION } from '../../constants';
import { isFromEssenceFont, isFromVivify } from '../../normalizers/CastLinkNormalizer';

const RAPID_DIFFUSION_SPELLS = [
  TALENTS_MONK.ENVELOPING_MIST_TALENT,
  TALENTS_MONK.RISING_SUN_KICK_TALENT,
];
const BASE_AVERAGE_REMS = 2.22;

class Vivify extends Analyzer {
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
    if (isFromVivify(event) && !isFromEssenceFont(event)) {
      this.gomHealing += (event.amount || 0) + (event.absorbed || 0);
      this.gomOverhealing += event.overheal || 0;
    }
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
        .actual(
          `${this.averageRemPerVivify.toFixed(2) + ' '}${t({
            id: 'monk.mistweaver.suggestions.vivify.renewingMistsPerVivify',
            message: ` Renewing Mists per Vivify`,
          })}`,
        )
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
}

export default Vivify;
