import { TALENTS_PRIEST } from 'common/TALENTS';
import BLOODLUST_BUFFS from 'game/BLOODLUST_BUFFS';
import { Options } from 'parser/core/Module';
import Ability from 'parser/core/modules/Ability';
import Haste from 'parser/shared/modules/Haste';

import Abilities from './Abilities';
import Aura, { SpellbookAura } from './Aura';
import Analyzer, { SELECTED_PLAYER } from '../Analyzer';
import Events, {
  ApplyBuffEvent,
  ApplyDebuffEvent,
  RemoveBuffEvent,
  RemoveDebuffEvent,
} from '../Events';
import { SpellFilter, SpellInfo } from '../EventFilter';
import StateHistory from '../StateHistory';

function isAbilityWithBuffSpellId(
  ability: Ability,
): ability is Ability & { buffSpellId: number | number[] } {
  return ability.buffSpellId !== null && ability.buffSpellId !== 0;
}

type BuffOrDebuffEvent = ApplyBuffEvent | RemoveBuffEvent | ApplyDebuffEvent | RemoveDebuffEvent;

class Auras extends Analyzer.withDependencies({
  abilities: Abilities,
  haste: Haste,
}) {
  activeAuras: Aura[] = [];
  private listenedAuraIds = new Set<number>();
  /**
   * The set of aura ids that were added to `auras()` or via `add()`. This is
   * not the same as the set of auras that have event listeners (for example:
   * an aura with `enabled: false` is not added to listeners).
   */
  private knownAuraIds = new Set<number>();

  constructor(options: Options) {
    super(options);
    this.loadAuras(this.auras());
    this.registerListeners(this.activeAuraFilter());
    for (const aura of this.activeAuraFilter()) {
      this.listenedAuraIds.add(aura.id);
    }

    for (const aura of this.auras()) {
      const ids = typeof aura.spellId === 'number' ? [aura.spellId] : aura.spellId;
      for (const id of ids) {
        this.knownAuraIds.add(id);
      }
    }
  }

  isKnownAura(id: number): boolean {
    return this.knownAuraIds.has(id);
  }

  readonly auraEvents = new Map<number, BuffOrDebuffEvent[]>();

  history(spellId: number): StateHistory<BuffOrDebuffEvent> {
    return new StateHistory(this.auraEvents.get(spellId) ?? []);
  }

  private appendToHistory(event: BuffOrDebuffEvent): void {
    const spellId = event.ability.guid;
    if (!this.auraEvents.has(spellId)) {
      this.auraEvents.set(spellId, []);
    }

    this.auraEvents.get(spellId)?.push(event);
  }

  // the rare non-constructor event listener. `add` is called in constructors of other analyzers, so the event listener should still be registered in time.
  private registerListeners(filter: SpellFilter<SpellInfo>): void {
    this.addEventListener(Events.applybuff.to(SELECTED_PLAYER).spell(filter), this.appendToHistory);
    this.addEventListener(
      Events.removebuff.to(SELECTED_PLAYER).spell(filter),
      this.appendToHistory,
    );

    this.addEventListener(
      Events.applydebuff.to(SELECTED_PLAYER).spell(filter),
      this.appendToHistory,
    );
    this.addEventListener(
      Events.removedebuff.to(SELECTED_PLAYER).spell(filter),
      this.appendToHistory,
    );
  }

  private activeAuraFilter(): SpellInfo[] {
    return this.activeAuras.flatMap((aura) =>
      Array.isArray(aura.spellId) ? aura.spellId.map((id) => ({ id })) : [{ id: aura.spellId }],
    );
  }

  /**
   * This will be called *once* during initialization. This isn't nearly as well worked out as the Abilities modules and was in fact extremely rushed. So I have no clue if you should include all buffs here, or just important ones. We'll figure it out later.
   * @returns {object[]}
   */
  auras(): SpellbookAura[] {
    // This list will NOT be recomputed during the fight. If a cooldown changes based on something like Haste or a Buff you need to put it in a function.
    // While you can put checks for talents/traits outside the cooldown prop, you generally should aim to keep everything about a single spell together. In general only move a prop up if you're regularly checking for the same talent/trait in multiple spells.
    // I think anyway, this might all change lul.
    return [
      // Convert the legacy buffSpellId prop
      ...this.deps.abilities.activeAbilities.filter(isAbilityWithBuffSpellId).map((ability) => ({
        spellId: ability.buffSpellId,
        triggeredBySpellId:
          ability.spell !== ability.buffSpellId ? ability.primarySpell : undefined,
        timelineHighlight: true,
      })),
      {
        spellId: Object.keys(BLOODLUST_BUFFS).map((item) => Number(item)),
        timelineHighlight: true,
      },
      {
        spellId: TALENTS_PRIEST.POWER_INFUSION_TALENT.id,
        timelineHighlight: true,
      },
    ];
  }

  loadAuras(buffs: SpellbookAura[]) {
    this.activeAuras = buffs
      .map((options) => new Aura(options))
      .filter((ability) => ability.enabled);
  }

  /**
   * Add a buff to the list of active buffs.
   * @param {object} options An object with all the properties and their values that gets passed to the Buff class.
   */
  add(options: SpellbookAura) {
    const buff = new Aura(options);
    this.activeAuras.push(buff);
    if (Array.isArray(buff.spellId)) {
      for (const id of buff.spellId) {
        this.knownAuraIds.add(id);
        if (!this.listenedAuraIds.has(id)) {
          this.listenedAuraIds.add(id);
          this.registerListeners({ id });
        }
      }
    } else {
      this.knownAuraIds.add(buff.spellId);
      if (!this.listenedAuraIds.has(buff.spellId)) {
        this.listenedAuraIds.add(buff.spellId);
        this.registerListeners({ id: buff.spellId });
      }
    }
  }

  /**
   * Returns the first ACTIVE buff with the given spellId (or undefined if there is no such buff)
   */
  getAura(spellId: number) {
    return this.activeAuras.find((aura) => {
      if (aura.spellId instanceof Array) {
        return aura.spellId.includes(spellId);
      } else {
        return aura.spellId === spellId;
      }
    });
  }
}

export default Auras;
