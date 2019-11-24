import React from 'react';
import { Trans } from '@lingui/macro';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import SPELLS from 'common/SPELLS';
import AzeritePowerStatistic from 'interface/statistics/AzeritePowerStatistic';
import ItemHealingDone from 'interface/others/ItemHealingDone';
import { formatNumber } from 'common/format';
import SpellIcon from 'common/SpellIcon';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText/index';

import BeaconHealSource from '../beacons/BeaconHealSource';
import Events from 'parser/core/Events';

const AW_BASE_DURATION = 20;
const LIGHTS_DECREE_DURATION = 5;

/**
 * Spending Holy Power during Avenging Wrath causes you to explode with Holy light for 508 damage per Holy Power spent to nearby enemies.
 * Avenging Wrath's duration is increased by 5 sec.
 */
class LightsDecree extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    beaconHealSource: BeaconHealSource,
  };

  baseDuration = AW_BASE_DURATION;
  regularHealing = 0;
  healingTransfered = 0;
  healingFromGlimmer = 0;
  avengingWrathCasts = 0;

  constructor(...args) {
    super(...args);

    this.active = this.selectedCombatant.hasTrait(SPELLS.LIGHTS_DECREE.id);

    if (!this.active) {
      return;
    }

    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.onHeal);
    this.addEventListener(this.beaconHealSource.beacontransfer.by(SELECTED_PLAYER), this.onBeaconTransfer);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.AVENGING_WRATH), this.onCastAvengingWrath);
  }

  hasAvengingWrathBuffThroughLightsDecree(event) {
    const buff = this.selectedCombatant.getBuff(SPELLS.AVENGING_WRATH.id, event.timestamp);

    if (buff === undefined) {
      return false;
    }

    const end = buff.end || event.timestamp;
    const remainingDuration = (end - buff.start) / 1000;

    return remainingDuration <= LIGHTS_DECREE_DURATION;
  }

  onCastAvengingWrath() {
    this.avengingWrathCasts++;
  }

  onHeal(event) {
    if (!this.hasAvengingWrathBuffThroughLightsDecree(event)) {
      return;
    }

    const healingDone = (event.amount + (event.absorbed || 0));

    this.regularHealing += healingDone;

    if (event.ability.guid !== SPELLS.GLIMMER_OF_LIGHT.id) {
      return;
    }

    this.healingFromGlimmer += healingDone;
  }

  onBeaconTransfer(event) {
    if (!this.hasAvengingWrathBuffThroughLightsDecree(event)) {
      return;
    }

    const healingDone = (event.amount + (event.absorbed || 0));

    this.healingTransfered += healingDone;

    if (event.originalHeal.ability.guid !== SPELLS.GLIMMER_OF_LIGHT.id) {
      return;
    }

    this.healingFromGlimmer += healingDone;
  }

  get totalHealing() {
    return this.regularHealing + this.healingTransfered;
  }

  get totalDurationIncrease() {
    return this.avengingWrathCasts * LIGHTS_DECREE_DURATION;
  }

  statistic() {
    return (
      <AzeritePowerStatistic
        size="flexible"
        tooltip={(
          <Trans>
            The amount of healing done during the additional {LIGHTS_DECREE_DURATION} seconds given by the azerite trait. <br />

            Healing done: <b>{formatNumber(this.totalHealing)}</b> <br />
            Beacon healing transfered: <b>{formatNumber(this.healingTransfered)}</b> <br />
            Glimmer healing done: <b>{formatNumber(this.healingFromGlimmer)}</b> <br />
          </Trans>
        )}
      >
        <BoringSpellValueText spell={SPELLS.LIGHTS_DECREE}>
          <ItemHealingDone amount={this.totalHealing} />
          <br />
          <SpellIcon id={SPELLS.AVENGING_WRATH.id} /> +{formatNumber(this.totalDurationIncrease)} seconds
        </BoringSpellValueText>
      </AzeritePowerStatistic>
    );
  }
}

export default LightsDecree;
