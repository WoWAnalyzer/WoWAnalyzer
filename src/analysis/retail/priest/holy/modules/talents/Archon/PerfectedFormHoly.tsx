import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { Options } from 'parser/core/Module';
import Combatants from 'parser/shared/modules/Combatants';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import SpellLink from 'interface/SpellLink';
import { formatNumber, formatPercentage } from 'common/format';
import TalentSpellText from 'parser/ui/TalentSpellText';

import { TALENTS_PRIEST } from 'common/TALENTS';
import PRIEST_TALENTS from 'common/TALENTS/priest';
import Events, { HealEvent } from 'parser/core/Events';
import { HOLY_ABILITIES_AFFECTED_BY_HEALING_INCREASES } from '../../../constants';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import SPELLS from 'common/SPELLS';
import { PERFECTED_FORM_AMP } from './ArchonValues';

class PerfectedFormHoly extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  protected combatants!: Combatants;

  /** Total healing from perfected form's salvation buff */
  perfectedFormSalv = 0;
  /** Total healing from perfected form's apoth buff */
  perfectedFormApoth = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_PRIEST.PERFECTED_FORM_TALENT);

    //perfected form healing
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(HOLY_ABILITIES_AFFECTED_BY_HEALING_INCREASES),
      this.onPerfectedFormHeal,
    );
  }

  onPerfectedFormHeal(event: HealEvent) {
    if (
      this.selectedCombatant.hasBuff(
        SPELLS.PERFECTED_FORM_TALENT_BUFF.id,
        null,
        0,
        0,
        this.selectedCombatant.id,
      )
    ) {
      this.perfectedFormSalv += calculateEffectiveHealing(event, PERFECTED_FORM_AMP);
    }

    //Apoth only gets the buff when Perfected Form from Salv isn't active
    else if (
      !this.selectedCombatant.hasBuff(
        SPELLS.PERFECTED_FORM_TALENT_BUFF.id,
        null,
        0,
        0,
        this.selectedCombatant.id,
      ) &&
      this.selectedCombatant.hasBuff(
        TALENTS_PRIEST.APOTHEOSIS_TALENT.id,
        null,
        0,
        0,
        this.selectedCombatant.id,
      )
    ) {
      this.perfectedFormApoth += calculateEffectiveHealing(event, PERFECTED_FORM_AMP);
    }
  }

  //PERFECTED FORM STATISTICS
  passPerfectedFormHealing(): number {
    return this.perfectedFormApoth + this.perfectedFormSalv;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(99)}
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
        tooltip={
          <>
            <SpellLink spell={PRIEST_TALENTS.PERFECTED_FORM_TALENT} /> healing contributions:
            <ul>
              <li>
                {formatNumber(this.perfectedFormApoth)}
                {' ('}
                {formatPercentage(
                  this.owner.getPercentageOfTotalHealingDone(this.perfectedFormApoth),
                )}
                %) from <SpellLink spell={TALENTS_PRIEST.APOTHEOSIS_TALENT} />
              </li>
              <li>
                {formatNumber(this.perfectedFormSalv)}
                {' ('}
                {formatPercentage(
                  this.owner.getPercentageOfTotalHealingDone(this.perfectedFormSalv),
                )}
                %) from <SpellLink spell={TALENTS_PRIEST.HOLY_WORD_SALVATION_TALENT} />
              </li>
            </ul>
          </>
        }
      >
        <TalentSpellText talent={TALENTS_PRIEST.PERFECTED_FORM_TALENT}>
          <ItemPercentHealingDone amount={this.passPerfectedFormHealing()} />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default PerfectedFormHoly;
