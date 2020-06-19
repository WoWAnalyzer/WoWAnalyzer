import React from 'react';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';

import SPELLS from 'common/SPELLS';
import { formatNumber, formatPercentage } from 'common/format';
import Enemies from 'parser/shared/modules/Enemies';
import SpellLink from 'common/SpellLink';
import ItemDamageDone from 'interface/ItemDamageDone';
import StatTracker from 'parser/shared/modules/StatTracker';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import { SERPENT_STING_SV_BASE_DURATION, SERPENT_STING_SV_PANDEMIC } from 'parser/hunter/survival/constants';
import Statistic from 'interface/statistics/Statistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import UptimeIcon from 'interface/icons/Uptime';
import Events, { ApplyDebuffEvent, CastEvent, DamageEvent, RefreshDebuffEvent, RemoveDebuffEvent } from 'parser/core/Events';
import { encodeTargetString } from 'parser/shared/modules/EnemyInstances';

/**
 * Fire a shot that poisons your target, causing them to take (15% of Attack power) Nature damage instantly and an additional (60% of Attack power) Nature damage over 12/(1+haste) sec.
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/ZRALzNbMpqka1fTB#fight=17&type=summary&source=329
 */

class SerpentSting extends Analyzer {
  static dependencies = {
    enemies: Enemies,
    statTracker: StatTracker,
  };

  //Used to handle talents
  hasVV: boolean = false;
  hasBoP: boolean = false;

  //Used for handling when parsing
  serpentStingTargets: { timestamp: number, serpentStingDuration: number }[] = [];
  vipersVenomBuffUp: boolean = false;

  //Used for statistics
  casts: number = 0;
  bonusDamage: number = 0;
  timesRefreshed: number = 0;

  //Used for suggestions
  nonPandemicRefresh: number = 0;
  nonVVBoPRefresh: number = 0;

  protected enemies!: Enemies;
  protected statTracker!: StatTracker;

