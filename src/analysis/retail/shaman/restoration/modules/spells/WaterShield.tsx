import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/shaman';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, ResourceChangeEvent } from 'parser/core/Events';
import { ThresholdStyle } from 'parser/core/ParseResults';
import ItemManaGained from 'parser/ui/ItemManaGained';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';

// just gonna steal my mtt formatting
import './ManaTideTotem.scss';

const WATER_SHIELD_MANA_REGEN_PER_SECOND = 239 / 5;

class WaterShield extends Analyzer {
  manaGain = 0;
  prepullApplication = false;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.WATER_SHIELD_TALENT);

    this.addEventListener(
      Events.resourcechange.by(SELECTED_PLAYER).spell(SPELLS.WATER_SHIELD_ENERGIZE),
      this.waterShield,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(TALENTS.WATER_SHIELD_TALENT),
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
      this.selectedCombatant.getBuffUptime(TALENTS.WATER_SHIELD_TALENT.id) /
      this.owner.fightDuration;
    if (uptime === 0) {
      uptime = 1; // quick fix for water shield not being in logs
    }

    return (this.owner.fightDuration / 1000) * WATER_SHIELD_MANA_REGEN_PER_SECOND * uptime;
  }

  get uptime() {
    return this.selectedCombatant.getBuffUptime(TALENTS.WATER_SHIELD_TALENT.id);
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
        <TalentSpellText talent={TALENTS.WATER_SHIELD_TALENT}>
          <ItemManaGained amount={this.manaGain + this.regenOnPlayer} />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default WaterShield;
