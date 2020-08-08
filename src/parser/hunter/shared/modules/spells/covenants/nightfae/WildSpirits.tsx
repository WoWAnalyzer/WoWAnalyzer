import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Abilities from 'parser/core/modules/Abilities';
import SPELLS from 'common/SPELLS';
import Events, { DamageEvent } from 'parser/core/Events';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import React from 'react';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import Enemies from 'parser/shared/modules/Enemies';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import { WILD_MARK_DAMAGE_AMP } from 'parser/hunter/shared/constants';
import { formatNumber } from 'common/format';

class WildSpirits extends Analyzer {
  static dependencies = {
    abilities: Abilities,
    enemies: Enemies,
  };
  damage: number = 0;
  ampDamage: number = 0;
  protected abilities!: Abilities;
  protected enemies!: Enemies;

  constructor(options: any) {
    super(options);
    this.active = true; //TODO: Once we can parse from WCL this should be changed to activate
    if (this.active) {
      options.abilities.add({
        spell: SPELLS.WILD_SPIRITS,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 120,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
      });
      this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell([SPELLS.WILD_SPIRITS_DAMAGE, SPELLS.WILD_SPIRITS_DAMAGE_AOE]), this.onWildSpiritsDamage);
      this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);
    }
  }

  onWildSpiritsDamage(event: DamageEvent) {
    this.damage += event.amount + (event.absorbed || 0);
  }

  onDamage(event: DamageEvent) {
    const enemy = this.enemies.getEntity(event);
    if (!enemy || !enemy.hasBuff(SPELLS.WILD_MARK.id)) {
      return;
    }
    this.ampDamage += calculateEffectiveDamage(event, WILD_MARK_DAMAGE_AMP);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
      >
        <BoringSpellValueText spell={SPELLS.WILD_SPIRITS}>
          <>
            <img src="/img/sword.png" alt="Damage" className="icon" />{' '}
            {formatNumber(this.damage)} <small> direct damage</small>
            <br />
            <img src="/img/sword.png" alt="Damage" className="icon" />{' '}
            {formatNumber(this.damage)} <small> Wild Mark damage</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }

}

export default WildSpirits;
