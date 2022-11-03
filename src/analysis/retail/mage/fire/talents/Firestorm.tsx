import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';
import Events, { CastEvent, ApplyBuffEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

class Firestorm extends Analyzer {
  castsDuringFirestorm = 0;
  firestormProcs = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasLegendary(SPELLS.FIRESTORM);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell([SPELLS.PYROBLAST, TALENTS.FLAMESTRIKE_TALENT]),
      this.onCast,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.FIRESTORM_BUFF),
      this.onFirestormApplied,
    );
  }

  onCast(event: CastEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.FIRESTORM_BUFF.id)) {
      return;
    }
    this.castsDuringFirestorm += 1;
  }

  onFirestormApplied(event: ApplyBuffEvent) {
    this.firestormProcs += 1;
  }

  get castsPerProc() {
    return this.castsDuringFirestorm / this.firestormProcs;
  }

  statistic() {
    return (
      <Statistic category={STATISTIC_CATEGORY.ITEMS} size="flexible">
        <BoringSpellValueText spellId={SPELLS.FIRESTORM.id}>
          {formatNumber(this.firestormProcs)} <small>Total Procs</small>
          <br />
          {formatNumber(this.castsPerProc)} <small>Avg. Casts per Proc</small>
          <br />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Firestorm;
