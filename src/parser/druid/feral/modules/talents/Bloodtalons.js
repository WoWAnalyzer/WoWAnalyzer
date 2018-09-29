import React from 'react';
import { Doughnut as DoughnutChart } from 'react-chartjs-2';
import StatisticsListBox, { STATISTIC_ORDER } from 'interface/others/StatisticsListBox';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import Analyzer from 'parser/core/Analyzer';
import HIT_TYPES from 'parser/core/HIT_TYPES';

const debug = false;

const BLOODTALONS_BUFF_DURATION = 30000;
const EXPIRE_WINDOW = 100;
const POTENTIAL_SPENDERS = [
  SPELLS.RAKE,
  SPELLS.RIP,
  SPELLS.SHRED,
  SPELLS.FEROCIOUS_BITE,
  SPELLS.BRUTAL_SLASH_TALENT,
  SPELLS.SWIPE_CAT,
  SPELLS.THRASH_FERAL,
  SPELLS.MAIM,
  // Feral Frenzy would be a spender, but it's a talent on the same row as Bloodtalons
];

// time (in ms) within which to consider direct damage events with same spellId as belonging to the same ability use
const AOE_DAMAGE_WINDOW = 200;
const HIT_TYPES_THAT_DONT_CONSUME = [
  HIT_TYPES.MISS,
  HIT_TYPES.DODGE,
  HIT_TYPES.PARRY,
];

const CHART_SIZE = 100;
const CHART_COLOR_WASTED = '#d53805';
const CHART_COLOR_SPENDERS = [
  '#987284',
  '#9dbf9e',
  '#2e86ab',
  '#40376e',
  '#f39b6d',
  '#f9cb40',
  '#603140',
  '#e0607e',
];

/**
 * Casting Regrowth or Entangling Roots generates 2 stacks of the Bloodtalons buff.
 * 1 charge is consumed by each successful use of one of the POTENTIAL_SPENDERS. Successful uses
 * are detected in different ways depending on the ability:
 * - Single target attacks that do initial damage consume a stack so long as that damage connects.
 * - AoE abilities consume a charge if they succeed in hitting at least 1 enemy.
 * - Rip (DoT with no initial damage) success is detected by watching for debuff apply or refresh.
 */
class Bloodtalons extends Analyzer {
  spenders = null;
  currentStack = 0;
  expireTime = null;
  lastSpender = null;

  generated = 0;
  used = 0;
  expired = 0;
  remainAfterFight = 0;
  overwritten = 0;

  constructor(...args) {
    super(...args);

    if (POTENTIAL_SPENDERS.length > CHART_COLOR_SPENDERS.length) {
      throw new Error(`Bloodtalons has ${POTENTIAL_SPENDERS.length} potential spenders but only ${CHART_COLOR_SPENDERS.length} chart colors defined.`);
    }
    this.active = this.selectedCombatant.hasTalent(SPELLS.BLOODTALONS_TALENT.id);
    if (this.active) {
      /**
       * The spenders array could be built during parsing, but doing it at the start means it'll
       * always list the spenders in the same order. That should make comparison between fights
       * or players easier for the user.
       */
      this.spenders = POTENTIAL_SPENDERS.map((spender, index) => ({
        spell: spender,
        chartColor: CHART_COLOR_SPENDERS[index],
        count: 0,
      }));
    }
  }

  on_finished() {
    this.remainAfterFight = this.currentStack;
    debug && console.log(`${this.owner.formatTimestamp(this.owner.fight.end_time, 3)} fight ended with ${this.currentStack} Bloodtalons charges remaining`);

    if (debug && this.generated !== (this.used + this.expired + this.remainAfterFight + this.overwritten)) {
      console.warn(`Not all Bloodtalon charges accounted for. Generated: ${this.generated}, used: ${this.used}, expired: ${this.expired}, remainAfterFight: ${this.remainAfterFight}, overwritten: ${this.overwritten}`);
    }
  }

