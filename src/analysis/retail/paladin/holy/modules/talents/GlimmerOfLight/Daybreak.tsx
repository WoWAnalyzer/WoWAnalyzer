import TALENTS from 'common/TALENTS/paladin';
import { SpellLink, TooltipElement } from 'interface';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, { CastEvent, EventType, GetRelatedEvents } from 'parser/core/Events';
import BoringValueText from 'parser/ui/BoringValueText';
import ItemManaGained from 'parser/ui/ItemManaGained';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { DAYBREAK_HEALING, DAYBREAK_MANA } from '../../../normalizers/CastLinkNormalizer';
import { formatNumber } from 'common/format';

class Daybreak extends Analyzer {
  castEvents: CastEvent[] = [];

  manaGained: number = 0;
  manaWasted: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.DAYBREAK_TALENT);
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.cast.spell(TALENTS.DAYBREAK_TALENT).by(SELECTED_PLAYER),
      this.onCast,
    );
  }

  onCast(event: CastEvent) {
    this.castEvents.push(event);

    GetRelatedEvents(event, DAYBREAK_MANA).forEach((e) => {
      if (e.type === EventType.ResourceChange) {
        this.manaGained += e.resourceChange;
        this.manaWasted += e.waste;
      }
    });
  }

  getEffectiveHealing(cast: CastEvent) {
    return GetRelatedEvents(cast, DAYBREAK_HEALING).reduce((sum, healEvent) => {
      if (healEvent.type === EventType.Heal) {
        return sum + healEvent.amount + (healEvent.absorbed || 0);
      }
      return sum;
    }, 0);
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        dropdown={
          <table className="table table-condensed">
            <thead>
              <tr>
                <th>Time</th>
                <th>
                  <TooltipElement content="Number of glimmers absorbed">#</TooltipElement>
                </th>
                <th>Healing</th>
              </tr>
            </thead>
            <tbody>
              {Object.values(this.castEvents).map((cast, i) => (
                <tr key={i}>
                  <td>{this.owner.formatTimestamp(cast.timestamp)}</td>
                  <td>{GetRelatedEvents(cast, DAYBREAK_MANA).length}</td>
                  <td>{formatNumber(this.getEffectiveHealing(cast))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        }
      >
        <BoringValueText
          label={
            <>
              <SpellLink spell={TALENTS.DAYBREAK_TALENT} />
            </>
          }
        >
          <ItemManaGained amount={this.manaGained} useAbbrev />
          {this.manaWasted > 0 ? (
            <>
              <br />
              {this.manaWasted} wasted due to overcapping
            </>
          ) : null}
        </BoringValueText>
      </Statistic>
    );
  }
}
export default Daybreak;
