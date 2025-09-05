import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { TALENTS_PALADIN } from 'common/TALENTS';
import SPELLS from 'common/SPELLS';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import { formatDurationMinSec } from 'common/format';

const INSTRUMENT_OF_RETRIBUTION_AVENGING_WRATH_DURATION_SECONDS = 9;

export default class InstrumentOfRetribution extends Analyzer {
  private avengingWrathSecondsGained = 0;

  constructor(options: Options) {
    super(options);

    // IoR always gives Avenging Wrath (even when playing Crusade). I don't know how to differenciate procs from people dying and genuine casts (or Radiant Glory procs).
    // As of 11.2 everyone plays Crusade anyway.
    this.active = this.selectedCombatant.hasTalent(TALENTS_PALADIN.CRUSADE_TALENT);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.AVENGING_WRATH_BUFF),
      this.onAvengingWrathApply,
    );
  }

  private onAvengingWrathApply() {
    this.avengingWrathSecondsGained += INSTRUMENT_OF_RETRIBUTION_AVENGING_WRATH_DURATION_SECONDS;
  }

  statistic() {
    return (
      <Statistic size="flexible" category={STATISTIC_CATEGORY.GENERAL}>
        <BoringSpellValueText spell={SPELLS.INSTRUMENT_OF_RETRIBUTION}>
          {formatDurationMinSec(this.avengingWrathSecondsGained)} <small>gained</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}
