import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/paladin';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import Statistic from 'parser/ui/Statistic';
import BoringValueText from 'parser/ui/BoringValueText';
import { SpellIcon } from 'interface';

class ELConsumedBuffs extends Analyzer {
  didWog = false;
  hasBuff = false;
  buffsGained = 0;
  buffsUsed = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.EMPYREAN_LEGACY_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.WORD_OF_GLORY), this.cast);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.EMPYREAN_LEGACY_BUFF),
      this.applybuff,
    );

    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.EMPYREAN_LEGACY_BUFF),
      this.removebuff,
    );
  }

  cast() {
    if (this.hasBuff) {
      this.didWog = true;
    }
  }

  applybuff() {
    this.hasBuff = true;
    this.buffsGained += 1;
  }

  removebuff() {
    this.hasBuff = false;

    if (this.didWog) {
      this.buffsUsed += 1;
    }

    this.didWog = false;
  }

  statistic() {
    return (
      <Statistic category={STATISTIC_CATEGORY.TALENTS} size="flexible">
        <BoringValueText
          label={
            <>
              <SpellIcon spell={TALENTS.EMPYREAN_LEGACY_TALENT} /> Gained vs Consumed
            </>
          }
        >
          {this.buffsGained} : {this.buffsUsed}
        </BoringValueText>
      </Statistic>
    );
  }
}

export default ELConsumedBuffs;
