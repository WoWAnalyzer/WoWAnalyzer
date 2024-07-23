import SPELLS from 'common/SPELLS';
import { TALENTS_EVOKER } from 'common/TALENTS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
  RemoveBuffStackEvent,
} from 'parser/core/Events';
import ItemManaGained from 'parser/ui/ItemManaGained';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';
import {
  didEbConsumeSparkProc,
  didSparkProcEssenceBurst,
  wasEbConsumed,
} from '../../normalizers/EventLinking/helpers';
import { getEssenceBurstConsumeAbility } from 'analysis/retail/evoker/shared/modules/normalizers/EssenceBurstCastLinkNormalizer';
import { ESSENCE_COSTS, MANA_COSTS } from './EssenceBurst';

class SparkOfInsight extends Analyzer {
  currentTcStacks: number = 0;
  essenceSaved: number = 0;
  manaSaved: number = 0;
  totalSparkProcs: number = 0;
  wastedStacks: number = 0;
  wastedProcs: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_EVOKER.SPARK_OF_INSIGHT_TALENT);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.ESSENCE_BURST_BUFF),
      this.onApply,
    );
    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.ESSENCE_BURST_BUFF),
      this.onApply,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.ESSENCE_BURST_BUFF),
      this.onEbRefresh,
    );
    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.TEMPORAL_COMPRESSION_BUFF),
      this.onGainStack,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.TEMPORAL_COMPRESSION_BUFF),
      this.onConsumeTcStacks,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.ESSENCE_BURST_BUFF),
      this.onEbRemove,
    );
    this.addEventListener(
      Events.removebuffstack.by(SELECTED_PLAYER).spell(SPELLS.ESSENCE_BURST_BUFF),
      this.onEbRemove,
    );
  }

  onApply(event: ApplyBuffEvent | ApplyBuffStackEvent) {
    if (didSparkProcEssenceBurst(event)) {
      this.totalSparkProcs += 1;
      if (!wasEbConsumed(event)) {
        this.wastedProcs += 1;
      }
    }
  }

  onEbRefresh(event: RefreshBuffEvent) {
    if (didSparkProcEssenceBurst(event)) {
      this.wastedProcs += 1;
      this.totalSparkProcs += 1;
    }
  }

  onGainStack(event: ApplyBuffStackEvent) {
    this.currentTcStacks += 1;
  }

  onConsumeTcStacks(event: RemoveBuffEvent) {
    if (!didSparkProcEssenceBurst(event)) {
      this.wastedStacks += this.currentTcStacks;
    }
    this.currentTcStacks = 0;
  }

  onEbRemove(event: RemoveBuffEvent | RemoveBuffStackEvent) {
    const consumeAbility = getEssenceBurstConsumeAbility(event);
    if (consumeAbility && didEbConsumeSparkProc(event)) {
      const spellName = consumeAbility.ability.name;
      this.essenceSaved += ESSENCE_COSTS[spellName];
      this.manaSaved += MANA_COSTS[spellName];
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(5)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <TalentSpellText talent={TALENTS_EVOKER.SPARK_OF_INSIGHT_TALENT}>
          {this.totalSparkProcs}{' '}
          <small>
            extra <SpellLink spell={TALENTS_EVOKER.ESSENCE_BURST_PRESERVATION_TALENT} /> procs
          </small>
          <br />
          {this.wastedProcs}{' '}
          <small>
            wasted <SpellLink spell={TALENTS_EVOKER.ESSENCE_BURST_PRESERVATION_TALENT} /> procs
          </small>
          <br />
          {this.wastedStacks} <small>wasted stacks</small>
          <br />
          {this.essenceSaved} <small>essence saved</small> <br />
          <ItemManaGained amount={this.manaSaved} useAbbrev />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default SparkOfInsight;
