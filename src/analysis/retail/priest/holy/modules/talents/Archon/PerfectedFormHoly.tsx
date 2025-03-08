import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { Options } from 'parser/core/Module';
import Combatants from 'parser/shared/modules/Combatants';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import SpellLink from 'interface/SpellLink';
import TalentSpellText from 'parser/ui/TalentSpellText';

import { TALENTS_PRIEST } from 'common/TALENTS';
import PRIEST_TALENTS from 'common/TALENTS/priest';
import Events, { HealEvent } from 'parser/core/Events';
import {
  HOLY_ABILITIES_AFFECTED_BY_HEALING_INCREASES,
  PERFECTED_FORM_AMP,
} from '../../../constants';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import SPELLS from 'common/SPELLS';
import EOLAttrib from '../../core/EchoOfLightAttributor';

class PerfectedFormHoly extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    eolAttrib: EOLAttrib,
  };

  protected combatants!: Combatants;
  protected eolAttrib!: EOLAttrib;
  /** Total healing from perfected form's salvation buff */
  perfectedFormSalv = 0;
  /** Total healing from perfected form's apoth buff */
  perfectedFormApoth = 0;

  eolContrib = 0;

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
      this.eolContrib += this.eolAttrib.getEchoOfLightAmpAttrib(event, PERFECTED_FORM_AMP);
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
      this.eolContrib += this.eolAttrib.getEchoOfLightAmpAttrib(event, PERFECTED_FORM_AMP);
    }
  }

  //PERFECTED FORM STATISTICS
  passPerfectedFormHealing(): number {
    return this.perfectedFormApoth + this.perfectedFormSalv + this.eolContrib;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(99)}
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
        tooltip={
          <>
            <SpellLink spell={PRIEST_TALENTS.PERFECTED_FORM_TALENT} /> triggers from
            <SpellLink spell={TALENTS_PRIEST.APOTHEOSIS_TALENT} /> and contributes to{' '}
            <SpellLink spell={SPELLS.ECHO_OF_LIGHT_MASTERY} />: <br />
            <br />
            <SpellLink spell={TALENTS_PRIEST.APOTHEOSIS_TALENT} />:{' '}
            <ItemPercentHealingDone amount={this.perfectedFormApoth}></ItemPercentHealingDone>
            <br />
            <SpellLink spell={SPELLS.ECHO_OF_LIGHT_MASTERY} />:{' '}
            <ItemPercentHealingDone amount={this.eolContrib}></ItemPercentHealingDone> <br />
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
