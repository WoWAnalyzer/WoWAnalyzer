import { formatPercentage } from 'common/format';
import SpellLink from 'common/SpellLink';

import SPELLS from 'common/SPELLS';
import ItemDamageDone from 'interface/ItemDamageDone';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import Statistic from 'interface/statistics/Statistic';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import Events, { ApplyDebuffEvent, DamageEvent, RefreshDebuffEvent, RemoveDebuffEvent } from 'parser/core/Events';
import { SERPENT_STING_MM_BASE_DURATION, SERPENT_STING_MM_PANDEMIC } from 'parser/hunter/marksmanship/constants';
import Enemies from 'parser/shared/modules/Enemies';
import { encodeTargetString } from 'parser/shared/modules/EnemyInstances';
import React from 'react';
import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';

/**
 * Fire a shot that poisons your target, causing them to take (16.5% of Attack power) Nature damage instantly and an additional (99% of Attack power) Nature damage over 18 sec.
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/GWwtNLVQD8adn6q9#fight=5&type=damage-done&source=18&ability=271788
 *
 */

class SerpentSting extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  serpentStingTargets: Array<{ timestamp: number, serpentStingDuration: number }> = [];
  damage: number = 0;
  timesRefreshed: number = 0;
  nonPandemicRefresh: number = 0;
  casts: number = 0;

  protected enemies!: Enemies;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.SERPENT_STING_TALENT.id);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SERPENT_STING_TALENT), this.onCast);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.SERPENT_STING_TALENT), this.onDamage);
    this.addEventListener(Events.applydebuff.by(SELECTED_PLAYER).spell(SPELLS.SERPENT_STING_TALENT), this.onApplyDebuff);
    this.addEventListener(Events.removedebuff.by(SELECTED_PLAYER).spell(SPELLS.SERPENT_STING_TALENT), this.onRemoveDebuff);
    this.addEventListener(Events.refreshdebuff.by(SELECTED_PLAYER).spell(SPELLS.SERPENT_STING_TALENT), this.onRefreshDebuff);
  }

  get uptimePercentage() {
    return this.enemies.getBuffUptime(SPELLS.SERPENT_STING_TALENT.id) / this.owner.fightDuration;
  }

  get nonPandemicThreshold() {
    return {
      actual: this.nonPandemicRefresh,
      isGreaterThan: {
        minor: 1,
        average: 3,
        major: 5,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  get uptimeThreshold() {
    return {
      actual: this.uptimePercentage,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.85,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  onCast() {
    this.casts += 1;
  }

  onDamage(event: DamageEvent) {
    this.damage += event.amount + (event.absorbed || 0);
  }

  onApplyDebuff(event: ApplyDebuffEvent) {
    let targetInstance = event.targetInstance;
    if (targetInstance === undefined) {
      targetInstance = 1;
    }
    const serpentStingTarget: any = encodeTargetString(event.targetID, targetInstance);
    this.serpentStingTargets[serpentStingTarget] = { timestamp: event.timestamp, serpentStingDuration: SERPENT_STING_MM_BASE_DURATION };

  }

  onRemoveDebuff(event: RemoveDebuffEvent) {
    let targetInstance = event.targetInstance;
    if (targetInstance === undefined) {
      targetInstance = 1;
    }
    const serpentStingTarget: any = encodeTargetString(event.targetID, targetInstance);
    this.serpentStingTargets.splice(serpentStingTarget, 1);
  }

  onRefreshDebuff(event: RefreshDebuffEvent) {
    let targetInstance = event.targetInstance;
    if (targetInstance === undefined) {
      targetInstance = 1;
    }
    const serpentStingTarget: any = encodeTargetString(event.targetID, targetInstance);
    this.timesRefreshed += 1;

    const timeRemaining = this.serpentStingTargets[serpentStingTarget].serpentStingDuration - (event.timestamp - this.serpentStingTargets[serpentStingTarget].timestamp);
    if (timeRemaining > (SERPENT_STING_MM_BASE_DURATION * SERPENT_STING_MM_PANDEMIC)) {
      this.nonPandemicRefresh += 1;
    } else {
      const pandemicSerpentStingDuration = Math.min(SERPENT_STING_MM_BASE_DURATION * SERPENT_STING_MM_PANDEMIC, timeRemaining) + SERPENT_STING_MM_BASE_DURATION;
      this.serpentStingTargets[serpentStingTarget].timestamp = event.timestamp;
      this.serpentStingTargets[serpentStingTarget].serpentStingDuration = pandemicSerpentStingDuration;
    }
  }

  suggestions(when: When) {
    when(this.nonPandemicThreshold).addSuggestion((suggest, actual, recommended) => suggest(
        <>It is not recommended to refresh <SpellLink id={SPELLS.SERPENT_STING_TALENT.id} /> earlier than when there is less than {formatPercentage(SERPENT_STING_MM_PANDEMIC, 0)}% of the duration remaining.
        </>)
        .icon(SPELLS.SERPENT_STING_TALENT.icon)
        .actual(i18n._(t('hunter.marksmanship.suggestions.serpentSting.refreshOutsidePandemic')`You refreshed Serpent Sting ${actual} times when it wasn't in the pandemic window`))
        .recommended(`${recommended} non-pandemic refreshes is recommended`));

    when(this.uptimeThreshold).addSuggestion((suggest, actual, recommended) => suggest(
        <>
          You should make sure to keep up <SpellLink id={SPELLS.SERPENT_STING_TALENT.id} /> by using it within the pandemic windows to maximize it's damage potential.
        </>)
        .icon(SPELLS.SERPENT_STING_TALENT.icon)
        .actual(i18n._(t('hunter.marksmanship.suggestions.serpentSting.uptime')`You had an uptime of ${formatPercentage(actual, 0)}%`))
        .recommended(`An uptime of >${formatPercentage(recommended, 0)}% is recommended`));
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={(
          <>
            <ul>
              <li>You cast Serpent Sting a total of {this.casts} times.</li>
              <li>You refreshed the debuff {this.timesRefreshed} times.</li>
              <li>You had {this.nonPandemicRefresh} refreshes outside of the pandemic window. This means refreshes with more than {formatPercentage(SERPENT_STING_MM_PANDEMIC, 0)}% of the current debuff remaining.</li>
            </ul>
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.SERPENT_STING_TALENT}>
          <>
            <ItemDamageDone amount={this.damage} /><br />
            {formatPercentage(this.uptimePercentage)}% <small>uptime</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default SerpentSting;
