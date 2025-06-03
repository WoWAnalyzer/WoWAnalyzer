import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS, { TALENTS_PALADIN } from 'common/TALENTS/paladin';
import { SpellLink } from 'interface';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import { calculateEffectiveDamage, calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Events, { CastEvent, DamageEvent, HealEvent, ResourceChangeEvent } from 'parser/core/Events';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import ItemManaGained from 'parser/ui/ItemManaGained';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { RECLAMATION_MAX_INCREASE } from '../../constants';

class Reclamation extends Analyzer {
  lastCast = 0;

  healing = 0;

  resourceGained: Map<number, number> = new Map<number, number>();
  damageDone = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.RECLAMATION_TALENT);

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
    const ratio =
      (1 - (event.hitPoints - event.amount) / event.maxHitPoints) * RECLAMATION_MAX_INCREASE;
    const effectiveHealingBoost = calculateEffectiveHealing(event, ratio);
    this.healing += effectiveHealingBoost;
  }

  damage(event: DamageEvent) {
    if (!event.hitPoints || !event.maxHitPoints) {
      return;
    }

    const ratio =
      (1 - (event.hitPoints + event.amount) / event.maxHitPoints) * RECLAMATION_MAX_INCREASE;
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
          <div>
            <ItemHealingDone amount={this.healing} />
          </div>
          <div>
            <ItemDamageDone amount={this.damageDone} />
          </div>
          <div>
            <ItemManaGained amount={totalMana} useAbbrev customLabel="mana" />
          </div>
        </TalentSpellText>
      </Statistic>
    );
  }
}
export default Reclamation;
