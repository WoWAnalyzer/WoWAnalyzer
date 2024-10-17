import { SHATTER_DEBUFFS } from 'analysis/retail/mage/shared';
import TALENTS from 'common/TALENTS/mage';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent, GetRelatedEvents } from 'parser/core/Events';
import Enemies from 'parser/shared/modules/Enemies';

export default class CometStorm extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };
  protected enemies!: Enemies;

  cometCasts: CometStormCast[] = [];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.COMET_STORM_TALENT);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.COMET_STORM_TALENT),
      this.onCometCast,
    );
  }

  onCometCast(event: CastEvent) {
    const damage: DamageEvent[] | undefined = GetRelatedEvents(event, 'SpellDamage');
    const enemies: number[] = [];
    let shattered = 0;
    damage.forEach((d) => {
      const enemy = this.enemies.getEntity(d);
      if (enemy && !enemies.includes(enemy.guid)) {
        enemies.push(enemy.guid);
      }
      if (enemy && SHATTER_DEBUFFS.some((effect) => enemy.hasBuff(effect.id, d.timestamp))) {
        shattered += 1;
      }
    });

    this.cometCasts.push({
      cast: event,
      enemiesHit: enemies.length,
      shatteredHits: shattered,
    });
  }
}

export interface CometStormCast {
  cast: CastEvent;
  enemiesHit: number;
  shatteredHits: number;
}
