import { FLAME_SIPHON_CDR_MS } from 'analysis/retail/evoker/shared/constants';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/evoker';
import SPECS from 'game/SPECS';
import SpellLink from 'interface/SpellLink';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { Options } from 'parser/core/EventSubscriber';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import DonutChart from 'parser/ui/DonutChart';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

/** Engulf reduces the cooldown of Fire Breath and Dream Breath by 6 sec. */
class FlameSiphon extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };
  protected spellUsable!: SpellUsable;

  totalEffectiveFireBreathCDR = 0;
  totalWastedFireBreathCDR = 0;

  totalEffectiveDreamBreathCDR = 0;
  totalWastedDreamBreathCDR = 0;

  fireBreathSpell =
    this.selectedCombatant.hasTalent(TALENTS.FONT_OF_MAGIC_DEVASTATION_TALENT) ||
    this.selectedCombatant.hasTalent(TALENTS.FONT_OF_MAGIC_PRESERVATION_TALENT)
      ? SPELLS.FIRE_BREATH_FONT
      : SPELLS.FIRE_BREATH;

  dreamBreathSpell =
    this.selectedCombatant.specId === SPECS.PRESERVATION_EVOKER.id &&
    (this.selectedCombatant.hasTalent(TALENTS.FONT_OF_MAGIC_PRESERVATION_TALENT)
      ? SPELLS.DREAM_BREATH_FONT
      : TALENTS.DREAM_BREATH_TALENT);

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.FLAME_SIPHON_TALENT);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.ENGULF_TALENT),
      this.onCast,
    );
  }

  onCast(event: CastEvent) {
    const effectiveFireBreathCDR = this.spellUsable.reduceCooldown(
      this.fireBreathSpell.id,
      FLAME_SIPHON_CDR_MS,
    );
    const wastedFireBreathCDR = FLAME_SIPHON_CDR_MS - effectiveFireBreathCDR;

    this.totalEffectiveFireBreathCDR += effectiveFireBreathCDR / 1_000;
    this.totalWastedFireBreathCDR += wastedFireBreathCDR / 1_000;

    if (!this.dreamBreathSpell) {
      return;
    }

    const effectiveDreamBreathCDR = this.spellUsable.reduceCooldown(
      this.dreamBreathSpell.id,
      FLAME_SIPHON_CDR_MS,
    );
    const wastedDreamBreathCDR = FLAME_SIPHON_CDR_MS - effectiveDreamBreathCDR;

    this.totalEffectiveDreamBreathCDR += effectiveDreamBreathCDR / 1_000;
    this.totalWastedDreamBreathCDR += wastedDreamBreathCDR / 1_000;
  }

  statistic() {
    const effectiveFireBreathCDRItems = [
      {
        color: 'rgb(123,188,93)',
        label: 'Effective CDR',
        valueTooltip: this.totalEffectiveFireBreathCDR.toFixed(2) + 's effective CDR',
        value: this.totalEffectiveFireBreathCDR,
      },
      {
        color: 'rgb(216,59,59)',
        label: 'Wasted CDR',
        valueTooltip: this.totalWastedFireBreathCDR.toFixed(2) + 's CDR wasted',
        value: this.totalWastedFireBreathCDR,
      },
    ];

    const effectiveDreamBreathCDRItems = this.dreamBreathSpell && [
      {
        color: 'rgb(123,188,93)',
        label: 'Effective CDR',
        valueTooltip: this.totalEffectiveDreamBreathCDR.toFixed(2) + 's effective CDR',
        value: this.totalEffectiveDreamBreathCDR,
      },
      {
        color: 'rgb(216,59,59)',
        label: 'Wasted CDR',
        valueTooltip: this.totalWastedDreamBreathCDR.toFixed(2) + 's CDR wasted',
        value: this.totalWastedDreamBreathCDR,
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
          <SpellLink spell={SPELLS.FIRE_BREATH} /> CDR:
          <DonutChart items={effectiveFireBreathCDRItems} />
        </div>
        {effectiveDreamBreathCDRItems && (
          <div className="pad">
            <SpellLink spell={SPELLS.DREAM_BREATH} /> CDR:
            <DonutChart items={effectiveDreamBreathCDRItems} />
          </div>
        )}
      </Statistic>
    );
  }
}

export default FlameSiphon;
