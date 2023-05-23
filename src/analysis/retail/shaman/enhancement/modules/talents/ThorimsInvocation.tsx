import SPELLS from 'common/SPELLS';
import { TALENTS_SHAMAN } from 'common/TALENTS';
import Analyzer from 'parser/core/Analyzer';
import { Options, SELECTED_PLAYER } from 'parser/core/EventSubscriber';
import Events, { CastEvent, Ability } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import Statistic from 'parser/ui/Statistic';

class ThorimsInvocation extends Analyzer {
  protected lastCast: Ability | null = null;
  protected incorrectCasts: number = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_SHAMAN.THORIMS_INVOCATION_TALENT);

    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.LIGHTNING_BOLT),
      this.onCast,
    );

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_SHAMAN.CHAIN_LIGHTNING_TALENT),
      this.onCast,
    );

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.WINDSTRIKE_CAST),
      this.checkChainLightningDuringWindStrike,
    );
  }

  onCast(event: CastEvent) {
    this.lastCast = event.ability;
  }

  checkChainLightningDuringWindStrike() {
    if (this.lastCast?.guid !== SPELLS.LIGHTNING_BOLT.id) {
      this.incorrectCasts += 1;
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
      >
        <BoringSpellValueText spellId={TALENTS_SHAMAN.THORIMS_INVOCATION_TALENT.id}>
          {this.incorrectCasts} Windstrikes
          <br />
          <small>while not primed with Lightning Bolt</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ThorimsInvocation;
