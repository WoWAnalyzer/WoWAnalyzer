import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { AbsorbedEvent, DamageEvent } from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import Buffs from 'parser/core/modules/Auras';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BoringItemValueText from 'parser/ui/BoringItemValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

class BloodSplatteredScale extends Analyzer {
  static dependencies = {
    abilities: Abilities,
    castEfficiency: CastEfficiency,
    spellUsable: SpellUsable,
    buffs: Buffs,
  };

  protected buffs!: Buffs;
  protected castEfficiency!: CastEfficiency;
  protected spellUsable!: SpellUsable;

  protected damage = 0;
  protected healing = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTrinket(ITEMS.BLOOD_SPATTERED_SCALE.id);

    if (!this.active) {
      return;
    }

    (options.buffs as Buffs).add({
      spellId: SPELLS.BLOOD_SPATTERED_SCALE_HEALING.id,
      timelineHighlight: true,
    });

    (options.abilities as Abilities).add({
      spell: SPELLS.BLOOD_SPATTERED_SCALE_DAMAGE.id,
      category: Abilities.SPELL_CATEGORIES.ITEMS,
      gcd: null,
      cooldown: 120,
      castEfficiency: {
        suggestion: true,
        recommendedEfficiency: 0.8,
      },
    });
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.BLOOD_SPATTERED_SCALE_DAMAGE),
      this.onDamage,
    );

    this.addEventListener(
      Events.absorbed.by(SELECTED_PLAYER).spell(SPELLS.BLOOD_SPATTERED_SCALE_HEALING),
      this.onHeal,
    );
  }

  onDamage(event: DamageEvent) {
    this.damage += event.amount;
  }

  onHeal(event: AbsorbedEvent) {
    this.healing += event.amount;
  }

  private getCastEfficiency() {
    return (
      this.castEfficiency.getCastEfficiencyForSpellId(SPELLS.BLOOD_SPATTERED_SCALE_DAMAGE.id) ?? {
        casts: 0,
        maxCasts: 0,
      }
    );
  }

  statistic() {
    const { casts, maxCasts } = this.getCastEfficiency();

    return (
      <Statistic
        position={STATISTIC_ORDER.CORE()}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
      >
        <BoringItemValueText item={ITEMS.BLOOD_SPATTERED_SCALE}>
          {casts} Uses <small>{maxCasts} possible</small>
          <br />
          <ItemDamageDone amount={this.damage} />
          <br />
          <ItemHealingDone amount={this.healing} />
        </BoringItemValueText>
      </Statistic>
    );
  }
}

export default BloodSplatteredScale;
