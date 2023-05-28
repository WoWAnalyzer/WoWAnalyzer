import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { EventType } from 'parser/core/Events';
import EventHistory from 'parser/shared/modules/EventHistory';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

class Hyperthermia extends Analyzer {
  static dependencies = {
    eventHistory: EventHistory,
  };
  protected eventHistory!: EventHistory;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.HYPERTHERMIA_TALENT);
  }

  castsDuringHyperthermia = () =>
    this.eventHistory.getEventsWithBuff(SPELLS.HYPERTHERMIA_BUFF, EventType.Cast, [
      TALENTS.PYROBLAST_TALENT,
      TALENTS.FLAMESTRIKE_TALENT,
    ]).length || 0;

  totalProcs = () =>
    this.eventHistory.getEvents(EventType.ApplyBuff, {
      searchBackwards: true,
      spell: SPELLS.HYPERTHERMIA_BUFF,
    }).length || 0;

  get castsPerProc() {
    return this.castsDuringHyperthermia() / this.totalProcs();
  }

  statistic() {
    return (
      <Statistic category={STATISTIC_CATEGORY.ITEMS} size="flexible">
        <BoringSpellValueText spellId={TALENTS.HYPERTHERMIA_TALENT.id}>
          {formatNumber(this.totalProcs())} <small>Total Procs</small>
          <br />
          {formatNumber(this.castsPerProc)} <small>Avg. Casts per Proc</small>
          <br />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Hyperthermia;
