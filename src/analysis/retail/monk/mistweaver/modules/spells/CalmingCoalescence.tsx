import talents, { TALENTS_MONK } from 'common/TALENTS/monk';
import { formatNumber } from 'common/format';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  AbsorbedEvent,
  ApplyBuffEvent,
  CastEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import Statistic from 'parser/ui/Statistic';
import { CALMING_COALESCENCE_INCREASE } from '../../constants';

class CalmingCoalescence extends Analyzer {
  casts: number = 0;
  shieldSize: number = 0;
  currentShieldAbsorbed: number = 0;
  totalShieldSize: number = 0;
  baseShield: number = 0;
  healing: number = 0;
  wasted: number = 0;

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
  }

  onCast(event: CastEvent) {
    this.casts += 1;
  }

  onApplyLifeCocoon(event: ApplyBuffEvent) {
    this.totalShieldSize += event.absorb || 0;
    this.shieldSize = event.absorb || 0;
    this.baseShield = this.calculateBaseShield(event.absorb!);
    this.currentShieldAbsorbed = 0;
  }

  onAbsorbed(event: AbsorbedEvent) {
    this.currentShieldAbsorbed += event.amount;
  }

  onRemoveLifeCocoon(event: RemoveBuffEvent) {
    this.wasted += this.shieldSize - this.currentShieldAbsorbed;
    this.healing += Math.max(0, this.currentShieldAbsorbed - this.baseShield);
    this.shieldSize = 0;
  }

  private calculateBaseShield(absorb: number): number {
    return absorb / (1 + CALMING_COALESCENCE_INCREASE);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(12)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <ul>
            <li>Total wasted Shield: {formatNumber(this.wasted)}</li>
          </ul>
        }
      >
        <BoringSpellValueText spell={TALENTS_MONK.CALMING_COALESCENCE_TALENT}>
          <ItemHealingDone amount={this.healing} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default CalmingCoalescence;
