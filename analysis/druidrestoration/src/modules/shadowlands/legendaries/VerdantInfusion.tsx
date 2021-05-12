import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import HotTrackerRestoDruid from '../../core/hottracking/HotTrackerRestoDruid';
import { Attribution, TrackersBySpell } from 'parser/shared/modules/HotTracker';
import Events, { CastEvent } from 'parser/core/Events';
import Combatants from 'parser/shared/modules/Combatants';
import Statistic from 'parser/ui/Statistic';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import React from 'react';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { formatNumber } from 'common/format';

const HOT_EXTENSION = 10_000;

/**
 * **Verdant Infusion**
 * Runecarving Legendary
 *
 * Swiftmend no longer consumes a heal over time effect,
 * and extends the duration of your heal over time effects on the target by 10 sec.
 */
class VerdantInfusion extends Analyzer {
  static dependencies = {
    hotTracker: HotTrackerRestoDruid,
    combatants: Combatants,
  };

  hotTracker!: HotTrackerRestoDruid;
  combatants!: Combatants;

  attribution: Attribution = {
    attributionId: SPELLS.VERDANT_INFUSION.id,
    name: "Verdant Infusion",
    healing: 0,
    procs: 0,
    totalExtension: 0,
  };
  casts: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasLegendaryByBonusID(SPELLS.VERDANT_INFUSION.bonusID);

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SWIFTMEND), this.onSwiftmend);
  }

  onSwiftmend(event: CastEvent) {
    this.casts += 1;
    const target = this.combatants.getEntity(event);
    if (!target) {
      return;
    }

    const hotsOn: TrackersBySpell = this.hotTracker.hots[target.id];
    if (!hotsOn) {
      return;
    }

    Object.keys(hotsOn).forEach(hotId => {
      // TODO count per HoT?
      this.hotTracker.addExtension(this.attribution, HOT_EXTENSION, target.id, Number(hotId));
    });
  }

  // TODO attribute the un-consumed HoT?

  get healingPerCast() {
    return (this.casts === 0) ? 0 : this.attribution.healing / this.casts;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
        tooltip={
          <>
            This is the sum of the healing attributable to the HoT extensions caused by
            casting Swiftmend with the Verdant Infusion legendary. This number accounts only for
            the extensions and does not consider the benefit of not consuming a HoT.
            <br/><br/>
            <strong>You cast{' '}{this.casts}{' '}Swiftmends, averaging
              {' '}{formatNumber(this.healingPerCast)}{' '} healing due to extensions per cast</strong>
          </>
        }
      >
        <BoringSpellValueText spell={SPELLS.VERDANT_INFUSION}>
          <ItemPercentHealingDone amount={this.attribution.healing} />
          <br />
        </BoringSpellValueText>
      </Statistic>
    );
  }

}

export default VerdantInfusion;
