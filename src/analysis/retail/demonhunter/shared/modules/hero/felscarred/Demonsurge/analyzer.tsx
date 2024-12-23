import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS/demonhunter';
import TALENTS from 'common/TALENTS/demonhunter';
import Spell from 'common/SPELLS/Spell';
import SPECS from 'game/SPECS';
import Events, { AnyEvent, CastEvent, RemoveBuffEvent } from 'parser/core/Events';
import { AvailableColor, BadColor, GoodColor } from 'interface/guide';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import SpellLink from 'interface/SpellLink';
import { DEMONSURGE_TRIGGERS } from 'analysis/retail/demonhunter/shared';
import React from 'react';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { getDamageEvents } from 'analysis/retail/demonhunter/shared/modules/hero/felscarred/Demonsurge/eventLinkNormalizer';

export default class Demonsurge extends Analyzer {
  readonly #demonicTriggers: Spell[];
  readonly #hardcastTriggers: Spell[];
  readonly #triggers: Spell[];
  readonly #consumedTriggers: Map<number, number>;
  readonly #wastedTriggers: Map<number, number>;
  readonly #metamorphosisBuff: Spell;
  readonly #availableTriggers: Set<number>;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.DEMONSURGE_TALENT);

    // figure out what can trigger Demonsurge
    this.#triggers =
      this.selectedCombatant.spec === SPECS.HAVOC_DEMON_HUNTER
        ? [...DEMONSURGE_TRIGGERS.HAVOC.DEMONIC, ...DEMONSURGE_TRIGGERS.HAVOC.HARDCAST_ADDL]
        : [
            ...DEMONSURGE_TRIGGERS.VENGEANCE.DEMONIC,
            ...DEMONSURGE_TRIGGERS.VENGEANCE.HARDCAST_ADDL,
          ];
    if (this.selectedCombatant.hasTalent(TALENTS.DEMONIC_TALENT)) {
      this.#demonicTriggers =
        this.selectedCombatant.spec === SPECS.HAVOC_DEMON_HUNTER
          ? DEMONSURGE_TRIGGERS.HAVOC.DEMONIC
          : DEMONSURGE_TRIGGERS.VENGEANCE.DEMONIC;
    } else {
      this.#demonicTriggers = [];
    }
    this.#hardcastTriggers = this.#triggers;

    // determine metamorphosis buff
    this.#metamorphosisBuff =
      this.selectedCombatant.spec === SPECS.HAVOC_DEMON_HUNTER
        ? SPELLS.METAMORPHOSIS_HAVOC_BUFF
        : SPELLS.METAMORPHOSIS_TANK;

    // construct consumed and wasted triggers maps
    this.#consumedTriggers = new Map(this.#triggers.map((trigger) => [trigger.id, 0]));
    this.#wastedTriggers = new Map(this.#triggers.map((trigger) => [trigger.id, 0]));

    // start off with no available triggers
    this.#availableTriggers = new Set();

