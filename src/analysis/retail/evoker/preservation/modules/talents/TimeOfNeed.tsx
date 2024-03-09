import Analyzer, { Options, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import { TALENTS_EVOKER } from 'common/TALENTS';
import Events, { HealEvent } from 'parser/core/Events';
import SPELLS from 'common/SPELLS';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { SpellLink } from 'interface';
import { formatNumber } from 'common/format';

interface TonEvent {
  timestamp: number;
  healing: number;
}

class TimeOfNeed extends Analyzer {
  totalSpawns = 0;
  spawns: TonEvent[] = [];
  tonEvent: TonEvent | null = null;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_EVOKER.TIME_OF_NEED_TALENT);

    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.heal
        .by(SELECTED_PLAYER_PET)
        .spell([SPELLS.VERDANT_EMBRACE_HEAL, SPELLS.TIME_OF_NEED_LIVING_FLAME]),
      this.onHeal,
    );
  }

  onHeal(event: HealEvent) {
    const healAmount = event.amount + (event.absorbed || 0);
    if (event.ability.guid === SPELLS.VERDANT_EMBRACE_HEAL.id) {
      this.totalSpawns += 1;
      this.tonEvent = { timestamp: event.timestamp, healing: healAmount };
      this.spawns.push(this.tonEvent);
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(15)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        wide
      >
        <SpellLink spell={TALENTS_EVOKER.TIME_OF_NEED_TALENT} /> <small>events</small>
        <br />
        <table className="table table-condensed">
          <thead>
            <tr>
              <th>Event #</th>
              <th>Event Time</th>
              <th>Verdant Embrace Healing</th>
            </tr>
          </thead>
          <tbody>
            {this.spawns.map((info, index) => (
              <tr key={index}>
                <th scope="row">{index + 1}</th>
                <td>{this.owner.formatTimestamp(info.timestamp)}</td>
                <td>{formatNumber(info.healing)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Statistic>
    );
  }
}

export default TimeOfNeed;
