import { Trans } from '@lingui/macro';
import { COMET_STORM_AOE_MIN_TARGETS } from 'analysis/retail/mage/shared';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import { SpellLink } from 'interface';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';
import Events, { AnyEvent, CastEvent } from 'parser/core/Events';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import Enemies from 'parser/shared/modules/Enemies';

import { cometStormHits } from '../normalizers/CometStormLinkNormalizer';

const MIN_SHATTERED_PROJECTILES_PER_CAST = 4;

class CometStorm extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    enemies: Enemies,
  };
  protected abilityTracker!: AbilityTracker;
  protected enemies!: Enemies;

  badCometStormCast = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.COMET_STORM_TALENT);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.COMET_STORM_TALENT),
      this.onCometStormCast,
    );
  }

  onCometStormCast(event: CastEvent) {
    const damageEvents: AnyEvent[] = cometStormHits(event);
    const enemiesHit: number[] = [];
    let projectilesShattered = 0;

    damageEvents.forEach((hit) => {
      const enemy = this.enemies.getEntity(hit);
      if (!enemy) {
        return;
      }
      //Tracks each unique enemy that was hit by the cast
      if (!enemiesHit.includes(enemy.guid)) {
        enemiesHit.push(enemy.guid);
      }

      //Tracks how many projectiles were shattered
      if (enemy.hasBuff(SPELLS.WINTERS_CHILL.id)) {
        projectilesShattered += 1;
      }
    });

    if (
      enemiesHit.length < COMET_STORM_AOE_MIN_TARGETS &&
      projectilesShattered < MIN_SHATTERED_PROJECTILES_PER_CAST
    ) {
      this.badCometStormCast += 1;
    }
  }

  get totalCasts() {
    return this.abilityTracker.getAbility(TALENTS.COMET_STORM_TALENT.id).casts;
  }

  get castUtilization() {
    return 1 - this.badCometStormCast / this.totalCasts;
  }

  get cometStormUtilizationThresholds() {
    return {
      actual: this.castUtilization,
      isLessThan: {
        minor: 0.9,
        average: 0.8,
        major: 0.7,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.cometStormUtilizationThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You failed to get the most out of your <SpellLink id={TALENTS.COMET_STORM_TALENT.id} />{' '}
          casts {this.badCometStormCast} times. Because the projectiles from{' '}
          <SpellLink id={TALENTS.COMET_STORM_TALENT.id} /> no longer remove your stacks of{' '}
          <SpellLink id={SPELLS.WINTERS_CHILL.id} />, you should always cast{' '}
          <SpellLink id={TALENTS.COMET_STORM_TALENT.id} /> immediately after casting{' '}
          <SpellLink id={TALENTS.FLURRY_TALENT.id} /> and applying{' '}
          <SpellLink id={SPELLS.WINTERS_CHILL} />. This way there is time for most/all of the comets
          to hit the target before <SpellLink id={SPELLS.WINTERS_CHILL.id} /> expires.
          Alternatively, if <SpellLink id={TALENTS.COMET_STORM_TALENT.id} /> will hit at least{' '}
          {COMET_STORM_AOE_MIN_TARGETS} targets, then it is acceptable to use it without{' '}
          <SpellLink id={TALENTS.SHATTER_TALENT.id} />/<SpellLink id={SPELLS.WINTERS_CHILL.id} />
        </>,
      )
        .icon(TALENTS.COMET_STORM_TALENT.icon)
        .actual(
          <Trans id="mage.frost.suggestions.cometStorm.castUtilization">
            {formatPercentage(actual)}% Utilization
          </Trans>,
        )
        .recommended(`${formatPercentage(recommended)}% is recommended`),
    );
  }
}

export default CometStorm;