  on_toPlayer_applybuff(event) {
    if (SPELLS.BLOODTALONS_BUFF.id !== event.ability.guid) {
      return;
    }
    debug && console.log(`${this.owner.formatTimestamp(event.timestamp, 3)} generated 2 Bloodtalons charges`);
    this.generated += 2;
    this.currentStack = 2;
    this.expireTime = event.timestamp + BLOODTALONS_BUFF_DURATION;
  }

  on_toPlayer_refreshbuff(event) {
    if (SPELLS.BLOODTALONS_BUFF.id !== event.ability.guid) {
      return;
    }
    debug && console.log(`${this.owner.formatTimestamp(event.timestamp, 3)} generated 2 Bloodtalons charges, overwriting ${this.currentStack}`);
    this.overwritten += this.currentStack;
    this.generated += 2;
    this.currentStack = 2;

    // pandemic doesn't apply
    this.expireTime = event.timestamp + BLOODTALONS_BUFF_DURATION;
  }

  on_toPlayer_removebuff(event) {
    if (SPELLS.BLOODTALONS_BUFF.id !== event.ability.guid ||
        this.currentStack === 0 || !this.expireTime ||
        Math.abs(this.expireTime - event.timestamp) > EXPIRE_WINDOW) {
      // only interested in bloodtalons buff wearing off after its full duration
      return;
    }
    debug && console.log(`${this.owner.formatTimestamp(event.timestamp, 3)} Bloodtalons expired, losing ${this.currentStack} charges`);
    this.expired += this.currentStack;
    this.currentStack = 0;
    this.expireTime = null;
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (!this.isSpender(spellId) || this.currentStack === 0 ||
        event.tick || HIT_TYPES_THAT_DONT_CONSUME.includes(event.hitType) ||
        this.isAlreadyAccountedForAoE(spellId, event.timestamp)) {
      // only interested in direct damage hits from a spender ability
      return;
    }
    this.lastSpender = {
      spellId,
      timestamp: event.timestamp,
    };
    this.currentStack -= 1;
    this.addSpender(spellId);
  }

  on_byPlayer_applydebuff(event) {
    this.applyDebuff(event);
  }

  on_byPlayer_refreshdebuff(event) {
    this.applyDebuff(event);
  }

  applyDebuff(event) {
    if (this.currentStack === 0 || SPELLS.RIP.id !== event.ability.guid) {
      return;
    }
    this.currentStack -= 1;
    this.addSpender(SPELLS.RIP.id);
  }

  isSpender(spellId) {
    return !!POTENTIAL_SPENDERS.find(spender => spender.id === spellId);
  }

  isAlreadyAccountedForAoE(spellId, timestamp) {
    return this.lastSpender && this.lastSpender.spellId === spellId &&
      Math.abs(this.lastSpender.timestamp - timestamp) < AOE_DAMAGE_WINDOW;
  }

  addSpender(spellId) {
    const spender = this.spenders.find(spender => spender.spell.id === spellId);
    if (!spender) {
      throw new Error (`Tried to add spender ${spellId} which was not listed as a potential spender.`);
    }
    spender.count += 1;
    this.used += 1;
    debug && console.log(`${this.owner.formatTimestamp(this.owner.currentTimestamp, 3)} spend Bloodtalons charge on ${spender.spell.name}`);
  }

  get wasted() {
    return this.expired + this.overwritten + this.remainAfterFight;
  }

  get overwrittenPerMinute() {
    return (this.overwritten / this.owner.fightDuration) * 1000 * 60;
  }

