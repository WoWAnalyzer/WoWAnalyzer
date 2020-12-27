import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent} from 'parser/core/Events';
import SPELLS from 'common/SPELLS';
import React from 'react';
import { NumberThreshold, ThresholdStyle, When } from 'parser/core/ParseResults';
import { t } from '@lingui/macro';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import SpellLink from 'common/SpellLink';
import { formatNumber } from 'common/format';
import BoringSpellValue from 'interface/statistics/components/BoringSpellValue';
import Enemies from 'parser/shared/modules/Enemies';
import { TrackedBuffEvent } from 'parser/core/Entity';
import Enemy from 'parser/core/Enemy';

/**
 * Analyzer for the suggestion that Vanish should not be cast
 * with longer than 1s of Find Weakness buff remaining. This is because
 * Vanish allows the rogue to re-cast Shadowstrike and re-apply Find Weakness.
 */
class VanishFindWeakness extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  }

  private BAD_CAST_WINDOW: number = 1000;
  private VANISH_TO_SHADOW_STRIKE_WINDOW: number = 5000;

  private vanishCasts: CastEvent[] = [];
  private shadowstrikeCasts: CastEvent[] = [];
  private cachedBadCasts: CastEvent[] | null = null;
  protected enemies!: Enemies;

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.VANISH), this.onVanishCast);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SHADOWSTRIKE), this.onShadowStrikeCast);
  }

  onVanishCast(event: CastEvent): void {
      this.debug(`Pushing vanish cast at timestamp ${event.timestamp}`);
      this.vanishCasts.push(event);
  }

  onShadowStrikeCast(event: CastEvent): void {
    this.debug(`Pushing ShadowStrike cast at timestamp ${event.timestamp} on target ID ${event.targetID}.`);
    this.shadowstrikeCasts.push(event);
  }

  /**
   * Determine the FindWeakness buff history as applied by the selected rogue to
   * all enemeies within the fight. Returns a Map of the enemy ID to the sorted
   * buff history of Find Weakness as applied by the rogue.
   */
  get enemyFindWeaknessHistory(): Map<number, TrackedBuffEvent[]> {
    const enemyEntities = Object.values(this.enemies.getEntities());
    const enemyIdToFindWeaknessBuffs: Map<number, TrackedBuffEvent[]> = new Map<number, TrackedBuffEvent[]>();
    for (let i: number = 0; i < enemyEntities.length; i++) {
      const enemy: Enemy = enemyEntities[i];
      if (!enemyIdToFindWeaknessBuffs.has(enemy.id)) {
        enemyIdToFindWeaknessBuffs.set(enemy.id,
          enemy.getBuffHistory(SPELLS.FIND_WEAKNESS.id,
            this.selectedCombatant.id).sort((a, b) => a.timestamp - b.timestamp));
      }
    }
    this.debug(`Returning find weakness history:`);
    this.debug(enemyIdToFindWeaknessBuffs);
    return enemyIdToFindWeaknessBuffs;
  }

  /**
   * Determine the mapping from a vanish cast to the next Shadow Strike application.
   * Vanish may be used for utility, e.g. to avoid dying at the end of a wipe. Thus, we
   * only determine if a Vanish was used incorrectly in relation to Shadow Strike and
   * Find Weakness if there was a Shadow Strike used within VANISH_TO_SHADOW_STRIKE_WINDOW ms
   * since Vanish was cast.
   */
  get vanishCastToShadowStrikeInWindow(): Map<CastEvent, CastEvent | null> {
    const vanishToShadowStrike: Map<CastEvent, CastEvent | null> = new Map<CastEvent, CastEvent>();
    for (let i: number = 0; i < this.vanishCasts.length; i++) {
      const vanishCast: CastEvent = this.vanishCasts[i];
      for (let j = 0; j < this.shadowstrikeCasts.length; j++) {
        const shadowstrikeCast: CastEvent = this.shadowstrikeCasts[j];
        if (shadowstrikeCast.timestamp > vanishCast.timestamp && (shadowstrikeCast.timestamp - vanishCast.timestamp) < this.VANISH_TO_SHADOW_STRIKE_WINDOW) {
          vanishToShadowStrike.set(vanishCast, shadowstrikeCast);
          break;
        }
      }
      if (!vanishToShadowStrike.has(vanishCast)) {
        vanishToShadowStrike.set(vanishCast, null);
      }
    }
    this.debug(`Returning vanish cast to shadowstrike mapping:`);
    this.debug(vanishToShadowStrike);
    return vanishToShadowStrike;
  }

  get badVanishCasts(): CastEvent[] {
    if (this.cachedBadCasts !== null) {
      this.debug(`Returning cached badVanishCasts of size ${this.cachedBadCasts.length}`);
      return this.cachedBadCasts;
    }
    const findWeaknessHistory: Map<number, TrackedBuffEvent[]> = this.enemyFindWeaknessHistory;
    const vanishToShadowstrikeMap: Map<CastEvent, CastEvent | null> = this.vanishCastToShadowStrikeInWindow;
    const badCasts: CastEvent[] = this.vanishCasts.filter((vanish) => this.vanishCastIsBad(vanish, findWeaknessHistory, vanishToShadowstrikeMap));
    this.cachedBadCasts = badCasts;
    this.debug(`Returning fresh bad Vanish casts:`);
    this.debug(badCasts);
    return this.cachedBadCasts;
  }

  vanishCastIsBad(vanish: CastEvent, findWeaknessHistory: Map<number, TrackedBuffEvent[]>, vanishToShadowStrike: Map<CastEvent, CastEvent | null>): boolean {
    if (!vanishToShadowStrike.has(vanish) || vanishToShadowStrike.get(vanish) === null) {
      // In this case, vanish was likely used for utility rather than to apply Shadowstrike, so we deem it to not be a bad case.
      this.debug(`Returning bad vanish cast for timestamp ${vanish.timestamp} as false due to being deemed utility cast.`);
      return false;
    }
    const shadowstrike: CastEvent = vanishToShadowStrike.get(vanish) as CastEvent;
    if (!shadowstrike.targetID) {
      // We need the target ID of shadowstrike moving forward, so if we can't get it we give up and assume the vanish was fine.
      this.debug(`Returning bad vanish cast for timestamp ${vanish.timestamp} as false due to missing shadowstrike targetID.`);
      return false;
    }
    const enemyEntities = Object.values(this.enemies.getEntities());
    if (findWeaknessHistory.has(shadowstrike.targetID as number)) {
      const findWeaknessBuff: Array<TrackedBuffEvent | undefined> = enemyEntities
        .filter(enemy => enemy.hasBuff(SPELLS.FIND_WEAKNESS.id, shadowstrike.timestamp, 0, 0, this.selectedCombatant.id))
        .map(enemy => enemy.getBuff(SPELLS.FIND_WEAKNESS.id, shadowstrike.timestamp, 0, 0, this.selectedCombatant.id))
        .filter(buffEvent => buffEvent !== undefined);
      if (findWeaknessBuff.length === 0) {
        // In this case, the target did not have Find Weakness up on any target when the shadowstrike was cast, so the Vanish is good.
        this.debug(`Returning bad vanish cast for timestamp ${vanish.timestamp} as false due to no targets having FW.`);
        return false;
      } else {
        // This is the complicated case. If the shadowstrike was cast on a target without FW, then the cast is good regardless of remaining time on the other targets.
        // If it was cast on a target with FW, we check that the corresponding vanish was not cast more than BAD_CAST_WINDOW ms before FW expired.
        const enemiesById: { [enemyId: number]: Enemy } = this.enemies.getEntities();
        const targetEnemy: Enemy = enemiesById[shadowstrike.targetID];
        if (!targetEnemy.hasBuff(SPELLS.FIND_WEAKNESS.id, shadowstrike.timestamp, 0, 0, this.selectedCombatant.id)) {
          this.debug(`Returning bad vanish cast for timestamp ${vanish.timestamp} as false due to shadowstrike target not having FW.`);
          return false;
        } else {
          const findWeaknessBuff: TrackedBuffEvent | undefined = targetEnemy.getBuff(SPELLS.FIND_WEAKNESS.id, shadowstrike.timestamp, 0, 0, this.selectedCombatant.id);
          const timeRemainingOnFindWeakness: number = ((findWeaknessBuff as TrackedBuffEvent).end || 0) - vanish.timestamp;
          if (timeRemainingOnFindWeakness > 0 && timeRemainingOnFindWeakness < this.BAD_CAST_WINDOW) {
            this.debug(`Returning bad vanish cast for timestamp ${vanish.timestamp} as false due to being within bad cast window..`);
            return false;
          }
        }
      }
    }
    this.debug(`Returning bad vanish cast for timestamp ${vanish.timestamp} as true.`);
    return true;
  }

  get badVanishCastsSuggestionThresholds(): NumberThreshold {
    return {
      actual: this.badVanishCasts.length,
      isGreaterThan: {
        minor: 0,
        average: 0,
        major: 0
      },
      style: ThresholdStyle.NUMBER,
    }
  }

  suggestions(when: When) {
    when(this.badVanishCastsSuggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => suggest(t({
        id: "rogue.subtlety.suggestions.findWeaknessAndVanish.badCasts.suggestion",
        message: `Avoid casting Vanish with more than ${this.BAD_CAST_WINDOW/1000}s left on Find Weakness on the current target`
      }))
        .icon(SPELLS.VANISH.icon)
        .actual(t({
          id: "rogue.subtlety.suggestions.findWeaknessAndVanish.badCasts.actual",
          message: `You cast Vanish ${this.badVanishCasts.length} times with more than ${this.BAD_CAST_WINDOW/1000}s left on Find Weakness on the current target`
        }))
        .recommended(t({
          id: "rogue.subtlety.suggestions.findWeaknessAndVanish.badCasts.recommended",
          message: `Do not cast Vanish with more than ${this.BAD_CAST_WINDOW/1000}s left on Find Weakness on the current target`
        })));
  }

  statistic(): React.ReactNode {
    return (
      <>
        <Statistic
          position={STATISTIC_ORDER.DEFAULT}
          size="flexible"
          category={STATISTIC_CATEGORY.GENERAL}
          tooltip={(
            <>
              You cast <SpellLink id={SPELLS.VANISH.id} /> {formatNumber(this.badVanishCasts.length)} times with more than {formatNumber(this.BAD_CAST_WINDOW/1000)}s remaining on <SpellLink id={SPELLS.FIND_WEAKNESS.id} />
               on the current target. <br />
               We consider a cast to be bad if it was used to re-apply <SpellLink id={SPELLS.FIND_WEAKNESS.id} /> to a target with more than {formatNumber(this.BAD_CAST_WINDOW/1000)}s remaining.
            </>
          )}
          dropdown={(
            <>
              <table className="table table-condensed">
                <thead>
                  <tr>
                    <th>Cast Timestamp</th>
                  </tr>
                  <tr>
                    <th>Debuff Time Remaining</th>
                  </tr>
                </thead>
                <tbody>
                  {this.badVanishCasts.map((event: CastEvent, i: number) => (
                    <tr key={i}>
                      <td>{this.owner.formatTimestamp(event.timestamp)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
          >
          <BoringSpellValue spell={SPELLS.VANISH} value={`${this.badVanishCasts.length} bad casts`} label="Bad casts regarding Find Weakness" />
        </Statistic>
      </>
    )
  }
}

export default VanishFindWeakness;
