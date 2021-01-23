import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent} from 'parser/core/Events';
import SPELLS from 'common/SPELLS';
import React from 'react';
import { NumberThreshold, ThresholdStyle, When } from 'parser/core/ParseResults';
import { t } from '@lingui/macro';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { SpellLink } from 'interface';
import { formatMilliseconds, formatNumber } from 'common/format';
import BoringSpellValue from 'parser/ui/BoringSpellValue';
import Enemies from 'parser/shared/modules/Enemies';
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

  private BAD_CAST_WINDOW = 1000;
  private FW_DEBUFF_LENGTH = 18 * 1000;
  private DEBUFF_CAP = this.FW_DEBUFF_LENGTH; // Verified with Ravenholdt discord that FW does not follow pandemic debuff length rules (1.3 times base length).

  private lastVanishPtr: CastEvent | null = null;
  private badVanishCasts: Map<CastEvent, number> = new Map<CastEvent, number>();
  protected enemies!: Enemies;

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.VANISH), this.onVanishCast);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SHADOWSTRIKE), this.onFindWeaknessApplierCast);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.CHEAP_SHOT), this.onFindWeaknessApplierCast);
  }

  onVanishCast(event: CastEvent): void {
      this.lastVanishPtr = event;
  }

  onFindWeaknessApplierCast(event: CastEvent): void {
    if (event.targetID === undefined) {
      return;
    }
    if (this.lastVanishPtr === null) {
      return;
    }
    const enemyID: number = event.targetID as number;
    const enemy: Enemy = this.enemies.getEntities()[enemyID];
    if (enemy === undefined) {
      // In this case, a FW applier was cast on a non-enemy target.
      // Maybe the rogue was mind-controlled and cast it on another player?
      return;
    }
    const enemyHasFW: boolean = enemy.hasBuff(SPELLS.FIND_WEAKNESS.id, event.timestamp, 0, 0, this.selectedCombatant.id);
    if (!enemyHasFW) {
      // This is the first time we cast a FW applier on the target, so we can safely assume it has not had FW before.
      // Or we've hit the target with a FW applier before, but they don't have it now.
      return;
    } else {
      const fwTimeRemaining: number = enemy.getRemainingBuffTimeAtTimestamp(SPELLS.FIND_WEAKNESS.id, this.FW_DEBUFF_LENGTH, this.DEBUFF_CAP, event.timestamp, this.selectedCombatant.id);
      if (fwTimeRemaining > this.BAD_CAST_WINDOW) {
        this.badVanishCasts.set(this.lastVanishPtr, fwTimeRemaining);
      }
    }
  }

  get badVanishCastsSuggestionThresholds(): NumberThreshold {
    return {
      actual: this.badVanishCasts.size,
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
        message: `Avoid casting Vanish with more than ${this.BAD_CAST_WINDOW/1000}s left on Find Weakness on the current target.`
      }))
        .icon(SPELLS.VANISH.icon)
        .actual(t({
          id: "rogue.subtlety.suggestions.findWeaknessAndVanish.badCasts.actual",
          message: `You cast Vanish ${this.badVanishCasts.size} times with more than ${this.BAD_CAST_WINDOW/1000}s left on Find Weakness on the current target.`
        }))
        .recommended(t({
          id: "rogue.subtlety.suggestions.findWeaknessAndVanish.badCasts.recommended",
          message: `Do not cast Vanish with more than ${this.BAD_CAST_WINDOW/1000}s left on Find Weakness on the current target.`
        })));
  }

  statistic(): React.ReactNode {
    const tableEntries: React.ReactNode[] = [];
    const keys: CastEvent[] = Array.from(this.badVanishCasts.keys());
    keys.forEach((cast: CastEvent, idx: number) => {
      tableEntries.push(
        <>
          <tr key={idx}>
            <td>{this.owner.formatTimestamp(cast.timestamp)}</td>
            <td>{formatMilliseconds(this.badVanishCasts.get(cast) as number)}</td>
          </tr>
        </>
      );
    });

    return (
      <>
        <Statistic
          position={STATISTIC_ORDER.DEFAULT}
          size="flexible"
          category={STATISTIC_CATEGORY.GENERAL}
          tooltip={(
            <>
              You cast <SpellLink id={SPELLS.VANISH.id} /> {formatNumber(this.badVanishCasts.size)} times with more than {formatNumber(this.BAD_CAST_WINDOW/1000)}s remaining on <SpellLink id={SPELLS.FIND_WEAKNESS.id} />
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
                    <th>Debuff Time Remaining</th>
                  </tr>
                </thead>
                <tbody>
                  {tableEntries}
                </tbody>
              </table>
            </>
          )}
          >
          <BoringSpellValue spell={SPELLS.VANISH} value={`${this.badVanishCasts.size} bad casts`} label="Bad casts regarding Find Weakness" />
        </Statistic>
      </>
    )
  }
}

export default VanishFindWeakness;
