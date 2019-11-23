import React from 'react';
import { Trans } from '@lingui/macro';
import Analyzer from 'parser/core/Analyzer';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import SPELLS from 'common/SPELLS';
import AzeritePowerStatistic from 'interface/statistics/AzeritePowerStatistic';
import ItemHealingDone from 'interface/others/ItemHealingDone';
import { formatNumber } from 'common/format';
import SpellIcon from 'common/SpellIcon';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText/index';

import BeaconHealSource from '../beacons/BeaconHealSource';

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

  constructor(...args) {
    super(...args);

    this.active = this.selectedCombatant.hasTrait(SPELLS.LIGHTS_DECREE.id);

    if (!this.active) {
      return;
    }
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

  on_byPlayer_heal(event) {
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

  on_beacontransfer(event) {
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
    const buffId = SPELLS.AVENGING_WRATH.id;
    const hist = this.selectedCombatant.getBuffHistory(buffId);
    if (!hist || hist.length === 0) {
      return null;
    }
    let totalIncrease = 0;
    hist.forEach((buff) => {
      const end = buff.end || this.owner.currentTimestamp;
      const duration = (end - buff.start) / 1000;
      const increase = Math.max(0, duration - this.baseDuration);
      totalIncrease += increase;
    });
    return totalIncrease;
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
