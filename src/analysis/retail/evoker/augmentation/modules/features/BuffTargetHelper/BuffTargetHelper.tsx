import { i18n } from '@lingui/core';
import TALENTS from 'common/TALENTS/evoker';
import { WCLDamageDoneTableResponse } from 'common/WCL_TYPES';
import fetchWcl from 'common/fetchWclApi';
import { formatDuration, formatNumber } from 'common/format';
import ROLES from 'game/ROLES';
import SPECS from 'game/SPECS';
import Analyzer, { Options } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import Combatants from 'parser/shared/modules/Combatants';
import { isFightDungeon } from 'common/isFightDungeon';
import './BuffTargetHelper.scss';
import BuffTargetHelperSection from './BuffTargetHelperSection';
import { SubSection } from 'interface/guide';
import { SpellLink } from 'interface';

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
const blacklist: number[] = [
  402583, // Beacon
  408671, // Bomb dispenser
  401303, // Pocket Anvil
  401395, // Vessel
  418774, // Mirror
];

/**
 * So managing your buffs is essentially what Augmentation boils down to.
 * But knowing who to buff and when can be tricky to figure out at a glance.
 * Given multiple factors such as time intervals (Ebon Might timings), filtering
 * off damage that isn't amplified by buffs, intimate knowledge about different specs
 * where they perform, where they don't, player skill, etc.
 *
 * The aim for this module is to streamline the process, by providing a list of the targets
 * that would have been best to buff in a given time interval.
 *
 * Along with this we will provide the user with a MRT note export that can be used with
 * various WA's to help keep track of who to Prescience.
 *
 * We don't provide analysis on actual gameplay in this module, this is strictly meant
 * to assist people in making more informed decisions about who to buff at what times in
 * a given boss fight.
 *
 * Hopefully with this information being easily available, players will be able to use this
 * data and predict who will be high performing target on other fights as well.
 * (Assuming you are playing with the same people again eg. reclears/prog).
 */
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
  mrtPrescienceHelperNote: string = '';

  constructor(options: Options) {
    super(options);
    /** No need to show this in dungeon runs, for obvious reasons */
    this.active = !isFightDungeon(this.owner.fight);

    /** Populate our whitelist */
    this.addEventListener(Events.fightend, () => {
      /** Clear the maps, we do this since otherwise it has a tendency
       * to keep the values from a previous fight if you swap around without
       * refreshing the browser */
      playerDamageMap.clear();
      playerWhitelist.clear();

      const players = Object.values(this.combatants.players);
      players.forEach((player) => {
        if (!player.spec) {
          return;
        }
        if (
          player.spec.role !== ROLES.HEALER &&
          player.spec.role !== ROLES.TANK &&
          player.spec !== SPECS.AUGMENTATION_EVOKER
        ) {
          const i18nClassName = player.spec.className ? i18n._(player.spec.className) : '';
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
    /** If we already populated the map no need to do it again
     * eg. someone went to stats and loaded the component, then
     * went to overview and back to stats and loaded it again.
     * no need to re-query WCL events
     */
    if (playerDamageMap.size > 0) {
      return;
    }

    let currentTime = this.fightStart;

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

    const tableRows: any[] = [];

    const headerRow = (
      <tr>
        <th>Time</th>
        <th>Player - Damage</th>
        <th>Player - Damage</th>
        <th>Player - Damage</th>
        <th>Player - Damage</th>
      </tr>
    );

    const button = (
      <button className="button" onClick={this.handleCopyClick}>
        Copy MRT note to clipboard
      </button>
    );

    /** Find the top 4 pumpers for each interval */
    for (let i = 0; i < (this.fightEnd - this.fightStart) / this.interval; i += 1) {
      const sortedEntries = [...playerDamageMap.entries()].sort((a, b) => {
        /**Ensure that both arrays have the same length before comparing
         * We need to do this check due how we set up our data structure.
         * If players die early they do no damage, and therefor dont generate
         * extra entries, therefor this check is needed.
         */
        if (a[1].length === b[1].length) {
          return b[1][i] - a[1][i];
        }

        // Handle the case where arrays have different lengths
        return b[1].length - a[1].length;
      });

      // Get the top 4 entries, used for the table.
      const top4Entries = sortedEntries.slice(0, 4);
      /** Get the top 2 entries, used for the MRT note.
       * It might make sense to set to top 3 for T31 2pc but giving 3 targets that needs
       * the buff at 30s intervals would infer perfect gameplay with zero time allowed
       * between individual Prescience casts which is unrealistic in actual gameplay
       * it could potentially make sense to give options, but at that point I feel like
       * the player should manually adapt the note themselves. */
      const top2Entries = sortedEntries.slice(0, 2);

      const formattedEntriesTable = top4Entries.map(([name, values]) => (
        <td key={name}>
          <span className={playerWhitelist.get(name)}>
            {name} - {formatNumber(values[i])}
          </span>
        </td>
      ));

      const intervalStart = formatDuration(i * this.interval);
      let intervalEnd = formatDuration((i + 1) * this.interval);
      if (intervalEnd > formatDuration(this.fightEnd - this.fightStart)) {
        intervalEnd = formatDuration(this.fightEnd - this.fightStart);
      }

      tableRows.push(
        <tr key={i}>
          <td>{`${intervalStart} - ${intervalEnd}`}</td>
          {formattedEntriesTable}
        </tr>,
      );

      this.addEntryToMRTNote(top2Entries, i, intervalStart);
    }

    const tableContent = (
      <div>
        <table>
          <tbody className="table">
            {headerRow}
            {tableRows}
          </tbody>
        </table>
        <br />
        {button}
      </div>
    );
    return tableContent;
  }

  /**
   * Create a MRT note for who to Prescience and when
   * This is pretty basic in design for now, but it will do as advertised.
   *
   * Format is basicly:
   * PREPULL - |cff8788eeOlgey|r |cffc41e3aDérp|r
   * 0:30 - |cff33937fVollmer|r |cff3fc7ebMcbaguette|r
   * 1:00 - |cfff48cbaFrøkentut|r |cff33937fVollmer|r
   * etc..
   */
  addEntryToMRTNote(top2Pumpers: [string, number[]][], index: number, interval: string) {
    if (index === 0) {
      this.mrtPrescienceHelperNote += 'PREPULL - ';
    } else {
      this.mrtPrescienceHelperNote += interval + ' - ';
    }
    this.mrtPrescienceHelperNote += top2Pumpers
      .map(([name]) => mrtColorMap.get(playerWhitelist.get(name) ?? '') + name + '|r')
      .join(' ');
    this.mrtPrescienceHelperNote += '\n';
  }

  handleCopyClick = () => {
    navigator.clipboard.writeText(this.mrtPrescienceHelperNote);
  };

  guideSubsection(): JSX.Element | null {
    if (!this.active) {
      return null;
    }

    return (
      <SubSection title="Buff Helper">
        <div className="grid">
          <div>
            <p>
              This module will help you with finding the optimal buff targets for{' '}
              <SpellLink spell={TALENTS.EBON_MIGHT_TALENT} /> and{' '}
              <SpellLink spell={TALENTS.PRESCIENCE_TALENT} />. It will show you the top 4 DPS for
              each 30 second interval (27 with{' '}
              <SpellLink spell={TALENTS.INTERWOVEN_THREADS_TALENT} /> talented)
            </p>
            <p>
              Damage events that doesn't get amplified by your buffs will be ignored. <br />
              Tanks, Healers and other Augmentations are not included. <br />
              Phases are also not accounted for for now.
            </p>
            <p>This module will also produce a MRT note for prescience timings.</p>
          </div>
          <div>
            <BuffTargetHelperSection
              loader={this.loadInterval.bind(this)}
              value={this.findTopPumpers.bind(this)}
            />
          </div>
        </div>
      </SubSection>
    );
  }
}

export default BuffTargetHelper;
