import React from 'react';

import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';
import { TooltipElement } from 'common/Tooltip';

import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import StatisticListBoxItem from 'interface/others/StatisticListBoxItem';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { HealEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import { Trans } from '@lingui/macro';

import CooldownThroughputTracker from '../features/CooldownThroughputTracker';
import RestorationAbilityTracker from '../core/RestorationAbilityTracker';

const BUFFER = 100;
const cooldownIncrease = 5000;
const maxHits = 6;

/**
 * CD changes depending on amount of effective targets hit (0 = 5s, 6 = 35s)
 */

class Downpour extends Analyzer {
  static dependencies = {
    cooldownThroughputTracker: CooldownThroughputTracker,
    spellUsable: SpellUsable,
    abilityTracker: RestorationAbilityTracker,
  };

  protected cooldownThroughputTracker!: CooldownThroughputTracker;
  protected spellUsable!: SpellUsable;
  protected abilityTracker!: RestorationAbilityTracker;

  healing = 0;
  downpourHits = 0;
  downpourHitsSum = 0;
  downpourTimestamp = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.DOWNPOUR_TALENT.id);

    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this._onHeal);
  }

  _onHeal(event: HealEvent) {
    // This spells cooldown gets increased depending on how many targets you heal
    // instead we set it to the maximum possible cooldown and reduce it by how many it fully overhealed or missed
    if (this.downpourTimestamp && event.timestamp > this.downpourTimestamp + BUFFER) {
      const reductionMS = (maxHits - this.downpourHits) * cooldownIncrease;
      this.spellUsable.reduceCooldown(SPELLS.DOWNPOUR_TALENT.id, reductionMS);
      this.downpourTimestamp = 0;
      this.downpourHits = 0;
    }

    const spellId = event.ability.guid;
    if (spellId !== SPELLS.DOWNPOUR_TALENT.id) {
      return;
    }

    if (event.amount) {
      this.downpourHits += 1;
      this.downpourHitsSum += 1;
    }

    this.downpourTimestamp = event.timestamp;
    this.healing += event.amount + (event.absorbed || 0);
  }

  statistic() {
    const downpour = this.abilityTracker.getAbility(SPELLS.DOWNPOUR_TALENT.id);

    const downpourCasts = downpour.casts;
    if (!downpourCasts) {
      return null;
    }
    // downpourHits are all hits and downpourHitsSum are only the ones with effective healing done
    const downpourHits = downpour.healingHits;
    const downpourAverageHits = (this.downpourHitsSum) / downpourCasts;
    const downpourAverageOverhealedHits = (downpourHits - this.downpourHitsSum) / downpourCasts;
    const downpourAverageCooldown = 5 + (this.downpourHitsSum / downpourCasts * 5);

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.DOWNPOUR_TALENT.id} />}
        value={<Trans id="shaman.restoration.downpour.statistic.value">{downpourAverageCooldown.toFixed(1)} seconds</Trans>}
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.OPTIONAL(90)}
        label={(
          <TooltipElement
            content={(
              <Trans id="shaman.restoration.downpour.statistic.label.tooltip">
                You cast a total of {downpourCasts} Downpours, which on average hit {(downpourAverageHits + downpourAverageOverhealedHits).toFixed(1)} out of 6 targets. <br />
                Of those hits, {downpourAverageHits.toFixed(1)} had effective healing and increased the cooldown.
              </Trans>
            )}
          >
            <Trans id="shaman.restoration.downpour.statistic.label">Average Downpour cooldown</Trans>
          </TooltipElement>
        )}
      />
    );
  }

  subStatistic() {
    const feeding = this.cooldownThroughputTracker.getIndirectHealing(SPELLS.DOWNPOUR_TALENT.id);
    return (
      <StatisticListBoxItem
        title={<SpellLink id={SPELLS.DOWNPOUR_TALENT.id} />}
        value={`${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.healing + feeding))} %`}
      />
    );
  }

}

export default Downpour;

