import { t } from '@lingui/macro';
import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
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
  rmActive: boolean = false;

  constructor(options: Options) {
    super(options);
    const secret_infusion_rank = this.selectedCombatant.getTalentRank(
      TALENTS_MONK.SECRET_INFUSION_TALENT.id,
    );
    switch (secret_infusion_rank) {
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
    this.rmActive = this.selectedCombatant.hasTalent(TALENTS_MONK.RISING_MIST_TALENT.id);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_MONK.THUNDER_FOCUS_TEA_TALENT),
      this.tftCast,
    );
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.buffedCast);
  }

  get incorrectTftCasts() {
    return this.castsUnderTft - this.correctCasts;
  }

  get suggestionThresholds() {
    return {
      actual: this.incorrectTftCasts,
      isGreaterThan: {
        minor: 1,
        average: 1.5,
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
    if (event.timestamp - this.castBufferTimestamp < 25) {
      return;
    }

    if (this.selectedCombatant.hasBuff(TALENTS_MONK.THUNDER_FOCUS_TEA_TALENT.id)) {
      if (
        SPELLS.VIVIFY.id === spellId &&
        !event.classResources?.find((resource) => resource.type === RESOURCE_TYPES.MANA.id)?.cost
      ) {
        this.castsUnderTft += 1;
        this.castsTftViv += 1;
        this.correctCasts += 1;
        debug && console.log('Viv TFT Check ', event.timestamp);
        this.castBufferTimestamp = event.timestamp;
      }
      if (TALENTS_MONK.RISING_SUN_KICK_TALENT.id === spellId) {
        this.castsUnderTft += 1;
        this.castsTftRsk += 1;

        if (this.rmActive) {
          this.correctCasts += 1;
        }

        debug && console.log('RSK TFT Check ', event.timestamp);
      }
      if (TALENTS_MONK.ENVELOPING_MIST_TALENT.id === spellId) {
        this.castsUnderTft += 1;
        this.castsTftEnm += 1;
        debug && console.log('Enm TFT Check ', event.timestamp);
      }
      if (TALENTS_MONK.RENEWING_MIST_TALENT.id === spellId) {
        this.castsUnderTft += 1;
        this.castsTftRem += 1;
        this.correctCasts += 1;
        debug && console.log('REM TFT Check ', event.timestamp);
      }
      if (TALENTS_MONK.ESSENCE_FONT_TALENT.id === spellId) {
        this.castsUnderTft += 1;
        this.castsTftEF += 1;
        this.correctCasts += 1;
        debug && console.log('REM EF Check ', event.timestamp);
      }
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
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You are currently using <SpellLink id={TALENTS_MONK.THUNDER_FOCUS_TEA_TALENT.id} /> to
          buff spells other than{' '}
          {this.rmActive ? (
            <SpellLink id={TALENTS_MONK.RISING_SUN_KICK_TALENT.id} />
          ) : (
            <SpellLink id={SPELLS.VIVIFY.id} />
          )}{' '}
          or <SpellLink id={TALENTS_MONK.RENEWING_MIST_TALENT.id} />. It is advised to limit the
          number of spells buffed to only these two.
        </>,
      )
        .icon(TALENTS_MONK.THUNDER_FOCUS_TEA_TALENT.icon)
        .actual(
          `${this.incorrectTftCasts}${t({
            id: 'monk.mistweaver.suggestions.thunderFocusTea.incorrectCasts',
            message: `incorrect casts with Thunder Focus Tea`,
          })}`,
        )
        .recommended(`<${recommended} incorrect cast is recommended`),
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
