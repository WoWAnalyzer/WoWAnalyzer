import React from 'react';
import SPELLS from 'common/SPELLS/index';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';

import Statistic from 'interface/statistics/Statistic';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import Events, { DamageEvent } from 'parser/core/Events';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import ItemDamageDone from 'interface/ItemDamageDone';
import { STORMSTRIKE_DAMAGE_SPELLS } from '../core/Stormbringer';

const LANDSLIDE = {
  INCREASE: 1.0,
};

class Landslide extends Analyzer {
  /**
   * Rockbiter has a 40% chance to increase the damage
   * of your next Stormstrike by 100%.
   *
   * Example Log:
   *
   */

  protected damage = 0;
  protected landslideCount = 0;
  protected landslideUses = 0;

  constructor(options: any) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.LANDSLIDE_TALENT.id);

    this.addEventListener(
      Events.applybuff.spell(SPELLS.LANDSLIDE_BUFF),
      this.onLandslideBuff,
    );

    this.addEventListener(
      Events.refreshbuff.spell(SPELLS.LANDSLIDE_BUFF),
      this.onLandslideBuff,
    );

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER)
        .spell(STORMSTRIKE_DAMAGE_SPELLS),
      this.onStormstrikeDamage,
    );
  }

  onLandslideBuff() {
    this.landslideCount++;
  }

  onStormstrikeDamage(event: DamageEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.LANDSLIDE_BUFF.id)) {
      return;
    }

    this.landslideUses++;
    this.damage += calculateEffectiveDamage(event, LANDSLIDE.INCREASE);
  }

  // TODO: add uses/count to statistics
  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        size="small"
        category={'TALENTS'}
      >
        <BoringSpellValueText spell={SPELLS.LANDSLIDE_TALENT}>
          <>
            <ItemDamageDone amount={this.damage} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Landslide;
