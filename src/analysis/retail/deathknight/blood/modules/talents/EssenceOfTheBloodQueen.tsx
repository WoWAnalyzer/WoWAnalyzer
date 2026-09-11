import { formatDuration, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import talents from 'common/TALENTS/deathknight';
import UptimeIcon from 'interface/icons/Uptime';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, RemoveBuffEvent } from 'parser/core/Events';
import Haste from 'parser/shared/modules/Haste';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

// Essence of the Blood Queen is 1% haste per stack outside of Gift of the San'layn, and 3% haste per stack during it.
const ESSENCE_HASTE_NORMAL = 0.01;
const ESSENCE_HASTE_GIFT = 0.03;

export default class EssenceOfTheBloodQueen extends Analyzer.withDependencies({ haste: Haste }) {
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(talents.VAMPIRIC_STRIKE_TALENT);

    this.addEventListener(
      Events.applybuff.to(SELECTED_PLAYER).spell(SPELLS.GIFT_OF_THE_SANLAYN_BUFF),
      this.onGiftApply,
    );
    this.addEventListener(
      Events.removebuff.to(SELECTED_PLAYER).spell(SPELLS.GIFT_OF_THE_SANLAYN_BUFF),
      this.onGiftRemove,
    );

    if (this.active) {
      this.deps.haste.addHasteBuff(SPELLS.ESSENCE_OF_THE_BLOOD_QUEEN_BUFF.id, {
        hastePerStack: ESSENCE_HASTE_NORMAL,
      });
    }
  }

  onGiftApply(event: ApplyBuffEvent) {
    this.deps.haste.updateHasteBuff(event, SPELLS.ESSENCE_OF_THE_BLOOD_QUEEN_BUFF.id, {
      hastePerStack: ESSENCE_HASTE_GIFT,
    });
  }

  onGiftRemove(event: RemoveBuffEvent) {
    this.deps.haste.updateHasteBuff(event, SPELLS.ESSENCE_OF_THE_BLOOD_QUEEN_BUFF.id, {
      hastePerStack: ESSENCE_HASTE_NORMAL,
    });
  }

  get uptime() {
    return (
      this.selectedCombatant.getBuffUptime(SPELLS.ESSENCE_OF_THE_BLOOD_QUEEN_BUFF.id) /
      this.owner.fightDuration
    );
  }

  get stackUptimes(): Record<number, number> {
    return this.selectedCombatant.getStackBuffUptimes(SPELLS.ESSENCE_OF_THE_BLOOD_QUEEN_BUFF.id);
  }

  get averageStacks() {
    return (
      this.selectedCombatant.getStackWeightedBuffUptime(SPELLS.ESSENCE_OF_THE_BLOOD_QUEEN_BUFF.id) /
      this.owner.fightDuration
    );
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.OPTIONAL(7)}
        size="flexible"
        dropdown={
          <table className="table table-condensed">
            <thead>
              <tr>
                <th>Stacks</th>
                <th>Time</th>
                <th>Uptime</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(this.stackUptimes)
                .sort(([a], [b]) => Number(a) - Number(b))
                .map(([stacks, totalTime]) => {
                  if (totalTime === 0) {
                    return null;
                  }

                  return (
                    <tr key={stacks}>
                      <th>{stacks}</th>
                      <td>{formatDuration(totalTime)}</td>
                      <td>{formatPercentage(totalTime / this.owner.fightDuration)}%</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        }
      >
        <BoringSpellValueText spell={SPELLS.ESSENCE_OF_THE_BLOOD_QUEEN_BUFF}>
          <div>
            <UptimeIcon /> {formatPercentage(this.uptime)}% <small>uptime</small>
          </div>
          <div>
            {this.averageStacks.toFixed(1)} <small>average stacks</small>
          </div>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}
