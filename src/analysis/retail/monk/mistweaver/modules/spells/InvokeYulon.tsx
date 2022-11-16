import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events, { HealEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

class InvokeYulon extends Analyzer {
  soothHealing: number = 0;
  envelopHealing: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(
      TALENTS_MONK.INVOKE_YULON_THE_JADE_SERPENT_TALENT.id,
    );
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.ENVELOPING_BREATH_HEAL),
      this.handleEnvelopingBreath,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER_PET).spell(SPELLS.SOOTHING_BREATH),
      this.handleSoothingBreath,
    );
  }

  handleEnvelopingBreath(event: HealEvent) {
    this.envelopHealing += (event.amount || 0) + (event.absorbed || 0);
  }

  handleSoothingBreath(event: HealEvent) {
    this.soothHealing += (event.amount || 0) + (event.absorbed || 0);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.DEFAULT}
        size="flexible"
        tooltip={
          <>
            Healing Breakdown:
            <ul>
              <li>{formatNumber(this.soothHealing)} healing from Soothing Breath.</li>
              <li>{formatNumber(this.envelopHealing)} healing from Enveloping Breath.</li>
            </ul>
          </>
        }
      >
        <BoringSpellValueText spellId={TALENTS_MONK.INVOKE_YULON_THE_JADE_SERPENT_TALENT.id}>
          <ItemHealingDone amount={this.soothHealing + this.envelopHealing} />
          <br />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default InvokeYulon;
