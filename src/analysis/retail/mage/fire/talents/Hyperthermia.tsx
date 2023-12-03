import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, ApplyBuffEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

class Hyperthermia extends Analyzer {
  totalProcs = 0;
  castsDuringHyperthermia: CastEvent[] = [];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.HYPERTHERMIA_TALENT);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.HYPERTHERMIA_BUFF),
      this.onHyperthermiaApply,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell([TALENTS.PYROBLAST_TALENT, SPELLS.FLAMESTRIKE]),
      this.onSpender,
    );
  }

  onHyperthermiaApply(event: ApplyBuffEvent) {
    this.totalProcs += 1;
  }

  onSpender(event: CastEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.HYPERTHERMIA_BUFF.id)) {
      return;
    }
    this.castsDuringHyperthermia.push(event);
  }

  get castsPerProc() {
    return this.castsDuringHyperthermia.length / this.totalProcs;
  }

  statistic() {
    return (
      <Statistic category={STATISTIC_CATEGORY.ITEMS} size="flexible">
        <BoringSpellValueText spell={TALENTS.HYPERTHERMIA_TALENT}>
          {formatNumber(this.totalProcs)} <small>Total Procs</small>
          <br />
          {formatNumber(this.castsPerProc)} <small>Avg. Casts per Proc</small>
          <br />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Hyperthermia;
