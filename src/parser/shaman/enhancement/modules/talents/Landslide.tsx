import React from 'react';
import SPELLS from 'common/SPELLS/index';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';

import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import Events, { DamageEvent } from 'parser/core/Events';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import ItemDamageDone from 'interface/ItemDamageDone';
import { STORMSTRIKE_DAMAGE_SPELLS } from 'parser/shaman/enhancement/constants';

const LANDSLIDE = {
  INCREASE: 1.0,
};

/**
 * Rockbiter has a 40% chance to increase the damage
 * of your next Stormstrike by 100%.
 *
 * Example Log:
 *
 */
class Landslide extends Analyzer {
  protected damageGained: number = 0;
  protected landslideCount: number = 0;
  protected landslideUses: number = 0;

  constructor(options: any) {
    super(options);

    if(!this.selectedCombatant.hasTalent(SPELLS.LANDSLIDE_TALENT.id)) {
      this.active = false;
      return;
    }

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
    this.landslideCount += 1;
  }

  onStormstrikeDamage(event: DamageEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.LANDSLIDE_BUFF.id)) {
      return;
    }

    this.landslideUses += 1;
    this.damageGained += calculateEffectiveDamage(event, LANDSLIDE.INCREASE);
  }

  // TODO: add uses/count to statistics
  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        size="small"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spell={SPELLS.LANDSLIDE_TALENT}>
          <>
            <ItemDamageDone amount={this.damageGained} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Landslide;
