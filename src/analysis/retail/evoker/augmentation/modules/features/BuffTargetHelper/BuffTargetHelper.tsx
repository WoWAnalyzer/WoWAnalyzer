import { i18n } from '@lingui/core';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/evoker';
import { WCLDamageDoneTableResponse } from 'common/WCL_TYPES';
import fetchWcl from 'common/fetchWclApi';
import { formatDuration, formatNumber } from 'common/format';
import ROLES from 'game/ROLES';
import SPECS from 'game/SPECS';
import { SpellIcon, SpellLink } from 'interface';
import Analyzer, { Options } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import Combatants from 'parser/shared/modules/Combatants';
import LazyLoadStatisticBox, { STATISTIC_ORDER } from 'parser/ui/LazyLoadStatisticBox';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import './BuffTargetHelper.scss';

/**
 * @key Player Name
 * @value Array of damage for each interval
 */
const playerDamageMap: Map<string, number[]> = new Map();

/**
 * Used to only grab DPS players, excluding Augmentation
 * We use ClassName so we can apply colors to our output
 * @key Player Name
 * @value ClassName
 */
const playerWhitelist: Map<string, string> = new Map();

/**
 * @key ClassName
 * @value mrt color code
 */
const mrtColorMap: Map<string, string> = new Map([
  ['Mage', '|cff3fc7eb'],
  ['Paladin', '|cfff48cba'],
  ['Warrior', '|cffc69b6d'],
  ['Druid', '|cffff7c0a'],
  ['DeathKnight', '|cffc41e3a'],
  ['Hunter', '|cffaad372'],
  ['Priest', '|cffffffff'],
  ['Rogue', '|cfffff468'],
  ['Shaman', '|cff0070dd'],
  ['Warlock', '|cff8788ee'],
  ['Monk', '|cff00ff98'],
  ['DemonHunter', '|cffa330c9'],
  ['Evoker', '|cff33937f'],
]);

/** SpellIds to blacklist, ie. trinkets that doesnt add contribution */
const blacklist = [
  402583, // Beacon
  408671, // Bomb dispenser
  401303, // Pocket Anvil
  401395, // Vessel
  418774, // Mirror
];

let mrtPrescienceHelperNote = '';

