import TALENTS from 'common/TALENTS/priest';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import Events, { DamageEvent, HealEvent, CastEvent } from 'parser/core/Events';
import {
  calculateEffectiveHealing,
  calculateOverhealing,
  calculateEffectiveDamage,
} from 'parser/core/EventCalculateLib';
import StatTracker from 'parser/shared/modules/StatTracker';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import { formatPercentage } from 'common/format';
import { ABILITIES_THAT_WORK_WITH_DIVINE_FAVOR_CHASTISE } from 'analysis/retail/priest/holy/constants';
import { SpellIcon } from 'interface';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import ItemManaGained from 'parser/ui/ItemManaGained';

const DAMAGE_INCREASE_FROM_CHASTISE = 0.2;
const CHASTISE_REFUNDED_COOLDOWN = 15;
const HEALING_INCREASE_FROM_SERENITY = 0.3;
const MANA_REDUCTION_FROM_SERENITY = 0.2;
const ACTIVATOR_SPELL_INCREASE = 0.3;

// Example Logs: /report/VXr2kgALF3Rj6Q4M/11-Mythic+Anduin+Wrynn+-+Kill+(5:12)/Litena/standard/statistics
// /report/xq2FvfVCJh6YLjzZ/2-Mythic+Vigilant+Guardian+-+Kill+(4:40)/Ashelya/standard/statistics
class DivineWord extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };
  protected statTracker!: StatTracker;

  //Could also track mana saved and wasted Divine Words buffs
  sanctifyHealing = 0;
  sanctifyOverhealing = 0;

  chastiseDamage = 0;

  serenityHealing = 0;
  serenityOverhealing = 0;
  serenityManaSaved = 0;

  divineWordCasts = 0;
  serenityWordUse = 0;
  chastiseWordUse = 0;
  sanctifyWordUse = 0;

  constructor(options: Options) {
    super(options);
    if (!this.selectedCombatant.hasTalent(TALENTS.DIVINE_WORD_TALENT)) {
      this.active = false;
      return;
    }

    // Healing spells that are affected by serenity buff
    this.addEventListener(
      Events.heal
        .by(SELECTED_PLAYER)
        .spell([
          TALENTS.HOLY_WORD_SERENITY_TALENT,
          SPELLS.FLASH_HEAL,
          TALENTS.RENEW_TALENT,
          SPELLS.GREATER_HEAL,
        ]),
      this.onHeal,
    );
    // Mana cost reduction from serenity buff

    this.addEventListener(
      Events.cast
        .by(SELECTED_PLAYER)
        .spell([SPELLS.FLASH_HEAL, TALENTS.RENEW_TALENT, SPELLS.GREATER_HEAL]),
      this.onCastHeal,
    );

    // The heal from casting sanctify
    this.addEventListener(
      Events.heal
        .by(SELECTED_PLAYER)
        .spell([TALENTS.HOLY_WORD_SANCTIFY_TALENT, SPELLS.DIVINE_WORD_SANCTIFY_TALENT_HEAL]),
      this.onHeal,
    );
    //Keeping track of which divine word is activated
    this.addEventListener(
      Events.cast
        .by(SELECTED_PLAYER)
        .spell([
          TALENTS.HOLY_WORD_CHASTISE_TALENT,
          TALENTS.HOLY_WORD_SANCTIFY_TALENT,
          TALENTS.HOLY_WORD_SERENITY_TALENT,
        ]),
      this.onActivatorCast,
    );
    //Tracking damage events for divine favor chastise
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);
    //Tracking different uses of the buff
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.DIVINE_WORD_TALENT),
      this.onDivineWord,
    );
  }

  onCastHeal(event: CastEvent) {
    if (this.selectedCombatant.hasBuff(SPELLS.DIVINE_WORD_SERENITY_TALENT_BUFF.id)) {
      if (event.resourceCost && event.resourceCost[RESOURCE_TYPES.MANA.id] !== undefined) {
        this.serenityManaSaved +=
          event.resourceCost[RESOURCE_TYPES.MANA.id] * MANA_REDUCTION_FROM_SERENITY;
      }
    }
  }

  onHeal(event: HealEvent) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.DIVINE_WORD_SANCTIFY_TALENT_HEAL.id) {
      this.sanctifyHealing += event.amount;
      this.sanctifyOverhealing += event.overheal || 0;
      return;
    } else if (
      this.selectedCombatant.hasBuff(SPELLS.DIVINE_WORD_SERENITY_TALENT_BUFF.id) &&
      (spellId === SPELLS.GREATER_HEAL.id ||
        spellId === SPELLS.FLASH_HEAL.id ||
        spellId === TALENTS.RENEW_TALENT.id)
    ) {
      //Average healing gain from the increased crit
      //This does not into account how many spells actually crit and will only be accurate on average
      const healingIncreaseTotal = HEALING_INCREASE_FROM_SERENITY;
      this.serenityHealing += calculateEffectiveHealing(event, healingIncreaseTotal);
      this.serenityOverhealing += calculateOverhealing(event, healingIncreaseTotal);
    } else if (
      spellId === TALENTS.HOLY_WORD_SERENITY_TALENT.id &&
      this.selectedCombatant.hasBuff(TALENTS.DIVINE_WORD_TALENT.id)
    ) {
      this.serenityHealing += calculateEffectiveHealing(event, ACTIVATOR_SPELL_INCREASE);
      this.serenityOverhealing += calculateOverhealing(event, ACTIVATOR_SPELL_INCREASE);
    } else if (
      spellId === TALENTS.HOLY_WORD_SANCTIFY_TALENT.id &&
      this.selectedCombatant.hasBuff(TALENTS.DIVINE_WORD_TALENT.id)
    ) {
      this.sanctifyHealing += calculateEffectiveHealing(event, ACTIVATOR_SPELL_INCREASE);
      this.sanctifyOverhealing += calculateOverhealing(event, ACTIVATOR_SPELL_INCREASE);
    }
  }

  onActivatorCast(event: CastEvent) {
    const spellId = event.ability.guid;
    if (this.selectedCombatant.hasBuff(TALENTS.DIVINE_WORD_TALENT.id)) {
      switch (spellId) {
        case TALENTS.HOLY_WORD_SERENITY_TALENT.id:
          this.serenityWordUse += 1;
          break;
        case TALENTS.HOLY_WORD_CHASTISE_TALENT.id:
          this.chastiseWordUse += 1;
          break;
        case TALENTS.HOLY_WORD_SANCTIFY_TALENT.id:
          this.sanctifyWordUse += 1;
          break;
      }
    }
  }

  onDamage(event: DamageEvent) {
    const spellId = event.ability.guid;
    if (
      spellId === TALENTS.HOLY_WORD_CHASTISE_TALENT.id &&
      this.selectedCombatant.hasBuff(TALENTS.DIVINE_WORD_TALENT.id)
    ) {
      this.chastiseDamage += calculateEffectiveDamage(event, ACTIVATOR_SPELL_INCREASE);
    } else if (
      ABILITIES_THAT_WORK_WITH_DIVINE_FAVOR_CHASTISE.includes(event.ability.guid) &&
      this.selectedCombatant.hasBuff(SPELLS.DIVINE_WORD_CHASTISE_TALENT_BUFF.id)
    ) {
      this.chastiseDamage += calculateEffectiveDamage(event, DAMAGE_INCREASE_FROM_CHASTISE);
    }
  }

  onDivineWord() {
    this.divineWordCasts += 1;
  }

  statistic() {
    const castsString = this.divineWordCasts > 1 ? 'casts' : 'cast';
    return (
      <Statistic
        tooltip={
          <>
            Sanctuary{' '}
            {formatPercentage(
              this.sanctifyOverhealing / (this.sanctifyHealing + this.sanctifyOverhealing),
            )}
            % OH
            <br />
            Serenity{' '}
            {formatPercentage(
              this.serenityOverhealing / (this.serenityHealing + this.serenityOverhealing),
            )}
            % OH
            <br />
            The extra effectiveness from the activating <strong>Holy Word</strong> is included.
          </>
        }
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.OPTIONAL(7)}
      >
        <BoringSpellValueText spell={TALENTS.DIVINE_WORD_TALENT}>
          Usage: {this.sanctifyWordUse}
          <SpellIcon spell={SPELLS.DIVINE_WORD_SANCTIFY_TALENT_HEAL} />
          &nbsp;{this.serenityWordUse}
          <SpellIcon spell={SPELLS.DIVINE_WORD_SERENITY_TALENT_BUFF} />
          &nbsp;{this.chastiseWordUse}
          <SpellIcon spell={SPELLS.DIVINE_WORD_CHASTISE_TALENT_BUFF} />
          <br />
          {this.divineWordCasts} total {castsString}
        </BoringSpellValueText>
        <BoringSpellValueText spell={SPELLS.DIVINE_WORD_SANCTIFY_TALENT_HEAL}>
          <ItemHealingDone amount={this.sanctifyHealing} />
        </BoringSpellValueText>
        <BoringSpellValueText spell={SPELLS.DIVINE_WORD_SERENITY_TALENT_BUFF}>
          <ItemHealingDone amount={this.serenityHealing} />
          <br />
          <ItemManaGained amount={this.serenityManaSaved} />
        </BoringSpellValueText>
        <BoringSpellValueText spell={SPELLS.DIVINE_WORD_CHASTISE_TALENT_BUFF}>
          <ItemDamageDone amount={this.chastiseDamage} />
          <br />
          {this.chastiseWordUse * CHASTISE_REFUNDED_COOLDOWN}s CDR for Chastise.
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default DivineWord;
