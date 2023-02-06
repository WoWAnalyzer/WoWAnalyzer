import SPELLS from 'common/SPELLS';
import { TALENTS_PRIEST } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  Ability,
  ApplyDebuffEvent,
  CastEvent,
  DamageEvent,
  HealEvent,
  RefreshDebuffEvent,
} from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { calculateEffectiveDamage, calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import { encodeEventTargetString } from 'parser/shared/modules/Enemies';
import { getDamageEvent, hasAtonementDamageEvent } from '../../../normalizers/AtonementTracker';
import { getCastAbility } from '../../../normalizers/DamageCastLink';
import MAGIC_SCHOOLS from 'game/MAGIC_SCHOOLS';
import TeSourceDonut from './TeSourceDonut';

const TE_INCREASE = 0.15;

interface DirtyCastEvent extends CastEvent {
  buffedByTe?: boolean;
}

class TwilightEquilibrium extends Analyzer {
  healing = 0;
  damage = 0;
  testHealing = 0;
  ptwTargets: Set<string> = new Set<string>();
  healingMap: Map<number, number> = new Map();
  abilityMap: Map<number, Ability> = new Map();

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_PRIEST.TWILIGHT_EQUILIBRIUM_TALENT);

    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.applydebuff.by(SELECTED_PLAYER).spell([SPELLS.PURGE_THE_WICKED_TALENT]),
      this.onPTWApply,
    );

    this.addEventListener(
      Events.refreshdebuff.by(SELECTED_PLAYER).spell(SPELLS.PURGE_THE_WICKED_BUFF),
      this.onPTWApply,
    );
    this.addEventListener(
      Events.heal
        .by(SELECTED_PLAYER)
        .spell([SPELLS.ATONEMENT_HEAL_CRIT, SPELLS.ATONEMENT_HEAL_NON_CRIT]),
      this.onHeal,
    );
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.PURGE_THE_WICKED_BUFF),
      this.onPTWDotDamage,
    );
  }

  onHeal(event: HealEvent) {
    if (!hasAtonementDamageEvent(event)) {
      return;
    }

    const damageEvent = getDamageEvent(event);

    if (damageEvent?.ability.guid === SPELLS.PURGE_THE_WICKED_BUFF.id) {
      if (this.ptwTargets.has(encodeEventTargetString(damageEvent) || '')) {
        const increase = calculateEffectiveHealing(event, TE_INCREASE);
        this.healing += increase;
        this.attributeToMap(increase, damageEvent);
        return;
      }
    }

    if (this.checkDamageEvent(damageEvent)) {
      if (damageEvent.ability.guid === TALENTS_PRIEST.SCHISM_TALENT.id) {
        console.log(calculateEffectiveHealing(event, TE_INCREASE), event);
      }
      const increase = calculateEffectiveHealing(event, TE_INCREASE);
      this.healing += increase;
      this.attributeToMap(increase, damageEvent);
    }
  }

  onDamage(event: DamageEvent) {
    if (this.checkDamageEvent(event)) {
      this.damage += calculateEffectiveDamage(event, TE_INCREASE);
    }
  }

  checkDamageEvent(event: DamageEvent) {
    const castEvent = getCastAbility(event) as DirtyCastEvent;
    if (!castEvent) {
      return;
    }

    const eventSchool = event.ability.type;
    let check = false;
    if (eventSchool === MAGIC_SCHOOLS.ids.SHADOW) {
      check = this.selectedCombatant.hasBuff(
        SPELLS.TWILIGHT_EQUILIBRIUM_SHADOW_BUFF.id,
        castEvent?.timestamp,
      );
    } else if (
      eventSchool === MAGIC_SCHOOLS.ids.HOLY ||
      eventSchool === MAGIC_SCHOOLS.ids.RADIANT
    ) {
      check = this.selectedCombatant.hasBuff(
        SPELLS.TWILIGHT_EQUILIBRIUM_HOLY_BUFF.id,
        castEvent?.timestamp,
      );
    }

    if (check) {
      castEvent.buffedByTe = true;
      return true;
    }
    return false;
  }

  onPTWApply(event: CastEvent | RefreshDebuffEvent | ApplyDebuffEvent) {
    const targetString = encodeEventTargetString(event) || '';
    if (this.selectedCombatant.hasBuff(SPELLS.TWILIGHT_EQUILIBRIUM_HOLY_BUFF.id)) {
      this.ptwTargets.add(targetString);
    } else {
      this.ptwTargets.delete(targetString);
    }
  }

  onPTWDotDamage(event: DamageEvent) {
    if (this.ptwTargets.has(encodeEventTargetString(event) || '')) {
      this.damage += calculateEffectiveDamage(event, TE_INCREASE);
    }
  }

  private attributeToMap(amount: number, sourceEvent?: DamageEvent) {
    if (!sourceEvent) {
      return;
    }
    const { ability } = sourceEvent;

    // Set ability in map
    this.abilityMap.set(ability.guid, ability);

    // Attribute healing
    const currentValue = this.healingMap.get(ability.guid) || 0;
    this.healingMap.set(ability.guid, currentValue + amount);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <>
          <BoringSpellValueText spellId={TALENTS_PRIEST.TWILIGHT_EQUILIBRIUM_TALENT.id}>
            <ItemHealingDone amount={this.healing} /> <br />
            <ItemDamageDone amount={this.damage} />
          </BoringSpellValueText>
          <TeSourceDonut abilityMap={this.abilityMap} healingMap={this.healingMap} />
        </>
      </Statistic>
    );
  }
}

export default TwilightEquilibrium;
