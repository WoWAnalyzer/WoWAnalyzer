import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import TALENTS, { TALENTS_PRIEST } from 'common/TALENTS/priest';
import Events, { HealEvent } from 'parser/core/Events';
import TalentSpellText from 'parser/ui/TalentSpellText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import { DESP_TIMES_HEALING_MULTIPLIER_PER_RANK } from '../../../constants';
import EOLAttrib from '../../core/EchoOfLightAttributor';
import SpellLink from 'interface/SpellLink';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import SPELLS from 'common/SPELLS';

//Example log: /report/kVQd4LrBb9RW2h6K/9-Heroic+The+Primal+Council+-+Wipe+5+(5:04)/Delipriest/standard/statistics
class DesperateTimes extends Analyzer {
  static dependencies = {
    eolAttrib: EOLAttrib,
  };
  protected eolAttrib!: EOLAttrib;

  healingDoneFromTalent = 0;
  healingMultiplier = 0;
  eolContrib = 0;

  constructor(options: Options) {
    super(options);
    if (!this.selectedCombatant.hasTalent(TALENTS.DESPERATE_TIMES_TALENT)) {
      this.active = false;
    }
    this.healingMultiplier =
      DESP_TIMES_HEALING_MULTIPLIER_PER_RANK *
      this.selectedCombatant.getTalentRank(TALENTS.DESPERATE_TIMES_TALENT);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.onHeal);
  }
  onHeal(event: HealEvent) {
    const lifeBeforeHeal = event.hitPoints - event.amount;
    const lifePercentageBeforeHeal = lifeBeforeHeal / event.maxHitPoints;
    if (lifePercentageBeforeHeal <= 0.5) {
      //Float imprecision should not matter here

      this.healingDoneFromTalent += calculateEffectiveHealing(event, this.healingMultiplier);
      this.eolContrib += this.eolAttrib.getEchoOfLightAmpAttrib(event, this.healingMultiplier);
    }
  }

  statistic() {
    return (
      <Statistic
        tooltip={
          <>
            Breakdown:{' '}
            <div>
              <SpellLink spell={TALENTS_PRIEST.DESPERATE_TIMES_TALENT} />:{' '}
              <ItemPercentHealingDone amount={this.healingDoneFromTalent}></ItemPercentHealingDone>{' '}
            </div>
            <div>
              <SpellLink spell={SPELLS.ECHO_OF_LIGHT_MASTERY} />:{' '}
              <ItemPercentHealingDone amount={this.eolContrib}></ItemPercentHealingDone> <br />
            </div>
          </>
        }
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.OPTIONAL(1)}
      >
        <TalentSpellText talent={TALENTS.DESPERATE_TIMES_TALENT}>
          <ItemHealingDone amount={this.healingDoneFromTalent + this.eolContrib} />
        </TalentSpellText>
      </Statistic>
    );
  }
}
export default DesperateTimes;
