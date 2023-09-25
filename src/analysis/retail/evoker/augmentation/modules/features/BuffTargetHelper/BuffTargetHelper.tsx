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
import { SubSection } from 'interface/guide';
import { SpellLink } from 'interface';
import LazyLoadGuideSection from './LazyLoadGuideSection';

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
  408682, // Bomb dispenser
  408694, // Bomb dispenser
  401324, // Pocket Anvil
  401306, // Pocket Anvil
  401422, // Vessel (Shadow Spike)
  401428, // Vessel (Ravenous Shadowflame)
  418774, // Mirror
  400223, // Thorns of Iron
  322109, // Touch of Death
  124280, // Touch of Karma
  184689, // Shield of Vengeance
  379403, // Toxic Thorn Footwraps
  408791, // Ashkandur
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

  /**
   * @key Player Name
   * @value Array of damage for each interval
   */
  playerDamageMap: Map<string, number[]> = new Map();

  /**
   * Used to only grab DPS players, excluding Augmentation
   * We use ClassName so we can apply colors to our output
   * @key Player Name
   * @value ClassName
   */
  playerWhitelist: Map<string, string> = new Map();

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

          this.playerWhitelist.set(player.name, className);
        }
      });
    });
  }

  /** Generate filter based on black list and whitelist */
  getFilter() {
    const playerNames = Array.from(this.playerWhitelist.keys());
    const nameFilter = playerNames
      .map((name) => `source.name="${name}" OR source.owner.name="${name}"`)
      .join(' OR ');

    const abilityFilter = blacklist.map((id) => `ability.id=${id}`).join(' OR ');

    const filter = `not(${abilityFilter}) AND (${nameFilter})`;

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
    if (this.playerDamageMap.size > 0) {
      return;
    }

    let currentTime = this.fightStart;
    let index = 0;
    while (currentTime < this.fightEnd) {
      index += 1;
      await this.getDamage(currentTime, index);
      currentTime += this.interval;
    }
  }

  async getDamage(currentTime: number, index: number) {
    return fetchWcl(`report/tables/damage-done/${this.owner.report.code}`, {
      start: currentTime,
      end: currentTime + this.interval,
      filter: this.getFilter(),
    }).then((json) => {
      const data = json as WCLDamageDoneTableResponse;
      data.entries.forEach((entry) => {
        if (this.playerWhitelist.has(entry.name)) {
          if (!this.playerDamageMap.get(entry.name)) {
            this.playerDamageMap.set(entry.name, [entry.total]);
          } else {
            this.playerDamageMap.get(entry.name)?.push(entry.total);
          }
        }
      });

      /** Check if a player didn't get an entry
       * This happens when they either:
       * 1. fall asleep at the wheel
       * 2. deadge
       * 3. taking their sweet time with mechanics
       *
       * This causes issues when they potentially later get ressed
       * and their damage entry now no longer mathces up
       * we fix this by manually pushing in a zero value.
       */
      for (const [name] of this.playerWhitelist) {
        const damageEntries = this.playerDamageMap.get(name);

        if (!damageEntries) {
          this.playerDamageMap.set(name, [0]);
        } else if (damageEntries.length < index) {
          damageEntries.push(0);
        }
      }
    });
  }

  findTopPumpers() {
    /** Don't run if no player damage is found
     * Essentially prevents it from running when page is loaded
     * and only when load button is pressed
     */
    if (this.playerDamageMap.size === 0) {
      return;
    }

    const topPumpersData = this.getTopPumpersData();
    const defaultTargets = this.getDefaultTargets(topPumpersData);
    const tableContent = this.renderTableContent(topPumpersData, defaultTargets);

    return tableContent;
  }

  getTopPumpersData() {
    const topPumpersData = [];
    for (let i = 0; i < (this.fightEnd - this.fightStart) / this.interval; i += 1) {
      const sortedEntries = [...this.playerDamageMap.entries()].sort((a, b) => b[1][i] - a[1][i]);
      const top4 = sortedEntries.slice(0, 4);
      topPumpersData.push(top4);
    }
    return topPumpersData;
  }

  getDefaultTargets(topPumpersData: [string, number[]][][]) {
    const nameCounts = new Map();
    topPumpersData.flat().forEach(([name]) => {
      nameCounts.set(name, (nameCounts.get(name) || 0) + 1);
    });
    const sortedNames = [...nameCounts.entries()].sort((a, b) => b[1] - a[1]);
    return sortedNames.slice(0, 2).map((entry) => entry[0]);
  }

  renderTableContent(topPumpersData: [string, number[]][][], defaultTargets: any[]) {
    const tableRows = [];
    const headerRow = (
      <tr>
        <th>Time</th>
        <th>Player - Damage</th>
        <th>Player - Damage</th>
        <th>Player - Damage</th>
        <th>Player - Damage</th>
      </tr>
    );

    for (let i = 0; i < topPumpersData.length; i += 1) {
      const intervalStart = formatDuration(i * this.interval);
      const intervalEnd = formatDuration(
        Math.min((i + 1) * this.interval, this.fightEnd - this.fightStart),
      );

      const formattedEntriesTable = topPumpersData[i].map(([name, values]) => (
        <td key={name}>
          <span className={this.playerWhitelist.get(name)}>
            {name} - {formatNumber(values[i])}
          </span>
        </td>
      ));

      tableRows.push(
        <tr key={i}>
          <td>{`${intervalStart} - ${intervalEnd}`}</td>
          {formattedEntriesTable}
        </tr>,
      );

      /** Determine whether or not to mark the interval as important
       * Logic for now is if both default targets are missing
       * we mark it as important.
       * We could also do some mathies with checking dammie diffies
       * buuuut, we'll just do it this way */
      const isImportant = !topPumpersData[i].some(([name]) => defaultTargets.includes(name));
      const top2Entries = topPumpersData[i].slice(0, 2);

      this.addEntryToMRTNote(top2Entries, i, intervalStart, isImportant);
    }

    /** Finalize MRT note */
    this.mrtPrescienceHelperNote =
      'prescGlowsStart \n' +
      'defaultTargets - ' +
      mrtColorMap.get(this.playerWhitelist.get(defaultTargets[0]) ?? '') +
      defaultTargets[0] +
      '|r ' +
      mrtColorMap.get(this.playerWhitelist.get(defaultTargets[1]) ?? '') +
      defaultTargets[1] +
      '|r \n' +
      this.mrtPrescienceHelperNote +
      'prescGlowsEnd';

    const button = (
      <button className="button" onClick={this.handleCopyClick}>
        Copy MRT note to clipboard
      </button>
    );

    return (
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
  }

  /** Used for HenryG WA
   * https://wago.io/yrmx6ZQSG */
  /**
   * Create a MRT note for who to Prescience and when
   * This is pretty basic in design for now, but it will do as advertised.
   *
   * TODO: words (?)
   *
   * Format is basicly:
   * prescGlowsStart
   * defaultTargets - |cff3fc7ebSheeper|r |cffffffffXanapriest|r
   * PREPULL - |cffc41e3aDérp|r |cff3fc7ebSheeper|r
   * 0:30 - |cff33937fVollmer|r |cfffff468Zylv|r *
   * 1:00 - |cffffffffXanapriest|r |cffc69b6dDolanpepe|r
   * ...etc...
   * prescGlowsEnd
   */
  addEntryToMRTNote(
    top2Pumpers: [string, number[]][],
    index: number,
    interval: string,
    important: boolean = false,
  ) {
    if (index === 0) {
      this.mrtPrescienceHelperNote += 'PREPULL - ';
    } else {
      this.mrtPrescienceHelperNote += interval + ' - ';
    }
    this.mrtPrescienceHelperNote += top2Pumpers
      .map(([name]) => mrtColorMap.get(this.playerWhitelist.get(name) ?? '') + name + '|r')
      .join(' ');
    if (important) {
      this.mrtPrescienceHelperNote += ' *';
    }
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
            <p>
              This module will also produce a MRT note for prescience timings.
              <br />
              The note fully supports the <a href="https://wago.io/yrmx6ZQSG">
                Prescience Helper
              </a>{' '}
              WeakAura made by <b>HenryG</b>.
            </p>
          </div>
          <div>
            <LazyLoadGuideSection
              loader={this.loadInterval.bind(this)}
              value={this.findTopPumpers.bind(this)}
              className="button"
            />
          </div>
        </div>
      </SubSection>
    );
  }
}

export default BuffTargetHelper;
