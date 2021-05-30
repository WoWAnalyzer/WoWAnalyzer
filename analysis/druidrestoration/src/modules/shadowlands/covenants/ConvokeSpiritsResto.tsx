import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import COVENANTS from 'game/shadowlands/COVENANTS';
import { SpellLink } from 'interface';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, HealEvent, RefreshBuffEvent } from 'parser/core/Events';
import HotTracker, { Attribution } from 'parser/shared/modules/HotTracker';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import React from 'react';

import { ConvokeSpirits } from '@wowanalyzer/druid';

import HotTrackerRestoDruid from '../../core/hottracking/HotTrackerRestoDruid';

const CONVOKED_HOTS = [
  SPELLS.REJUVENATION,
  SPELLS.REJUVENATION_GERMINATION,
  SPELLS.REGROWTH,
  SPELLS.WILD_GROWTH,
];
const CONVOKED_DIRECT_HEALS = [
  SPELLS.SWIFTMEND,
  SPELLS.REGROWTH,
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
  convokeFlourishRateAttributions: Array<{ amount: number }> = [];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasCovenant(COVENANTS.NIGHT_FAE.id);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(CONVOKED_HOTS),
      this.onRestoHotApply,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(CONVOKED_HOTS),
      this.onRestoHotApply,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(CONVOKED_DIRECT_HEALS),
      this.onRestoDirectHeal,
    );
    // Flourish is tracked from the Flourish module, which calls into this one to update the attribution
  }

  onRestoHotApply(event: ApplyBuffEvent | RefreshBuffEvent) {
    if (this.isConvoking()) {
      this.hotTracker.addAttributionFromApply(this.currentConvokeAttribution, event);
    }
  }

  onRestoDirectHeal(event: HealEvent) {
    if (!event.tick && this.isConvoking()) {
      this.currentConvokeAttribution.healing += event.amount + (event.absorbed || 0);
    }
  }

  onConvoke(event: ApplyBuffEvent) {
    super.onConvoke(event);
    this.convokeAttributions[this.cast] = HotTracker.getNewAttribution('Convoke #' + this.cast);
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
    const flourishRateHealing = this.convokeFlourishRateAttributions.reduce(
      (sum, att) => att.amount + sum,
      0,
    );
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
            Abilities cast by Convoke do not create cast events; this listing is created by tracking
            related events during the channel. Occasionally a Convoke will cast an ability that hits
            nothing (like Thrash when only immune targets are in range). In these cases we won't be
            able to track it and so the number of spells listed may not add up to{' '}
            {this.spellsPerCast}.
            <br />
            <br />
            Healing amount is attributed by tracking the healing spells cast by Convoke, including
            possible Flourish casts. This amount includes mastery benefit from the proceed HoTs.
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
                {this.convokeTracker.map((spellIdToCasts, index) => (
                  <tr key={index}>
                    <th scope="row">{index}</th>
                    <td>{spellIdToCasts.form}</td>
                    <td>
                      {formatNumber(
                        this.convokeAttributions[index].healing +
                          this.convokeFlourishRateAttributions[index].amount,
                      )}
                    </td>
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
