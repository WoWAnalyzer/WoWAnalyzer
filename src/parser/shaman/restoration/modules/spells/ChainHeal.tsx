import React from 'react';

import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';
import { TooltipElement } from 'common/Tooltip';
import SPECS, { Spec } from 'game/SPECS';
import SpecIcon from 'common/SpecIcon';
import { formatNth, formatDuration } from 'common/format';

import Events, { CastEvent, EventType, HealEvent } from 'parser/core/Events';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';

import Combatants from 'parser/shared/modules/Combatants';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import { When } from 'parser/core/ParseResults';

import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';
import { Trans } from '@lingui/macro';

import RestorationAbilityTracker from '../core/RestorationAbilityTracker';

const CHAIN_HEAL_TARGET_EFFICIENCY = 0.97;
const HEAL_WINDOW_MS = 250;

interface ChainHealInfo {
  target: {
    id: number | undefined,
    name: string,
    spec: Spec,
    specClassName: string
  }
  timestamp: number,
  castNo: number,
  hits: number
}

class ChainHeal extends Analyzer {
  static dependencies = {
    abilityTracker: RestorationAbilityTracker,
    combatants: Combatants,
  };

  protected abilityTracker!: RestorationAbilityTracker;
  protected combatants!: Combatants;

  buffer: Array<HealEvent | CastEvent> = [];
  chainHealHistory: ChainHealInfo[] = [];
  castIndex = 0;
  chainHealTimestamp = 0;
  maxTargets = 4;
  suggestedTargets = 0;

  constructor(options: Options) {
    super(options);
    this.suggestedTargets = this.maxTargets * CHAIN_HEAL_TARGET_EFFICIENCY;

    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.CHAIN_HEAL), this.chainHeal);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.CHAIN_HEAL), this.chainHeal);
  }

  chainHeal(event: HealEvent | CastEvent) {
    if (!this.chainHealTimestamp || event.timestamp - this.chainHealTimestamp > HEAL_WINDOW_MS) {
      this.processBuffer();
      this.chainHealTimestamp = event.timestamp;
    }

    this.buffer.push({
      ...event,
    });
  }

  processBuffer() {
    if (this.buffer.length === 0) {
      return;
    }
    this.castIndex += 1;
    const currentCast = this.buffer.find(event => event.type === EventType.Cast);
    if (!currentCast) {
      return;
    }
    const combatant = this.combatants.getEntity(currentCast);
    if (!combatant) {
      return;
    }
    this.chainHealHistory[this.castIndex] = {
      target: {
        id: currentCast.targetID,
        name: combatant.name,
        spec: SPECS[combatant.specId],
        specClassName: SPECS[combatant.specId].className.replace(' ', ''),
      },
      timestamp: currentCast.timestamp,
      castNo: this.castIndex,
      hits: this.buffer.filter(event => event.type === EventType.Heal).length,
    };
    this.buffer = [];
  }

  suggestions(when: When) {
    const suggestedThreshold = this.suggestionThreshold;
    if (isNaN(suggestedThreshold.actual)) {
      return;
    }
    when(suggestedThreshold.actual).isLessThan(suggestedThreshold.isLessThan.minor)
      .addSuggestion((suggest, actual, recommended) => suggest(<Trans id="shaman.restoration.suggestions.chainHeal.label">Try to always cast <SpellLink id={SPELLS.CHAIN_HEAL.id} /> on groups of people, so that it heals all {this.maxTargets} potential targets.</Trans>)
          .icon(SPELLS.CHAIN_HEAL.icon)
          .actual(`${suggestedThreshold.actual.toFixed(2)} ${i18n._(t('shaman.restoration.suggestions.chainHeal.averageTargets')`average targets healed`)}`)
          .recommended(`${suggestedThreshold.isLessThan.minor} ${i18n._(t('shaman.restoration.suggestions.chainHeal.averageTargets')`average targets healed`)}`)
          .regular(suggestedThreshold.isLessThan.average).major(suggestedThreshold.isLessThan.major));
  }

  get avgHits() {
    const chainHeal = this.abilityTracker.getAbility(SPELLS.CHAIN_HEAL.id);
    const casts = chainHeal.casts;
    const hits = chainHeal.healingHits;
    return hits / casts || 0;
  }

  get casts() {
    return this.abilityTracker.getAbility(SPELLS.CHAIN_HEAL.id).casts;
  }

  get suggestionThreshold() {
    return {
      actual: this.avgHits,
      isLessThan: {
        minor: this.suggestedTargets,//Missed 1 target
        average: this.suggestedTargets - 1,//Missed 2-3 targets
        major: this.suggestedTargets - 2,//Missed more than 3 targets
      },
      style: 'number',
    };
  }

  statistic() {
    if (this.casts === 0) {
      return false;
    }

    const singleHits = this.chainHealHistory.filter(cast => cast.hits === 1);

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.CHAIN_HEAL.id} />}
        value={this.avgHits.toFixed(2)}
        position={STATISTIC_ORDER.OPTIONAL(70)}
        label={(
          <TooltipElement content={<Trans id="shaman.restoration.chainHeal.averageTargets.tooltip">The average number of targets healed by Chain Heal out of the maximum amount of targets. You cast a total of {this.casts} Chain Heals, which healed an average of {this.avgHits.toFixed(2)} out of {this.maxTargets} targets.</Trans>}>
            <Trans id="shaman.restoration.chainHeal.averageTargets">Average Chain Heal targets</Trans>
          </TooltipElement>
        )}
      >
        {singleHits.length > 0 && (
          <>
            <div>
              <Trans id="shaman.restoration.chainHeal.averageTargets.title">Below are the casts that only hit the initial target. A large list indicates that target selection is an area for improvement.</Trans>
            </div>
            <table className="table table-condensed" style={{ fontWeight: 'bold' }}>
              <thead>
                <tr>
                  <th><Trans id="common.cast">Cast</Trans></th>
                  <th><Trans id="common.time">Time</Trans></th>
                  <th><Trans id="common.target">Target</Trans></th>
                </tr>
              </thead>
              <tbody>
                {
                  this.chainHealHistory
                    .filter(cast => cast.hits === 1)
                    .map(cast => (
                      <tr key={cast.timestamp}>
                        <th scope="row">{formatNth(cast.castNo)}</th>
                        <td>{formatDuration((cast.timestamp - this.owner.fight.start_time) / 1000, 0)}</td>
                        <td className={cast.target.specClassName}> <SpecIcon id={cast.target.spec.id} />{' '}{cast.target.name}</td>
                      </tr>
                    ))
                }
              </tbody>
            </table>
          </>
        )}
      </StatisticBox>
    );
  }
}

export default ChainHeal;
