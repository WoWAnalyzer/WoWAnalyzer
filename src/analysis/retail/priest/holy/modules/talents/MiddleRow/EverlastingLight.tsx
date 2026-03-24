import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_PRIEST } from 'common/TALENTS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { SpellLink } from 'interface';
import BoringValueText from 'parser/ui/BoringValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

const BASE_SURGE_PROC_CHANCE = 0.08;
const MAX_ADDITIONAL_MULTIPLIER = 0.5;

// Spells that can trigger Surge of Light
const SURGE_TRIGGER_SPELLS = [
  SPELLS.FLASH_HEAL,
  TALENTS_PRIEST.PRAYER_OF_HEALING_TALENT,
  SPELLS.SMITE,
  TALENTS_PRIEST.HOLY_NOVA_TALENT,
];

/**
 * Everlasting Light
 * Surge of Light occurs up to 50% more often based on your missing mana.
 */

class EverlastingLight extends Analyzer {
  private totalBonus = 0;
  private eligibleCasts = 0;
  private expectedExtraProcs = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_PRIEST.EVERLASTING_LIGHT_TALENT);

    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SURGE_TRIGGER_SPELLS),
      this.onTriggerCast,
    );
  }

  private onTriggerCast(event: CastEvent) {
    const manaResource = event.classResources?.find(r => r.type === RESOURCE_TYPES.MANA.id);
    if (!manaResource) {
      return;
    }

    const currentMana = manaResource.amount;
    const maxMana = manaResource.max;

    const missingManaPercent = Math.max(0, Math.min(1, (maxMana - currentMana) / maxMana));

    const bonus = MAX_ADDITIONAL_MULTIPLIER * missingManaPercent;

    this.totalBonus += bonus;
    this.eligibleCasts += 1;
    this.expectedExtraProcs += BASE_SURGE_PROC_CHANCE * bonus;
  }

  get averageBonus(): number {
    return this.eligibleCasts === 0 ? 0 : this.totalBonus / this.eligibleCasts;
  }

  statistic() {
    const avgBonusPct = formatPercentage(this.averageBonus, 1);
    const extraProcs = this.expectedExtraProcs.toFixed(1);

    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(1)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringValueText label={<><SpellLink spell={TALENTS_PRIEST.EVERLASTING_LIGHT_TALENT} /></>}>
          <div>
            {avgBonusPct}% <small>avg. increased proc chance</small>
          </div>
          <div>
            ≈{extraProcs} <small>extra Surge procs</small>
          </div>
        </BoringValueText>
      </Statistic>
    );
  }
}

export default EverlastingLight;