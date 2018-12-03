import React from 'react';

import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import Analyzer from 'parser/core/Analyzer';
import Haste from 'parser/shared/modules/Haste';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import Tab from 'interface/others/Tab';

import Insanity from '../core/Insanity';
import VoidformsTab from './VoidformsTab';

const debug = false;
const logger = (message, color) => debug && console.log(`%c${message.join('  ')}`, `color: ${color}`);

const VOID_FORM_ACTIVATORS = [
  SPELLS.VOID_ERUPTION.id,
  SPELLS.DARK_ASCENSION_TALENT.id,
];

class Voidform extends Analyzer {
  static dependencies = {
    insanity: Insanity,
    haste: Haste,
  };

  _previousVoidformCast = null;
  _totalHasteAcquiredOutsideVoidform = 0;
  _totalLingeringInsanityTimeOutsideVoidform = 0;
  _inVoidform = false;

  _voidforms = {};

  get voidforms() {
    return Object.keys(this._voidforms).map(key => this._voidforms[key]);
  }

  get nonExcludedVoidforms() {
    return this.voidforms.filter(voidform => !voidform.excluded);
  }

  get averageVoidformStacks() {
    if (this.voidforms.length === 0) {
      return 0;
    }
    // ignores last voidform if seen as skewing
    return this.nonExcludedVoidforms.reduce((p, c) => p + c.stacks.length, 0) / this.nonExcludedVoidforms.length;
  }

  get averageVoidformHaste() {
    if (!this.currentVoidform) {
      return (1 + this.haste.current);
    }

    const averageHasteGainedFromVoidform = (this.voidforms.reduce((total, voidform) => total + voidform.averageGainedHaste, 0)) / this.voidforms.length;
    return (1 + this.haste.current) * (1 + averageHasteGainedFromVoidform);
  }

  get averageNonVoidformHaste() {
    return (1 + this.haste.current) * (1 + (this._totalHasteAcquiredOutsideVoidform / this._totalLingeringInsanityTimeOutsideVoidform) / 100);
  }

  get inVoidform() {
    return this.selectedCombatant.hasBuff(SPELLS.VOIDFORM_BUFF.id);
  }

  get currentVoidform() {
    if (this.voidforms && this.voidforms.length > 0) {
      return this._voidforms[this.voidforms[this.voidforms.length - 1].start];
    } else {
      return false;
    }
  }

