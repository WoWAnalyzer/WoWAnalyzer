import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import calculateEffectiveHealing from 'parser/core/calculateEffectiveHealing';
import Events, { HealEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import React from 'react';

import { getSpellInfo } from '../../../SpellInfo';

const HASTE_AMOUNT = 0.12;

/**
 * **Field of Blossoms**
 * Soulbind Conduit - Dreamweaver / Night Fae
 *
 * Convoke the Spirits puts flowers at your feet for 20 sec that increase your Haste by 12% while you stand with them.
 */
class FieldOfBlossomsResto extends Analyzer {
  hpmHealAttribution: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasSoulbindTrait(SPELLS.FIELD_OF_BLOSSOMS.id);

    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.onHeal);
  }

  onHeal(event: HealEvent) {
    if (
      this.selectedCombatant.hasBuff(SPELLS.FIELD_OF_BLOSSOMS_BUFF.id) &&
      getSpellInfo(event.ability.guid).hasteHpm
    ) {
      this.hpmHealAttribution += calculateEffectiveHealing(event, HASTE_AMOUNT);
    }
  }

  get uptimePercent() {
    return (
      this.selectedCombatant.getBuffUptime(SPELLS.FIELD_OF_BLOSSOMS_BUFF.id) /
      this.owner.fightDuration
    );
  }

  statistic(): React.ReactNode {
    return (
      <Statistic
        size="flexible"
        position={STATISTIC_ORDER.OPTIONAL(100)}
        category={STATISTIC_CATEGORY.COVENANTS}
        tooltip={
          <>
            This is the healing soley due to faster HoT ticks from the haste buff. The buff's true
            value is higher than this because it also allows you to cast faster.
            <br />
            The buff's uptime was <strong>{formatPercentage(this.uptimePercent, 1)}%</strong>.
          </>
        }
      >
        <BoringSpellValueText spell={SPELLS.FIELD_OF_BLOSSOMS}>
          <ItemPercentHealingDone greaterThan amount={this.hpmHealAttribution} />
          <br />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default FieldOfBlossomsResto;
