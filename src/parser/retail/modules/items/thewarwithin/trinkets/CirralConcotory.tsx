import ITEMS from 'common/ITEMS/thewarwithin/trinkets';
import SPELLS from 'common/SPELLS/thewarwithin/trinkets';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Abilities from 'parser/core/modules/Abilities';
import Events, { ApplyBuffEvent } from 'parser/core/Events';
import DonutChart from 'parser/ui/DonutChart';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import BoringItemValueText from 'parser/ui/BoringItemValueText';

export default class CirralConcoctory extends Analyzer.withDependencies({
  abilities: Abilities,
}) {
  protected strandApplications: { [key: number]: number } = {};
  constructor(options: Options) {
    super(options);
    const strandBuffs = [
      SPELLS.STRAND_OF_THE_ASCENDED,
      SPELLS.STRAND_OF_THE_LORD,
      SPELLS.STRAND_OF_THE_QUEEN,
      SPELLS.STRAND_OF_THE_SAGE,
      SPELLS.STRAND_OF_THE_SUNDERED_DPS_BUFF,
      SPELLS.STRAND_OF_THE_SUNDERED_HEALER_BUFF,
      SPELLS.STRAND_OF_THE_SUNDERED_TANK_BUFF,
    ];
    this.active = this.selectedCombatant.hasTrinket(ITEMS.CIRRAL_CONCOCTORY.id);
    if (!this.active) {
      return;
    }
    Object.values(strandBuffs).forEach((spell) => {
      this.strandApplications[spell.id] = 0;
    });
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(strandBuffs),
      this.onApplyBuff,
    );
  }

  protected onApplyBuff(event: ApplyBuffEvent) {
    this.strandApplications[event.ability.guid] += 1;
  }

  statistic() {
    const buffProcs = [
      {
        color: 'rgb(100, 255, 100)',
        label: 'Primary stat',
        spellId: SPELLS.STRAND_OF_THE_LORD.id,
        valueTooltip: this.strandApplications[SPELLS.STRAND_OF_THE_LORD.id],
        value: this.strandApplications[SPELLS.STRAND_OF_THE_LORD.id],
      },
      {
        color: 'rgb(100, 255, 255)',
        label: 'Secondary stat',
        spellId: SPELLS.STRAND_OF_THE_ASCENDED.id,
        valueTooltip: this.strandApplications[SPELLS.STRAND_OF_THE_ASCENDED.id],
        value: this.strandApplications[SPELLS.STRAND_OF_THE_ASCENDED.id],
      },
      {
        color: 'rgb(255, 100, 100)',
        label: 'Damage proc (DPS)',
        spellId: SPELLS.STRAND_OF_THE_SUNDERED_DPS_BUFF.id,
        valueTooltip: this.strandApplications[SPELLS.STRAND_OF_THE_SUNDERED_DPS_BUFF.id],
        value: this.strandApplications[SPELLS.STRAND_OF_THE_SUNDERED_DPS_BUFF.id],
      },
      {
        color: 'rgb(100, 100, 255)',
        label: 'Damage proc (tank)',
        spellId: SPELLS.STRAND_OF_THE_SUNDERED_TANK_BUFF.id,
        valueTooltip: this.strandApplications[SPELLS.STRAND_OF_THE_SUNDERED_TANK_BUFF.id],
        value: this.strandApplications[SPELLS.STRAND_OF_THE_SUNDERED_TANK_BUFF.id],
      },
      {
        color: 'rgb(255, 255, 100)',
        label: 'Healing proc (healer)',
        spellId: SPELLS.STRAND_OF_THE_SUNDERED_HEALER_BUFF.id,
        valueTooltip: this.strandApplications[SPELLS.STRAND_OF_THE_SUNDERED_HEALER_BUFF.id],
        value: this.strandApplications[SPELLS.STRAND_OF_THE_SUNDERED_HEALER_BUFF.id],
      },
      {
        color: 'rgb(255, 255, 255)',
        label: 'All tertiary stats',
        spellId: SPELLS.STRAND_OF_THE_QUEEN.id,
        valueTooltip: this.strandApplications[SPELLS.STRAND_OF_THE_QUEEN.id],
        value: this.strandApplications[SPELLS.STRAND_OF_THE_QUEEN.id],
      },
      {
        color: 'rgb(3, 64, 68)',
        label: 'Mana',
        spellId: SPELLS.STRAND_OF_THE_SAGE.id,
        valueTooltip: this.strandApplications[SPELLS.STRAND_OF_THE_SAGE.id],
        value: this.strandApplications[SPELLS.STRAND_OF_THE_SAGE.id],
      },
    ];
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(99)}
        category={STATISTIC_CATEGORY.ITEMS}
        size="flexible"
      >
        <BoringItemValueText item={ITEMS.CIRRAL_CONCOCTORY}> </BoringItemValueText>

        <div className="pad">
          <label>Buff procs</label>
          <DonutChart items={buffProcs} />
        </div>
      </Statistic>
    );
  }
}
