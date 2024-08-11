import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warlock';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, CreateEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

class DemonicCircle extends Analyzer {
  created = 0;
  cast = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.DEMONIC_CIRCLE_TALENT);
    this.addEventListener(
      Events.create.by(SELECTED_PLAYER).spell(SPELLS.DEMONIC_CIRCLE_SUMMON),
      this.onDCSummon,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.DEMONIC_CIRCLE_TELEPORT),
      this.onDCTeleport,
    );
  }

  onDCSummon(event: CreateEvent) {
    this.created += 1;
  }

  onDCTeleport(event: CastEvent) {
    this.cast += 1;
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.OPTIONAL(1)}
        size="flexible"
      >
        <BoringSpellValueText spell={SPELLS.DEMONIC_CIRCLE_SUMMON}>
          <p>
            {formatNumber(this.cast)}{' '}
            <small> Demonic Circle{this.cast === 1 ? '' : 's'} teleported to </small>
          </p>
          <p>
            {formatNumber(this.created)}{' '}
            <small> Demonic Circle{this.created === 1 ? '' : 's'} summoned </small>
          </p>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default DemonicCircle;
