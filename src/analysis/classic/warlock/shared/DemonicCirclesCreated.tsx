import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS/classic/warlock';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CreateEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

class DemonicCirclesCreated extends Analyzer {
  static dependencies = {};

  created = 0;

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.create.by(SELECTED_PLAYER).spell(SPELLS.DEMONIC_CIRCLE_SUMMON),
      this.handleCreateEvent,
    );
  }

  handleCreateEvent(event: CreateEvent) {
    this.created += 1;
  }

  statistic() {
    return (
      <Statistic position={STATISTIC_ORDER.OPTIONAL()} size="flexible">
        <BoringSpellValueText spellId={SPELLS.DEMONIC_CIRCLE_SUMMON.id}>
          {formatNumber(this.created)} Demonic Circle(s) created
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default DemonicCirclesCreated;
