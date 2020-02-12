import React from 'react';

import SPELLS from 'common/SPELLS/index';
import { formatDuration } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import Events from 'parser/core/Events';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import EventEmitter from 'parser/core/modules/EventEmitter';

import indexById from 'common/indexById';
import safeMerge from 'common/safeMerge';
import T_DEATH_KNIGHT from 'common/SPELLS/talents/deathknight';
import T_DEMON_HUNTER from 'common/SPELLS/talents/demonhunter';
import T_DRUID from 'common/SPELLS/talents/druid';
import T_HUNTER from 'common/SPELLS/talents/hunter';
import T_MAGE from 'common/SPELLS/talents/mage';
import T_MONK from 'common/SPELLS/talents/monk';
import T_PALADIN from 'common/SPELLS/talents/paladin';
import T_PRIEST from 'common/SPELLS/talents/priest';
import T_ROGUE from 'common/SPELLS/talents/rogue';
import T_SHAMAN from 'common/SPELLS/talents/shaman';
import T_WARLOCK from 'common/SPELLS/talents/warlock';
import T_WARRIOR from 'common/SPELLS/talents/warrior';
import DEATH_KNIGHT from 'common/SPELLS/deathknight';
import DEMON_HUNTER from 'common/SPELLS/demonhunter';
import DRUID from 'common/SPELLS/druid';
import HUNTER from 'common/SPELLS/hunter';
import MAGE from 'common/SPELLS/mage';
import MONK from 'common/SPELLS/monk';
import PALADIN from 'common/SPELLS/paladin';
import PRIEST from 'common/SPELLS/priest';
import ROGUE from 'common/SPELLS/rogue';
import SHAMAN from 'common/SPELLS/shaman';
import WARLOCK from 'common/SPELLS/warlock';
import WARRIOR from 'common/SPELLS/warrior';

const CLASS_ABILITIES = {
  ...safeMerge(T_DEATH_KNIGHT, T_DEMON_HUNTER, T_DRUID, T_HUNTER, T_MAGE, T_MONK, T_PALADIN, T_PRIEST, T_ROGUE, T_SHAMAN, T_WARLOCK, T_WARRIOR),
  ...safeMerge(DEATH_KNIGHT, DEMON_HUNTER, DRUID, HUNTER, MAGE, MONK, PALADIN, PRIEST, ROGUE, SHAMAN, WARLOCK, WARRIOR),
};
indexById(CLASS_ABILITIES);

const SMALL_TRUTH = 0.3;
const BIG_TRUTH = 0.5;

const debug = false;

class IneffableTruth extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  buffActive = false;
  lastTimestamp = 0;
  reducedDuration = [];
  reductionPercent = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasCorruptionByName("Ineffable Truth");
    if (!this.active) {
      return;
    }

    this.reductionPercent += this.selectedCombatant.getCorruptionCount(SPELLS.INEFFABLE_TRUTH_T1.id) * SMALL_TRUTH;
    this.reductionPercent += this.selectedCombatant.getCorruptionCount(SPELLS.INEFFABLE_TRUTH_T2.id) * BIG_TRUTH;
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.INEFFABLE_TRUTH_BUFF), this.setBuffActive);
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.INEFFABLE_TRUTH_BUFF), this.setBuffInactive);
    this.addEventListener(EventEmitter.catchAll, this.reduceCooldowns);
  }

  setBuffActive(event) {
    this.buffActive = true;
    this.lastTimestamp = event.timestamp;
  }

  setBuffInactive() {
    this.buffActive = false;
    debug && this.log(this.reducedDuration);
  }

  reduceCooldowns(event) {
    if (!this.buffActive) {
      return;
    }

    /**
     * This is assuming that stacking this corruption works additive, might need adjustment in the future
     * 1x 50%: For every 1 second of elapsed time, reduce cooldowns for another 50% of that (0.5 seconds)
     * 1x 30% 1x 50%: For every 1 second of elapsed time, reduce cooldowns for another 80% of that (0.8 seconds)
     * 2x 50%: For every 1 second of elapsed time, reduce cooldowns for another 100% of that (1.0 seconds)
     */
    const reduction = (event.timestamp - this.lastTimestamp) * this.reductionPercent;
    Object.keys(this.spellUsable._currentCooldowns)
      .filter(cd => CLASS_ABILITIES[cd])
      .forEach(cooldown => {
        debug && this.log(cooldown);
        this.spellUsable.reduceCooldown(cooldown, reduction, event.timestamp);
        if (!this.reducedDuration[cooldown]) {
          this.reducedDuration[cooldown] = reduction;
        } else {
          this.reducedDuration[cooldown] += reduction;
        }
      });
    this.lastTimestamp = event.timestamp;
  }

  get totalReduction() {
    return this.reducedDuration.reduce((acc, curr) => acc + curr, 0) / 1000;
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.INEFFABLE_TRUTH_BUFF.id} />}
        value={`${formatDuration(this.totalReduction)} min reduction`}
        category={STATISTIC_CATEGORY.ITEMS}
        position={STATISTIC_ORDER.OPTIONAL(60)}
        label="Ineffable Truth"
      >
        <table className="table table-condensed">
          <thead>
            <tr>
              <th />
              <th>Spell</th>
              <th>Reduction</th>
            </tr>
          </thead>
          <tbody>
            {
              Object.entries(this.reducedDuration).map((cd) => (
                <tr key={cd[0]}>
                  <td><SpellIcon id={cd[0]} /></td>
                  <td><SpellLink id={cd[0]} icon={false} /></td>
                  <td>{formatDuration(cd[1] / 1000)}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </StatisticBox>
    );
  }
}

export default IneffableTruth;
