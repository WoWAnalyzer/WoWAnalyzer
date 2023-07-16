import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS, { TALENTS_PALADIN } from 'common/TALENTS/paladin';
import { SpellLink } from 'interface';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import { calculateEffectiveDamage, calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Events, { CastEvent, DamageEvent, HealEvent, ResourceChangeEvent } from 'parser/core/Events';
import ItemManaGained from 'parser/ui/ItemManaGained';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import TalentSpellText from 'parser/ui/TalentSpellText';

const MAX_BOOST = 0.5;

class Reclamation extends Analyzer {
  lastCast: number = 0;

  healing: number = 0;

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
      Events.damage.spell([SPELLS.CRUSADER_STRIKE, SPELLS.HOLY_SHOCK_DAMAGE]).by(SELECTED_PLAYER),
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
  }

  damage(event: DamageEvent) {
    if (!event.hitPoints || !event.maxHitPoints) {
      return;
    }

    const ratio = (1 - (event.hitPoints - event.amount) / event.maxHitPoints) * MAX_BOOST;
    this.damageDone += calculateEffectiveDamage(event, ratio);
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
            <div>Healing Done: {formatNumber(this.healing)}</div>
            <div>Damage Done: {formatNumber(this.damageDone)}</div>
            <div>
              Mana from <SpellLink spell={TALENTS_PALADIN.HOLY_SHOCK_TALENT} />:{' '}
              {formatNumber(this.resourceGained.get(TALENTS.HOLY_SHOCK_TALENT.id) || 0)}
            </div>
            <div>
              Mana from <SpellLink spell={SPELLS.CRUSADER_STRIKE} />:{' '}
              {formatNumber(this.resourceGained.get(SPELLS.CRUSADER_STRIKE.id) || 0)}
            </div>
          </>
        }
      >
        <TalentSpellText talent={TALENTS_PALADIN.RECLAMATION_TALENT}>
          <div>{this.owner.formatItemHealingDone(this.healing)}</div>
          <div>{this.owner.formatItemDamageDone(this.damageDone)}</div>
          <div>
            <ItemManaGained amount={totalMana} />
          </div>
        </TalentSpellText>
      </Statistic>
    );
  }
}
export default Reclamation;
