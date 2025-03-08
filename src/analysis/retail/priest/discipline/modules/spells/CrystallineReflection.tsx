import { formatThousands } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_PRIEST } from 'common/TALENTS';
import { SpellLink } from 'interface';
import Analyzer, { Options } from 'parser/core/Analyzer';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import PowerWordShield from './PowerWordShield';
import DonutChart from 'parser/ui/DonutChart';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

const CRYSTALLINE_REFLECTION_RANK_INCREASE = 0.06;

class CrystallineReflection extends Analyzer {
  static dependencies = {
    powerWordShield: PowerWordShield,
  };

  protected powerWordShield!: PowerWordShield;

  talentRank = 0;
  crIncrease = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_PRIEST.CRYSTALLINE_REFLECTION_TALENT);

    if (!this.active) {
      return;
    }
    this.talentRank = this.selectedCombatant.getTalentRank(
      TALENTS_PRIEST.CRYSTALLINE_REFLECTION_TALENT,
    );
    this.crIncrease = this.talentRank * CRYSTALLINE_REFLECTION_RANK_INCREASE;
  }

  renderCrystallineReflectionChart() {
    const wealDetails = {
      color: '#0CD368',
      label: 'Weal and Woe',
      spellId: TALENTS_PRIEST.WEAL_AND_WOE_TALENT.id,
      value: this.powerWordShield.wealValue * this.crIncrease,
      valueTooltip: `${formatThousands(
        ((this.powerWordShield.wealValue * this.crIncrease) / this.owner.fightDuration) * 1000,
      )} DPS`,
    };

    const aegisDetails = {
      color: '#fcba03',
      label: 'Aegis of Wrath',
      spellId: TALENTS_PRIEST.ETERNAL_BARRIER_TALENT.id,
      value: this.powerWordShield.aegisOfWrathValue * this.crIncrease,
      valueTooltip: `${formatThousands(
        ((this.powerWordShield.aegisOfWrathValue * this.crIncrease) / this.owner.fightDuration) *
          1000,
      )} DPS`,
    };

    const items = [
      {
        color: '#fff',
        label: 'Power Word: Shield',
        spellId: SPELLS.POWER_WORD_SHIELD.id,
        value: this.powerWordShield.pwsValue * this.crIncrease,
        valueTooltip: `${formatThousands(
          ((this.powerWordShield.pwsValue * this.crIncrease) / this.owner.fightDuration) * 1000,
        )} DPS`,
      },
    ];

    if (this.selectedCombatant.hasTalent(TALENTS_PRIEST.WEAL_AND_WOE_TALENT)) {
      items.push(wealDetails);
    }

    if (this.selectedCombatant.hasTalent(TALENTS_PRIEST.ETERNAL_BARRIER_TALENT)) {
      items.push(aegisDetails);
    }

    return <DonutChart items={items} />;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(20)}
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
      >
        <div className="pad">
          <label>
            <SpellLink spell={TALENTS_PRIEST.CRYSTALLINE_REFLECTION_TALENT}></SpellLink> damage
            breakdown
          </label>
          {this.renderCrystallineReflectionChart()}
        </div>
      </Statistic>
    );
  }
}

export default CrystallineReflection;
