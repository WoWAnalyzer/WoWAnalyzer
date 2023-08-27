import TALENTS from 'common/TALENTS/shaman';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, RefreshBuffEvent, RemoveBuffEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import Enemies from 'parser/shared/modules/Enemies';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import { ELECTRIFIED_SHOCKS_DURATION } from '../../constants';

interface ActiveIFWindow {
  start: number;
  empoweredCasts: number;
}

interface FinishedIFWindow extends ActiveIFWindow {
  end: number;
  icefuryCooldownLeft: number;
}

class Icefury extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    spellUsable: SpellUsable,
    enemies: Enemies,
  };
  activeIFWindow: ActiveIFWindow | null;
  icefuryWindows: FinishedIFWindow[] = [];

  protected spellUsable!: SpellUsable;
  protected abilityTracker!: AbilityTracker;
  protected enemies!: Enemies;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.ICEFURY_TALENT);

    this.activeIFWindow = null;

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.FROST_SHOCK_TALENT),
      this.onFrostShockCast,
    );

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(TALENTS.ICEFURY_TALENT),
      this.onIcefuryBuff,
    );

    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(TALENTS.ICEFURY_TALENT),
      this.onIcefuryBuffDropoff,
    );
  }

  onIcefuryBuff(event: ApplyBuffEvent) {
    this.activeIFWindow = { start: event.timestamp, empoweredCasts: 0 };
  }

  onIcefuryRefresh(event: RefreshBuffEvent) {
    if (!this.activeIFWindow) {
      return;
    }
    this.icefuryWindows.push({
      ...this.activeIFWindow,
      end: event.timestamp,
      icefuryCooldownLeft: 0,
    });

    this.activeIFWindow = { start: event.timestamp, empoweredCasts: 0 };
  }

  onIcefuryBuffDropoff(event: RemoveBuffEvent) {
    if (!this.activeIFWindow) {
      return;
    }

    this.icefuryWindows.push({
      ...this.activeIFWindow,
      end: event.timestamp,
      icefuryCooldownLeft: Math.max(
        this.spellUsable.cooldownRemaining(TALENTS.ICEFURY_TALENT.id) - ELECTRIFIED_SHOCKS_DURATION,
        0,
      ),
    });
    this.activeIFWindow = null;
  }
  onFrostShockCast() {
    if (!this.activeIFWindow) {
      return;
    }

    this.activeIFWindow.empoweredCasts += 1;
  }

  get empoweredFrostShockCasts() {
    return this.icefuryWindows.map((e) => e.empoweredCasts).reduce((a, b) => a + b, 0);
  }

  get suggestionThresholds() {
    return {
      actual:
        this.empoweredFrostShockCasts /
        this.abilityTracker.getAbility(TALENTS.ICEFURY_TALENT.id).casts,
      isLessThan: {
        minor: 4,
        average: 3.5,
        major: 3,
      },
      style: ThresholdStyle.DECIMAL,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual) =>
      suggest(
        <>
          You should fully utilize your <SpellLink spell={TALENTS.ICEFURY_TALENT} /> casts by
          casting 4 <SpellLink spell={TALENTS.FROST_SHOCK_TALENT} />s before the{' '}
          <SpellLink spell={TALENTS.ICEFURY_TALENT} /> buff expires.Pay attention to the remaining
          duration of the buff to ensure you have time to use all of the stacks.
        </>,
      )
        .icon(TALENTS.ICEFURY_TALENT.icon)
        .actual(
          <>
            On average, only {actual.toFixed(2)} <SpellLink spell={TALENTS.ICEFURY_TALENT} />
            (s) stacks were consumed with <SpellLink spell={TALENTS.FROST_SHOCK_TALENT} /> casts
            before <SpellLink spell={TALENTS.ICEFURY_TALENT} /> buff expired.
          </>,
        )
        .recommended("It's recommended to always consume all 4 stacks."),
    );
  }
}

export default Icefury;
