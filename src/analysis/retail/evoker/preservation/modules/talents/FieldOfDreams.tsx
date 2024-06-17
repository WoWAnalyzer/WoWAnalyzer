import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { HealEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { TALENTS_EVOKER } from 'common/TALENTS';
import { formatNumber } from 'common/format';
import { SpellLink, TooltipElement } from 'interface';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import { getHealEvents, isFromFieldOfDreams } from '../../normalizers/EventLinking/helpers';

class FieldOfDreams extends Analyzer {
  countedTimestamps: Set<number> = new Set<number>();
  numProcs: number = 0;
  totalHealing: number = 0;
  totalOverhealing: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_EVOKER.FIELD_OF_DREAMS_TALENT);
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.EMERALD_BLOSSOM),
      this.onEbHeal,
    );
  }

  onEbHeal(event: HealEvent) {
    if (this.countedTimestamps.has(event.timestamp) || !isFromFieldOfDreams(event)) {
      return;
    }
    const allEvents = getHealEvents(event);
    allEvents.forEach((ev) => {
      this.totalHealing += (ev.amount || 0) + (ev.absorbed || 0);
      this.totalOverhealing += ev.overheal || 0;
    });
    this.numProcs += 1;
    this.countedTimestamps.add(event.timestamp);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(5)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <TalentSpellText talent={TALENTS_EVOKER.FIELD_OF_DREAMS_TALENT}>
          <ItemHealingDone amount={this.totalHealing} />
          <br />
          <TooltipElement
            content={
              <ul>
                <li>{formatNumber(this.totalHealing)} effective healing</li>
                <li>{formatNumber(this.totalOverhealing)} overheal</li>
              </ul>
            }
          >
            <small>
              {this.numProcs} extra <SpellLink spell={SPELLS.EMERALD_BLOSSOM} /> procs
            </small>
          </TooltipElement>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default FieldOfDreams;
