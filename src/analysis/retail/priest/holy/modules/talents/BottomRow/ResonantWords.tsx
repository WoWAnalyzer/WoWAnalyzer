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
  okConsumes = 0;
  goodConsumes = 0;
  overcaps = 0;

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
    if (!this.selectedCombatant.hasBuff(SPELLS.RESONANT_WORDS_TALENT_BUFF.id)) {
      return;
    } else {
      this.usedResonantWords += 1; // For statistics
    }
    switch (event.ability.guid) {
      case SPELLS.FLASH_HEAL.id:
        if (this.selectedCombatant.hasBuff(SPELLS.SURGE_OF_LIGHT_BUFF.id)) {
          this.okConsumes += 1;
        } else {
          this.badConsumes += 1;
        }
        break;
      case SPELLS.GREATER_HEAL.id:
        if (this.selectedCombatant.hasBuff(SPELLS.LIGHTWEAVER_TALENT_BUFF.id)) {
          this.goodConsumes += 1;
        } else {
          this.badConsumes += 1;
        }
        break;
      case SPELLS.CIRCLE_OF_HEALING.id:
        this.okConsumes += 1;
        break;
      default:
        this.badConsumes += 1;
    }
  }

  onHolyWordCast() {
    this.totalResonantWords += 1;
    if (this.selectedCombatant.hasBuff(SPELLS.RESONANT_WORDS_TALENT_BUFF.id)) {
      // This isn't ideal, but the buff sometimes refreshes when applied for no reason so we can't listen for that
      this.overcaps += 1;
    }
  }

  get guideSubsection(): JSX.Element {
    // if player isn't running resonant words, don't show guide section
    if (!this.selectedCombatant.hasTalent(TALENTS.RESONANT_WORDS_TALENT)) {
      return <></>;
    }
    const explanation = (
      <p>
        <b>
          <SpellLink spell={TALENTS.RESONANT_WORDS_TALENT} />
        </b>{' '}
        is a strong buff that you should be playing around to buff your{' '}
        <SpellLink spell={SPELLS.GREATER_HEAL} /> casts. You want to always consume this buff with a{' '}
        <SpellLink spell={SPELLS.LIGHTWEAVER_TALENT_BUFF} />
        -buffed <SpellLink spell={SPELLS.GREATER_HEAL} /> cast. If you consume it with a{' '}
        <SpellLink spell={SPELLS.SURGE_OF_LIGHT_BUFF} />
        -buffed <SpellLink spell={SPELLS.FLASH_HEAL} /> or a{' '}
        <SpellLink spell={SPELLS.CIRCLE_OF_HEALING} /> that's ok as well.
        <li>
          <b>Above all else, you do not want to waste the buff by casting another Holy Word.</b>
        </li>
      </p>
    );

    const goodConsumes = {
      count: this.goodConsumes,
      label: 'Good Usages of Resonant Words',
    };

    const okConsumes = {
      count: this.okConsumes,
      label: 'OK Usages of Resonant Words',
    };

    const badConsumes = {
      count: this.badConsumes,
      label: 'Good Usages of Resonant Words',
    };

    const data = (
      <div>
        <strong>
          <SpellLink spell={SPELLS.GREATER_HEAL} /> cast breakdown
        </strong>
        <small>
          {' '}
          - Green is a <SpellLink spell={SPELLS.LIGHTWEAVER_TALENT_BUFF} />
          -buffed <SpellLink spell={SPELLS.GREATER_HEAL} />. Yellow is a{' '}
          <SpellLink spell={SPELLS.SURGE_OF_LIGHT_BUFF} />
          -buffed <SpellLink spell={SPELLS.FLASH_HEAL} /> or a{' '}
          <SpellLink spell={SPELLS.CIRCLE_OF_HEALING} />. Red is none of those things.
        </small>
        <GradiatedPerformanceBar good={goodConsumes} ok={okConsumes} bad={badConsumes} />

        <strong>
          Wasted uses of <SpellLink spell={TALENTS.RESONANT_WORDS_TALENT} />
        </strong>
        <small>
          {' '}
          - You wasted {this.wastedResonantWords} of {this.totalResonantWords} uses of{' '}
          <SpellLink spell={TALENTS.RESONANT_WORDS_TALENT} />
        </small>
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
