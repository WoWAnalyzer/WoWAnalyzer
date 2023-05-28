import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, ResourceChangeEvent } from 'parser/core/Events';
import { ThresholdStyle } from 'parser/core/ParseResults';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemManaGained from 'parser/ui/ItemManaGained';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

// just gonna steal my mtt formatting
import './ManaTideTotem.scss';

const WATER_SHIELD_MANA_REGEN_PER_SECOND = 239 / 5;

class WaterShield extends Analyzer {
  manaGain = 0;
  prepullApplication = false;

  constructor(options: Options) {
    super(options);

    this.addEventListener(
      Events.resourcechange.by(SELECTED_PLAYER).spell(SPELLS.WATER_SHIELD_ENERGIZE),
      this.waterShield,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.WATER_SHIELD),
      this.waterShieldPrepullCheck,
    );
  }

  waterShield(event: ResourceChangeEvent) {
    this.manaGain += event.resourceChange;
  }

  waterShieldPrepullCheck(event: ApplyBuffEvent) {
    if (event.prepull) {
      this.prepullApplication = true;
    }
  }

  get regenOnPlayer() {
    let uptime =
      this.selectedCombatant.getBuffUptime(SPELLS.WATER_SHIELD.id) / this.owner.fightDuration;
    if (uptime === 0) {
      uptime = 1; // quick fix for water shield not being in logs
    }

    return (this.owner.fightDuration / 1000) * WATER_SHIELD_MANA_REGEN_PER_SECOND * uptime;
  }

  get uptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.WATER_SHIELD.id);
  }

  get uptimePercent() {
    return this.uptime / this.owner.fightDuration;
  }

  get suggestionThresholds() {
    return {
      actual: this.uptimePercent,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.85,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  get suggestionThresholdsPrepull() {
    return {
      actual: this.prepullApplication,
      isEqual: false,
      style: ThresholdStyle.BOOLEAN,
    };
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        position={STATISTIC_ORDER.UNIMPORTANT(88)}
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <ul>
            <li>{formatNumber(this.regenOnPlayer)} from passive regen</li>
            <li>{formatNumber(this.manaGain)} from hits taken</li>
          </ul>
        }
      >
        <BoringSpellValueText spellId={SPELLS.WATER_SHIELD.id}>
          <ItemManaGained amount={this.manaGain + this.regenOnPlayer} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default WaterShield;
