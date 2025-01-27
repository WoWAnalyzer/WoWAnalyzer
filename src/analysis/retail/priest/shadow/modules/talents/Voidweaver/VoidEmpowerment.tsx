import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { Options } from 'parser/core/Module';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Enemies from 'parser/shared/modules/Enemies';
import { SpellLink } from 'interface';

import TALENTS from 'common/TALENTS/priest';
import SPELLS from 'common/SPELLS';

import Events, { ApplyBuffEvent } from 'parser/core/Events';

class VoidEmpowerment extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  protected enemies!: Enemies;

  buffGained = 0;
  buffWasted = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.VOID_EMPOWERMENT_TALENT);

    this.addEventListener(
      Events.applybuff
        .by(SELECTED_PLAYER)
        .spell(SPELLS.SHADOW_PRIEST_VOIDWEAVER_ENTROPIC_RIFT_BUFF),
      this.onBuffApplied,
    );
  }

  onBuffApplied(event: ApplyBuffEvent) {
    //With Void Empowerment, every Entropic Rift grants Mind Devourer
    //If you had Mind Devourer before this buff, then the proc would be wasted.
    // So if the buff was active for some time before, then the buff would have been wasted

    if (this.selectedCombatant.hasBuff(SPELLS.MIND_DEVOURER_TALENT_BUFF, event.timestamp, 0, 100)) {
      this.buffWasted += 1;
    } else {
      this.buffGained += 1;
    }
  }

  statistic() {
    return (
      <Statistic size="flexible" category={STATISTIC_CATEGORY.HERO_TALENTS}>
        <BoringSpellValueText spell={TALENTS.VOID_EMPOWERMENT_TALENT}>
          <div>
            {this.buffGained}{' '}
            <small>
              Buffs of <SpellLink spell={SPELLS.MIND_DEVOURER_TALENT_BUFF} /> Gained
            </small>{' '}
          </div>
          <div>
            {this.buffWasted}{' '}
            <small>
              Buffs of <SpellLink spell={SPELLS.MIND_DEVOURER_TALENT_BUFF} /> Wasted
            </small>
          </div>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default VoidEmpowerment;