class BuffTargetHelper extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };
  protected combatants!: Combatants;

  // This could be set to fixed 30s intervals, but might as well give some attention to the Interwoven gamers!
  interval: number =
    30 * 1000 * (this.selectedCombatant.hasTalent(TALENTS.INTERWOVEN_THREADS_TALENT) ? 0.9 : 1);

  fightStart: number = this.owner.fight.start_time;
  fightEnd: number = this.owner.fight.end_time;

  constructor(options: Options) {
    super(options);

    /** Populate our whitelist */
    this.addEventListener(Events.fightend, () => {
      const players = Object.values(this.combatants.players);
      players.forEach((player) => {
        if (
          player.spec?.role !== ROLES.HEALER &&
          player.spec?.role !== ROLES.TANK &&
          player.spec !== SPECS.AUGMENTATION_EVOKER
        ) {
          const i18nClassName = player.spec?.className ? i18n._(player.spec.className) : '';
          const className = i18nClassName?.replace(/\s/g, '') ?? '';

          playerWhitelist.set(player.name, className);
        }
      });
    });
  }

  /** Generate filter based on black list and whitelist */
  getFilter() {
    const playerNames = Array.from(playerWhitelist.keys());
    const nameFilter = playerNames.map((name) => `source.name="${name}"`).join(' OR ');

    const abilityFilter = blacklist.map((id) => `ability.id!=${id}`).join(' OR ');

    const filter = `(IN RANGE WHEN ${abilityFilter} AND ${nameFilter} END)`;

    return filter;
  }

  /**
   * Should add support for phased fights
   * eg. Sark when you go downstairs for P1
   * So instead of going strictly in 30 seconds intervals one after the other
   * we would jump ahead in time to ignore phased periods where there is zero damage
   * This would provide more accurate/relevant information
   *
   * This is on the backburner for now.
   */
  async loadInterval() {
    let currentTime = this.fightStart;
    /** If we already populated the map no need to do it again
     * eg. someone went to stats and loaded the component, then
     * went to overview and back to stats and loaded it again.
     * no need to re-query WCL events
     */
    if (playerDamageMap.size > 0) {
      return;
    }

    while (currentTime < this.fightEnd) {
      await this.getDamage(currentTime);
      currentTime += this.interval;
    }
  }

  async getDamage(currentTime: number) {
    return fetchWcl(`report/tables/damage-done/${this.owner.report.code}`, {
      start: currentTime,
      end: currentTime + this.interval,
      filter: this.getFilter(),
    }).then((json) => {
      const data = json as WCLDamageDoneTableResponse;
      data.entries.forEach((entry) => {
        if (playerWhitelist.has(entry.name)) {
          if (!playerDamageMap.get(entry.name)) {
            playerDamageMap.set(entry.name, [entry.total]);
          } else {
            playerDamageMap.get(entry.name)?.push(entry.total);
          }
        }
      });
    });
  }

  findTopPumpers() {
    /** Don't run if no player damage is found
     * Essentially prevents it from running when page is loaded
     * and only when load button is pressed
     */
    if (playerDamageMap.size === 0) {
      return;
    }

    console.log(playerDamageMap);
    const content = [];
    content.push(
      <div className="container">
        <button onClick={this.handleCopyClick} className="copyButton">
          Copy MRT note to clipboard
        </button>
      </div>,
    );

    /** Find the top 4 pumpers for each interval */
    for (let i = 0; i < (this.fightEnd - this.fightStart) / this.interval; i += 1) {
      const sortedEntries = [...playerDamageMap.entries()].sort((a, b) => b[1][i] - a[1][i]);

      // Get the top 4 entries
      const top4Entries = sortedEntries.slice(0, 4);
      const top2Entries = sortedEntries.slice(0, 2);

      // Create the list of top 4 pumpers
      const formattedEntries = top4Entries.map(([name, values]) => (
        <li key={name} className="intervalEntry">
          <span className={playerWhitelist.get(name)}>{name}</span>: {formatNumber(values[i])}
        </li>
      ));

      const intervalStart = formatDuration(i * this.interval);
      let intervalEnd = formatDuration((i + 1) * this.interval);
      if (intervalEnd > formatDuration(this.fightEnd - this.fightStart)) {
        intervalEnd = formatDuration(this.fightEnd - this.fightStart);
      }

      /**
       * Create a MRT note for who to Prescience and when
       * This is pretty basic in design for now, but it will do as advertised.
       * Ideally you would most likely assign with more macro, but w/e
       *
       * Format is basicly:
       * PREPULL - |cff8788eeOlgey|r |cffc41e3aDérp|r
       * 0:30 - |cff33937fVollmer|r |cff3fc7ebMcbaguette|r
       * 1:00 - |cfff48cbaFrøkentut|r |cff33937fVollmer|r
       * etc..
       *
       * It's possible that with 10.2 tier set that you need to think a bit harder about every
       * third prescience, since it's extended, buuut for now I'll let people figure
       * that on out for themselves.
       */
      if (i === 0) {
        mrtPrescienceHelperNote += 'PREPULL - ';
      } else {
        mrtPrescienceHelperNote += intervalStart + ' - ';
      }
      mrtPrescienceHelperNote += top2Entries
        .map(([name]) => mrtColorMap.get(playerWhitelist.get(name) ?? '') + name + '|r')
        .join(' ');
      mrtPrescienceHelperNote += '\n';

      console.log('Top 4 Pumpers for interval', i + 1, 'are:', formattedEntries);

      content.push(
        <div key={i}>
          <p className="intervalTitle">
            Top 4 Pumpers for interval {intervalStart} - {intervalEnd}:
          </p>
          <ul className="intervalList">{formattedEntries}</ul>
        </div>,
      );
    }

    return content;
  }

  handleCopyClick = () => {
    navigator.clipboard.writeText(mrtPrescienceHelperNote);
  };

  statistic() {
    return (
      <LazyLoadStatisticBox
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.CORE(1)}
        loader={this.loadInterval.bind(this)}
        icon={<SpellIcon spell={SPELLS.EBON_MIGHT_BUFF_EXTERNAL} />}
        value={this.findTopPumpers()}
        label="Find optimal buff targets"
        tooltip={
          <>
            This is a tool to help you find the optimal buff targets for Ebon Might. It will show
            you the top 4 pumpers for each 30 second interval (27 with{' '}
            <SpellLink spell={TALENTS.INTERWOVEN_THREADS_TALENT} />)
            <br />
            This module will also produce a MRT note for prescience timings.
          </>
        }
      />
    );
  }
}

export default BuffTargetHelper;
