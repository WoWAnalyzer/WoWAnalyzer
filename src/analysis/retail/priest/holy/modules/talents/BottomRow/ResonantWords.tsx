import SPELLS from 'common/SPELLS';
import TALENTS, { TALENTS_PRIEST } from 'common/TALENTS/priest';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, HealEvent } from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import TalentSpellText from 'parser/ui/TalentSpellText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { formatPercentage } from 'common/format';
import { calculateEffectiveHealing, calculateOverhealing } from 'parser/core/EventCalculateLib';
import {
  HEALING_MULTIPLIER_BY_RANK,
  HOLY_WORD_LIST,
  RESONANT_WORD_WHITELIST,
} from '../../../constants';
import EOLAttrib from '../../core/EchoOfLightAttributor';
import SpellLink from 'interface/SpellLink';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import GradiatedPerformanceBar from 'interface/guide/components/GradiatedPerformanceBar';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../../Guide';

// Example Log: /report/kVQd4LrBb9RW2h6K/9-Heroic+The+Primal+Council+-+Wipe+5+(5:04)/Delipriest/standard/statistics
class ResonantWords extends Analyzer {
  static dependencies = {
    eolAttrib: EOLAttrib,
  };
  protected eolAttrib!: EOLAttrib;
  eolContrib = 0;

  totalResonantWords = 0;
  usedResonantWords = 0;
  healingDoneFromTalent = 0;
  overhealingDoneFromTalent = 0;
  healingMultiplierWhenActive = 0;
  badConsumes = 0;
  goodConsumes = 0;

  talentRank = 0;

  get wastedResonantWords() {
    return this.totalResonantWords - this.usedResonantWords;
  }

  constructor(options: Options) {
    super(options);

    this.talentRank = this.selectedCombatant.getTalentRank(TALENTS.RESONANT_WORDS_TALENT);
    if (!this.talentRank) {
      this.active = false;
      return;
    }
    this.healingMultiplierWhenActive = HEALING_MULTIPLIER_BY_RANK[this.talentRank];

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(RESONANT_WORD_WHITELIST),
      this.onHeal,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(RESONANT_WORD_WHITELIST),
      this.onHealCast,
    );

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(HOLY_WORD_LIST),
      this.onHolyWordCast,
    );
  }

  onHeal(event: HealEvent) {
    if (this.selectedCombatant.hasBuff(SPELLS.RESONANT_WORDS_TALENT_BUFF.id)) {
      this.healingDoneFromTalent += calculateEffectiveHealing(
        event,
        this.healingMultiplierWhenActive,
      );
      this.overhealingDoneFromTalent += calculateOverhealing(
        event,
        this.healingMultiplierWhenActive,
      );
      this.eolContrib += this.eolAttrib.getEchoOfLightAmpAttrib(
        event,
        this.healingMultiplierWhenActive,
      );
    }
  }

  onHealCast(event: CastEvent) {
    if (this.selectedCombatant.hasBuff(SPELLS.RESONANT_WORDS_TALENT_BUFF.id)) {
      this.usedResonantWords += 1;
    }
    if (event.ability.guid === SPELLS.FLASH_HEAL.id) {
      if (!this.selectedCombatant.hasBuff(SPELLS.SURGE_OF_LIGHT_BUFF)) {
        this.badConsumes += 1;
      }
    } else if (event.ability.guid === SPELLS.GREATER_HEAL.id) {
      if (!this.selectedCombatant.hasBuff(SPELLS.LIGHTWEAVER_TALENT_BUFF)) {
        this.badConsumes += 1;
      }
    } else {
      this.goodConsumes += 1;
    }
  }

  onHolyWordCast() {
    this.totalResonantWords += 1;
  }

  get guideSubsection(): JSX.Element {
    // if player isn't running Resonant Words, don't show guide section
    if (!this.selectedCombatant.hasTalent(TALENTS.RESONANT_WORDS_TALENT)) {
      return <></>;
    }
    const explanation = (
      <p>
        <b>
          <SpellLink spell={TALENTS.RESONANT_WORDS_TALENT} />
        </b>{' '}
        is a strong buff that you should be playing around to buff your{' '}
        <SpellLink spell={SPELLS.GREATER_HEAL} /> and <SpellLink spell={SPELLS.FLASH_HEAL} /> casts.
        Focus on casting <SpellLink spell={SPELLS.GREATER_HEAL} /> with{' '}
        <SpellLink spell={SPELLS.LIGHTWEAVER_TALENT_BUFF} /> when it would consume{' '}
        <SpellLink spell={TALENTS.RESONANT_WORDS_TALENT} />, and{' '}
        <SpellLink spell={SPELLS.FLASH_HEAL} /> when it would consume{' '}
        <SpellLink spell={TALENTS.RESONANT_WORDS_TALENT} />.
      </p>
    );

    const goodHeals = {
      count: this.goodConsumes,
      label: 'Good Lightweaver-buffed Heals/Surge Of Light-buffed Flash Heals',
    };

    const badHeals = {
      count: this.badConsumes,
      label:
        'Bad Casts (Either your Heal was cast without Lightweaver, or your Flash Heal was cast without Surge of Light)',
    };

    const data = (
      <div>
        <strong>
          <SpellLink spell={SPELLS.GREATER_HEAL} /> cast breakdown
        </strong>
        <small>
          {' '}
          - Green is a good cast. Red is a cast without a{' '}
          <SpellLink spell={TALENTS.LIGHTWEAVER_TALENT} /> buff or a{' '}
          <SpellLink spell={SPELLS.SURGE_OF_LIGHT_BUFF} /> buff.
        </small>
        <GradiatedPerformanceBar good={goodHeals} bad={badHeals} />
      </div>
    );

    return explanationAndDataSubsection(explanation, data, GUIDE_CORE_EXPLANATION_PERCENT);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            {this.wastedResonantWords}/{this.totalResonantWords} wasted{' '}
            <SpellLink spell={TALENTS_PRIEST.RESONANT_WORDS_TALENT} /> buffs.
            <br />
            <div>Breakdown:</div>
            <div>
              <SpellLink spell={TALENTS_PRIEST.RESONANT_WORDS_TALENT} />:{' '}
              <ItemPercentHealingDone amount={this.healingDoneFromTalent}></ItemPercentHealingDone>{' '}
            </div>
            <div>
              <SpellLink spell={SPELLS.ECHO_OF_LIGHT_MASTERY} />:{' '}
              <ItemPercentHealingDone amount={this.eolContrib}></ItemPercentHealingDone>
            </div>
            <div>
              Notably this module currently is missing the contributions to{' '}
              <SpellLink spell={TALENTS_PRIEST.BINDING_HEALS_TALENT} /> and{' '}
              <SpellLink spell={TALENTS_PRIEST.TRAIL_OF_LIGHT_TALENT} />, which can undervalue it.
            </div>
          </>
        }
      >
        <TalentSpellText talent={TALENTS.RESONANT_WORDS_TALENT}>
          <ItemHealingDone amount={this.healingDoneFromTalent + this.eolContrib} />
          <br />
          {formatPercentage(
            this.overhealingDoneFromTalent /
              (this.healingDoneFromTalent + this.overhealingDoneFromTalent),
          )}
          % OH
        </TalentSpellText>
      </Statistic>
    );
  }
}
export default ResonantWords;