    // listen for events
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(this.#metamorphosisBuff),
      this.#onMetamorphosisEnd,
    );
    console.log('[Demonsurge] adding listener for metamorphosis hardcast', this.active);
    this.addEventListener(
      Events.cast
        .by(SELECTED_PLAYER)
        .spell(
          this.selectedCombatant.spec === SPECS.HAVOC_DEMON_HUNTER
            ? SPELLS.METAMORPHOSIS_HAVOC
            : SPELLS.METAMORPHOSIS_TANK,
        ),
      this.#onMetamorphosisHardcast,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(this.#triggers),
      this.#onDemonsurgeTriggerCast,
    );
    if (this.selectedCombatant.hasTalent(TALENTS.DEMONIC_TALENT)) {
      this.addEventListener(
        Events.cast
          .by(SELECTED_PLAYER)
          .spell(
            this.selectedCombatant.spec === SPECS.HAVOC_DEMON_HUNTER
              ? TALENTS.EYE_BEAM_TALENT
              : TALENTS.FEL_DEVASTATION_TALENT,
          ),
        this.#onDemonicAbilityCast,
      );
    }
  }

  statistic(): React.ReactNode {
    const tableData = Array.from(this.#consumedTriggers.entries()).map(([trigger, consumed]) => {
      const wasted = this.#wastedTriggers.get(trigger) ?? 0;
      return [trigger, consumed, wasted] as const;
    });

    return (
      <>
        <Statistic
          position={STATISTIC_ORDER.CORE(6)}
          category={STATISTIC_CATEGORY.HERO_TALENTS}
          size="flexible"
          dropdown={
            <>
              <table className="table table-condensed">
                <thead>
                  <tr>
                    <th>Trigger</th>
                    <th>Spent</th>
                    <th>Wasted</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.map(([trigger, consumed, wasted]) => (
                    <tr key={trigger}>
                      <th>
                        <SpellLink spell={trigger} />
                      </th>
                      <td>{String(consumed)}</td>
                      <td>{String(wasted)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          }
        >
          <TalentSpellText talent={TALENTS.DEMONSURGE_TALENT}>
            {Array.from(this.#consumedTriggers.values()).reduce((acc, curr) => acc + curr, 0)}{' '}
            <small>Demonsurges spent</small>
            <br />
            {Array.from(this.#wastedTriggers.values()).reduce((acc, curr) => acc + curr, 0)}{' '}
            <small>Demonsurges wasted</small>
          </TalentSpellText>
        </Statistic>
      </>
    );
  }

  #onMetamorphosisEnd(event: RemoveBuffEvent) {
    this.#markAvailableTriggersAsWasted(event);
    this.#clearAvailableTriggers();
  }

  #onMetamorphosisHardcast(event: CastEvent) {
    this.#markAvailableTriggersAsWasted(event);
    this.#clearAvailableTriggers();
    this.#enableHardcastTriggers(event);
  }

  #onDemonicAbilityCast(event: CastEvent) {
    // if Demonic is re-triggered while the player is already in Meta, no new Demonsurges
    // become available.
    if (this.selectedCombatant.hasBuff(this.#metamorphosisBuff, event.timestamp)) {
      return;
    }
    this.#enableDemonicTriggers(event);
  }

  #onDemonsurgeTriggerCast(event: CastEvent) {
    // if no Demonsurge trigger available, we do nothing
    if (!this.#isTriggerAvailable(event.ability.guid)) {
      return;
    }
    this.#consumeTrigger(event);
  }

  #isTriggerAvailable(triggerId: number) {
    return this.#availableTriggers.has(triggerId);
  }

  #consumeTrigger(trigger: CastEvent) {
    this.#availableTriggers.delete(trigger.ability.guid);

    const previouslyConsumedTriggers = this.#consumedTriggers.get(trigger.ability.guid) ?? 0;
    this.#consumedTriggers.set(trigger.ability.guid, previouslyConsumedTriggers + 1);

    const damageEvents = getDamageEvents(trigger);
    this.addDebugAnnotation(trigger, {
      color: damageEvents.length >= 1 ? GoodColor : BadColor,
      summary: 'Spent Demonsurge proc',
      details: <BoringSpellValueText spell={SPELLS.DEMONSURGE}>Spent a proc</BoringSpellValueText>,
    });
  }

  #enableDemonicTriggers(event: CastEvent) {
    for (const trigger of this.#demonicTriggers) {
      this.#availableTriggers.add(trigger.id);
    }
    this.addDebugAnnotation(event, {
      color: AvailableColor,
      summary: 'Enabled Demonic Demonsurge procs',
      details: (
        <BoringSpellValueText spell={TALENTS.DEMONSURGE_TALENT}>
          Enabled Demonsurge procs for these spells:
          <ul>
            {this.#demonicTriggers.map((it) => (
              <li key={it.id}>
                <SpellLink spell={it} />
              </li>
            ))}
          </ul>
        </BoringSpellValueText>
      ),
    });
  }

  #enableHardcastTriggers(event: CastEvent) {
    for (const trigger of this.#hardcastTriggers) {
      this.#availableTriggers.add(trigger.id);
    }
    this.addDebugAnnotation(event, {
      color: AvailableColor,
      summary: 'Enabled hardcast Demonsurge procs',
      details: (
        <BoringSpellValueText spell={TALENTS.DEMONIC_INTENSITY_TALENT}>
          Enabled Demonsurge procs for these spells:
          <ul>
            {this.#hardcastTriggers.map((it) => (
              <li key={it.id}>
                <SpellLink spell={it} />
              </li>
            ))}
          </ul>
        </BoringSpellValueText>
      ),
    });
  }

  #clearAvailableTriggers() {
    this.#availableTriggers.clear();
  }

  #markAvailableTriggersAsWasted(event: AnyEvent) {
    for (const availableTrigger of this.#availableTriggers) {
      const previouslyWastedTriggers = this.#wastedTriggers.get(availableTrigger) ?? 0;
      this.#wastedTriggers.set(availableTrigger, previouslyWastedTriggers + 1);
      this.addDebugAnnotation(event, {
        color: BadColor,
        summary: 'Wasted available Demonsurge proc',
        details: (
          <BoringSpellValueText spell={availableTrigger}>
            Wasted a proc of <SpellLink spell={SPELLS.DEMONSURGE} />
          </BoringSpellValueText>
        ),
      });
    }
  }
}
