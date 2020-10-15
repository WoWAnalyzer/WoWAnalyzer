import React from 'react';

import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import BoringResourceValue from 'interface/statistics/components/BoringResourceValue/index';
import { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import Statistic from 'interface/statistics/Statistic';
import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';

import getComboPointsFromEvent from '../core/getComboPointsFromEvent';
import RipSnapshot from '../bleeds/RipSnapshot';

const debug = false;

const FINISHERS = [
  SPELLS.FEROCIOUS_BITE,
  SPELLS.RIP,
  SPELLS.MAIM,
  SPELLS.PRIMAL_WRATH_TALENT,
  SPELLS.SAVAGE_ROAR_TALENT,
];
const MAX_COMBO = 5;

/**
 * Although all finishers are most efficient at 5 combo points, in some situations use at fewer combo points
 * will be a damage increase compared to waiting for the full 5.
 *
 * Situations where <5 combo point use of an ability is fine:
 *  Fresh Rip on a target which doesn't yet have it.
 *  Rip on a target that already has Rip if it upgrades the snapshot, so long as player is using Sabertooth.
 *  [NYI] Maim on a target where the stun is effective and useful.
 *  [NYI] Possibly when using Savage Roar? Will need theorycrafting.
 *
 */
class FinisherUse extends Analyzer {
  static dependencies = {
    ripSnapshot: RipSnapshot,
  };

  hasSabertooth = false;

  totalFinishers = 0;
  notFullComboFinishers = 0;
  badFinishers = 0;
  freshRips = 0;
  upgradingRips = 0;

  constructor(...args) {
    super(...args);
    this.hasSabertooth = this.selectedCombatant.hasTalent(SPELLS.SABERTOOTH_TALENT.id);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this._castSpell);
  }

  _castSpell(event) {
    const finisher = FINISHERS.find(element => element.id === event.ability.guid);
    if (!finisher) {
      return;
    }
    this.totalFinishers += 1;

    const combo = getComboPointsFromEvent(event);
    if (!combo || combo === MAX_COMBO) {
      // either full combo points (therefore not a problem) used or something went wrong and couldn't get combo information
      return;
    }
    this.notFullComboFinishers += 1;

    if (finisher !== SPELLS.RIP) {
      this.badFinishers += 1;
      debug && this.log(`cast ${finisher.name} with ${combo} combo points`);
      return;
    }

    // Rip has been used without full combo points, which is a good thing only in certain situations
    // RipSnapshot will have added the feralSnapshotState prop to the event, because this module has RipSnapshot as a dependency
    // we know that will have been done before this executes.
    if (!event.feralSnapshotState) {
      // ..but when it comes to null references it's worth checking.
      // If for some reason the property doesn't exist just skip checking this cast
      debug && this.warn('Rip cast event doesn\'t have the expected feralSnapshotState property.');
      return;
    }
    if (RipSnapshot.wasStateFreshlyApplied(event.feralSnapshotState)) {
      debug && this.log(`cast ${finisher.name} with ${combo} combo points but it was a fresh application, so is good`);
      this.freshRips += 1;
      return;
    }
    if (this.hasSabertooth && RipSnapshot.wasStatePowerUpgrade(event.feralSnapshotState)) {
      debug && this.log(`cast ${finisher.name} with ${combo} combo points but it was upgrading ready to be extended with sabertooth, so is good`);
      this.upgradingRips += 1;
      return;
    }
    debug && this.log(`cast ${finisher.name} with ${combo} combo points`);
    this.badFinishers += 1;
  }

  get fractionBadFinishers() {
    if (this.totalFinishers === 0) {
      return 0;
    }
    return this.badFinishers / this.totalFinishers;
  }

  get badFinishersThresholds() {
    return {
      actual: this.fractionBadFinishers,
      isGreaterThan: {
        minor: 0,
        average: 0.05,
        major: 0.10,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.badFinishersThresholds).addSuggestion((suggest, actual, recommended) => suggest(
        <>
          You are unnecessarily using finishers at less than full combo points. Generally the only finisher you should use without full combo points is <SpellLink id={SPELLS.RIP.id} /> when applying it to a target that doesn't have it active yet.
        </>,
      )
        .icon('creatureportrait_bubble')
        .actual(i18n._(t('druid.feral.suggestions.finishers.efficiency')`${(actual * 100).toFixed(0)}% of finishers were incorrectly used without full combo points`))
        .recommended(`${(recommended * 100).toFixed(0)}% is recommended`));
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(6)}
        size="small"
        tooltip={(
          <>
            All finisher abilities are most efficient when used at full combo points, but there are situations where that rule doesn't apply. Of the <b>{this.totalFinishers}</b> finishers you used, <b>{this.notFullComboFinishers}</b> {this.notFullComboFinishers === 1 ? 'was' : 'were'} used without full combo points, and <b>{this.badFinishers}</b> appear not to have had a good reason for their low combo use.<br />
            <ul>
              <li><b>{this.freshRips}</b> {this.freshRips === 1 ? 'was a fresh Rip' : 'were fresh Rips'} applied to a target which didn't already have the DoT, where low combo point use is typically the right thing to do.</li>
              <li><b>{this.upgradingRips}</b> {this.upgradingRips === 1 ? 'was an upgrading Rip' : 'were upgrading Rips'} where thanks to snapshotting the new DoT would do more damage than the existing. When combined with Sabertooth to extend the improved DoT this is a situation where low combo finisher use is of benefit.</li>
            </ul>
          </>
        )}
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
