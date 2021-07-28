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

import StatWeights from '../../../modules/features/StatWeights';

const ADAPTIVE_ARMOR_FRAGMENT_EFFECT_BY_RANK = [
  0, // rank '0' - doesn't exist
  0.02,
  0.022,
  0.024,
  0.026,
  0.028,
  0.03,
  0.032,
  0.034,
  0.036,
  0.038,
  0.04,
  0.042,
  0.044,
  0.046,
  0.048,
];

// NOTE - this is actually a shared TANK conduit - this specific module for
//        Resto Druids is due to a specific request for comparison which hooks in with the int
//        scaling info to generate the true percentage of healing done
/**
 * **Adaptive Armor Fragment**
 * Conduit - Shared
 *
 * When you are healed by another player, increase your <Primary Stat> by X% for 15 sec.
 * This can only occur once every 30 sec.
 */
class AdaptiveArmorFragment extends Analyzer {
  static dependencies = {
    statWeights: StatWeights,
  };

  protected statWeights!: StatWeights;

  _adaptiveArmorFragmentBoost: number;
  healing: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasConduitBySpellID(SPELLS.ADAPTIVE_ARMOR_FRAGMENT.id);
    this._adaptiveArmorFragmentBoost =
      ADAPTIVE_ARMOR_FRAGMENT_EFFECT_BY_RANK[
        this.selectedCombatant.conduitRankBySpellID(SPELLS.ADAPTIVE_ARMOR_FRAGMENT.id)
      ];

    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.onHeal);
  }

  onHeal(event: HealEvent) {
    if (
      this.selectedCombatant.hasBuff(SPELLS.ADAPTIVE_ARMOR_FRAGMENT_BUFF.id) &&
      this.statWeights._getSpellInfo(event).int
    ) {
      this.healing += calculateEffectiveHealing(event, this._adaptiveArmorFragmentBoost);
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
            This is the healing attributable to Adaptive Armor Fragment's int buff. The buff's
            uptime was{' '}
            <strong>
              {formatPercentage(
                this.selectedCombatant.getBuffUptime(SPELLS.ADAPTIVE_ARMOR_FRAGMENT_BUFF.id) /
                  this.owner.fightDuration,
                1,
              )}
              %
            </strong>
            .
          </>
        }
      >
        <BoringSpellValueText
          spellId={SPELLS.ADAPTIVE_ARMOR_FRAGMENT.id}
          ilvl={
            this.selectedCombatant.conduitsByConduitID[SPELLS.ADAPTIVE_ARMOR_FRAGMENT.id].itemLevel
          }
        >
          <ItemPercentHealingDone amount={this.healing} />
          <br />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default AdaptiveArmorFragment;
