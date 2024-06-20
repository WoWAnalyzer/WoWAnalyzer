import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import DonutChart from 'parser/ui/DonutChart';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { STATISTIC_ORDER } from 'parser/ui/StatisticsListBox';
import Haste from 'parser/shared/modules/Haste';
import { SPELL_COLORS, THUNDER_FOCUS_TEA_SPELLS } from '../../constants';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { GapHighlight } from 'parser/ui/CooldownBar';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../Guide';
import { BoxRowEntry, PerformanceBoxRow } from 'interface/guide/components/PerformanceBoxRow';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { Arrow } from 'interface/icons';

const debug = false;

//TODO clean up and make easier to add triggers
class ThunderFocusTea extends Analyzer {
  static dependencies = {
    haste: Haste,
  };

  protected haste!: Haste;

  castEntries: BoxRowEntry[] = [];
  castsTftRsk: number = 0;
  castsTftViv: number = 0;
  castsTftEnm: number = 0;
  castsTftRem: number = 0;
  castsTftEh: number = 0;
  //add EH

  castsTft: number = 0;
  castsUnderTft: number = 0;

  correctCasts: number = 0;

  castBufferTimestamp: number = 0;
  ftActive: boolean = false;
  correctCapstoneSpells: number[] = [];
  okCapstoneSpells: number[] = [];

