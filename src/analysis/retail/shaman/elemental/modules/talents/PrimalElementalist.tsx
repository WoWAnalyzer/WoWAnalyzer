import TALENTS from 'common/TALENTS/shaman';
import { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Spell from 'common/SPELLS/Spell';
import Events, {
  AnyEvent,
  CastEvent,
  DamageEvent,
  Event,
  EventType,
  HasSource,
  SourcedEvent,
} from 'parser/core/Events';
import MajorCooldown, { CooldownTrigger } from 'parser/core/MajorCooldowns/MajorCooldown';
import CooldownUsage from 'parser/core/MajorCooldowns/CooldownUsage';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import TalentSpellText from 'parser/ui/TalentSpellText';
import SpellLink from 'interface/SpellLink';
import { ReactNode } from 'react';

export interface PrimalElementalCast extends CooldownTrigger<CastEvent> {
  spells: Map<number, number>;
  damageDone: number;
  end: number;
}

const EVERLASTING_ELEMENTS_DURATION_INCREASE = 1.2;

abstract class PrimalElementalist<T extends PrimalElementalCast> extends MajorCooldown<T> {
  protected currentElemental: T | null = null;
  protected duration: number = 30000;
  protected selectedElemental?: number;

  private readonly elementalSpells: Spell[];
  private damageGained: number = 0;

  constructor(elementalId: number, elementalSpells: Spell[], options: Options) {
    super(
      {
        spell: options.owner.selectedCombatant.hasTalent(TALENTS.STORM_ELEMENTAL_TALENT)
          ? TALENTS.STORM_ELEMENTAL_TALENT
          : TALENTS.FIRE_ELEMENTAL_TALENT,
      },
      options,
    );
    this.elementalSpells = elementalSpells;
    this.selectedElemental = this.owner.playerPets.find((pet) => pet.guid === elementalId)?.id;

    this.active =
      this.selectedCombatant.hasTalent(TALENTS.PRIMAL_ELEMENTALIST_TALENT) &&
      this.selectedElemental !== undefined;
    if (!this.active) {
      return;
    }
    this.duration *= this.selectedCombatant.hasTalent(TALENTS.EVERLASTING_ELEMENTS_TALENT)
      ? EVERLASTING_ELEMENTS_DURATION_INCREASE
      : 1;

    this.addEventListener(
      Events.cast
        .by(SELECTED_PLAYER)
        .spell(
          this.selectedCombatant.hasTalent(TALENTS.STORM_ELEMENTAL_TALENT)
            ? TALENTS.STORM_ELEMENTAL_TALENT
            : TALENTS.FIRE_ELEMENTAL_TALENT,
        ),
      this.onCastElemental,
    );
    this.addEventListener(Events.cast.by(SELECTED_PLAYER_PET), this.onElementalCast);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER_PET), this.onElementalDamage);
    this.addEventListener(Events.any.by(SELECTED_PLAYER), this.onElementalEnd);
  }

  isPetEvent<T extends EventType>(event: Event<T>): event is SourcedEvent<T> {
    if (this.currentElemental && HasSource(event) && event.sourceID === this.selectedElemental) {
      return true;
    }
    return false;
  }

  /**
   * Returns a value of {@link T} which begins a cooldown usage
   * @param event the cast event which summons the primal storm/fire elemental
   * @param spells map of spells the elemental **MUST** cast to be considered a "good" cast.
   */
  abstract beginCooldownTrigger(event: CastEvent, spells: Map<number, number>): T;

  /**
   * Player casts of selected elemental
   */
  onCastElemental(event: CastEvent): void {
    this.currentElemental = this.beginCooldownTrigger(
      event,
      this.elementalSpells.reduce((map, spell) => {
        map.set(spell.id, 0);
        return map;
      }, new Map<number, number>()),
    );
  }

  onElementalEnd(event: AnyEvent) {
    if (this.currentElemental && this.currentElemental.end <= event.timestamp) {
      this.recordCooldown(this.currentElemental);
      this.currentElemental = null;
    }
  }

  /**
   * Spells cast by elemental
   */
  onElementalCast(event: CastEvent): void {
    if (!this.isPetEvent(event)) {
      return;
    }
    this.currentElemental!.spells.set(
      event.ability.guid,
      (this.currentElemental!.spells.get(event.ability.guid) ?? 0) + 1,
    );
  }

  onElementalDamage(event: DamageEvent) {
    if (!this.isPetEvent(event)) {
      return;
    }

    this.currentElemental!.damageDone += event.amount + (event.absorbed ?? 0);
    this.damageGained += event.amount + (event.absorbed ?? 0);
  }

  description(): ReactNode {
    return (
      <>
        If you have auto-cast disabled for your <SpellLink spell={this.spell} />, the breakdown
        shows how effectively you used the spells for your <SpellLink spell={this.spell} />.
      </>
    );
  }

  guideSubsection(): JSX.Element {
    return <CooldownUsage analyzer={this} title={`Primal ${this.spell.name}`} />;
  }

  statistic() {
    return (
      <Statistic position={STATISTIC_ORDER.OPTIONAL()} size="flexible">
        <TalentSpellText talent={TALENTS.PRIMAL_ELEMENTALIST_TALENT}>
          <p>
            <small>
              <SpellLink spell={this.spell} />
            </small>
          </p>
          <p>
            <ItemDamageDone amount={this.damageGained} />
          </p>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default PrimalElementalist;
