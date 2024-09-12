import SPELLS from 'common/SPELLS';
import TALENTS, { TALENTS_PRIEST } from 'common/TALENTS/priest';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { HealEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import EOLAttrib from '../../core/EchoOfLightAttributor';
import SpellLink from 'interface/SpellLink';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';

// Example Log: /report/hRd3mpK1yTQ2tDJM/1-Mythic+MOTHER+-+Kill+(2:24)/14-丶寶寶小喵
class TrailOfLight extends Analyzer {
  static dependencies = {
    eolAttrib: EOLAttrib,
  };
  protected eolAttrib!: EOLAttrib;
  eolContrib = 0;

  totalToLProcs = 0;
  totalToLHealing = 0;
  totalToLOverhealing = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.TRAIL_OF_LIGHT_TALENT);
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.TRAIL_OF_LIGHT_TALENT_HEAL),
      this.onHeal,
    );
  }

  onHeal(event: HealEvent) {
    this.totalToLProcs += 1;
    this.totalToLHealing += event.amount + (event.absorbed || 0);
    this.totalToLOverhealing += event.overheal || 0;
    this.eolContrib += this.eolAttrib.getEchoOfLightHealingAttrib(event);
  }

  statistic() {
    return (
      <Statistic
        tooltip={
          <>
            <div>
              <SpellLink spell={TALENTS_PRIEST.TRAIL_OF_LIGHT_TALENT} /> Procs: $
              {this.totalToLProcs}
            </div>
            <br />
            <div>Breakdown: </div>
            <div>
              <SpellLink spell={TALENTS_PRIEST.TRAIL_OF_LIGHT_TALENT} />:{' '}
              <ItemPercentHealingDone amount={this.totalToLHealing}></ItemPercentHealingDone>{' '}
            </div>
            <div>
              <SpellLink spell={SPELLS.ECHO_OF_LIGHT_MASTERY} />:{' '}
              <ItemPercentHealingDone amount={this.eolContrib}></ItemPercentHealingDone>{' '}
            </div>
          </>
        }
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.OPTIONAL(1)}
      >
        <BoringSpellValueText spell={TALENTS.TRAIL_OF_LIGHT_TALENT}>
          <ItemHealingDone amount={this.totalToLHealing + this.eolContrib} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default TrailOfLight;
