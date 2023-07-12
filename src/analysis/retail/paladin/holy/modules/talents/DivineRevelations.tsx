import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/paladin';
import { SpellLink } from 'interface';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Events, { CastEvent, HealEvent, ResourceChangeEvent } from 'parser/core/Events';
import BoringValueText from 'parser/ui/BoringValueText';
import ItemManaGained from 'parser/ui/ItemManaGained';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import {
  INFUSION_OF_LIGHT_BUFF_EXPIRATION_BUFFER,
  INFUSION_OF_LIGHT_BUFF_MINIMAL_ACTIVE_TIME,
} from '../core/PaladinAbilityTracker';

const FLASH_HEAL_INCREASE = 0.2;

class DivineRevelations extends Analyzer {
  lastCast: number = 0;

  healing: number = 0;
  overhealing: number = 0;

  resourceGained: Map<number, number> = new Map<number, number>();

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.DIVINE_REVELATIONS_TALENT);
    if (!this.active) {
      return;
    }
    this.addEventListener(Events.heal.spell(SPELLS.FLASH_OF_LIGHT).by(SELECTED_PLAYER), this.heal);
    this.addEventListener(
      Events.cast.spell([SPELLS.HOLY_LIGHT, SPELLS.JUDGMENT_CAST_HOLY]).by(SELECTED_PLAYER),
      this.cast,
    );

    this.addEventListener(
      Events.resourcechange.spell(SPELLS.DIVINE_REVELATIONS_ENERGIZE).by(SELECTED_PLAYER),
      this.mana,
    );
  }

  cast(event: CastEvent) {
    this.lastCast = event.ability.guid;
  }

  heal(event: HealEvent) {
    const hasIol = this.selectedCombatant.hasBuff(
      SPELLS.INFUSION_OF_LIGHT.id,
      event.timestamp,
      INFUSION_OF_LIGHT_BUFF_EXPIRATION_BUFFER,
      INFUSION_OF_LIGHT_BUFF_MINIMAL_ACTIVE_TIME,
    );
    if (!hasIol) {
      return;
    }

    const effectiveHealingBoost = calculateEffectiveHealing(event, FLASH_HEAL_INCREASE);
    this.healing += effectiveHealingBoost;

    this.overhealing +=
      (event.amount + (event.absorbed || 0) + (event.overheal || 0)) * FLASH_HEAL_INCREASE -
      effectiveHealingBoost;
  }

  mana(event: ResourceChangeEvent) {
    if (!this.lastCast) {
      return;
    }

    this.resourceGained.set(
      this.lastCast,
      (this.resourceGained.get(this.lastCast) || 0) + event.resourceChange,
    );
  }

  statistic() {
    const totalMana =
      (this.resourceGained.get(SPELLS.HOLY_LIGHT.id) || 0) +
      (this.resourceGained.get(SPELLS.JUDGMENT_CAST_HOLY.id) || 0);

    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <>
            Healing Done: {this.healing.toFixed(2)} <br />
            Overhealing Done: {this.overhealing.toFixed(2)} <br />
            Mana from Holy Light: {this.resourceGained.get(SPELLS.HOLY_LIGHT.id) || 0} <br />
            Mana from Judgment: {this.resourceGained.get(SPELLS.JUDGMENT_CAST_HOLY.id) || 0} <br />
          </>
        }
      >
        <BoringValueText
          label={
            <>
              <SpellLink spell={TALENTS.DIVINE_REVELATIONS_TALENT} />
            </>
          }
        >
          {this.owner.formatItemHealingDone(this.healing)} <br />
          <ItemManaGained amount={totalMana} />
        </BoringValueText>
      </Statistic>
    );
  }
}
export default DivineRevelations;
