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

const CONFLUX_OF_ELEMENTS_EFFECT_BY_RANK = [
  0.15,
  0.165,
  0.18,
  0.195,
  0.21,
  0.225,
  0.24,
  0.255,
  0.27,
  0.285,
  0.3,
  0.315,
  0.33,
  0.345,
  0.36,
];

/**
 * **Conflux of Elements**
 * Conduit - Night Fae
 *
 * While channeling Convoke the Spirits, your damage and healing are increased by X%.
 */
class ConfluxOfElementsResto extends Analyzer {
  _confluxOfElementsBoost: number;
  healing: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasConduitBySpellID(SPELLS.CONFLUX_OF_ELEMENTS.id);
    this._confluxOfElementsBoost =
      CONFLUX_OF_ELEMENTS_EFFECT_BY_RANK[
        this.selectedCombatant.conduitRankBySpellID(SPELLS.CONFLUX_OF_ELEMENTS.id)
      ];

    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.onHeal);
  }

  onHeal(event: HealEvent) {
    if (this.selectedCombatant.hasBuff(SPELLS.CONVOKE_SPIRITS.id)) {
      this.healing += calculateEffectiveHealing(event, this._confluxOfElementsBoost);
    }
  }

  statistic(): React.ReactNode {
    return (
      <Statistic
        size="flexible"
        position={STATISTIC_ORDER.OPTIONAL(0)}
        category={STATISTIC_CATEGORY.COVENANTS}
        tooltip={
          <>
            This is the healing attributable specifically to Conflux of Elements's boost to healing
            during Convoke.
          </>
        }
      >
        <BoringSpellValueText
          spellId={SPELLS.CONFLUX_OF_ELEMENTS.id}
          ilvl={this.selectedCombatant.conduitsByConduitID[SPELLS.CONFLUX_OF_ELEMENTS.id].itemLevel}
        >
          <ItemPercentHealingDone amount={this.healing} />
          <br />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ConfluxOfElementsResto;
