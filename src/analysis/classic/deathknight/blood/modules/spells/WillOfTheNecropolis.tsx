import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import Events from 'parser/core/Events';
import spells from '../../spell-list_DeathKnight_Blood.classic';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import SpellLink from 'interface/SpellLink';
import BoringValue from 'parser/ui/BoringValueText';

const WOTN_BUFF_ID = 96171;

export default class WillOfTheNecropolis extends Analyzer.withDependencies({
  spellUsable: SpellUsable,
}) {
  private runeTapResets = 0;
  private wastedResets = 0;

  constructor(options: Options) {
    super(options);

    this.addEventListener(
      Events.applybuff.spell({ id: WOTN_BUFF_ID }).to(SELECTED_PLAYER),
      this.resetRuneTap,
    );
  }

  private resetRuneTap(): void {
    const isWasted = !this.deps.spellUsable.isOnCooldown(spells.RUNE_TAP.id);
    this.deps.spellUsable.endCooldown(spells.RUNE_TAP.id);

    if (isWasted) {
      this.wastedResets += 1;
    } else {
      this.runeTapResets += 1;
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE()}
        size="flexible"
        tooltip={
          <>
            <SpellLink spell={spells.WILL_OF_THE_NECROPOLIS_PASSIVE.id} /> triggered{' '}
            <strong>{this.runeTapResets + this.wastedResets}</strong> times.{' '}
            <strong>{this.wastedResets}</strong> triggers were wasted because{' '}
            <SpellLink spell={spells.RUNE_TAP.id} /> was not on cooldown.
          </>
        }
      >
        <BoringValue
          label={
            <>
              <SpellLink spell={spells.RUNE_TAP.id} /> Resets from{' '}
              <SpellLink spell={spells.WILL_OF_THE_NECROPOLIS_PASSIVE.id}>WotN</SpellLink>
            </>
          }
        >
          {this.runeTapResets} Resets
        </BoringValue>
      </Statistic>
    );
  }
}
