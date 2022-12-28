import { t } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  HealEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';

const TARGETSPERCAST = 78;

class RefreshingJadeWind extends Analyzer {
  healsRJW: number = 0;
  healingRJW: number = 0;
  overhealingRJW: number = 0;
  castRJW: number = 0;
  precast: boolean = true;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.REFRESHING_JADE_WIND_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(TALENTS_MONK.REFRESHING_JADE_WIND_TALENT),
      this.rjwBuffApplied,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(TALENTS_MONK.REFRESHING_JADE_WIND_TALENT),
      this.rjwBuffRefreshed,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(TALENTS_MONK.REFRESHING_JADE_WIND_TALENT),
      this.rjwBuffRemoved,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.REFRESHING_JADE_WIND_HEAL),
      this.rjwHeal,
    );
  }

  get avgTargetsHitPerRJWPercentage() {
    return this.healsRJW / this.castRJW / TARGETSPERCAST || 0;
  }

  get rjwEffectiveness() {
    const rjwEfficiency = this.healsRJW / (this.castRJW * TARGETSPERCAST) || 0;
    return rjwEfficiency.toFixed(4);
  }

  get suggestionThresholds() {
    return {
      actual: this.avgTargetsHitPerRJWPercentage,
      isLessThan: {
        minor: 0.9,
        average: 0.8,
        major: 0.7,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  rjwBuffApplied(event: ApplyBuffEvent) {
    // no matter what we want to add 1 if buff applied
    this.castRJW += 1;
    this.precast = false;
  }

  rjwBuffRefreshed(event: RefreshBuffEvent) {
    // if we get a REFRESH event before a buff applied event then there was a pre-cast
    if (this.precast) {
      this.castRJW += 1;
      // we set this to false since at this point we have heard the precast and no longer care
      this.precast = false;
    }
    this.castRJW += 1;
  }

  rjwBuffRemoved(event: RemoveBuffEvent) {
    // if we get a removed event before a buff applied event then there was a pre-cast
    if (this.precast) {
      this.castRJW += 1;
      // we set this to false since at this point we have heard the precast and no longer care
      this.precast = false;
    }
  }

  rjwHeal(event: HealEvent) {
    this.healsRJW += 1;
    this.healingRJW += (event.amount || 0) + (event.absorbed || 0);
    this.overhealingRJW += event.overheal || 0;
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You are not utilizing your <SpellLink id={TALENTS_MONK.REFRESHING_JADE_WIND_TALENT.id} />{' '}
          effectively. <SpellLink id={TALENTS_MONK.REFRESHING_JADE_WIND_TALENT.id} /> excells when
          you hit 6 targets for the duration of the spell. The easiest way to accomplish this is to
          stand in melee, but there can be other uses when the raid stacks for various abilities.
        </>,
      )
        .icon(TALENTS_MONK.REFRESHING_JADE_WIND_TALENT.icon)
        .actual(
          `${formatPercentage(this.avgTargetsHitPerRJWPercentage)}${t({
            id: 'monk.mistweaver.suggestions.refreshingJadeWind.avgTargetsHit',
            message: `% of targets hit per Refreshing Jade Wind`,
          })}`,
        )
        .recommended(`>${formatPercentage(recommended)}% is recommended`),
    );
  }
}

export default RefreshingJadeWind;
