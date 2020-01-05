import React from 'react';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import ItemHealingDone from 'interface/ItemHealingDone';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';
import Events, { HealEvent } from 'parser/core/Events';

import GlimmerOfLight, {
  GLIMMER_CAP_8_3,
  IS_IT_8_3_YET,
} from './GlimmerOfLight';

const GLIMMER_OF_LIGHT_HEALING_NERF = 0.12;

class GlimmerOfLightNerf extends Analyzer {
  static dependencies = {
    glimmerOfLight: GlimmerOfLight,
  };

  private glimmerOfLight!: GlimmerOfLight;

  actualHealing = 0;
  overCapHealing = 0;
  healingReductionHealing = 0;

  constructor(options: any) {
    super(options);
    this.active =
      !IS_IT_8_3_YET &&
      this.selectedCombatant.hasTrait(SPELLS.GLIMMER_OF_LIGHT_TRAIT.id);
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.GLIMMER_OF_LIGHT),
      this.onHeal,
    );
  }

  onHeal(event: HealEvent) {
    const index = this.glimmerOfLight.glimmerBuffs.findIndex(
      buff => buff.targetID === event.targetID,
    );
    const glimmerNo = index + 1;
    const effective = event.amount + (event.absorbed || 0);
    this.actualHealing += effective;
    if (glimmerNo > GLIMMER_CAP_8_3) {
      this.overCapHealing += effective;
    } else {
      const raw = effective + (event.overheal || 0);
      const rawAfterNerf = raw * (1 - GLIMMER_OF_LIGHT_HEALING_NERF);
      const effectiveAfterNerf = Math.max(0, rawAfterNerf - (event.overheal || 0));
      this.healingReductionHealing += effective - effectiveAfterNerf;
    }
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.ITEMS}
        position={STATISTIC_ORDER.OPTIONAL()}
        size="flexible"
        tooltip={
          <>
            The max amount of healing the Glimmer of Light nerfs will have made
            you lose out on for this fight. This will likely be noticeably lower
            due to getting better targets for Holy Shock and reduced
            overhealing on Glimmer.<br /><br />

            The 12% reduction prediction accounts for overhealing.
          </>
        }
      >
        <div className="pad" style={{ lineHeight: 1.4 }}>
          <label>
            <SpellLink id={SPELLS.GLIMMER_OF_LIGHT.id} /> nerf prediction
          </label>

          <div className="value">
            <small>Lost due to target cap:</small>
            <br />
            <ItemHealingDone amount={this.overCapHealing} lessThan />
            <br />
            <small>Lost due to 12% reduction:</small>
            <br />
            <ItemHealingDone amount={this.healingReductionHealing} lessThan />
            <br />
            <small>Total:</small>
            <br />
            <ItemHealingDone
              amount={this.overCapHealing + this.healingReductionHealing}
              lessThan
            />
          </div>
        </div>
      </Statistic>
    );
  }
}

export default GlimmerOfLightNerf;
