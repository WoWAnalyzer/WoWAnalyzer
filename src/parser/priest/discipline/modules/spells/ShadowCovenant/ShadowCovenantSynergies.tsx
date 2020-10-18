import React from 'react';
import SPELLS from 'common/SPELLS';
import Statistic from 'interface/statistics/Statistic';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Spell from 'common/SPELLS/Spell';
import Events, { AnyEvent, CastEvent } from 'parser/core/Events';
import EventGrouper from 'parser/core/EventGrouper';
import SpellIcon from 'common/SpellIcon';

const SHADOW_COVENANT_BUFF_DURATION = 9000;

/**
 * @description Defines a sequence of spells
 * @example
 * const ShadowCovenantSequence = [SPELLS.SHADOW_COVENANT, SPELLS.SCHISM, SPELLS.MINDGAMES]
 */
type SpellSequenceDefinition = Spell[];
type SpellSequenceBonus = [SpellSequenceDefinition, number];

/**
 * @description Describes bonuses associated with casting specific sequences
 */
const ShadowCovenantSequenceBonuses: SpellSequenceBonus[] = [
  [[SPELLS.SHADOW_COVENANT_TALENT, SPELLS.SCHISM], 20],
  [[SPELLS.SCHISM, SPELLS.MINDGAMES], 20],
];

/**
 * @description Describes spells included for consideration as a Shadow Covenant Synergy
 */
const ShadowCovenantSynergyPasslist: Set<Spell> = new Set([
  SPELLS.SCHISM_TALENT,
  SPELLS.MINDGAMES,
  SPELLS.MIND_BLAST,
  SPELLS.MIND_SEAR,
]);

const ShadowCovenantSynergyScoremap = {
  [SPELLS.MINDGAMES.id]: 20,
  [SPELLS.SCHISM_TALENT.id]: 15,
  [SPELLS.MIND_BLAST.id]: 10,
  [SPELLS.MIND_SEAR.id]: 5,
};

class ShadowCovenantSynergies extends Analyzer {
  previousCovenantCast: number = 0;
  eventGrouper = new EventGrouper<CastEvent>(SHADOW_COVENANT_BUFF_DURATION);

  constructor(options: Options) {
    super(options);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SHADOW_COVENANT_TALENT),
      this.handleShadowCovenantCast,
    );

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(Array.from(ShadowCovenantSynergyPasslist.values())),
      this.groupEvents,
    );
  }

  handleShadowCovenantCast(e: CastEvent) {
    this.previousCovenantCast = e.timestamp;
  }

  groupEvents(e: CastEvent) {
    if (e.timestamp > this.previousCovenantCast + SHADOW_COVENANT_BUFF_DURATION) {
      return; // We don't want to process things outside of the Shadow Covenant window
    }

    this.eventGrouper.processEvent(e);
  }

  statistic() {
    const eventLists = this.eventGrouper.eventGroups;

    return (
      <Statistic>
        <div className="pad">
          <>Shadow Covenant Synergies</>
          {eventLists.map((eList) => {
            return (
              <div key={eList.timestamp}>
                {eList.events.map((e, idx) => (
                  <SpellIcon
                    alt={e.ability.name}
                    key={`${e.ability.guid}-${idx}`}
                    id={e.ability.guid}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </Statistic>
    );
  }
}

export default ShadowCovenantSynergies;
