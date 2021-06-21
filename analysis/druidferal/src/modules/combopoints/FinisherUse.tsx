import { t } from '@lingui/macro';
import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import BoringResourceValue from 'parser/ui/BoringResourceValue';
import Statistic from 'parser/ui/Statistic';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import React from 'react';

import { FINISHERS, MAX_CPS } from '../../constants';
import RipSnapshot from '../bleeds/RipSnapshot';
import getComboPointsFromEvent from '../core/getComboPointsFromEvent';

/**
 * Although all finishers are most efficient at 5 combo points, in some situations use at fewer combo points
 * will be a damage increase compared to waiting for the full 5.
 *
 * Situations where <5 combo point use of an ability is fine:
 *  Fresh Rip on a target which doesn't yet have it.
 *  [NYI] Maim on a target where the stun is effective and useful.
 *  [NYI] Possibly when using Savage Roar? Will need theorycrafting.
 */
class FinisherUse extends Analyzer {
  static dependencies = {
    ripSnapshot: RipSnapshot,
  };

  totalFinishers = 0;
  notFullComboFinishers = 0;
  badFinishers = 0;
  freshRips = 0;
  upgradingRips = 0;

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(FINISHERS), this.onFinisher);
  }

  onFinisher(event: CastEvent) {
    this.totalFinishers += 1;

    const combo = getComboPointsFromEvent(event);
    if (!combo || combo === MAX_CPS) {
      // either full combo points (therefore not a problem) used or something went wrong and couldn't get combo information
      return;
    }
    this.notFullComboFinishers += 1;

    if (event.ability.guid !== SPELLS.RIP.id) {
      this.badFinishers += 1;
      return;
    }

    // TODO
    // // Rip has been used without full combo points, which is a good thing only in certain situations
    // // RipSnapshot will have added the feralSnapshotState prop to the event, because this module has RipSnapshot as a dependency
    // // we know that will have been done before this executes.
    // if (!event.feralSnapshotState) {
    //   // ..but when it comes to null references it's worth checking.
    //   // If for some reason the property doesn't exist just skip checking this cast
    //   debug && this.warn("Rip cast event doesn't have the expected feralSnapshotState property.");
    //   return;
    // }
    // if (RipSnapshot.wasStateFreshlyApplied(event.feralSnapshotState)) {
    //   debug &&
    //   this.log(
    //     `cast ${finisher.name} with ${combo} combo points but it was a fresh application, so is good`,
    //   );
    //   this.freshRips += 1;
    //   return;
    // }
    // if (this.hasSabertooth && RipSnapshot.wasStatePowerUpgrade(event.feralSnapshotState)) {
    //   debug &&
    //   this.log(
    //     `cast ${finisher.name} with ${combo} combo points but it was upgrading ready to be extended with sabertooth, so is good`,
    //   );
    //   this.upgradingRips += 1;
    //   return;
    // }
    // debug && this.log(`cast ${finisher.name} with ${combo} combo points`);
    // this.badFinishers += 1;
  }

  get fractionBadFinishers() {
    return this.totalFinishers === 0 ? 0 : this.badFinishers / this.totalFinishers;
  }

  get badFinishersThresholds() {
    return {
      actual: this.fractionBadFinishers,
      isGreaterThan: {
        minor: 0,
        average: 0.05,
        major: 0.2,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  // TODO update wording
  suggestions(when: When) {
    when(this.badFinishersThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You are unnecessarily using finishers at less than full combo points. Generally the only
          finisher you should use without full combo points is <SpellLink id={SPELLS.RIP.id} /> when
          applying it to a target that doesn't have it active yet.
        </>,
      )
        .icon('creatureportrait_bubble')
        .actual(
          t({
            id: 'druid.feral.suggestions.finishers.efficiency',
            message: `${(actual * 100).toFixed(
              0,
            )}% of finishers were incorrectly used without full combo points`,
          }),
        )
        .recommended(`${(recommended * 100).toFixed(0)}% is recommended`),
    );
  }

  // TODO update wording
  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(6)}
        size="small"
        tooltip={
          <>
            All finisher abilities are most efficient when used at full combo points, but there are
            situations where that rule doesn't apply. Of the <b>{this.totalFinishers}</b> finishers
            you used, <b>{this.notFullComboFinishers}</b>{' '}
            {this.notFullComboFinishers === 1 ? 'was' : 'were'} used without full combo points, and{' '}
            <b>{this.badFinishers}</b> appear not to have had a good reason for their low combo use.
            <br />
            <ul>
              <li>
                <b>{this.freshRips}</b>{' '}
                {this.freshRips === 1 ? 'was a fresh Rip' : 'were fresh Rips'} applied to a target
                which didn't already have the DoT, where low combo point use is typically the right
                thing to do.
              </li>
              <li>
                <b>{this.upgradingRips}</b>{' '}
                {this.upgradingRips === 1 ? 'was an upgrading Rip' : 'were upgrading Rips'} where
                thanks to snapshotting the new DoT would do more damage than the existing. When
                combined with Sabertooth to extend the improved DoT this is a situation where low
                combo finisher use is of benefit.
              </li>
            </ul>
          </>
        }
      >
        <BoringResourceValue
          resource={RESOURCE_TYPES.COMBO_POINTS}
          value={`${(this.fractionBadFinishers * 100).toFixed(0)}%`}
          label="Low Combo Finishers"
        />
      </Statistic>
    );
  }
}

export default FinisherUse;
