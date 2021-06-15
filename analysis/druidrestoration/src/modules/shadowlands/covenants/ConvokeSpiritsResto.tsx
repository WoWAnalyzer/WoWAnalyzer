import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import COVENANTS from 'game/shadowlands/COVENANTS';
import { SpellLink } from 'interface';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import calculateEffectiveHealing from 'parser/core/calculateEffectiveHealing';
import Events, { ApplyBuffEvent, HealEvent, RefreshBuffEvent } from 'parser/core/Events';
import HotTracker, { Attribution } from 'parser/shared/modules/HotTracker';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import React from 'react';

import { ConvokeSpirits } from '@wowanalyzer/druid';

import { isFromHardcast } from '../../../normalizers/CastLinkNormalizer';
import HotTrackerRestoDruid from '../../core/hottracking/HotTrackerRestoDruid';

const CONVOKED_HOTS = [
  SPELLS.REJUVENATION,
  SPELLS.REJUVENATION_GERMINATION,
  SPELLS.REGROWTH,
  SPELLS.WILD_GROWTH,
];
const CONVOKED_DIRECT_HEALS = [SPELLS.SWIFTMEND, SPELLS.REGROWTH];

const NATURES_SWIFTNESS_BOOST = 1;

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

  /** Nature's Swiftness boosts convoked Regrowths but does not consume the buff.
   * This attributor specifically tracks the healing due to this. */
  convokeNaturesSwiftnessAttributions: Attribution[] = [];

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
    if (!isFromHardcast(event) && this.isConvoking()) {
      this.hotTracker.addAttributionFromApply(this.currentConvokeAttribution, event);
      if (
        event.ability.guid === SPELLS.REGROWTH.id &&
        this.selectedCombatant.hasBuff(SPELLS.NATURES_SWIFTNESS.id)
      ) {
        this.hotTracker.addBoostFromApply(
          this.currentNsConvokeAttribution,
          NATURES_SWIFTNESS_BOOST,
          event,
        );
      }
    }
  }

  onRestoDirectHeal(event: HealEvent) {
    if (!isFromHardcast(event) && !event.tick && this.isConvoking()) {
      this.currentConvokeAttribution.healing += event.amount + (event.absorbed || 0);
      if (
        event.ability.guid === SPELLS.REGROWTH.id &&
        this.selectedCombatant.hasBuff(SPELLS.NATURES_SWIFTNESS.id)
      ) {
        this.currentNsConvokeAttribution.healing += calculateEffectiveHealing(
          event,
          NATURES_SWIFTNESS_BOOST,
        );
      }
    }
  }

  onConvoke(event: ApplyBuffEvent) {
    super.onConvoke(event);
    this.convokeAttributions[this.cast] = HotTracker.getNewAttribution('Convoke #' + this.cast);
    this.convokeFlourishRateAttributions[this.cast] = { amount: 0 };
    this.convokeNaturesSwiftnessAttributions[this.cast] = HotTracker.getNewAttribution(
      "Nature's Swiftness Convoke #" + this.cast,
    );
  }

  get currentConvokeAttribution(): Attribution {
    return this.convokeAttributions[this.cast];
  }

  get currentConvokeRateAttribution() {
    return this.convokeFlourishRateAttributions[this.cast];
  }

  get currentNsConvokeAttribution(): Attribution {
    return this.convokeNaturesSwiftnessAttributions[this.cast];
  }

  get totalHealing(): number {
    const attributorHealing = this.convokeAttributions.reduce((sum, att) => att.healing + sum, 0);
    const flourishRateHealing = this.convokeFlourishRateAttributions.reduce(
      (sum, att) => att.amount + sum,
      0,
    );
    return attributorHealing + flourishRateHealing;
  }

  get convokeCount(): number {
    // attributions start indexed from 1
    return this.convokeAttributions.length - 1;
  }

  get totalNsConvokeHealing(): number {
    return this.convokeNaturesSwiftnessAttributions.reduce((sum, att) => att.healing + sum, 0);
  }

  get nsBoostedConvokeRegrowthCount(): number {
    return this.convokeNaturesSwiftnessAttributions.reduce((sum, att) => att.procs + sum, 0);
  }

  get nsBoostedConvokeCount(): number {
    return this.convokeNaturesSwiftnessAttributions.filter((att) => att.healing !== 0).length;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE()}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
        tooltip={
          <>
            {this.baseTooltip}
            <br />
            <br />
            Healing amount is attributed by tracking the healing spells cast by Convoke, including
            possible Flourish casts. This amount includes mastery benefit from the proceed HoTs.
            {this.totalNsConvokeHealing !== 0 && (
              <>
                <br />
                <br />
                In addition, you took advantage of the fact that{' '}
                <SpellLink id={SPELLS.NATURES_SWIFTNESS.id} /> boosts convoked Regrowth healing
                without consuming the buff. Nature's swiftness was active during{' '}
                <strong>
                  {this.nsBoostedConvokeCount} out of {this.convokeCount}
                </strong>{' '}
                casts, during which it boosted{' '}
                <strong>{this.nsBoostedConvokeRegrowthCount} Regrowths</strong> and caused{' '}
                <strong>
                  {formatPercentage(
                    this.owner.getPercentageOfTotalHealingDone(this.totalNsConvokeHealing),
                    1,
                  )}
                  %
                </strong>{' '}
                of total healing. This amount is included in the top-line Convoke healing amount.
              </>
            )}
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
