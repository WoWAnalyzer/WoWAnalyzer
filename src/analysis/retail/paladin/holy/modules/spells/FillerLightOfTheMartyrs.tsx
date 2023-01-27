import { t, Trans } from '@lingui/macro';
import TALENTS from 'common/TALENTS/paladin';
import { SpellLink } from 'interface';
import { TooltipElement } from 'interface';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import SpellUsable from 'parser/shared/modules/SpellUsable';

/** @type {number} (ms) When Holy Shock has less than this as cooldown remaining you should wait and still not cast that filler FoL. */
const HOLY_SHOCK_COOLDOWN_WAIT_TIME = 200;

class FillerLightOfTheMartyrs extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };
  protected spellUsable!: SpellUsable;

  constructor(options: Options) {
    super(options);
    this.active = !this.selectedCombatant.hasTalent(TALENTS.MARAADS_DYING_BREATH_TALENT);
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.LIGHT_OF_THE_MARTYR_TALENT),
      this.handleCast,
    );
  }

  protected casts = 0;
  protected inefficientCasts: CastEvent[] = [];
  handleCast(event: CastEvent) {
    this.casts += 1;

    const hasHolyShockAvailable = this.spellUsable.isAvailable(TALENTS.HOLY_SHOCK_TALENT.id);
    if (!hasHolyShockAvailable) {
      // We can't cast it, but check how long until it comes off cooldown. We should wait instead of casting a filler if it becomes available really soon.
      const cooldownRemaining = this.spellUsable.cooldownRemaining(TALENTS.HOLY_SHOCK_TALENT.id);
      if (cooldownRemaining > HOLY_SHOCK_COOLDOWN_WAIT_TIME) {
        return;
      }
    }
    this.inefficientCasts.push(event);
    event.meta = event.meta || {};
    event.meta.isInefficientCast = true;
    event.meta.inefficientCastReason = t({
      id: 'paladin.holy.modules.fillerLightOfTheMatyrs.holyShockWasAvailable',
      message: `Holy Shock was available and should have been cast instead as it is a much more efficient spell.`,
    });
  }

  get cpm() {
    return (this.casts / (this.owner.fightDuration / 1000)) * 60;
  }
  get inefficientCpm() {
    return (this.inefficientCasts.length / (this.owner.fightDuration / 1000)) * 60;
  }

  get cpmSuggestionThresholds() {
    return {
      actual: this.cpm,
      isGreaterThan: {
        minor: 1.5,
        average: 2,
        major: 3,
      },
      style: ThresholdStyle.NUMBER,
    };
  }
  get inefficientCpmSuggestionThresholds() {
    return {
      actual: this.inefficientCpm,
      isGreaterThan: {
        minor: 0,
        average: 0.25,
        major: 0.5,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  suggestions(when: When) {
    when(this.cpmSuggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <Trans id="paladin.holy.modules.fillerLightOfTheMatyrs.suggestion">
          You cast many <SpellLink id={TALENTS.LIGHT_OF_THE_MARTYR_TALENT} />
          s. Light of the Martyr is an inefficient spell to cast, try to only cast Light of the
          Martyr when it will save someone's life or when moving and all other instant cast spells
          are on cooldown.
        </Trans>,
      )
        .icon(TALENTS.LIGHT_OF_THE_MARTYR_TALENT.icon)
        .actual(
          <Trans id="paladin.holy.modules.fillerLightOfTheMatyrs.actual">
            {this.cpm.toFixed(2)} casts per minute - {this.casts} casts total
          </Trans>,
        )
        .recommended(
          <Trans id="paladin.holy.modules.fillerLightOfTheMatyrs.recommended">
            &lt;{recommended} casts per minute is recommended
          </Trans>,
        ),
    );

    when(this.inefficientCpmSuggestionThresholds).addSuggestion((suggest, actual) =>
      suggest(
        <Trans id="paladin.holy.modules.fillerLightOfTheMatyrs.inefficientSuggestion">
          You cast {this.inefficientCasts.length}{' '}
          <SpellLink id={TALENTS.LIGHT_OF_THE_MARTYR_TALENT} />s while{' '}
          <SpellLink id={TALENTS.HOLY_SHOCK_TALENT} /> was{' '}
          <TooltipElement
            content={t({
              id: 'paladin.holy.modules.fillerLightOfTheMatyrs.inefficientSuggestion.availableWithin',
              message: `It was either already available or going to be available within ${HOLY_SHOCK_COOLDOWN_WAIT_TIME}ms.`,
            })}
          >
            available
          </TooltipElement>{' '}
          (at{' '}
          {this.inefficientCasts
            .map((event) => this.owner.formatTimestamp(event.timestamp))
            .join(', ')}
          ). Try to <b>never</b> cast <SpellLink id={TALENTS.LIGHT_OF_THE_MARTYR_TALENT} /> when
          something else is available
          <TooltipElement
            content={t({
              id: 'paladin.holy.modules.fillerLightOfTheMatyrs.inefficientSuggestion.exceptions',
              message: `There are very rare exceptions to this. For example it may be worth saving Holy Shock when you know you're going to be moving soon and you may have to heal yourself.`,
            })}
          >
            *
          </TooltipElement>
          .
        </Trans>,
      )
        .icon(TALENTS.LIGHT_OF_THE_MARTYR_TALENT.icon)
        .actual(
          <Trans id="paladin.holy.modules.fillerLightOfTheMatyrs.inefficientSuggestion.actual">
            {this.inefficientCasts.length} casts while Holy Shock was available
          </Trans>,
        )
        .recommended(
          <Trans id="paladin.holy.modules.fillerLightOfTheMatyrs.inefficientSuggestion.recommended">
            No inefficient casts is recommended
          </Trans>,
        ),
    );
  }
}

export default FillerLightOfTheMartyrs;
