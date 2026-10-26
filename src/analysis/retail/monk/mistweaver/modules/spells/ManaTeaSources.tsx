import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import DonutChart from 'parser/ui/DonutChart';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { MANA_TEA_MAX_STACKS, SPELL_COLORS } from '../../constants';
import { HasStackChange, isMTStackFromLifeCycles } from '../../normalizers/CastLinkNormalizer';
import ManaTeaGraph from '../features/ManaTeaGraph';

interface StackInfo {
  usedStacks: number;
  wastedStacks: number;
}

class ManaTeaSources extends Analyzer {
  static dependencies = {
    manaTeaGraph: ManaTeaGraph,
  };
  protected manaTeaGraph!: ManaTeaGraph;

  healing = 0;
  lifecyclesStacks: StackInfo = { usedStacks: 0, wastedStacks: 0 };
  naturalStacks: StackInfo = { usedStacks: 0, wastedStacks: 0 };

  constructor(options: Options) {
    super(options);
    // with only natural stacks there is nothing to break down
    this.active =
      this.selectedCombatant.hasTalent(TALENTS_MONK.MANA_TEA_TALENT) &&
      (this.selectedCombatant.hasTalent(TALENTS_MONK.LIFECYCLES_TALENT) ||
        this.selectedCombatant.hasTalent(TALENTS_MONK.REFRESHMENT_TALENT));
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
    this.addEventListener(
      Events.removebuff
        .by(SELECTED_PLAYER)
        .spell([SPELLS.LIFECYCLES_ENVELOPING_MIST_BUFF, SPELLS.LIFECYCLES_VIVIFY_BUFF]),
      this.onLifecyclesBuffFellOff,
    );
    this.addEventListener(
      Events.refreshbuff
        .by(SELECTED_PLAYER)
        .spell([SPELLS.LIFECYCLES_ENVELOPING_MIST_BUFF, SPELLS.LIFECYCLES_VIVIFY_BUFF]),
      this.onLifecyclesBuffFellOff,
    );
  }

  get refreshmentStacks(): StackInfo {
    return {
      usedStacks: this.manaTeaGraph.refreshmentGained,
      wastedStacks: this.manaTeaGraph.refreshmentWasted,
    };
  }

  onStackGain(event: ApplyBuffStackEvent | ApplyBuffEvent) {
    if (this.manaTeaGraph.isRefreshmentEvent(event)) {
      return;
    }
    if (isMTStackFromLifeCycles(event)) {
      this.lifecyclesStacks.usedStacks += 1;
    } else {
      this.naturalStacks.usedStacks += 1;
    }
  }

  onLifecyclesBuffFellOff(event: RemoveBuffEvent | RefreshBuffEvent) {
    if (!isMTStackFromLifeCycles(event)) {
      this.lifecyclesStacks.wastedStacks += 1;
    }
  }

  onStackWaste(event: RefreshBuffEvent) {
    if (
      HasStackChange(event) ||
      this.manaTeaGraph.isRefreshmentEvent(event) ||
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
    const pick = (info: StackInfo) => (wasted ? info.wastedStacks : info.usedStacks);
    const items = [
      {
        color: SPELL_COLORS.VIVIFY,
        label: 'Lifecycles',
        spellId: TALENTS_MONK.LIFECYCLES_TALENT.id,
        value: pick(this.lifecyclesStacks),
        valueTooltip: formatNumber(pick(this.lifecyclesStacks)),
        active: this.selectedCombatant.hasTalent(TALENTS_MONK.LIFECYCLES_TALENT),
      },
      {
        color: SPELL_COLORS.LIFE_COCOON,
        label: 'Refreshment',
        spellId: TALENTS_MONK.REFRESHMENT_TALENT.id,
        value: pick(this.refreshmentStacks),
        valueTooltip: formatNumber(pick(this.refreshmentStacks)),
        active: this.selectedCombatant.hasTalent(TALENTS_MONK.REFRESHMENT_TALENT),
      },
      {
        color: SPELL_COLORS.REVIVAL,
        label: 'Mana Tea',
        spellId: TALENTS_MONK.MANA_TEA_TALENT.id,
        value: pick(this.naturalStacks),
        valueTooltip: formatNumber(pick(this.naturalStacks)),
        active: true,
      },
    ].filter(({ active }) => active);

    return <DonutChart items={items} />;
  }

  private efficiency({ usedStacks, wastedStacks }: StackInfo) {
    const total = usedStacks + wastedStacks;
    return total === 0 ? 0 : usedStacks / total;
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        position={STATISTIC_ORDER.OPTIONAL(1)}
        category={STATISTIC_CATEGORY.THEORYCRAFT}
        tooltip={
          <>
            {this.selectedCombatant.hasTalent(TALENTS_MONK.LIFECYCLES_TALENT) && (
              <div>
                <SpellLink spell={TALENTS_MONK.LIFECYCLES_TALENT} /> stack efficiency:{' '}
                {formatPercentage(this.efficiency(this.lifecyclesStacks))}%
              </div>
            )}
            {this.selectedCombatant.hasTalent(TALENTS_MONK.REFRESHMENT_TALENT) && (
              <div>
                <SpellLink spell={TALENTS_MONK.REFRESHMENT_TALENT} /> stack efficiency:{' '}
                {formatPercentage(this.efficiency(this.refreshmentStacks))}%
              </div>
            )}
            <div>
              <SpellLink spell={TALENTS_MONK.MANA_TEA_TALENT} /> natural stack efficiency:{' '}
              {formatPercentage(this.efficiency(this.naturalStacks))}%
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
