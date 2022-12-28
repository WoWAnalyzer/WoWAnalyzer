import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/priest';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, ChangeBuffStackEvent, HealEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemManaGained from 'parser/ui/ItemManaGained';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

// Example Log: /report/da4AL7QPr36btCmV/8-Heroic+Huntsman+Altimor+-+Kill+(5:13)/Daemonlight/standard/statistics
class SurgeOfLight extends Analyzer {
  solStacksGained = 0;
  solStacksLost = 0;
  solFlashHeals = 0;
  currentSolStacks = 0;
  solStacksSpent = 0;
  solHealing = 0;
  solOverHealing = 0;

  get freeFlashHealPending() {
    return this.currentSolStacks > 0;
  }

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.SURGE_OF_LIGHT_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.changebuffstack.by(SELECTED_PLAYER).spell(SPELLS.SURGE_OF_LIGHT_BUFF),
      this.onChangeBuffStack,
    );
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.FLASH_HEAL), this.onCast);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.FLASH_HEAL), this.onHeal);
  }

  get solManaSaved() {
    return this.solFlashHeals * SPELLS.FLASH_HEAL.manaCost;
  }

  onChangeBuffStack(event: ChangeBuffStackEvent) {
    if (event.stacksGained > 0) {
      this.solStacksGained += 1;
    } else {
      this.solStacksSpent += 1;
    }
    this.currentSolStacks = event.newStacks;
  }

  onCast(event: CastEvent) {
    if (this.freeFlashHealPending) {
      this.solFlashHeals += 1;
    }
  }

  onHeal(event: HealEvent) {
    if (this.freeFlashHealPending) {
      this.solHealing += event.amount + (event.absorbed || 0);
      this.solOverHealing += event.overheal || 0;
    }
  }

  statistic() {
    return (
      <Statistic
        tooltip={`${this.solFlashHeals}/${this.solStacksGained} Surge of Light buffs used`}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.OPTIONAL(5)}
      >
        <BoringSpellValueText spellId={TALENTS.SURGE_OF_LIGHT_TALENT.id}>
          <>
            {this.solFlashHeals} free <SpellLink id={SPELLS.FLASH_HEAL.id} /> casts
            <br />
            <ItemManaGained amount={this.solManaSaved} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default SurgeOfLight;
