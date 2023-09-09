import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, ApplyBuffStackEvent } from 'parser/core/Events';
import DonutChart from 'parser/ui/DonutChart';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { SPELL_COLORS } from '../../constants';
import { isMTStackFromLifeCycles } from '../../normalizers/CastLinkNormalizer';

interface StackInfo {
  usedStacks: number;
  wastedStacks: number;
}

class ManaTeaSources extends Analyzer {
  healing: number = 0;
  lifecyclesStacks: StackInfo = { usedStacks: 0, wastedStacks: 0 };
  naturalStacks: StackInfo = { usedStacks: 0, wastedStacks: 0 };

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.LIFECYCLES_TALENT);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.MANA_TEA_STACK),
      this.onStackGain,
    );
    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.MANA_TEA_STACK),
      this.onStackGain,
    );
  }

  onStackGain(event: ApplyBuffStackEvent | ApplyBuffEvent) {
    if (isMTStackFromLifeCycles(event)) {
      this.lifecyclesStacks.usedStacks += 1;
    } else {
      this.naturalStacks.usedStacks += 1;
    }
  }

  renderChart(wasted: boolean) {
    const naturalStacks = wasted ? this.naturalStacks.wastedStacks : this.naturalStacks.usedStacks;
    const lifecyclesStacks = wasted
      ? this.lifecyclesStacks.wastedStacks
      : this.lifecyclesStacks.usedStacks;
    const items = [
      {
        color: SPELL_COLORS.VIVIFY,
        label: 'Lifecycles',
        spellId: TALENTS_MONK.LIFECYCLES_TALENT.id,
        value: lifecyclesStacks,
        valueTooltip: formatNumber(lifecyclesStacks),
      },
      {
        color: SPELL_COLORS.REVIVAL,
        label: 'Mana Tea',
        spellId: TALENTS_MONK.MANA_TEA_TALENT.id,
        value: naturalStacks,
        valueTooltip: formatNumber(naturalStacks),
      },
    ];

    return <DonutChart items={items} />;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(10)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <div className="pad">
          <label>
            <SpellLink spell={TALENTS_MONK.MANA_TEA_TALENT}></SpellLink> unwasted stacks breakdown
          </label>
          {this.renderChart(false /* wasted */)}
        </div>
        <div className="pad">
          <label>
            <SpellLink spell={TALENTS_MONK.MANA_TEA_TALENT}></SpellLink> wasted stacks breakdown
          </label>
          {this.renderChart(true /* wasted */)}
        </div>
      </Statistic>
    );
  }
}

export default ManaTeaSources;
