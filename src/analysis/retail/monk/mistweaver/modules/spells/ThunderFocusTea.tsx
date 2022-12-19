import { t } from '@lingui/macro';
import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import DonutChart from 'parser/ui/DonutChart';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { STATISTIC_ORDER } from 'parser/ui/StatisticsListBox';
import Haste from 'parser/shared/modules/Haste';
import { SPELL_COLORS } from '../../constants';

const debug = false;

//TODO clean up and make easier to add triggers
class ThunderFocusTea extends Analyzer {
  castsTftRsk: number = 0;
  castsTftViv: number = 0;
  castsTftEnm: number = 0;
  castsTftRem: number = 0;
  castsTftEF: number = 0;

  castsTft: number = 0;
  castsUnderTft: number = 0;

  correctCasts: number = 0;

  castBufferTimestamp: number = 0;
  ftActive: boolean = false;
  correctSpells: number[] = [];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.THUNDER_FOCUS_TEA_TALENT.id);
    const secretInfusionRank = this.selectedCombatant.getTalentRank(
      TALENTS_MONK.SECRET_INFUSION_TALENT.id,
    );
    switch (secretInfusionRank) {
      case 1: {
        Haste.HASTE_BUFFS[SPELLS.SECRET_INFUSION_HASTE_BUFF.id] = 0.08;
        break;
      }
      case 2: {
        Haste.HASTE_BUFFS[SPELLS.SECRET_INFUSION_HASTE_BUFF.id] = 0.15;
        break;
      }
      default: {
        Haste.HASTE_BUFFS[SPELLS.SECRET_INFUSION_HASTE_BUFF.id] = 0;
      }
    }
    this.ftActive = this.selectedCombatant.hasTalent(TALENTS_MONK.FOCUSED_THUNDER_TALENT.id);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_MONK.THUNDER_FOCUS_TEA_TALENT),
      this.tftCast,
    );
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.buffedCast);
    if (secretInfusionRank > 0) {
      this.correctSpells = [
        TALENTS_MONK.RENEWING_MIST_TALENT.id,
        TALENTS_MONK.ESSENCE_FONT_TALENT.id,
      ]; // only haste buff
    } else if (this.selectedCombatant.hasTalent(TALENTS_MONK.RISING_MIST_TALENT.id)) {
      this.correctSpells = [
        TALENTS_MONK.RISING_SUN_KICK_TALENT.id,
        TALENTS_MONK.RENEWING_MIST_TALENT.id,
      ];
    } else {
      this.correctSpells = [TALENTS_MONK.RENEWING_MIST_TALENT.id];
    }
  }

  get incorrectTftCasts() {
    return this.castsUnderTft - this.correctCasts;
  }

  get suggestionThresholds() {
    return {
      actual: this.incorrectTftCasts,
      isGreaterThan: {
        minor: 0,
        average: 1,
        major: 2,
      },
      style: ThresholdStyle.NUMBER,
    };
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
    } else if (TALENTS_MONK.ESSENCE_FONT_TALENT.id === spellId) {
      this.castsUnderTft += 1;
      this.castsTftEF += 1;
      debug && console.log('REM EF Check ', event.timestamp);
    }

    if (this.correctSpells.includes(spellId)) {
      this.correctCasts += 1;
    }
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
        color: SPELL_COLORS.ESSENCE_FONT,
        label: 'Essence Font',
        spellId: TALENTS_MONK.ESSENCE_FONT_TALENT.id,
        value: this.castsTftEF,
      },
    ];

    return <DonutChart items={items} />;
  }

  suggestions(when: When) {
    const elements = this.correctSpells.map((spell) => <SpellLink id={spell} key={spell} />);
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You are currently buffing spells other than{' '}
          {this.correctSpells.length === 1 ? elements[0] : [elements[0], ' and ', elements[1]]} with{' '}
          <SpellLink id={TALENTS_MONK.THUNDER_FOCUS_TEA_TALENT.id} />
        </>,
      )
        .icon(TALENTS_MONK.THUNDER_FOCUS_TEA_TALENT.icon)
        .actual(
          `${this.incorrectTftCasts} ${t({
            id: 'monk.mistweaver.suggestions.thunderFocusTea.incorrectCasts',
            message: `incorrect casts with Thunder Focus Tea`,
          })}`,
        )
        .recommended(`${recommended} incorrect casts is recommended`),
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
            <SpellLink id={TALENTS_MONK.THUNDER_FOCUS_TEA_TALENT.id} /> usage
          </label>
          {this.renderCastRatioChart()}
        </div>
      </Statistic>
    );
  }
}

export default ThunderFocusTea;
