import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import TALENTS from 'common/TALENTS/evoker';
import SPELLS from 'common/SPELLS/evoker';
import Events, {
  EmpowerEndEvent,
  EventType,
  RemoveBuffEvent,
  RemoveBuffStackEvent,
} from 'parser/core/Events';
import {
  getAzureSweepBuffEvent,
  getAzureSweepConsumeEvent,
} from '../normalizers/CastLinkNormalizer';
import { AZURE_SWEEP_BASE_STACKS, AZURE_SWEEP_MID1_2PC_EXTRA_STACKS } from '../../constants';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import SpellLink from 'interface/SpellLink';
import { TIERS } from 'game/TIERS';
import DonutChart from 'parser/ui/DonutChart';

/** Eternity Surge upgrades your next Azure Strike to Azure Sweep,
 * damaging all nearby enemies and dealing 75% additional damage. */
class AzureSweep extends Analyzer {
  buffsUsed = 0;
  buffsWasted = 0;
  buffsOvercapped = 0;

  currentStacks = 0;

  amountOfStacksGenerated =
    AZURE_SWEEP_BASE_STACKS +
    (this.selectedCombatant.has2PieceByTier(TIERS.MID1) ? AZURE_SWEEP_MID1_2PC_EXTRA_STACKS : 0);

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.AZURE_SWEEP_TALENT);

    this.addEventListener(
      Events.empowerEnd
        .by(SELECTED_PLAYER)
        .spell([SPELLS.ETERNITY_SURGE, SPELLS.ETERNITY_SURGE_FONT]),
      this.onEmpowerEnd,
    );

    this.addEventListener(
      Events.removebuffstack.by(SELECTED_PLAYER).spell(SPELLS.AZURE_SWEEP_BUFF),
      this.onRemoveBuffStack,
    );

    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.AZURE_SWEEP_BUFF),
      this.onRemoveBuff,
    );
  }

  private onEmpowerEnd(event: EmpowerEndEvent) {
    const buffEvent = getAzureSweepBuffEvent(event);

    if (!buffEvent) {
      this.buffsOvercapped += this.amountOfStacksGenerated;
    } else if (buffEvent.type === EventType.ApplyBuff) {
      this.currentStacks = this.amountOfStacksGenerated;
    } else {
      const effStacksGained = buffEvent.stack - this.currentStacks;

      const overcapped = this.amountOfStacksGenerated - effStacksGained;
      this.buffsOvercapped += overcapped;

      this.currentStacks = buffEvent.stack;
    }
  }

  private onRemoveBuff(event: RemoveBuffEvent) {
    const consumeEvent = getAzureSweepConsumeEvent(event);

    if (!consumeEvent) {
      this.buffsWasted += this.currentStacks;
    } else {
      this.buffsUsed += 1;
    }

    this.currentStacks = 0;
  }

  private onRemoveBuffStack(event: RemoveBuffStackEvent) {
    this.buffsUsed += 1;

    this.currentStacks = event.stack;
  }

  statistic() {
    const items = [
      {
        color: 'rgb(123,188,93)',
        label: 'Used',
        valueTooltip: this.buffsUsed + ' used',
        value: this.buffsUsed,
      },
      {
        color: 'rgb(216,59,59)',
        label: 'Overcapped',
        valueTooltip: this.buffsOvercapped + ' stacks overcapped',
        value: this.buffsOvercapped,
      },
      {
        color: 'rgb(153, 102, 255)',
        label: 'Wasted',
        valueTooltip: this.buffsWasted + ' stacks wasted to buff running out',
        value: this.buffsWasted,
      },
    ];

    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <div className="pad">
          <label>
            <SpellLink spell={TALENTS.AZURE_SWEEP_TALENT} /> buff usage
          </label>
          <DonutChart items={items} />
        </div>
      </Statistic>
    );
  }
}

export default AzureSweep;
