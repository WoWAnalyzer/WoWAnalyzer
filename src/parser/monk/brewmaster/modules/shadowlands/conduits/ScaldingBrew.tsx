import React from 'react';

import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import SPELLS from 'common/SPELLS';
import Events, { DamageEvent, CastEvent } from 'parser/core/Events';
import Enemies from 'parser/shared/modules/Enemies';
import Statistic from 'parser/ui/Statistic';
import ConduitSpellText from 'parser/ui/ConduitSpellText';
import { SpellLink } from 'interface';
import ItemDamageDone from 'parser/ui/ItemDamageDone'
import STATISTIC_ORDER  from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import Combatants from 'parser/shared/modules/Combatants';
import Entity from 'parser/core/Entity';

const DAMAGE_AMP_PER_RANK = 0.0075;
const BASE_DAMAGE_AMP = 0.075;

export default class ScaldingBrew extends Analyzer {
  static dependencies = {
    enemies: Enemies,
    combatants: Combatants,
  };

  protected enemies!: Enemies;
  protected combatants!: Combatants;

  bonusDamage = 0;
  // hits that did not trigger scalding brew
  // we don't count hits used to apply the KS debuff
  missedHits = 0;

  lastCast?: CastEvent;

  rank?: number;
  mult?: number;

  constructor(options: Options) {
    super(options);

    this.rank = this.selectedCombatant.conduitRankBySpellID(SPELLS.SCALDING_BREW.id);
    if(!this.rank) {
      this.active = false;
      return;
    }

    this.mult = BASE_DAMAGE_AMP + (this.rank - 1) * DAMAGE_AMP_PER_RANK;

    this.addEventListener(Events.damage.spell(SPELLS.KEG_SMASH).by(SELECTED_PLAYER), this.damage);
    this.addEventListener(Events.cast.spell(SPELLS.KEG_SMASH).by(SELECTED_PLAYER), this.cast);
  }

  private cast(event: CastEvent) {
    this.lastCast = event;
  }

  private damage(event: DamageEvent) {
    const target: Entity = this.enemies.enemies[event.targetID] || this.combatants.players[event.targetID];
    if (!target) {
      return;
    }
    if(target.hasBuff(SPELLS.BREATH_OF_FIRE_DEBUFF.id)) {
      this.bonusDamage += calculateEffectiveDamage(event, this.mult);
    } else if(target.hasBuff(SPELLS.KEG_SMASH.id, event.timestamp - 100)) {
      this.missedHits += 1;

      if(this.lastCast) {
        this.lastCast.meta = {
          isInefficientCast: true,
          inefficientCastReason: <>This cast did not benefit from <SpellLink id={SPELLS.SCALDING_BREW.id} /> or freshly apply the <SpellLink id={SPELLS.KEG_SMASH.id} /> debuff.</>,
        };
      }
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(0)}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
        tooltip={`${this.missedHits} of your Keg Smash hits (besides the initial debuff application) were without the Breath of Fire debuff.`}
      >
      <ConduitSpellText spell={SPELLS.SCALDING_BREW} rank={this.rank!}>
        <>
          <ItemDamageDone amount={this.bonusDamage} />
        </>
      </ConduitSpellText>
      </Statistic>
    );
  }
}
