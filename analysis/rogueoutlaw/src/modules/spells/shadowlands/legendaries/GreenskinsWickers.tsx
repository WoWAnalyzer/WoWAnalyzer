import SPELLS from 'common/SPELLS';
import { SpellIcon } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent } from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';

class GreenskinsWickers extends Analyzer {
  static dependencies = {
    abilities: Abilities,
  };

  greenskinProcs: number = 0;
  protected abilities!: Abilities;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasLegendary(SPELLS.GREENSKINS_WICKERS);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.GREENSKINS_WICKERS_BUFF),
      this.onGreenskinBuff,
    );
  }

  // Not sure what else should be tracked here. Maybe the total damage done by Pistol Shot with this legendary equipped?
  onGreenskinBuff(event: ApplyBuffEvent) {
    this.greenskinProcs += 1;
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        tooltip="This shows you the amount of procs gained from Greenskin's Wickers Legendary."
      >
        <BoringSpellValueText spellId={SPELLS.GREENSKINS_WICKERS.id}>
          <SpellIcon id={SPELLS.GREENSKINS_WICKERS.id} /> {this.greenskinProcs}{' '}
          <small>Procs gained</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default GreenskinsWickers;
