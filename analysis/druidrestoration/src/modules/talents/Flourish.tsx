import { t } from '@lingui/macro';
import { formatPercentage, formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import COVENANTS from 'game/shadowlands/COVENANTS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import calculateEffectiveHealing from 'parser/core/calculateEffectiveHealing';
import Events, { ApplyBuffEvent, HealEvent, RefreshBuffEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import HotTracker, { Attribution } from 'parser/shared/modules/HotTracker';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import React from 'react';

import { HOTS_INCREASED_RATE } from '../../constants';
import { isFromHardcast } from '../../normalizers/CastLinkNormalizer';
import HotTrackerRestoDruid from '../core/hottracking/HotTrackerRestoDruid';
import ConvokeSpiritsResto from '../shadowlands/covenants/ConvokeSpiritsResto';

const FLOURISH_EXTENSION = 8000;
const FLOURISH_HEALING_INCREASE = 1;

/**
 * **Flourish** - Talent lvl 50
 *
 * Extends the duration of all of your heal over time effects on friendly targets within 60 yards by 8 sec,
 * and increases the rate of your heal over time effects by 100% for 8 sec.
 */
class Flourish extends Analyzer {
  static dependencies = {
    hotTracker: HotTrackerRestoDruid,
    abilityTracker: AbilityTracker,
    convokeSpirits: ConvokeSpiritsResto,
  };

  hotTracker!: HotTrackerRestoDruid;
  abilityTracker!: AbilityTracker;
  convokeSpirits!: ConvokeSpiritsResto;

  extensionAttributions: Attribution[] = [];
  rateAttributions: MutableAmount[] = [];
  lastCastTimestamp?: number;
  hardcastCount: number = 0;
  wgsExtended = 0; // tracks how many flourishes extended Wild Growth

  currentRateAttribution: MutableAmount = { amount: 0 };

  constructor(options: Options) {
    super(options);
    // Convoke the Spirits can cast a Flourish even if the player isn't talented for it
    this.active =
      this.selectedCombatant.hasTalent(SPELLS.FLOURISH_TALENT.id) ||
      this.selectedCombatant.hasCovenant(COVENANTS.NIGHT_FAE.id);

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(HOTS_INCREASED_RATE),
      this.onIncreasedRateHeal,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.FLOURISH_TALENT),
      this.onFlourishApplyBuff,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.FLOURISH_TALENT),
      this.onFlourishApplyBuff,
    );
  }

  get totalExtensionHealing() {
    return this.extensionAttributions.reduce((acc, flourish) => acc + flourish.healing, 0);
  }

  get totalRateHealing() {
    return this.rateAttributions.reduce((acc, flourish) => acc + flourish.amount, 0);
  }

  get totalHealing() {
    return this.totalExtensionHealing + this.totalRateHealing;
  }

  get casts() {
    return this.hardcastCount;
  }

  get healingPerCast() {
    return this.casts === 0 ? 0 : this.totalHealing / this.casts;
  }

  get percentWgsExtended() {
    return this.casts === 0 ? 0 : this.wgsExtended / this.casts;
  }

  get wildGrowthSuggestionThresholds() {
    return {
      actual: this.percentWgsExtended,
      isLessThan: {
        minor: 1.0,
        average: 0.75,
        major: 0.5,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  onIncreasedRateHeal(event: HealEvent) {
    if (this.selectedCombatant.hasBuff(SPELLS.FLOURISH_TALENT.id) && event.tick) {
      this.currentRateAttribution.amount += calculateEffectiveHealing(
        event,
        FLOURISH_HEALING_INCREASE,
      );
    }
  }

  onFlourishApplyBuff(event: ApplyBuffEvent | RefreshBuffEvent) {
    let extensionAttribution: Attribution;
    if (!isFromHardcast(event) && this.convokeSpirits.isConvoking()) {
      extensionAttribution = this.convokeSpirits.currentConvokeAttribution;
      this.currentRateAttribution = this.convokeSpirits.currentConvokeRateAttribution;
    } else {
      this.hardcastCount += 1;
      extensionAttribution = HotTracker.getNewAttribution(`Flourish #${this.hardcastCount}`);
      this.currentRateAttribution = { amount: 0 };
      this.rateAttributions.push(this.currentRateAttribution);
      this.extensionAttributions.push(extensionAttribution);
    }

    let foundWg = false;

    Object.keys(this.hotTracker.hots).forEach((playerIdString) => {
      const playerId = Number(playerIdString);
      Object.keys(this.hotTracker.hots[playerId]).forEach((spellIdString) => {
        const spellId = Number(spellIdString);
        this.hotTracker.addExtension(extensionAttribution, FLOURISH_EXTENSION, playerId, spellId);

        if (spellId === SPELLS.WILD_GROWTH.id) {
          foundWg = true;
        }
      });
    });
    if (foundWg) {
      this.wgsExtended += 1;
    }
  }

  suggestions(when: When) {
    if (this.hardcastCount === 0) {
      return;
    }

    when(this.wildGrowthSuggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Your <SpellLink id={SPELLS.FLOURISH_TALENT.id} /> should always aim to extend a{' '}
          <SpellLink id={SPELLS.WILD_GROWTH.id} />
        </>,
      )
        .icon(SPELLS.FLOURISH_TALENT.icon)
        .actual(
          t({
            id: 'druid.restoration.suggestions.flourish.wildGrowthExtended',
            message: `${formatPercentage(this.wgsExtended / this.hardcastCount, 0)}% WGs extended.`,
          }),
        )
        .recommended(`${formatPercentage(recommended)}% is recommended`),
    );
  }

  statistic() {
    if (!this.selectedCombatant.hasTalent(SPELLS.FLOURISH_TALENT.id)) {
      return; // module needs to stay active for convoke, but we shouldn't display stat
    }
    return (
      <Statistic
        size="flexible"
        position={STATISTIC_ORDER.OPTIONAL(50)}
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            This is the sum of the healing enabled by the HoT extension and the HoT rate increase.
            Due to limitations in the way we do healing attribution, there may be some
            double-counting between the Extension and Increased Rate values, meaning the true amount
            attributable will be somewhat lower than listed.
            <ul>
              <li>
                Extension:{' '}
                <strong>{this.owner.formatItemHealingDone(this.totalExtensionHealing)}</strong>
              </li>
              <li>
                Increased Rate:{' '}
                <strong>{this.owner.formatItemHealingDone(this.totalRateHealing)}</strong>
              </li>
              <li>
                Wild Growths Casts Extended:{' '}
                <strong>
                  {this.wgsExtended} / {this.hardcastCount}
                </strong>
              </li>
              <li>
                Average Healing per Cast: <strong>{formatNumber(this.healingPerCast)}</strong>
              </li>
            </ul>
            <br />
            For the included table, note that extension healing for a flourish cast near the end of
            a fight might have lower than expected numbers because extension healing isn't tallied
            until the HoT has ticked past its original duration.
          </>
        }
        dropdown={
          <>
            <table className="table table-condensed">
              <thead>
                <tr>
                  <th>Cast</th>
                  <th>HoTs Extended</th>
                  <th>Extension Healing</th>
                  <th>Rate Healing</th>
                </tr>
              </thead>
              <tbody>
                {this.extensionAttributions.map((flourish, index) => (
                  <tr key={index}>
                    <th scope="row">{index + 1}</th>
                    <td>{flourish.procs}</td>
                    <td>{formatNumber(flourish.healing)}</td>
                    <td>{formatNumber(this.rateAttributions[index].amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        }
      >
        <BoringSpellValueText spellId={SPELLS.FLOURISH_TALENT.id}>
          <ItemPercentHealingDone approximate amount={this.totalHealing} />
          <br />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export type MutableAmount = {
  amount: number;
};

export default Flourish;
