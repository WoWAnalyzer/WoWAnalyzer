import TALENTS from 'common/TALENTS/paladin';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import Statistic from 'parser/ui/Statistic';
import { SpellIcon } from 'interface';
import BoringValueText from 'parser/ui/BoringValueText';
import Events from 'parser/core/Events';
import SPELLS from 'common/SPELLS';

class ELPossibleBuffs extends Analyzer {
  buffs = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.EMPYREAN_LEGACY_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.EMPYREAN_LEGACY_BUFF),
      this.applybuff,
    );
  }

  applybuff() {
    this.buffs += 1;
  }

  statistic() {
    const fightDuration = (this.owner.fight.end_time - this.owner.fight.start_time) / 1000;
    const possibleBuffs = Math.floor(fightDuration / 20);

    return (
      <Statistic category={STATISTIC_CATEGORY.TALENTS} size="flexible">
        <BoringValueText
          label={
            <>
              <SpellIcon spell={TALENTS.EMPYREAN_LEGACY_TALENT} /> Possible Buffs vs Buffs Gained
            </>
          }
        >
          {possibleBuffs} : {this.buffs}
        </BoringValueText>
      </Statistic>
    );
  }
}

export default ELPossibleBuffs;
