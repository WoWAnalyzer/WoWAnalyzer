import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/priest';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import Events, { CastEvent, HealEvent } from 'parser/core/Events';
import {
  calculateEffectiveHealing,
  calculateOverhealing,
  calculateEffectiveDamage,
} from 'parser/core/EventCalculateLib';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import {
  getSerenityHealEvent,
  getChastiseDamageEvent,
  getSalvationHealEvents,
  getSanctifyHealEvents,
} from 'analysis/retail/priest/holy/normalizers/CastLinkNormalizer';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import { formatNumber, formatPercentage } from 'common/format';
import ItemDamageDone from 'parser/ui/ItemDamageDone';

const TIER_BONUS = 0.04;
const FALL_BUFFER = 100;

class HolyPriestAbberus4Set extends Analyzer {
  healing = 0;
  overhealing = 0;
  damage = 0;
  stacksOnCast: number[] = [];

  constructor(options: Options) {
    super(options);

    // bonus set id for tier 30 logs not loading properly
    // if (!this.selectedCombatant.has4PieceByTier(TIERS.T30)) {
    //   this.active = false;
    //   return;
    // }

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell([TALENTS.HOLY_WORD_SERENITY_TALENT]),
      this.onSerenityCast,
    );

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell([TALENTS.HOLY_WORD_SANCTIFY_TALENT]),
      this.onSanctifyCast,
    );

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell([TALENTS.HOLY_WORD_SALVATION_TALENT]),
      this.onSalvationCast,
    );

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell([TALENTS.HOLY_WORD_CHASTISE_TALENT]),
      this.onChastiseCast,
    );
  }

  get tierStacks() {
    return this.selectedCombatant.getBuffStacks(
      SPELLS.HOLY_PRIEST_TIER_30_4_SET_BUFF.id,
      null,
      FALL_BUFFER,
    );
  }

  onSerenityCast(event: CastEvent) {
    const stacks = this.tierStacks;
    if (stacks > 0) {
      this.stacksOnCast.push(stacks);
      const healEvent = getSerenityHealEvent(event);
      this.healing += calculateEffectiveHealing(healEvent, stacks * TIER_BONUS);
      this.overhealing += calculateOverhealing(healEvent, stacks * TIER_BONUS);
    }
  }

  onSanctifyCast(event: CastEvent) {
    const stacks = this.tierStacks;
    if (stacks > 0) {
      this.stacksOnCast.push(stacks);
      const healEvents = getSanctifyHealEvents(event);
      healEvents.forEach((healEvent: HealEvent) => {
        this.healing += calculateEffectiveHealing(healEvent, stacks * TIER_BONUS);
        this.overhealing += calculateOverhealing(healEvent, stacks * TIER_BONUS);
      });
    }
  }

  onSalvationCast(event: CastEvent) {
    const stacks = this.tierStacks;
    if (stacks > 0) {
      this.stacksOnCast.push(stacks);
      const healEvents = getSalvationHealEvents(event);
      healEvents.forEach((healEvent: HealEvent) => {
        this.healing += calculateEffectiveHealing(healEvent, stacks * TIER_BONUS);
        this.overhealing += calculateOverhealing(healEvent, stacks * TIER_BONUS);
      });
    }
  }

  onChastiseCast(event: CastEvent) {
    const stacks = this.tierStacks;
    if (stacks > 0) {
      this.stacksOnCast.push(stacks);
      const damageEvent = getChastiseDamageEvent(event);
      this.damage += calculateEffectiveDamage(damageEvent, stacks * TIER_BONUS);
    }
  }

  get averageTierStacks() {
    return this.stacksOnCast.reduce((a, b) => a + b) / this.stacksOnCast.length;
  }

  statistic() {
    // adding this check here as checking if tier is equipped is buggy atm
    if (this.healing > 0 || this.overhealing > 0 || this.damage > 0) {
      return (
        <Statistic
          size="flexible"
          position={STATISTIC_ORDER.OPTIONAL(0)}
          category={STATISTIC_CATEGORY.ITEMS}
          tooltip={
            <>
              Average stacks on Holy Word cast: {formatNumber(this.averageTierStacks)}
              <br />
              Bonus Healing Done: {formatNumber(this.healing)} (
              {formatPercentage(this.overhealing / (this.healing + this.overhealing))}% OH)
            </>
          }
        >
          <BoringSpellValueText spell={SPELLS.HOLY_PRIEST_TIER_30_4_SET_BUFF}>
            <ItemHealingDone amount={this.healing} />
            {this.damage > 0 && <ItemDamageDone amount={this.damage} />}
          </BoringSpellValueText>
        </Statistic>
      );
    }
  }
}

export default HolyPriestAbberus4Set;
