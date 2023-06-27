
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import Enemies from 'parser/shared/modules/Enemies';

const debug = false;

class ArcaneMissiles extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    enemies: Enemies,
  };
  protected abilityTracker!: AbilityTracker;
  protected enemies!: Enemies;

  hasArcaneEcho: boolean;
  castWithoutClearcasting = 0;

  constructor(options: Options) {
    super(options);
    this.active = true;
    this.hasArcaneEcho = this.selectedCombatant.hasTalent(TALENTS.ARCANE_ECHO_TALENT);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.ARCANE_MISSILES_TALENT),
      this.onMissilesCast,
    );
  }

  onMissilesCast(event: CastEvent) {
    const spellId = event.ability.guid;
    const enemy = this.enemies.getEntity(event);
    if (this.hasArcaneEcho && enemy && enemy.hasBuff(SPELLS.TOUCH_OF_THE_MAGI_DEBUFF.id)) {
      return;
    }

    if (
      spellId === TALENTS.ARCANE_MISSILES_TALENT.id &&
      !this.selectedCombatant.hasBuff(SPELLS.CLEARCASTING_ARCANE.id)
    ) {
      debug && this.log('Arcane Missiles cast without Clearcasting');
      this.castWithoutClearcasting += 1;
    }
  }

  get missilesUtilization() {
    return (
      1 -
      this.castWithoutClearcasting /
        this.abilityTracker.getAbility(TALENTS.ARCANE_MISSILES_TALENT.id).casts
    );
  }

  get arcaneMissileUsageThresholds() {
    return {
      actual: this.missilesUtilization,
      isLessThan: {
        minor: 1,
        average: 0.95,
        major: 0.9,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.arcaneMissileUsageThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You cast <SpellLink id={TALENTS.ARCANE_MISSILES_TALENT.id} /> improperly{' '}
          {this.castWithoutClearcasting} times. In order to get the most out of{' '}
          <SpellLink id={TALENTS.ARCANE_MISSILES_TALENT.id} /> you should only cast it if you have{' '}
          <SpellLink id={SPELLS.CLEARCASTING_ARCANE.id} /> or if you are using{' '}
          <SpellLink id={TALENTS.ARCANE_ECHO_TALENT.id} /> and the target has{' '}
          <SpellLink id={TALENTS.TOUCH_OF_THE_MAGI_TALENT.id} />.
        </>,
      )
        .icon(TALENTS.ARCANE_MISSILES_TALENT.icon)
        .actual(
          <>
            {formatPercentage(this.missilesUtilization)}% Uptime
          </>,
        )
        .recommended(`${formatPercentage(recommended)}% is recommended`),
    );
  }
}

export default ArcaneMissiles;
