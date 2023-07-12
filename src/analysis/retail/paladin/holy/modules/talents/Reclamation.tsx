import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/paladin';
import { SpellLink } from 'interface';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import { calculateEffectiveDamage, calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Events, { CastEvent, DamageEvent, HealEvent, ResourceChangeEvent } from 'parser/core/Events';
import BoringValueText from 'parser/ui/BoringValueText';
import ItemManaGained from 'parser/ui/ItemManaGained';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

const MAX_BOOST = 0.5;

class Reclamation extends Analyzer {
  lastCast: number = 0;

  healing: number = 0;
  overhealing: number = 0;

  resourceGained: Map<number, number> = new Map<number, number>();
  damageDone: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.RECLAMATION_TALENT);
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.cast.spell([TALENTS.HOLY_SHOCK_TALENT, SPELLS.CRUSADER_STRIKE]).by(SELECTED_PLAYER),
      this.cast,
    );
    this.addEventListener(Events.heal.spell(SPELLS.HOLY_SHOCK_HEAL).by(SELECTED_PLAYER), this.heal);
    this.addEventListener(
      Events.damage.spell(SPELLS.CRUSADER_STRIKE).by(SELECTED_PLAYER),
      this.damage,
    );
    this.addEventListener(
      Events.resourcechange.spell(SPELLS.RECLAMATION_CAST).by(SELECTED_PLAYER),
      this.mana,
    );
  }

  cast(event: CastEvent) {
    this.lastCast = event.ability.guid;
  }

  heal(event: HealEvent) {
    const ratio = (1 - (event.hitPoints - event.amount) / event.maxHitPoints) * MAX_BOOST;
    const effectiveHealingBoost = calculateEffectiveHealing(event, ratio);
    this.healing += effectiveHealingBoost;

    this.overhealing +=
      (event.amount + (event.absorbed || 0) + (event.overheal || 0)) * ratio -
      effectiveHealingBoost;
  }

  damage(event: DamageEvent) {
    if (!event.hitPoints || !event.maxHitPoints) {
      return;
    }

    const ratio = ((event.hitPoints - event.amount) / event.maxHitPoints) * MAX_BOOST;
    this.damageDone = +Number(calculateEffectiveDamage(event, ratio));
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
      (this.resourceGained.get(TALENTS.HOLY_SHOCK_TALENT.id) || 0) +
      (this.resourceGained.get(SPELLS.CRUSADER_STRIKE.id) || 0);

    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <>
            Healing Done: {this.healing.toFixed(2)} <br />
            Overhealing Done: {this.overhealing.toFixed(2)} <br />
            Damage Done: {this.damageDone.toFixed(2)} <br />
            Mana from Holy Shock: {this.resourceGained.get(TALENTS.HOLY_SHOCK_TALENT.id) || 0}{' '}
            <br />
            Mana from Crusader Strike: {this.resourceGained.get(SPELLS.CRUSADER_STRIKE.id) ||
              0}{' '}
            <br />
          </>
        }
      >
        <BoringValueText
          label={
            <>
              <SpellLink spell={TALENTS.RECLAMATION_TALENT} />
            </>
          }
        >
          {this.owner.formatItemHealingDone(this.healing)} <br />
          {this.owner.formatItemDamageDone(this.damageDone)} <br />
          <ItemManaGained amount={totalMana} />
        </BoringValueText>
      </Statistic>
    );
  }
}
export default Reclamation;
