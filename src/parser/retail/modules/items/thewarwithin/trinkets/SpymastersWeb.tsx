import ITEMS from 'common/ITEMS/thewarwithin/trinkets';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Abilities from 'parser/core/modules/Abilities';
import SPELLS from 'common/SPELLS/thewarwithin/trinkets';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import Events, { ApplyBuffEvent, ApplyBuffStackEvent, CastEvent } from 'parser/core/Events';
import BoringItemValueText from 'parser/ui/BoringItemValueText';
import { formatDuration, formatNumber } from 'common/format';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { calculatePrimaryStat } from 'parser/core/stats';

type SpymastersWebCast = {
  timestamp: number;
  stacks: number;
};

/**
 * Based on the stats provided on wowhead.
 *
 * https://www.wowhead.com/item=220202/spymasters-web
 */
const SPYMASTERS_WEB_BASE_ILVL = 571;
const SPYMASTERS_WEB_BASE_GAIN = 515;

export default class SpymastersWeb extends Analyzer.withDependencies({
  abilities: Abilities,
}) {
  protected currentReportStackCount: number = 0;
  protected primaryStatBonus: number = 0;
  protected SpymastersWebCasts: SpymastersWebCast[] = [];

  constructor(options: Options) {
    super(options);

    // Ensure the combatant has the trinket.
    this.active = this.selectedCombatant.hasTrinket(ITEMS.SPYMASTERS_WEB.id);
    if (!this.active) {
      return;
    }

    // Add the ability to the spellbook of the current combatant.
    this.deps.abilities.add({
      spell: SPELLS.SPYMASTERS_WEB.id,
      category: SPELL_CATEGORY.ITEMS,
      cooldown: 20,
    });

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.SPYMASTERS_REPORT),
      this._onBuffApply,
    );
    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.SPYMASTERS_REPORT),
      this._onBuffApply,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SPYMASTERS_WEB),
      this._onCast,
    );

    // Calculate the primary stat bonus we'd receive per stack when the on use effect of the tricket is cast.
    this.primaryStatBonus = calculatePrimaryStat(
      SPYMASTERS_WEB_BASE_ILVL,
      SPYMASTERS_WEB_BASE_GAIN,
      this.selectedCombatant.getTrinket(ITEMS.SPYMASTERS_WEB.id)!.itemLevel,
    );
  }

  _onBuffApply(event: ApplyBuffStackEvent | ApplyBuffEvent) {
    // Increase the current stack report stack count.
    this.currentReportStackCount += 1;
  }

  _onCast(event: CastEvent) {
    this.SpymastersWebCasts.push({
      timestamp: event.timestamp,
      stacks: this.currentReportStackCount,
    });

    // Reset the stack count to zero.
    this.currentReportStackCount = 0;
  }

  statistic() {
    const castRows = this.SpymastersWebCasts.map((cast: SpymastersWebCast, index: number) => {
      const castTime = cast.timestamp - this.owner.fight.start_time;
      const intellectGained = cast.stacks * this.primaryStatBonus;

      return (
        <tr key={index}>
          <td>{formatDuration(castTime)}</td>
          <td>{cast.stacks}</td>
          <td>{formatNumber(intellectGained)}</td>
        </tr>
      );
    });

    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(99)}
        category={STATISTIC_CATEGORY.ITEMS}
        size="flexible"
        dropdown={
          <>
            <table className="table table-condensed">
              <thead>
                <tr>
                  <th>Cast</th>
                  <th>Stacks on Use</th>
                  <th>Intellect Gained</th>
                </tr>
              </thead>
              <tbody>{castRows}</tbody>
            </table>
          </>
        }
      >
        <BoringItemValueText item={ITEMS.SPYMASTERS_WEB}>
          {this.SpymastersWebCasts.length} Casts
        </BoringItemValueText>
      </Statistic>
    );
  }
}
