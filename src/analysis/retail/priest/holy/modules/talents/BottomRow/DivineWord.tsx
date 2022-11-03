import TALENTS from 'common/TALENTS/priest';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import Events, { DamageEvent, HealEvent, RemoveBuffEvent } from 'parser/core/Events';
import CritEffectBonus from 'parser/shared/modules/helpers/CritEffectBonus';
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

const DAMAGE_INCREASE_FROM_CHASTISE = 0.5;
const HOLY_FIRE_APPLICATION_DURATION = 7;
const HEALING_INCREASE_FROM_SERENITY = 0.3;
const CRIT_INCREASE_FROM_SERENITY = 0.2;

// Example Log:
class DivineWord extends Analyzer {
  static dependencies = {
    critEffectBonus: CritEffectBonus,
    statTracker: StatTracker,
  };
  protected critEffectBonus!: CritEffectBonus;
  protected statTracker!: StatTracker;

  //Could also track mana saved and wasted Divine Words buffs
  sanctifyHealing = 0;
  sanctifyOverhealing = 0;

  chastiseDamage = 0;
  holyFireApplications = 0;
  holyFireCasts = 0;

  serenityHealing = 0;
  serenityOverhealing = 0;

  divineFavorSerenityActive = false;
  divineFavorChastiseActive = false;

  constructor(options: Options) {
    super(options);
    if (!this.selectedCombatant.hasTalent(TALENTS.DIVINE_WORD_TALENT.id)) {
      this.active = false;
      return;
    }

    // Healing spells that are affected by serenity buff
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.FLASH_HEAL), this.onHeal);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(TALENTS.RENEW_TALENT), this.onHeal);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.GREATER_HEAL), this.onHeal);
    // The heal from casting sanctify
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.DIVINE_WORD_SANCTIFY_TALENT_HEAL),
      this.onHeal,
    );
    //Tracking buffs from casting Divine word and chastise/serenity while it is active
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.DIVINE_WORD_CHASTISE_TALENT_BUFF),
      this.onBuff,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.DIVINE_WORD_SERENITY_TALENT_BUFF),
      this.onBuff,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.DIVINE_WORD_SERENITY_TALENT_BUFF),
      this.onBuffRemoval,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.DIVINE_WORD_CHASTISE_TALENT_BUFF),
      this.onBuffRemoval,
    );
    //Tracking Holy fire casts and debuff applications
    this.addEventListener(
      Events.applydebuff.by(SELECTED_PLAYER).spell(SPELLS.HOLY_FIRE),
      this.onHolyFireDebuff,
    );
    this.addEventListener(
      Events.refreshdebuff.by(SELECTED_PLAYER).spell(SPELLS.HOLY_FIRE),
      this.onHolyFireDebuff,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.HOLY_FIRE),
      this.onHolyFireCast,
    );
    //Tracking damage events for divine favor chastise
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);
  }
  onHolyFireDebuff() {
    if (this.divineFavorChastiseActive) {
      this.holyFireApplications += 1;
    }
  }

  onHolyFireCast() {
    if (this.divineFavorChastiseActive) {
      this.holyFireCasts += 1;
    }
  }

  onHeal(event: HealEvent) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.DIVINE_WORD_SANCTIFY_TALENT_HEAL.id) {
      this.sanctifyHealing += event.amount;
      this.sanctifyOverhealing += event.overheal || 0;
      return;
    }
    if (
      this.divineFavorSerenityActive &&
      (spellId === SPELLS.GREATER_HEAL.id ||
        spellId === SPELLS.FLASH_HEAL.id ||
        spellId === TALENTS.RENEW_TALENT.id)
    ) {
      const currentCritChance = this.statTracker.currentCritPercentage;
      const percentIncreaseFromIncreasedCrit =
        CRIT_INCREASE_FROM_SERENITY / (currentCritChance + 1);
      //Average healing gain from the increased crit
      //This does not into account how many spells actually crit and will only be accurate on average
      const healingIncreaseTotal =
        (1 + percentIncreaseFromIncreasedCrit) * (1 + HEALING_INCREASE_FROM_SERENITY) - 1;
      this.serenityHealing += calculateEffectiveHealing(event, healingIncreaseTotal);
      this.serenityOverhealing += calculateOverhealing(event, healingIncreaseTotal);
    }
  }

  onDamage(event: DamageEvent) {
    if (
      ABILITIES_THAT_WORK_WITH_DIVINE_FAVOR_CHASTISE.includes(event.ability.guid) &&
      this.divineFavorChastiseActive
    ) {
      this.chastiseDamage += calculateEffectiveDamage(event, DAMAGE_INCREASE_FROM_CHASTISE);
    }
  }

  onBuff(event: ApplyBuffEvent) {
    const buffId = event.ability.guid;
    switch (buffId) {
      case SPELLS.DIVINE_WORD_CHASTISE_TALENT_BUFF.id:
        console.log('på');
        this.divineFavorChastiseActive = true;
        break;
      case SPELLS.DIVINE_WORD_SERENITY_TALENT_BUFF.id:
        this.divineFavorSerenityActive = true;
        break;
      default:
        throw new DOMException();
    }
  }

  onBuffRemoval(event: RemoveBuffEvent) {
    const buffId = event.ability.guid;
    switch (
      buffId // CHeck ordering for correctness
    ) {
      case SPELLS.DIVINE_WORD_CHASTISE_TALENT_BUFF.id:
        console.log('af');
        this.divineFavorChastiseActive = false;
        break;
      case SPELLS.DIVINE_WORD_SERENITY_TALENT_BUFF.id:
        this.divineFavorSerenityActive = false;
        break;
    }
  }

  statistic() {
    const holyFireFromSmiteDuration =
      (this.holyFireApplications - this.holyFireCasts) * HOLY_FIRE_APPLICATION_DURATION;
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
            The serenity healing increase from the increased crit chance is calculated as an
            average, so the <strong> Serenity</strong> healing is an estimate.
            <br />
            The <strong> Holy fire's </strong> dot damage applied by smite that is not included in
            the damage.
          </>
        }
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.OPTIONAL(7)}
      >
        <BoringSpellValueText spellId={TALENTS.DIVINE_WORD_TALENT.id}></BoringSpellValueText>
        <BoringSpellValueText spellId={SPELLS.DIVINE_WORD_SANCTIFY_TALENT_HEAL.id}>
          <ItemHealingDone amount={this.sanctifyHealing} />
        </BoringSpellValueText>
        <BoringSpellValueText spellId={SPELLS.DIVINE_WORD_SERENITY_TALENT_BUFF.id}>
          <ItemHealingDone amount={this.serenityHealing} />
        </BoringSpellValueText>
        <BoringSpellValueText spellId={SPELLS.DIVINE_WORD_CHASTISE_TALENT_BUFF.id}>
          <ItemDamageDone amount={this.chastiseDamage} />
          <br />
          {holyFireFromSmiteDuration} seconds of holy fire applied.
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default DivineWord;
