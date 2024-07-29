import { FAN_THE_FLAMES_INCREASE } from 'analysis/retail/evoker/shared/constants';
import SPELLS from 'common/SPELLS';
import { TALENTS_EVOKER } from 'common/TALENTS';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Combatant from 'parser/core/Combatant';
import Enemy from 'parser/core/Enemy';
import { calculateEffectiveDamage, calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Events, {
  ApplyBuffEvent,
  ApplyDebuffEvent,
  CastEvent,
  DamageEvent,
  HealEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
  RemoveDebuffEvent,
} from 'parser/core/Events';
import { Options } from 'parser/core/EventSubscriber';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';
import Combatants from 'parser/shared/modules/Combatants';
import Enemies from 'parser/shared/modules/Enemies';
import SpellLink from 'interface/SpellLink';
import { formatNumber } from 'common/format';
import SPECS from 'game/SPECS';

class FanTheFlames extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    enemies: Enemies,
  };

  totalDamage: number = 0;
  totalHealing: number = 0;
  numAmplified: number[] = [];
  activeTargets = new Set<Combatant | Enemy>();
  buffedTargets = new Set<Combatant | Enemy>();
  protected combatants!: Combatants;
  protected enemies!: Enemies;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_EVOKER.FAN_THE_FLAMES_TALENT);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_EVOKER.ENGULF_TALENT),
      this.onCast,
    );
    if (this.selectedCombatant.spec === SPECS.PRESERVATION_EVOKER) {
      this.addEventListener(
        Events.heal.by(SELECTED_PLAYER).spell(SPELLS.ENKINDLE_HOT),
        this.onHeal,
      );
      this.addEventListener(
        Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.ENKINDLE_HOT),
        this.onRemoveBuffEvent,
      );
      this.addEventListener(
        Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.ENKINDLE_HOT),
        this.onRefresh,
      );
      this.addEventListener(
        Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.ENKINDLE_HOT),
        this.onBuffApply,
      );
    } else {
      this.addEventListener(
        Events.damage.by(SELECTED_PLAYER).spell(SPELLS.ENKINDLE_DOT),
        this.onDamage,
      );
      this.addEventListener(
        Events.removedebuff.by(SELECTED_PLAYER).spell(SPELLS.ENKINDLE_DOT),
        this.onRemoveBuffEvent,
      );
      this.addEventListener(
        Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.ENKINDLE_DOT),
        this.onRefresh,
      );
      this.addEventListener(
        Events.applydebuff.by(SELECTED_PLAYER).spell(SPELLS.ENKINDLE_DOT),
        this.onBuffApply,
      );
    }
  }

  onCast(event: CastEvent) {
    this.buffedTargets = new Set(this.activeTargets);
    this.numAmplified.push(this.buffedTargets.size);
  }

  onBuffApply(event: ApplyBuffEvent | ApplyDebuffEvent) {
    const target = this.getEntity(event);
    if (target) {
      this.activeTargets.add(target);
    }
  }

  onRemoveBuffEvent(event: RemoveBuffEvent | RemoveDebuffEvent) {
    const target = this.getEntity(event);
    if (target) {
      this.activeTargets.delete(target);
    }
  }

  onRefresh(event: RefreshBuffEvent) {
    const target = this.getEntity(event);
    if (target) {
      this.buffedTargets.delete(target);
    }
  }

  getEntity(
    event:
      | RefreshBuffEvent
      | RemoveBuffEvent
      | RemoveDebuffEvent
      | ApplyBuffEvent
      | ApplyDebuffEvent
      | CastEvent
      | DamageEvent
      | HealEvent,
  ) {
    return event.targetIsFriendly
      ? this.combatants.getEntity(event)
      : this.enemies.getEntity(event);
  }

  onDamage(event: DamageEvent) {
    const target = this.getEntity(event);
    if (!target) {
      return;
    }
    if (this.buffedTargets.has(target)) {
      this.totalDamage += calculateEffectiveDamage(event, FAN_THE_FLAMES_INCREASE);
    }
  }

  onHeal(event: HealEvent) {
    const target = this.getEntity(event);
    if (!target) {
      return;
    }
    if (this.buffedTargets.has(target)) {
      this.totalHealing += calculateEffectiveHealing(event, FAN_THE_FLAMES_INCREASE);
    }
  }

  get averageBuffs() {
    return this.numAmplified.reduce((prev, cur) => prev + cur, 0) / this.numAmplified.length;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(5)}
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
      >
        <TalentSpellText talent={TALENTS_EVOKER.FAN_THE_FLAMES_TALENT}>
          {this.selectedCombatant.spec === SPECS.PRESERVATION_EVOKER ? (
            <div>
              <ItemHealingDone amount={this.totalHealing} />
            </div>
          ) : (
            <div>
              <ItemDamageDone amount={this.totalDamage} />
            </div>
          )}
        </TalentSpellText>
        <div className="pad">
          Average buffs on <SpellLink spell={TALENTS_EVOKER.ENGULF_TALENT} /> cast:{' '}
          {formatNumber(this.averageBuffs)}
        </div>
      </Statistic>
    );
  }
}

export default FanTheFlames;
