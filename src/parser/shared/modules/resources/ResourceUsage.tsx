import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import DonutChart from 'interface/statistics/components/DonutChart';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import Events, { CastEvent } from 'parser/core/Events';
import ResourceLink from 'common/ResourceLink';
import { formatNumber } from 'common/format';

import Spell from 'common/SPELLS/Spell';

import React from 'react';

class ResourceUsage extends Analyzer {

  //region IMPLEMENTME statics
  /**
   * One of the types from game/RESOURCE_TYPES
   */
  static resourceType: { id: number, name: string, icon: string, url: string };

  /**
   * Array of objects from common/SPELLS
   */
  static listOfResourceSpenders: Spell[] = [];

  /**
   * We might want some spells to show as other spells, if some buff can alter their spellID, but the spell is otherwise essentially the same.
   * An example of this can be Mongoose Bite and Raptor Strike for Survival that gain a different spellID when
   * Example format
   * [SPELLS.RAPTOR_STRIKE_AOTE.id]: SPELLS.RAPTOR_STRIKE,
   */
  static spellsThatShouldShowAsOtherSpells: { [spellID: number]: { id: number, name: string, abilityIcon: string, type: number } } = {};
  //endregion

  //region Optional IMPLEMENTME statics
  /**
   * String representations of hex colour codes
   * Only replace if you want different colours, or need more colours (even utilising all 7 will lead to a very ugly chart and potential spell names overflowing out of the statistic box)
   */
  static listOfDefaultColours: string[] = [
    '#ecd1b6',
    '#abff3d',
    '#ecda4c',
    '#ff7d0a',
    '#4ce4ec',
    '#8b8dec',
    '#00ec62',
  ];

  /**
   * If you want to change where this module is shown, change this static.
   */
  static statisticOrder = STATISTIC_ORDER.CORE(12);
  //endregion

  listOfSpellsUsed: { [key: string]: { casts: number, resourceUsed: number } } = {};
  ctor = this.constructor as typeof ResourceUsage;

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(this.resourceSpenders), this.onCast);
  }

  get resourceSpenders() {
    return this.ctor.listOfResourceSpenders;
  }

  get resourceTypeID() {
    return this.ctor.resourceType.id;
  }

  get resourceTypeName() {
    return this.ctor.resourceType.name;
  }

  get listOfDefaultColours() {
    return this.ctor.listOfDefaultColours;
  }

  get spellsThatShouldShowAsOtherSpells() {
    return this.ctor.spellsThatShouldShowAsOtherSpells;
  }

  get resourceUsageStatisticOrder() {
    return this.ctor.statisticOrder;
  }

  onCast(event: CastEvent) {
    //shouldn't really happen unless something messed up in the log where the cast event doesn't have any class resource information so we skip those.
    if (!event.classResources) {
      return;
    }
    let spellID = event.ability.guid;
    if (this.spellsThatShouldShowAsOtherSpells[spellID]) {
      spellID = this.spellsThatShouldShowAsOtherSpells[spellID].id;
    }

    const resource = event.classResources?.find(resource => resource.type === this.resourceTypeID);
    if (!resource) {
      return;
    }

    if (!this.listOfSpellsUsed[spellID]) {
      this.listOfSpellsUsed[spellID] = {
        casts: 0,
        resourceUsed: 0,
      };
    }

    this.listOfSpellsUsed[spellID].casts += 1;
    this.listOfSpellsUsed[spellID].resourceUsed += resource.cost || 0;
  }

  sortResourceUsage(a: { value: number; }, b: { value: number; }) {
    let comparison = 0;
    if (a.value > b.value) {
      comparison = -1;
    } else if (a.value < b.value) {
      comparison = 1;
    }
    return comparison;
  }

  get resourceUsageChart() {
    const items: Array<{ color: string, label: string, spellId: number, value: number, valueTooltip: string }> = [];
    let colourIndex = 0;
    this.resourceSpenders.forEach(spell => {
      if (this.listOfSpellsUsed[spell.id] && this.listOfSpellsUsed[spell.id].resourceUsed > 0) {
        items.push({
          color: this.listOfDefaultColours[colourIndex],
          label: spell.name,
          spellId: spell.id,
          value: Math.round(this.listOfSpellsUsed[spell.id].resourceUsed),
          valueTooltip: `${this.listOfSpellsUsed[spell.id].casts} casts and ${formatNumber(this.listOfSpellsUsed[spell.id].resourceUsed)} ${this.resourceTypeName} spent`,
        });
        colourIndex += 1;
      }
    });
    items.sort(this.sortResourceUsage);

    return (
      <DonutChart
        items={items}
      />
    );
  }

  statistic() {
    return (
      <Statistic position={this.resourceUsageStatisticOrder}>
        <div className="pad">
          <label><ResourceLink id={this.resourceTypeID} /> usage</label>
          {this.resourceUsageChart}
        </div>

      </Statistic>
    );
  }

}

export default ResourceUsage;
