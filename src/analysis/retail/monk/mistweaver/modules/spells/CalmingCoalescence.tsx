import SPELLS from 'common/SPELLS';
import talents from 'common/TALENTS/monk';
import { formatNumber } from 'common/format';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  AbsorbedEvent,
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  CastEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import Statistic from 'parser/ui/Statistic';
import { isFromLifeCocoon } from '../../normalizers/CastLinkNormalizer';

const BUFF_AMOUNT_PER_STACK = 0.03;

class CalmingCoalescence extends Analyzer {
  casts: number = 0;
  stacks: number = 0;
  totalStacks: number = 0;
  shieldSize: number = 0;
  currentShieldAbsorbed: number = 0;
  totalShieldSize: number = 0;
  baseShield: number = 0;
  healing: number = 0;
  wasted: number = 0;

  get averageStacks() {
    return this.totalStacks / this.casts;
  }

  get averageShieldSize() {
    return this.totalShieldSize / this.casts;
  }

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(talents.CALMING_COALESCENCE_TALENT);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(talents.LIFE_COCOON_TALENT),
      this.onCast,
    );
    this.addEventListener(
      Events.absorbed.by(SELECTED_PLAYER).spell(talents.LIFE_COCOON_TALENT),
      this.onAbsorbed,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(talents.LIFE_COCOON_TALENT),
      this.onApplyLifeCocoon,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(talents.LIFE_COCOON_TALENT),
      this.onRemoveLifeCocoon,
    );
    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.CALMING_COALESCENCE_BUFF),
      this.onApplyCCBuffStack,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.CALMING_COALESCENCE_BUFF),
      this.onRemoveCCBuff,
    );
  }

  onCast(event: CastEvent) {
    this.casts += 1;
  }

  onApplyLifeCocoon(event: ApplyBuffEvent) {
    this.totalShieldSize += event.absorb || 0;
    this.shieldSize = event.absorb || 0;
    console.log(this.stacks, this.shieldSize);
    this.baseShield = this.stacks > 0 ? this.calculateBaseShield(event.absorb!) : this.shieldSize;
    this.currentShieldAbsorbed = 0;
  }

  onAbsorbed(event: AbsorbedEvent) {
    console.log(event);
    this.currentShieldAbsorbed += event.amount;
  }

  onRemoveLifeCocoon(event: RemoveBuffEvent) {
    this.wasted += this.shieldSize - this.currentShieldAbsorbed;
    this.healing += Math.max(0, this.currentShieldAbsorbed - this.baseShield);
    this.shieldSize = 0;
  }

  onApplyCCBuffStack(event: ApplyBuffStackEvent) {
    this.stacks = event.stack;
  }

  onRemoveCCBuff(event: RemoveBuffEvent) {
    if (!isFromLifeCocoon(event)) {
      return;
    }
    this.totalStacks += this.stacks;
  }

  private calculateBaseShield(absorb: number): number {
    return absorb / (1 + BUFF_AMOUNT_PER_STACK * this.stacks);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(12)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <ul>
            <li>Average Stacks: {formatNumber(this.averageStacks)}</li>
            <li>Average Shield Size: {formatNumber(this.averageShieldSize)}</li>
            <li>Total wasted Shield: {formatNumber(this.wasted)}</li>
          </ul>
        }
      >
        <BoringSpellValueText spellId={SPELLS.CALMING_COALESCENCE_BUFF.id}>
          <ItemHealingDone amount={this.healing} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default CalmingCoalescence;