  get uptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.VOIDFORM_BUFF.id) / (this.owner.fightDuration - this.selectedCombatant.getBuffUptime(SPELLS.DISPERSION.id));
  }

  get normalizeTimestamp() {
    return (event) => Math.round((event.timestamp - this.currentVoidform.start) / 10) * 10;
  }

  get addVoidformEvent() {
    return (name, event) => {
      if (this.currentVoidform) {
        this.currentVoidform[name] = [
          ...this.currentVoidform[name],
          event,
        ];
      }
    };
  }

  addVoidformStack(event) {
    if (!this.currentVoidform) return;
    this.currentVoidform.stacks = [
      ...this.currentVoidform.stacks,
      { stack: event.stack, timestamp: this.normalizeTimestamp(event) },
    ];
    logger(['Added voidform stack:', event.stack, `at`, this.normalizeTimestamp(event)], 'green');
  }

  removeLingeringInsanityStack(event) {
    if (this.inVoidform) {
      this.currentVoidform.lingeringInsanityStacks = [
        ...this.currentVoidform.lingeringInsanityStacks,
        { stack: event.stack, timestamp: this.normalizeTimestamp(event) },
      ];
      logger(['Removed lingering stack:', event.stack, 'at', this.normalizeTimestamp(event)], 'orange');
    } else {
      this._totalHasteAcquiredOutsideVoidform += event.stack;
      this._totalLingeringInsanityTimeOutsideVoidform += 1;
    }
  }

  startVoidform(event) {
    this._voidforms[event.timestamp] = {
      start: event.timestamp,
      lingeringInsanityStacks: [],
      stacks: [],
      excluded: false,
      averageGainedHaste: 0,
      [SPELLS.MINDBENDER_TALENT_SHADOW.id]: [],
      [SPELLS.VOID_TORRENT_TALENT.id]: [],
      [SPELLS.DISPERSION.id]: [],
    };
    logger(['Started voidform at:', event.timestamp], 'purple');
    this.addVoidformStack({ ...event, stack: 1 });
  }

  endVoidform(event) {
    this.currentVoidform.duration = this.normalizeTimestamp(event);

    // artificially adds the starting lingering insanity stack:
    if (this.currentVoidform.lingeringInsanityStacks.length > 0) {
      const { stack: nextStack } = this.currentVoidform.lingeringInsanityStacks[0];
      this.currentVoidform.lingeringInsanityStacks = [
        { stack: nextStack + 2, timestamp: 0 },
        ...this.currentVoidform.lingeringInsanityStacks,
      ];
    }

    // calculates the average gained haste from voidform stacks & lingering insanity within the voidform:
    this.currentVoidform.averageGainedHaste = (this.currentVoidform.stacks.reduce((total, { stack, timestamp }, i) => {
      const nextTimestamp = this.currentVoidform.stacks[i + 1] ? this.currentVoidform.stacks[i + 1].timestamp : timestamp + 1000;
      return total + ((nextTimestamp - timestamp) / 1000) * stack / 100;
    }, 0) + this.currentVoidform.lingeringInsanityStacks.reduce((total, { stack, timestamp }, i) => {
      const nextTimestamp = this.currentVoidform.lingeringInsanityStacks[i + 1] ? this.currentVoidform.lingeringInsanityStacks[i + 1].timestamp : timestamp + 1000;
      return total + ((nextTimestamp - timestamp) / 1000) * stack / 100;
    }, 0)) / (this.currentVoidform.duration / 1000);
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (VOID_FORM_ACTIVATORS.includes(spellId)) {
      this.startVoidform(event);
    }
  }

  on_byPlayer_removebuff(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.VOIDFORM_BUFF.id) {
      this.endVoidform(event);
    }
  }

  on_byPlayer_applybuffstack(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.VOIDFORM_BUFF.id) {
      if (!this.currentVoidform) {
        // for prepull voidforms
        this.startVoidform(event);
      }
      this.addVoidformStack(event);
    }
  }

  on_byPlayer_removebuffstack(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.LINGERING_INSANITY.id) this.removeLingeringInsanityStack(event);
  }

  on_fightend() {
    if (this.selectedCombatant.hasBuff(SPELLS.VOIDFORM_BUFF.id)) {
      // excludes last one to avoid skewing the average (if in voidform when the encounter ends):
      const averageVoidformStacks = this.voidforms.slice(0, -1).reduce((p, c) => p + c.stacks.length, 0) / (this.voidforms.length - 1);
      const lastVoidformStacks = this.currentVoidform.stacks.length;

      if (lastVoidformStacks + 5 < averageVoidformStacks) {
        this.currentVoidform.excluded = true;
      }

      // end last voidform of the fight:
      this.endVoidform({ timestamp: this.owner._timestamp });
    }

    debug && console.log(this.voidforms);
  }

  get suggestionUptimeThresholds() {
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 0.7,
        average: 0.65,
        major: 0.6,
      },
      style: 'percentage',
    };
  }

  get suggestionStackThresholds() {
    return (voidform) => ({
      actual: voidform.stacks.length,
      isLessThan: {
        minor: 20,
        average: 19,
        major: 18,
      },
      style: 'number',
    });
  }

  suggestions(when) {
    const {
      isLessThan: {
        minor,
        average,
        major,
      },
    } = this.suggestionUptimeThresholds;

    when(this.uptime).isLessThan(minor)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>Your <SpellLink id={SPELLS.VOIDFORM.id} /> uptime can be improved. Try to maximize the uptime by using your insanity generating spells and cast <SpellLink id={SPELLS.MINDBENDER_TALENT_SHADOW.id} /> on cooldown.
          <br /><br />
          Use the generators with the priority:
          <br /><SpellLink id={SPELLS.VOID_BOLT.id} />
          <br /><SpellLink id={SPELLS.MIND_BLAST.id} />
          <br /><SpellLink id={SPELLS.MIND_FLAY.id} />
        </span>)
          .icon(SPELLS.VOIDFORM_BUFF.icon)
          .actual(`${formatPercentage(actual)}% Voidform uptime`)
          .recommended(`>${formatPercentage(recommended)}% is recommended`)
          .regular(average).major(major);
      });
  }

  statistic() {
    return (
      <StatisticBox
        position={STATISTIC_ORDER.CORE(1)}
        icon={<SpellIcon id={SPELLS.VOIDFORM.id} />}
        value={`${formatPercentage(this.selectedCombatant.getBuffUptime(SPELLS.VOIDFORM_BUFF.id) / (this.owner.fightDuration - this.selectedCombatant.getBuffUptime(SPELLS.DISPERSION.id)))} %`}
        label={(
          <dfn data-tip={`Time spent in dispersion (${Math.round(this.selectedCombatant.getBuffUptime(SPELLS.DISPERSION.id) / 1000)} seconds) is excluded from the fight.`}>
            Voidform uptime
          </dfn>
        )}
      />
    );
  }

  tab() {
    return {
      title: 'Voidforms',
      url: 'voidforms',
      render: () => (
        <Tab>
          <VoidformsTab
            voidforms={this.voidforms}
            insanityEvents={this.insanity.events}
            fightEnd={this.owner.fight.end_time}
            surrenderToMadness={!!this.selectedCombatant.hasTalent(SPELLS.SURRENDER_TO_MADNESS_TALENT.id)}
          />
        </Tab>
      ),
    };
  }
}

export default Voidform;