  get suggestionThresholds() {
    /**
     * Suggestion is based on just overwritten charges rather than all forms of waste.
     * That's because overwriting can always be avoided by the player but the other wastes are
     * often outside the player's control.
     */
    return {
      actual: this.overwrittenPerMinute,
      isGreaterThan: {
        minor: 0,
        average: 0.5,
        major: 2.0,
      },
      style: 'number',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => {
      return suggest(
        <React.Fragment>
          You are overwriting charges of <SpellLink id={SPELLS.BLOODTALONS_TALENT.id} />. Try to use both charges before you generate more from casting <SpellLink id={SPELLS.REGROWTH.id} /> or <SpellLink id={SPELLS.ENTANGLING_ROOTS.id} />.
        </React.Fragment>
      )
        .icon(SPELLS.BLOODTALONS_TALENT.icon)
        .actual(`${actual.toFixed(1)} wasted charges of Bloodtalons per minute.`)
        .recommended(`${recommended} is recommended`);
    });
  }

  legend(items, total) {
    const numItems = items.length;
    return items.map(({ color, label, tooltip, value, spellId }, index) => {
      label = spellId ? (
        <SpellLink id={spellId}>{label}</SpellLink>
      ) : label;
      return (
        <div
          className="flex"
          style={{
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            marginBottom: ((numItems - 1) === index) ? 0 : 5,
          }}
          key={index}
        >
          <div className="flex-sub">
            <div
              style={{
                display: 'inline-block',
                background: color,
                borderRadius: '50%',
                width: 16,
                height: 16,
                marginBottom: -3,
              }}
            />
          </div>
          <div className="flex-main" style={{ paddingLeft: 5 }}>
            {label}
          </div>
          <div className="flex-sub">
            <dfn data-tip={tooltip}>
              {formatPercentage(value / total, 0)}%
            </dfn>
          </div>
        </div>
      );
    });
  }

  doughnut(items) {
    return (
      <DoughnutChart
        data={{
          datasets: [{
            data: items.map(item => item.value),
            backgroundColor: items.map(item => item.color),
            borderColor: '#000000',
            borderWidth: 1.5,
          }],
          labels: items.map(item => item.label),
        }}
        options={{
          legend: {
            display: false,
          },
          tooltips: {
            bodyFontSize: 10,
          },
          cutoutPercentage: 45,
          animation: false,
          responsive: false,
        }}
        width={CHART_SIZE}
        height={CHART_SIZE}
      />
    );
  }

  combinedChart() {
    const items = this.spenders
      .filter(spender => spender.count !== 0)
      .map((spender, index) => {
        return {
          color: spender.chartColor,
          label: spender.spell.name,
          spellId: spender.spell.id,
          value: spender.count,
          tooltip: `<b>${spender.count}</b> charge${spender.count !== 1 ? 's' : ''} used on ${spender.spell.name}.`,
        };
      });

    items.push({
      color: CHART_COLOR_WASTED,
      label: 'Wasted',
      value: this.wasted,
      tooltip: `<b>${this.wasted}</b> Bloodtalons charge${this.wasted !== 1 ? 's were' : ' was'} wasted.<br/>
        <li>You lost <b>${this.overwritten}</b> by casting Regrowth or Entangling Roots when you already had charges.</li>
        <li>You lost <b>${this.expired}</b> by allowing ${this.expired !== 1 ? 'them' : 'it'} to expire.</li>
        <li>You lost <b>${this.remainAfterFight}</b> by having ${this.remainAfterFight !== 1 ? 'them' : 'it'} left over at the fight's end.</li>`,
    });

    return (
      <div className="flex">
        <div className="flex-sub" style={{ paddingRight: 12 }}>
          {this.doughnut(items)}
        </div>
        <div className="flex-main" style={{ fontSize: '90%', paddingTop: 3 }}>
          {this.legend(items, this.used + this.wasted)}
        </div>
      </div>
    );
  }

  statistic() {
    return (
      <StatisticsListBox title={(
        <React.Fragment>
          <SpellLink id={SPELLS.BLOODTALONS_TALENT.id} /> usage
        </React.Fragment>
      )}>
        {this.combinedChart()}
      </StatisticsListBox>
    );
  }

  statisticOrder = STATISTIC_ORDER.OPTIONAL(4);
}

export default Bloodtalons;
