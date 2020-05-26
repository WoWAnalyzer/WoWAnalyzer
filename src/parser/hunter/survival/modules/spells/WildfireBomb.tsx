import React from 'react';

import Analyzer from 'parser/core/Analyzer';

import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';
import Enemies from 'parser/shared/modules/Enemies';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import StatTracker from 'parser/shared/modules/StatTracker';
import SpellLink from 'common/SpellLink';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import GlobalCooldown from 'parser/shared/modules/GlobalCooldown';
import Statistic from 'interface/statistics/Statistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import { CastEvent, DamageEvent } from 'parser/core/Events';

/**
 * Hurl a bomb at the target, exploding for (45% of Attack power) Fire
 * damage in a cone and coating enemies in wildfire, scorching them for (90%
 * of Attack power) Fire damage over 6 sec.
 *
 * Example log: https://www.warcraftlogs.com/reports/pNJbYdLrMW2ynKGa#fight=3&type=damage-done&source=16&translate=true
 */

const GCD_BUFFER = 500; //People aren't robots, give them a bit of leeway in terms of when they cast WFB to avoid capping on charges
const MS_BUFFER = 200;

class WildfireBomb extends Analyzer {
  static dependencies = {
    enemies: Enemies,
    spellUsable: SpellUsable,
    statTracker: StatTracker,
    globalCooldown: GlobalCooldown,
  };

  acceptedCastDueToCapping = false;
  currentGCD = 0;
  badRefreshes = 0;
  lastRefresh = 0;
  casts = 0;
  targetsHit = 0;

  protected enemies!: Enemies;
  protected spellUsable!: SpellUsable;
  protected statTracker!: StatTracker;
  protected globalCooldown!: GlobalCooldown;

  constructor(options: any) {
    super(options);
    this.active = !this.selectedCombatant.hasTalent(SPELLS.WILDFIRE_INFUSION_TALENT.id);
  }

  get uptimePercentage() {
    return this.enemies.getBuffUptime(SPELLS.WILDFIRE_BOMB_DOT.id) / this.owner.fightDuration;
  }

  get badWFBThresholds() {
    return {
      actual: this.badRefreshes,
      isGreaterThan: {
        minor: 2,
        average: 4,
        major: 6,
      },
      style: 'number',
    };
  }

  get uptimeThresholds() {
    return {
      actual: this.uptimePercentage,
      isLessThan: {
        minor: 0.4,
        average: 0.35,
        major: 0.3,
      },
      style: 'percent',
    };
  }

  get averageTargetsHit() {
    return this.targetsHit / this.casts;
  }

  on_byPlayer_cast(event: CastEvent) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.WILDFIRE_BOMB.id) {
      return;
    }
    this.casts += 1;
    this.currentGCD = this.globalCooldown.getGlobalCooldownDuration(spellId);
    if (!this.spellUsable.isOnCooldown(SPELLS.WILDFIRE_BOMB.id) || this.spellUsable.cooldownRemaining(SPELLS.WILDFIRE_BOMB.id) < GCD_BUFFER + this.currentGCD) {
      this.acceptedCastDueToCapping = true;
    }
  }

  on_byPlayer_damage(event: DamageEvent) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.WILDFIRE_BOMB_IMPACT.id) {
      return;
    }
    if (this.casts === 0) {
      this.casts += 1;
      this.spellUsable.beginCooldown(SPELLS.WILDFIRE_BOMB.id, {
        timestamp: this.owner.fight.start_time,
      });
    }
    this.targetsHit += 1;
    const enemy = this.enemies.getEntity(event);
    if (this.acceptedCastDueToCapping || !enemy) {
      return;
    }
    if (enemy.hasBuff(SPELLS.WILDFIRE_BOMB_DOT.id) && event.timestamp > this.lastRefresh + MS_BUFFER) {
      this.badRefreshes += 1;
      this.lastRefresh = event.timestamp;
    }
  }

  suggestions(when: any) {
    when(this.badWFBThresholds).addSuggestion((suggest: any, actual: any, recommended: any) => {
      return suggest(<>You shouldn't refresh <SpellLink id={SPELLS.WILDFIRE_BOMB.id} /> since it doesn't pandemic. It's generally better to cast something else and wait for the DOT to drop off before reapplying.</>)
        .icon(SPELLS.WILDFIRE_BOMB.icon)
        .actual(`${actual} casts unnecessarily refreshed WFB`)
        .recommended(`<${recommended} is recommended`);
    });
    when(this.uptimeThresholds).addSuggestion((suggest: any, actual: any, recommended: any) => {
      return suggest(<>Try and maximize your uptime on <SpellLink id={SPELLS.WILDFIRE_BOMB.id} />. This is achieved through not unnecessarily refreshing the debuff as it doesn't pandemic. </>)
        .icon(SPELLS.WILDFIRE_BOMB.icon)
        .actual(`${formatPercentage(actual)}% uptime`)
        .recommended(`>${formatPercentage(recommended)}% is recommended`);
    });
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(20)}
        size="flexible"
        category={'TALENTS'}
        tooltip={<>You had an uptime of {formatPercentage(this.uptimePercentage)}% on the DoT from Wildfire Bomb.</>}
      >
        <BoringSpellValueText spell={SPELLS.WILDFIRE_BOMB}>
          <>
            {this.averageTargetsHit.toFixed(2)} <small>average targets hit</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default WildfireBomb;
