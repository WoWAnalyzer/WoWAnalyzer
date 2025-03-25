import { FLAME_SIPHON_CDR_MS } from 'analysis/retail/evoker/shared/constants';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/evoker';
import SpellLink from 'interface/SpellLink';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { Options } from 'parser/core/EventSubscriber';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import DonutChart from 'parser/ui/DonutChart';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

/** Engulf reduces the cooldown of Fire Breath by 6 sec. */
class FlameSiphon extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };
  protected spellUsable!: SpellUsable;

  totalEffectiveCDR = 0;
  totalWastedCDR = 0;

  fireBreathSpell =
    this.selectedCombatant.hasTalent(TALENTS.FONT_OF_MAGIC_DEVASTATION_TALENT) ||
    this.selectedCombatant.hasTalent(TALENTS.FONT_OF_MAGIC_PRESERVATION_TALENT)
      ? SPELLS.FIRE_BREATH_FONT
      : SPELLS.FIRE_BREATH;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.FLAME_SIPHON_TALENT);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.ENGULF_TALENT),
      this.onCast,
    );
  }

  onCast(event: CastEvent) {
    const effectiveCDR = this.spellUsable.reduceCooldown(
      this.fireBreathSpell.id,
      FLAME_SIPHON_CDR_MS,
    );
    const wastedCDR = FLAME_SIPHON_CDR_MS - effectiveCDR;

    this.totalEffectiveCDR += effectiveCDR / 1_000;
    this.totalWastedCDR += wastedCDR / 1_000;
  }

  statistic() {
    const effectiveCDRItems = [
      {
        color: 'rgb(123,188,93)',
        label: 'Effective CDR',
        valueTooltip: this.totalEffectiveCDR.toFixed(2) + 's effective CDR',
        value: this.totalEffectiveCDR,
      },
      {
        color: 'rgb(216,59,59)',
        label: 'Wasted CDR',
        valueTooltip: this.totalWastedCDR.toFixed(2) + 's CDR wasted',
        value: this.totalWastedCDR,
      },
    ];

    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(6)}
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
      >
        <div className="pad">
          <label>
            <SpellLink spell={TALENTS.FLAME_SIPHON_TALENT} />
          </label>
          <strong>CDR efficiency:</strong>
          <DonutChart items={effectiveCDRItems} />
        </div>
      </Statistic>
    );
  }
}

export default FlameSiphon;
