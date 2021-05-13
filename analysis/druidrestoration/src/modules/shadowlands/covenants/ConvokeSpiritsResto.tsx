import SPELLS from 'common/SPELLS';
import { ConvokeSpirits } from '@wowanalyzer/druid';
import HotTrackerRestoDruid from '../../core/hottracking/HotTrackerRestoDruid';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import COVENANTS from 'game/shadowlands/COVENANTS';
import { Attribution } from 'parser/shared/modules/HotTracker';
import Events, { ApplyBuffEvent, HealEvent, RefreshBuffEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { SpellLink } from 'interface';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import React from 'react';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import { formatNumber } from 'common/format';

const CONVOKED_HOTS = [
  SPELLS.REJUVENATION,
  SPELLS.REJUVENATION_GERMINATION,
  SPELLS.REGROWTH,
  SPELLS.WILD_GROWTH,
];


/**
 * Resto's extension to the Convoke the Spirits display. Includes healing attribution.
 * Convokable healing abilities:
 * * Rejuvenation - track apply/refresh - use HotTracker
 * * Regrowth - track apply/refresh - use HotTracker
 * * Swiftmend - track heal - directly attribute healing
 * * Wild Growth - track apply/refresh - use HotTracker
 * * Flourish - track apply/refresh - use integration with Flourish module
 */
class ConvokeSpiritsResto extends ConvokeSpirits {
  static dependencies = {
    ...ConvokeSpirits.dependencies,
    hotTracker: HotTrackerRestoDruid,
  };

  hotTracker!: HotTrackerRestoDruid;

  convokeAttributions: Attribution[] = [];
  convokeFlourishRateAttributions: { amount: number }[] = [];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasCovenant(COVENANTS.NIGHT_FAE.id);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(CONVOKED_HOTS), this.onRestoHotApply
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(CONVOKED_HOTS), this.onRestoHotApply
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.SWIFTMEND), this.onRestoSwiftmend
    );
    // Flourish is tracked from the Flourish module, which calls into this one to update the attribution
  }

  onRestoHotApply(event: ApplyBuffEvent | RefreshBuffEvent) {
    if (this.isChannelingConvoke) {
      this.hotTracker.addAttributionFromApply(this.currentConvokeAttribution, event);
    }
  }

  onRestoSwiftmend(event: HealEvent) {
    if (this.isChannelingConvoke) {
      this.currentConvokeAttribution.healing += event.amount + (event.absorbed || 0);
    }
  }

  startTracking(event: ApplyBuffEvent) {
    super.startTracking(event);
    this.convokeAttributions[this.cast] = this.hotTracker.getNewAttribution(
      SPELLS.CONVOKE_SPIRITS.id, 'Convoke #' + this.cast);
    this.convokeFlourishRateAttributions[this.cast] = { amount: 0 };
  }

  get currentConvokeAttribution(): Attribution {
    return this.convokeAttributions[this.cast];
  }

  get currentConvokeRateAttribution() {
    return this.convokeFlourishRateAttributions[this.cast];
  }

  get totalHealing(): number {
    const attributorHealing = this.convokeAttributions.reduce((sum, att) => att.healing + sum, 0);
    const flourishRateHealing = this.convokeFlourishRateAttributions.reduce((sum, att) => att.amount + sum, 0);
    return attributorHealing + flourishRateHealing;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE()}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
        tooltip={
          <>
            Abilities cast by Convoke do not create cast events; this listing is created by
            tracking related events during the channel. Occasionally a Convoke will cast an ability
            that hits nothing (like Thrash when only immune targets are in range). In these cases
            we won't be able to track it and so the number of spells listed may not add up to
            {' '}{this.spellsToTrack}.
            <br />
            Healing amount is attributed by tracking the healing spells cast by Convoke, including
            possible Flourish casts. When Flourish is cast some double counting within this module
            occurs, so the listed number will be somewhat higher than the true amount.
          </>
        }
        dropdown={
          <>
            <table className="table table-condensed">
              <thead>
                <tr>
                  <th>Cast #</th>
                  <th>Form</th>
                  <th>Healing</th>
                  <th>Spells In Cast</th>
                </tr>
              </thead>
              <tbody>
                {this.whatHappendIneachConvoke.map((spellIdToCasts, index) => (
                  <tr key={index}>
                    <th scope="row">{index}</th>
                    <td>{spellIdToCasts.form}</td>
                    <td>{formatNumber(this.convokeAttributions[index].healing + this.convokeFlourishRateAttributions[index].amount)}</td>
                    <td>
                      {spellIdToCasts.spellIdToCasts.map((casts, spellId) => (
                        <>
                          <SpellLink id={spellId} /> {casts} <br />
                        </>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        }
      >
        <BoringSpellValueText spell={SPELLS.CONVOKE_SPIRITS}>
          <ItemPercentHealingDone approximate amount={this.totalHealing} />
          <br />
        </BoringSpellValueText>
      </Statistic>
    );
  }


}

export default ConvokeSpiritsResto;
