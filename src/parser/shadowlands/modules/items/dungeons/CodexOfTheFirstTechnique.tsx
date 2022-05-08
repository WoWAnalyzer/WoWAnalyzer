import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { AbsorbedEvent, DamageEvent } from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import Buffs from 'parser/core/modules/Buffs';
import BoringItemValueText from 'parser/ui/BoringItemValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

class CodexOfTheFirstTechnique extends Analyzer {
  static dependencies = {
    abilities: Abilities,
    buffs: Buffs,
  };

  protected buffs!: Buffs;
  protected damage = 0;
  protected healing = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTrinket(ITEMS.CODEX_OF_THE_FIRST_TECHNIQUE.id);

    if (!this.active) {
      return;
    }

    (options.buffs as Buffs).add({
      spellId: SPELLS.CODEX_OF_THE_FIRST_TECHNIQUE_HEALING.id,
      timelineHighlight: true,
    });

    (options.abilities as Abilities).add({
      spell: SPELLS.CODEX_OF_THE_FIRST_TECHNIQUE_HEALING.id,
      category: Abilities.SPELL_CATEGORIES.ITEMS,
      gcd: null,
    });
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.CODEX_OF_THE_FIRST_TECHNIQUE_DAMAGE),
      this.onDamage,
    );

    this.addEventListener(
      Events.absorbed.by(SELECTED_PLAYER).spell(SPELLS.CODEX_OF_THE_FIRST_TECHNIQUE_HEALING),
      this.onHeal,
    );
  }

  onDamage(event: DamageEvent) {
    this.damage += event.amount;
  }

  onHeal(event: AbsorbedEvent) {
    this.healing += event.amount;
  }

  get uptime() {
    return (
      this.selectedCombatant.getBuffUptime(SPELLS.CODEX_OF_THE_FIRST_TECHNIQUE_HEALING.id) /
      this.owner.fightDuration
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE()}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
      >
        <BoringItemValueText item={ITEMS.CODEX_OF_THE_FIRST_TECHNIQUE}>
          <ItemDamageDone amount={this.damage} />
          <br />
          <ItemHealingDone amount={this.healing} />
        </BoringItemValueText>
      </Statistic>
    );
  }
}

export default CodexOfTheFirstTechnique;