  constructor(options: any) {
    super(options);
    this.hasBoP = this.selectedCombatant.hasTalent(SPELLS.BIRDS_OF_PREY_TALENT.id);
    this.hasVV = this.selectedCombatant.hasTalent(SPELLS.VIPERS_VENOM_TALENT.id);

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SERPENT_STING_SV), this.onCast);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.SERPENT_STING_SV), this.onDamage);
    this.addEventListener(Events.applydebuff.by(SELECTED_PLAYER).spell(SPELLS.SERPENT_STING_SV), this.onApplyDebuff);
    this.addEventListener(Events.removedebuff.by(SELECTED_PLAYER).spell(SPELLS.SERPENT_STING_SV), this.onRemoveDebuff);
    this.addEventListener(Events.refreshdebuff.by(SELECTED_PLAYER).spell(SPELLS.SERPENT_STING_SV), this.onRefreshDebuff);
  }

  get uptimePercentage() {
    return this.enemies.getBuffUptime(SPELLS.SERPENT_STING_SV.id) / this.owner.fightDuration;
  }

  get nonPandemicThreshold() {
    return {
      actual: this.nonPandemicRefresh,
      isGreaterThan: {
        minor: 1,
        average: 3,
        major: 5,
      },
      style: 'number',
    };
  }

  get nonVVBoPRefreshThreshold() {
    return {
      actual: this.nonVVBoPRefresh,
      isGreaterThan: {
        minor: 1,
        average: 3,
        major: 5,
      },
      style: 'number',
    };
  }

  get uptimeThresholdBoP() {
    if (this.hasVV) {
      return {
        actual: this.uptimePercentage,
        isLessThan: {
          minor: 0.6,
          average: 0.55,
          major: 0.5,
        },
        style: 'percentage',
      };
    } else {
      return {
        actual: this.uptimePercentage,
        isGreaterThan: {
          minor: 0.3,
          average: 0.35,
          major: 0.4,
        },
        style: 'percentage',
      };
    }
  }

  get uptimeThresholdNonBoP() {
    return {
      actual: this.uptimePercentage,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.85,
      },
      style: 'percentage',
    };
  }

  get serpentStingDuringCA() {
    return this.hasBoP && this.selectedCombatant.hasBuff(SPELLS.COORDINATED_ASSAULT.id) && (!this.hasVV || !this.vipersVenomBuffUp);
  }

  get hastedSerpentStingDuration() {
    return SERPENT_STING_SV_BASE_DURATION / (1 + this.statTracker.currentHastePercentage);
  }

  onCast(event: CastEvent) {
    this.casts += 1;

    if (event.meta === undefined) {
      event.meta = {
        isInefficientCast: false,
        isEnhancedCast: false,
        inefficientCastReason: '',
        enhancedCastReason: '',
      };
    }
    if (this.selectedCombatant.hasBuff(SPELLS.VIPERS_VENOM_BUFF.id)) {
      this.vipersVenomBuffUp = true;
      event.meta.isEnhancedCast = true;
      event.meta.enhancedCastReason = 'Viper\'s Venom buff consumed';
    }
    if (this.serpentStingDuringCA) {
      event.meta.isInefficientCast = true;
      event.meta.inefficientCastReason = 'Serpent String cast during Coordinated Assault with Birds of Prey talent used.';
    }
  }

  onDamage(event: DamageEvent) {
    this.bonusDamage += event.amount + (event.absorbed || 0);
  }

  onApplyDebuff(event: ApplyDebuffEvent) {
    let targetInstance = event.targetInstance;
    if (targetInstance === undefined) {
      targetInstance = 1;
    }
    const serpentStingTarget: any = encodeTargetString(event.targetID, targetInstance);
    this.serpentStingTargets[serpentStingTarget] = { timestamp: event.timestamp, serpentStingDuration: this.hastedSerpentStingDuration };
    if (this.vipersVenomBuffUp) {
      this.vipersVenomBuffUp = false;
    }
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
    if (timeRemaining > (this.hastedSerpentStingDuration * SERPENT_STING_SV_PANDEMIC)) {
      this.nonPandemicRefresh += 1;
    } else {
      const pandemicSerpentStingDuration = Math.min(this.hastedSerpentStingDuration * SERPENT_STING_SV_PANDEMIC, timeRemaining) + this.hastedSerpentStingDuration;
      this.serpentStingTargets[serpentStingTarget].timestamp = event.timestamp;
      this.serpentStingTargets[serpentStingTarget].serpentStingDuration = pandemicSerpentStingDuration;
    }
    if (this.hasBoP && this.selectedCombatant.hasBuff(SPELLS.COORDINATED_ASSAULT.id)) {
      if (this.vipersVenomBuffUp) {
        this.vipersVenomBuffUp = false;
      } else {
        this.nonVVBoPRefresh += 1;
      }
    }
  }

  suggestions(when: any) {
    if (this.hasBoP) {
      const suggestionText = this.hasVV ?
        <> You should make sure to keep up <SpellLink id={SPELLS.SERPENT_STING_SV.id} /> by using it within the pandemic windows during <SpellLink id={SPELLS.COORDINATED_ASSAULT.id} />, so long as you have a <SpellLink id={SPELLS.VIPERS_VENOM_TALENT.id} /> proc. </> :
        <>With <SpellLink id={SPELLS.BIRDS_OF_PREY_TALENT.id} /> talented and without <SpellLink id={SPELLS.VIPERS_VENOM_TALENT.id} /> talented, you don't want to cast <SpellLink id={SPELLS.SERPENT_STING_SV.id} /> during <SpellLink id={SPELLS.COORDINATED_ASSAULT.id} /> at all, which is a majority of the fight, therefore a low uptime of <SpellLink id={SPELLS.SERPENT_STING_SV.id} /> is better than a high uptime. </>;

      when(this.uptimeThresholdBoP).addSuggestion((suggest: any, actual: any, recommended: any) => {
        return suggest(suggestionText)
          .icon(SPELLS.SERPENT_STING_SV.icon)
          .actual(`${formatPercentage(actual)}% Serpent Sting uptime`)
          .recommended(`<${formatPercentage(recommended)}% is recommended`);
      });
    } else {
      when(this.uptimeThresholdNonBoP).addSuggestion((suggest: any, actual: any, recommended: any) => {
        return suggest(<>Remember to maintain the <SpellLink id={SPELLS.SERPENT_STING_SV.id} /> on enemies, but don't refresh the debuff unless it has less than {formatPercentage(SERPENT_STING_SV_PANDEMIC, 0)}% duration remaining.</>)
          .icon(SPELLS.SERPENT_STING_SV.icon)
          .actual(`${formatPercentage(actual)}% Serpent Sting uptime`)
          .recommended(`>${formatPercentage(recommended)}% is recommended`);
      });
    }

    when(this.nonPandemicThreshold).addSuggestion((suggest: any, actual: any, recommended: any) => {
      return suggest(<>It is not recommended to refresh <SpellLink id={SPELLS.SERPENT_STING_SV.id} /> earlier than when there is less than {formatPercentage(SERPENT_STING_SV_PANDEMIC, 0)}% of the duration remaining. </>)
        .icon(SPELLS.SERPENT_STING_SV.icon)
        .actual(`${actual} Serpent Sting cast(s) were cast too early`)
        .recommended(`<${recommended} is recommended`);
    });
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(19)}
        size="flexible"
        tooltip={(
          <>
            <ul>
              <li>You cast Serpent Sting a total of {this.casts} times.</li>
              <li>You refreshed the debuff {this.timesRefreshed} times.</li>
              {this.nonVVBoPRefresh + this.nonPandemicRefresh > 0 &&
              <ul>
                {this.nonPandemicRefresh > 0 && <li>You had {this.nonPandemicRefresh} refreshes outside of the pandemic window. This means refreshes with more than {formatPercentage(SERPENT_STING_SV_PANDEMIC, 0)}% of the current debuff remaining and no Viper's Venom buff active.</li>}
                {this.hasBoP && this.hasVV && this.nonVVBoPRefresh > 0 && <li>During Coordinated Assault, you should only refresh Serpent Sting when there is less than {formatPercentage(SERPENT_STING_SV_PANDEMIC, 0)}% remaining on Serpent Sting AND you have a Viper's Venom proc. You refreshed it incorrectly {this.nonVVBoPRefresh} times.</li>}
                {this.hasBoP && !this.hasVV && this.nonVVBoPRefresh > 0 && <li>Because you're using Birds of Prey, but not using Viper's Venom, you should never refresh Serpent Sting during Coordinated Assault buff. You did this {this.nonVVBoPRefresh} times.</li>}
              </ul>}
              <li>Serpent Sting dealt a total of {formatNumber(this.bonusDamage / this.owner.fightDuration * 1000)} DPS or {formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.bonusDamage))}% of your total damage.</li>
            </ul>
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.SERPENT_STING_SV}>
          <>
            <ItemDamageDone amount={this.bonusDamage} /> <br />
            <UptimeIcon /> {formatPercentage(this.uptimePercentage)}% <small>uptime</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default SerpentSting;
