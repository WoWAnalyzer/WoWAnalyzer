import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, ApplyBuffStackEvent, RefreshBuffEvent } from 'parser/core/Events';
import DonutChart from 'parser/ui/DonutChart';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { MANA_TEA_MAX_STACKS, SPELL_COLORS } from '../../constants';
import { HasStackChange, isMTStackFromLifeCycles } from '../../normalizers/CastLinkNormalizer';

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
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.MANA_TEA_STACK),
      this.onStackWaste,
    );
  }

  onStackGain(event: ApplyBuffStackEvent | ApplyBuffEvent) {
    if (isMTStackFromLifeCycles(event)) {
      this.lifecyclesStacks.usedStacks += 1;
    } else {
      this.naturalStacks.usedStacks += 1;
    }
  }

  onStackWaste(event: RefreshBuffEvent) {
    if (
      HasStackChange(event) ||
      this.selectedCombatant.getBuffStacks(SPELLS.MANA_TEA_STACK.id, event.timestamp) <
        MANA_TEA_MAX_STACKS
    ) {
      return;
    }

    if (isMTStackFromLifeCycles(event)) {
      this.lifecyclesStacks.wastedStacks += 1;
    } else {
      this.naturalStacks.wastedStacks += 1;
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

  get lifecyclesEfficiency() {
    return (
      this.lifecyclesStacks.usedStacks /
      (this.lifecyclesStacks.usedStacks + this.lifecyclesStacks.wastedStacks)
    );
  }

  get mtEfficiency() {
    return (
      this.naturalStacks.usedStacks /
      (this.naturalStacks.usedStacks + this.naturalStacks.wastedStacks)
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(10)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            <div>
              <SpellLink spell={TALENTS_MONK.LIFECYCLES_TALENT} /> stack efficiency:{' '}
              {formatPercentage(this.lifecyclesEfficiency)}
            </div>
            <div>
              <SpellLink spell={TALENTS_MONK.MANA_TEA_TALENT} /> natural stack efficiency:{' '}
              {formatPercentage(this.mtEfficiency)}
            </div>
          </>
        }
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