  constructor(options: Options) {
    super(options);
    this.haste = options.haste as Haste;
    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.THUNDER_FOCUS_TEA_TALENT);
    const secretInfusionRank = this.selectedCombatant.getTalentRank(
      TALENTS_MONK.SECRET_INFUSION_TALENT,
    );
    switch (secretInfusionRank) {
      case 1: {
        this.haste.addHasteBuff(SPELLS.SECRET_INFUSION_HASTE_BUFF.id, 0.08);
        break;
      }
      case 2: {
        this.haste.addHasteBuff(SPELLS.SECRET_INFUSION_HASTE_BUFF.id, 0.15);
        break;
      }
      default: {
        this.haste.addHasteBuff(SPELLS.SECRET_INFUSION_HASTE_BUFF.id, 0);
      }
    }
    this.ftActive = this.selectedCombatant.hasTalent(TALENTS_MONK.FOCUSED_THUNDER_TALENT);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_MONK.THUNDER_FOCUS_TEA_TALENT),
      this.tftCast,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(THUNDER_FOCUS_TEA_SPELLS),
      this.buffedCast,
    );
    if (this.selectedCombatant.hasTalent(TALENTS_MONK.RISING_MIST_TALENT)) {
      this.correctCapstoneSpells = [TALENTS_MONK.RENEWING_MIST_TALENT.id];
      this.okCapstoneSpells = [TALENTS_MONK.RISING_SUN_KICK_TALENT.id];
    } else if (this.selectedCombatant.hasTalent(TALENTS_MONK.TEAR_OF_MORNING_TALENT)) {
      this.correctCapstoneSpells = [
        TALENTS_MONK.ENVELOPING_MIST_TALENT.id,
        TALENTS_MONK.RENEWING_MIST_TALENT.id,
      ];
      this.okCapstoneSpells = [
        TALENTS_MONK.ENVELOPING_MIST_TALENT.id,
        TALENTS_MONK.RENEWING_MIST_TALENT.id,
      ];
    } else {
      this.correctCapstoneSpells = [TALENTS_MONK.RENEWING_MIST_TALENT.id];
    }
  }

  get incorrectTftCasts() {
    return this.castsUnderTft - this.correctCasts;
  }

  isCorrect(event: CastEvent, isFTCast: boolean, isOk: boolean): boolean {
    const spellId: number = event.ability.guid;
    const spellMap = isOk ? this.okCapstoneSpells : this.correctCapstoneSpells;
    debug && console.log('Checking for correctness', spellId, isFTCast, isOk);
    if (isFTCast) {
      if (this.selectedCombatant.hasTalent(TALENTS_MONK.SECRET_INFUSION_TALENT)) {
        return spellMap.includes(spellId);
      } else {
        return this.isCorrect(event, false /* isFTCast */, isOk); // same as 1st spell logic
      }
    } else if (this.selectedCombatant.hasTalent(TALENTS_MONK.SECRET_INFUSION_TALENT)) {
      return isOk && this.selectedCombatant.hasTalent(TALENTS_MONK.TEAR_OF_MORNING_TALENT)
        ? spellId === TALENTS_MONK.ENVELOPING_MIST_TALENT.id
        : spellId === TALENTS_MONK.RENEWING_MIST_TALENT.id;
    } else {
      return spellMap.includes(spellId);
    }
  }

  tftCast(event: CastEvent) {
    this.castsTft += this.ftActive ? 2 : 1;
  }

  buffedCast(event: CastEvent) {
    const spellId: number = event.ability.guid;

    // Implemented as a way to remove non-buffed REM casts that occur at the same timestamp as the buffed Viv cast.
    // Need to think of cleaner solution
    if (
      event.timestamp - this.castBufferTimestamp < 25 ||
      !this.selectedCombatant.hasBuff(TALENTS_MONK.THUNDER_FOCUS_TEA_TALENT.id)
    ) {
      return;
    }

    if (SPELLS.VIVIFY.id === spellId) {
      this.castsUnderTft += 1;
      this.castsTftViv += 1;
      debug && console.log('Viv TFT Check ', event.timestamp);
      this.castBufferTimestamp = event.timestamp;
    } else if (TALENTS_MONK.RISING_SUN_KICK_TALENT.id === spellId) {
      this.castsUnderTft += 1;
      this.castsTftRsk += 1;
      debug && console.log('RSK TFT Check ', event.timestamp);
    } else if (TALENTS_MONK.ENVELOPING_MIST_TALENT.id === spellId) {
      this.castsUnderTft += 1;
      this.castsTftEnm += 1;
      debug && console.log('Enm TFT Check ', event.timestamp);
    } else if (TALENTS_MONK.RENEWING_MIST_TALENT.id === spellId) {
      this.castsUnderTft += 1;
      this.castsTftRem += 1;
      debug && console.log('REM TFT Check ', event.timestamp);
    } else if (SPELLS.EXPEL_HARM.id === spellId) {
      this.castsUnderTft += 1;
      this.castsTftEh += 1;
      debug && console.log('EH TFT Check ', event.timestamp);
    } else {
      return;
    }
    let tooltip = null;
    let value = null;
    const isFTCast = this.ftActive && this.castsUnderTft % 2 === 0;
    if (this.isCorrect(event, isFTCast, false /* isOk */)) {
      value = QualitativePerformance.Good;
      tooltip = (
        <>
          Correct cast: buffed <SpellLink spell={spellId} />
        </>
      );
      this.correctCasts += 1;
    } else if (this.isCorrect(event, isFTCast, true /* isOk */)) {
      value = QualitativePerformance.Ok;
      tooltip = (
        <>
          Ok cast: buffed <SpellLink spell={spellId} />
        </>
      );
    } else {
      value = QualitativePerformance.Fail;
      tooltip = (
        <>
          Incorrect cast: buffed <SpellLink spell={spellId} />
        </>
      );
    }
    this.castEntries.push({ value, tooltip });
  }

  renderCastRatioChart() {
    const items = [
      {
        color: SPELL_COLORS.VIVIFY,
        label: 'Vivify',
        spellId: SPELLS.VIVIFY.id,
        value: this.castsTftViv,
      },
      {
        color: SPELL_COLORS.RENEWING_MIST,
        label: 'Renewing Mist',
        spellId: TALENTS_MONK.RENEWING_MIST_TALENT.id,
        value: this.castsTftRem,
      },
      {
        color: SPELL_COLORS.ENVELOPING_MIST,
        label: 'Enveloping Mists',
        spellId: TALENTS_MONK.ENVELOPING_MIST_TALENT.id,
        value: this.castsTftEnm,
      },
      {
        color: SPELL_COLORS.RISING_SUN_KICK,
        label: 'Rising Sun Kick',
        spellId: TALENTS_MONK.RISING_SUN_KICK_TALENT.id,
        value: this.castsTftRsk,
      },
      {
        color: SPELL_COLORS.EXPEL_HARM,
        label: 'Expel Harm',
        spellId: SPELLS.EXPEL_HARM.id,
        value: this.castsTftEh,
      },
    ];

    return <DonutChart items={items} />;
  }

  /** Guide subsection describing the proper usage of TFT */
  get guideSubsection(): JSX.Element {
    const explanation = (
      <p>
        <b>
          <SpellLink spell={TALENTS_MONK.THUNDER_FOCUS_TEA_TALENT} />
        </b>{' '}
        is an important spell used to empower other abilities. It should be used on cooldown at all
        times and the spell that you use it on depends on your talent selection, in general try to
        adhere to the following priority list
        <ol>
          <li>
            {' '}
            <SpellLink spell={TALENTS_MONK.SECRET_INFUSION_TALENT} /> talented <Arrow /> use on{' '}
            <SpellLink spell={TALENTS_MONK.RENEWING_MIST_TALENT} />
          </li>
          <li>
            {' '}
            <SpellLink spell={TALENTS_MONK.RISING_MIST_TALENT} /> talented <Arrow /> use on{' '}
            <SpellLink spell={TALENTS_MONK.RENEWING_MIST_TALENT} /> (
            <span style={{ color: 'green' }}>best</span>) or{' '}
            <SpellLink spell={TALENTS_MONK.RISING_SUN_KICK_TALENT} /> (
            <span style={{ color: 'yellow' }}>ok</span>)
          </li>
          <li>
            {' '}
            <SpellLink spell={TALENTS_MONK.TEAR_OF_MORNING_TALENT} /> talented <Arrow /> use on{' '}
            <SpellLink spell={TALENTS_MONK.ENVELOPING_MIST_TALENT} /> (
            <span style={{ color: 'green' }}>best</span>) or{' '}
            <SpellLink spell={TALENTS_MONK.RENEWING_MIST_TALENT} /> (
            <span style={{ color: 'yellow' }}>ok</span>)
          </li>
        </ol>
        If talented into <SpellLink spell={TALENTS_MONK.FOCUSED_THUNDER_TALENT} />, the priority
        slightly changes for the 2nd buffed cast depending on talents
        <ol>
          <li>
            {' '}
            <SpellLink spell={TALENTS_MONK.SECRET_INFUSION_TALENT} /> talented
          </li>
          <ul>
            <li>
              <SpellLink spell={TALENTS_MONK.TEAR_OF_MORNING_TALENT} /> talented <Arrow /> use on{' '}
              <SpellLink spell={TALENTS_MONK.ENVELOPING_MIST_TALENT} /> (
              <span style={{ color: 'green' }}>best</span>) or{' '}
              <SpellLink spell={TALENTS_MONK.RENEWING_MIST_TALENT} /> (
              <span style={{ color: 'yellow' }}>ok</span>)
            </li>
            <li>
              <SpellLink spell={TALENTS_MONK.RISING_MIST_TALENT} /> talented <Arrow /> use on{' '}
              <SpellLink spell={TALENTS_MONK.RENEWING_MIST_TALENT} /> (
              <span style={{ color: 'green' }}>best</span>) or{' '}
              <SpellLink spell={TALENTS_MONK.RISING_SUN_KICK_TALENT} /> (
              <span style={{ color: 'yellow' }}>ok</span>)
            </li>
          </ul>
          <li>
            {' '}
            <SpellLink spell={TALENTS_MONK.SECRET_INFUSION_TALENT} /> not talented <Arrow /> same
            spell as first buffed cast
          </li>
        </ol>
      </p>
    );
    const data = (
      <div>
        <RoundedPanel>
          <strong>
            <SpellLink spell={TALENTS_MONK.THUNDER_FOCUS_TEA_TALENT} /> cast efficiency
          </strong>
          <div>
            {this.subStatistic()} <br />
            <strong>Casts </strong>
            <small>
              - Green indicates a correct{' '}
              <SpellLink spell={TALENTS_MONK.THUNDER_FOCUS_TEA_TALENT} /> cast, while red indicates
              an incorrect cast.
            </small>
            <PerformanceBoxRow values={this.castEntries} />
          </div>
        </RoundedPanel>
      </div>
    );

    return explanationAndDataSubsection(explanation, data, GUIDE_CORE_EXPLANATION_PERCENT);
  }

  /** Guide subsection describing the proper usage of Rejuvenation */
  subStatistic() {
    return (
      <CastEfficiencyBar
        spell={TALENTS_MONK.THUNDER_FOCUS_TEA_TALENT}
        gapHighlightMode={GapHighlight.FullCooldown}
        minimizeIcons
        useThresholds
      />
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(23)}
        size="flexible"
        category={STATISTIC_CATEGORY.GENERAL}
      >
        <div className="pad">
          <label>
            <SpellLink spell={TALENTS_MONK.THUNDER_FOCUS_TEA_TALENT} /> usage
          </label>
          {this.renderCastRatioChart()}
        </div>
      </Statistic>
    );
  }
}

export default ThunderFocusTea;
