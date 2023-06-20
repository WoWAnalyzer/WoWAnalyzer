import { formatNumber } from 'common/format';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent, ResourceChangeEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { TALENTS_DRUID } from 'common/TALENTS';
import ItemPercentDamageDone from 'parser/ui/ItemPercentDamageDone';
import SPELLS from 'common/SPELLS';

const AP_PER_PROC = 8;
const AP_PER_TICK = 0.5;

class SunderedFirmament extends Analyzer {
  totalDamage = 0;
  gainedAP = 0;
  totalEffectiveAP = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.SUNDERED_FIRMAMENT_TALENT);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);
    this.addEventListener(Events.resourcechange.by(SELECTED_PLAYER), this.onEnergize);
  }

  onDamage(event: DamageEvent) {
    if (event.ability.guid === SPELLS.FURY_OF_ELUNE_DAMAGE_SUNDERED_FIRMAMENT.id) {
      this.totalDamage += event.amount;
    }
  }

  onEnergize(event: ResourceChangeEvent) {
    if (event.ability.guid === SPELLS.SUNDERED_FIRMAMENT_RESOURCE.id) {
      this.gainedAP += AP_PER_TICK;
    }
  }

  statistic() {
    const dpsIncrease = formatNumber(this.totalDamage / (this.owner.fightDuration / 1000));
    const proc = Math.ceil(this.gainedAP / AP_PER_PROC);
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(14)}
        size="flexible"
        tooltip={`You had ${formatNumber(
          proc,
        )} procs of this talent which added ${dpsIncrease} to your DPS.`}
      >
        <BoringSpellValueText spell={TALENTS_DRUID.SUNDERED_FIRMAMENT_TALENT}>
          <>
            <ItemPercentDamageDone greaterThan amount={this.totalDamage} />
            <br />
            {formatNumber(this.gainedAP)} <small>additional Astral Power generated</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default SunderedFirmament;
