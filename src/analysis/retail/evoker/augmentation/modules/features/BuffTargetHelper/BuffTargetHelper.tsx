import TALENTS from 'common/TALENTS/evoker';
import SPELLS from 'common/SPELLS/evoker';
import { WCLDamageDoneTableResponse } from 'common/WCL_TYPES';
import fetchWcl from 'common/fetchWclApi';
import { formatDuration, formatMilliseconds, formatNumber } from 'common/format';
import classColor from 'game/classColor';
import ROLES from 'game/ROLES';
import SPECS from 'game/SPECS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  FightEndEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import Combatants from 'parser/shared/modules/Combatants';
import { isMythicPlus } from 'common/isMythicPlus';
import '../../Styling.scss';
import { SubSection } from 'interface/guide';
import { SpellLink } from 'interface';
import LazyLoadGuideSection from 'analysis/retail/evoker/shared/modules/components/LazyLoadGuideSection';
import { PRESCIENCE_BASE_DURATION_MS, TIMEWALKER_BASE_EXTENSION } from '../../../constants';
import BuffTargetHelperWarningLabel from './BuffTargetHelperWarningLabel';
import Toggle from 'react-toggle';
import { TIERS } from 'game/TIERS';
import StatTracker from 'parser/shared/modules/StatTracker';
import BuffTargetHelperInfoLabel from './BuffTargetHelperInfoLabel';
import { ABILITY_BLACKLIST, ABILITY_NO_BOE_SCALING } from '../../util/abilityFilter';

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

const NO_EM_SCALING_MODIFIER = 0.5;

type DamageTables = {
  normalDamage: WCLDamageDoneTableResponse;
  noEbonDamage: WCLDamageDoneTableResponse;
};

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
    stats: StatTracker,
  };
  protected combatants!: Combatants;
  protected stats!: StatTracker;

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
  fightStartDelay: number = 4_000;
  fightEnd: number = this.owner.fight.end_time;
  prescienceHelperMrtNote: string = '';
  mrtFourTargetPrescienceHelperNote: string = '';
  // If we have 4pc we need to account for long prescience
  has4Pc =
    this.selectedCombatant.has4PieceByTier(TIERS.DF3) ||
    this.selectedCombatant.has4PieceByTier(TIERS.DF4);

  filterBossDamage: boolean = false;
  nameFilter: string = '';
  bossFilter: string = this.owner.report.enemies
    .filter((enemy) => enemy.subType === 'Boss')
    .map((enemy) => `${enemy.guid}`)
    .join(',');
  abilityBlacklist: string = [...ABILITY_BLACKLIST].join(', ');
  abilityFilter = [...ABILITY_NO_BOE_SCALING].join(', ');

  ebonApplyTimestamps: number[] = [];
  ebonRemoveTimestamps: number[] = [];

  constructor(options: Options) {
    super(options);
    /** No need to show this in dungeon runs, for obvious reasons */
    this.active = !isMythicPlus(this.owner.fight);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.EBON_MIGHT_BUFF_PERSONAL),
      this.onEbonApply,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.EBON_MIGHT_BUFF_PERSONAL),
      this.onEbonRefresh,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.EBON_MIGHT_BUFF_PERSONAL),
      this.onEbonRemove,
    );
    this.addEventListener(Events.fightend, this.onEbonRemoveFightEnd);
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
          this.playerWhitelist.set(player.name, classColor(player));
          this.nameFilter +=
            this.nameFilter.length === 0 ? `"${player.name}"` : `,"${player.name}"`;
        }
      });
    });
  }

  onEbonApply(event: ApplyBuffEvent) {
    this.ebonApplyTimestamps.push(event.timestamp);
  }

  onEbonRefresh(event: RefreshBuffEvent) {
    this.ebonRemoveTimestamps.push(event.timestamp);
    this.ebonApplyTimestamps.push(event.timestamp);
  }

  onEbonRemove(event: RemoveBuffEvent) {
    this.ebonRemoveTimestamps.push(event.timestamp);
  }

  onEbonRemoveFightEnd(event: FightEndEvent) {
    if (this.selectedCombatant.hasBuff(SPELLS.EBON_MIGHT_BUFF_PERSONAL)) {
      this.ebonRemoveTimestamps.push(event.timestamp);
    }
  }

  /** Generate filter based on our ability filters */
  getFilter(noEbonScaling: boolean) {
    let filter = `(not ability.id in(${this.abilityBlacklist})) 
    AND (${noEbonScaling ? '' : 'not'} ability.id in(${this.abilityFilter}))
    AND (source.name in (${this.nameFilter}) OR source.owner.name in (${this.nameFilter}))`;

    if (this.filterBossDamage) {
      filter += ` AND (target.id in(${this.bossFilter}))`;
    }
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

    // Start 4 seconds in since you start the fight with 2x Prescience -> Ebon Might
    // This will also show MUCH better value targets
    const fetchPromises: Promise<DamageTables>[] = [];
    for (let i = 0; i < this.ebonApplyTimestamps.length; i += 1) {
      if (this.ebonApplyTimestamps[i] && this.ebonRemoveTimestamps[i]) {
        fetchPromises.push(
          this.getDamage(this.ebonApplyTimestamps[i], this.ebonRemoveTimestamps[i]),
        );
      }
    }

    const result = await Promise.all(fetchPromises);

    result.forEach((res, idx) => {
      const normalDamage = res.normalDamage;
      const noEbonDamage = res.noEbonDamage;

      normalDamage.entries.forEach((entry) => {
        if (this.playerWhitelist.has(entry.name)) {
          if (!this.playerDamageMap.get(entry.name)) {
            this.playerDamageMap.set(entry.name, [entry.total]);
          } else {
            this.playerDamageMap.get(entry.name)?.push(entry.total);
          }
        }
      });

      noEbonDamage.entries.forEach((entry) => {
        if (this.playerWhitelist.has(entry.name)) {
          const currentPlayerMap = this.playerDamageMap.get(entry.name);
          if (!currentPlayerMap) {
            this.playerDamageMap.set(entry.name, [entry.total * NO_EM_SCALING_MODIFIER]);
          } else {
            currentPlayerMap[idx] += entry.total * NO_EM_SCALING_MODIFIER;
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
       * and their damage entry now no longer matches up
       * we fix this by manually pushing in a zero value.
       */
      for (const [name] of this.playerWhitelist) {
        const damageEntries = this.playerDamageMap.get(name);

        if (!damageEntries) {
          this.playerDamageMap.set(name, [0]);
        } else if (damageEntries.length < idx + 1) {
          damageEntries.push(0);
        }
      }
    });
  }

  async getDamage(currentTime: number, endTime: number): Promise<DamageTables> {
    const normalDamage = await fetchWcl<WCLDamageDoneTableResponse>(
      `report/tables/damage-done/${this.owner.report.code}`,
      {
        start: currentTime,
        end: endTime,
        filter: this.getFilter(false),
      },
    );
    const noEbonDamage = await fetchWcl<WCLDamageDoneTableResponse>(
      `report/tables/damage-done/${this.owner.report.code}`,
      {
        start: currentTime,
        end: endTime,
        filter: this.getFilter(true),
      },
    );

    return { normalDamage, noEbonDamage };
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
    const top4PumpersData = this.getTop4Pumpers(topPumpersData);
    const default2Targets = this.getDefaultTargets(top4PumpersData);
    const default4Targets = this.getDefaultTargets(top4PumpersData, 4);
    const tableContent = this.renderTableContent(topPumpersData, default2Targets, top4PumpersData);
    this.generateMRTNoteHenryG(top4PumpersData, default4Targets);

    return tableContent;
  }

  getTopPumpersData() {
    const topPumpersData = [];
    for (let i = 0; i < (this.fightEnd - this.fightStart) / this.interval; i += 1) {
      const sortedEntries = [...this.playerDamageMap.entries()].sort((a, b) => b[1][i] - a[1][i]);
      topPumpersData.push(sortedEntries);
    }
    return topPumpersData;
  }

  getTop4Pumpers(topPumpersData: [string, number[]][][]) {
    const top4PumpersData = [];
    for (let i = 0; i < topPumpersData.length; i += 1) {
      const top4 = topPumpersData[i].slice(0, 4);
      top4PumpersData.push(top4);
    }
    return top4PumpersData;
  }

  getDefaultTargets(top4PumpersData: [string, number[]][][], amount: number = 2): string[] {
    const nameSums = new Map();

    top4PumpersData.flat().forEach(([name, values]) => {
      const currentSum = nameSums.get(name) || 0;
      const sum = currentSum + values.reduce((a, b) => a + b, 0);

      nameSums.set(name, sum);
    });

    const sortedNames = [...nameSums.entries()].sort((a, b) => b[1] - a[1]);

    return sortedNames.slice(0, amount).map((entry) => entry[0]);
  }

  renderTableContent(
    topPumpersData: [string, number[]][][],
    defaultTargets: string[],
    top4PumpersData: [string, number[]][][],
  ) {
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
      const intervalStart = this.owner.formatTimestamp(this.ebonApplyTimestamps[i]);
      const intervalEnd = this.owner.formatTimestamp(this.ebonRemoveTimestamps[i]);

      const formattedEntriesTable = top4PumpersData[i].map(([name, values]) => (
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

      // We need mm:ss format, and this is the easiest way to do it
      const noteIntervalTimer = formatMilliseconds(i * this.interval + this.fightStartDelay).split(
        '.',
      )[0];
      this.addEntryToFourTargetMRTNote(topPumpersData[i], i, noteIntervalTimer);
    }

    /** Finalize Four Target MRT note */
    // Constructing the header and footer
    const augName = this.selectedCombatant.name + `|r\n`;
    const header = `"\nAugBuffStart\naug |cff33937f` + augName;
    const footer = `AugBuffEnd {v2.0} \n"\n`;
    // Combining header, main note content, and footer
    this.mrtFourTargetPrescienceHelperNote =
      header + this.mrtFourTargetPrescienceHelperNote + footer;

    return (
      <div>
        <div className="table-container">
          <table>
            <tbody className="buff-target-table">
              {headerRow}
              {tableRows}
            </tbody>
          </table>
        </div>
        {/*         <div className="button-container">
          <button className="button" onClick={this.handlePrescienceHelperCopyClick}>
            Copy Prescience Helper MRT note
          </button>
          <button className="button" onClick={this.handleFourTargetCopyClick}>
            Copy Frame Glow MRT note
          </button>
        </div> */}
      </div>
    );
  }

  /**
   * Create a MRT note for who to Prescience and when
   *
   * The format is made to support the WA
   * Created by HenryG
   * https://wago.io/yrmx6ZQSG
   *
   * Format is basically:
   * prescGlowsStart
   * defaultTargets - |cff8788eeOlgey|r |cfffff468Zylv|r
   * PULL - |cffc41e3aDérp|r |cffff7c0aMckulling|r
   * 0:12 - |cffff7c0aLøutus|r
   * 0:23 - |cff8788eeOlgey|r
   * 0:34 - |cffff7c0aMckulling|r
   * ...etc...
   * prescGlowsEnd
   */
  generateMRTNoteHenryG(top4Pumpers: [string, number[]][][], defaultTargets: string[]) {
    // Initialize the note with the default targets
    const defaultTargetsNote = defaultTargets
      .map((player) => mrtColorMap.get(this.playerWhitelist.get(player) ?? '') + player + '|r')
      .join(' ');
    let newNote = 'prescGlowsStart \ndefaultTargets - ' + defaultTargetsNote + '\n';

    const prescienceCooldown =
      12_000 * (this.selectedCombatant.hasTalent(TALENTS.INTERWOVEN_THREADS_TALENT) ? 0.9 : 1);
    // First two casts in fight should be 2x Prescience
    // We are assuming that count of 3 is long prescience so we go 3->1->2(start)
    let prescienceCount = 2;
    // Start 2 seconds in to mimic what HenryG does
    let curTime = prescienceCooldown + 2_000;

    const intervals = top4Pumpers.length;
    // Normalize fight length to be divisible by intervals
    // This makes logic infinitely easier
    const fightLength =
      this.fightEnd - this.fightStart - ((this.fightEnd - this.fightStart) % intervals);

    const prescienceDuration =
      PRESCIENCE_BASE_DURATION_MS *
      (1 + TIMEWALKER_BASE_EXTENSION + this.stats.currentMasteryPercentage);

    /** Playername, expiration time */
    const prescienceMap = new Map<string, number>();

    // Grab the top 2 pumpers for the pull
    newNote +=
      'PULL - ' +
      mrtColorMap.get(this.playerWhitelist.get(top4Pumpers[0][0][0]) ?? '') +
      top4Pumpers[0][0][0] +
      '|r ' +
      mrtColorMap.get(this.playerWhitelist.get(top4Pumpers[0][1][0]) ?? '') +
      top4Pumpers[0][1][0] +
      '|r \n';

    // Add them to the map
    prescienceMap.set(top4Pumpers[0][0][0], prescienceDuration * (this.has4Pc ? 2 : 1));
    prescienceMap.set(top4Pumpers[0][1][0], 1_000 + prescienceDuration); // Takes roughly 1 second to cast 2nd Prescience

    while (curTime < fightLength) {
      const curInterval = intervals - Math.round((fightLength - curTime) / this.interval) - 1;
      const hasLongPrescience = prescienceCount === 3 && this.has4Pc;
      let intervalToCheck = hasLongPrescience ? curInterval + 2 : curInterval + 1;

      let target: string | undefined;
      while (!target && intervalToCheck >= 0) {
        // If the interval we want to check is empty, keep going to previous
        // Ones until we find one that isn't
        // These last ones are kinda just filler since we don't have future data
        if (!top4Pumpers[intervalToCheck] && intervalToCheck > 0) {
          intervalToCheck -= 1;
          continue;
        }

        const targetInterval = [...top4Pumpers[intervalToCheck]];

        while (targetInterval.length) {
          // Keep going through the interval until we find a target that isn't
          // Already buffed by prescience - overriding loses uptime
          // Technically we should check for damage and stuff
          // But data structure is bad so cba for now
          // TODO: come back to this, maybe, idk
          const nextTarget = targetInterval.shift()![0];

          const curPrescience = prescienceMap.get(nextTarget);
          if (!curPrescience || curPrescience < curTime) {
            /* console.log(
              `Found target ${nextTarget} at ${curTime} for interval ${curInterval} checked ${intervalToCheck} prescienceCount ${prescienceCount}}`,
            ); */
            prescienceMap.set(
              nextTarget,
              curTime + prescienceDuration * (hasLongPrescience ? 2 : 1),
            );
            target = nextTarget;
            break;
          }
        }
      }

      if (target) {
        newNote += `${formatDuration(curTime)} - ${
          mrtColorMap.get(this.playerWhitelist.get(target) ?? '') + target + '|r'
        } \n`;
        prescienceCount = prescienceCount === 3 ? 1 : prescienceCount + 1;
      }

      curTime += prescienceCooldown;
    }

    /** Finalize TwoTargetMRT note */
    newNote += 'prescGlowsEnd';
    this.prescienceHelperMrtNote = newNote;
  }

  /**
   * Create a  4 Target MRT note for who to Prescience and when
   *
   * The format is made to support the WA
   * Created by Zephy
   * https://wago.io/KP-BlDV58
   *
   * Format is basically:
   * "
   * AugBuffStart
   * aug |cff33937fPantsdormu|r
   * {time:00:00}00:00 {#G|T#} |cfffff468Jackòfblades|r !1 |cffc41e3aCerknight|r !2 |cffaad372Athënâ|r !3 |cffa330c9Jabbernacky|r !4
   * {time:00:30}00:30 {#G|T#} |cff8788eeJustinianlok|r !1 |cffaad372Steelshunter|r !2 |cffaad372Athënâ|r !3 |cff0070ddFoxmulders|r !4
   * ...etc...
   * AugBuffEnd {v2.0}
   * "
   */
  addEntryToFourTargetMRTNote(
    topPumpers: [string, number[]][],
    intervalIndex: number,
    intervalTimer: string,
  ) {
    this.mrtFourTargetPrescienceHelperNote += `{time:${intervalTimer}}${intervalTimer} {#G|T#} `;

    // You can only buff 2 people on pull
    const pumpers = intervalIndex === 0 ? topPumpers.slice(0, 2) : topPumpers.slice(0, 4);

    this.mrtFourTargetPrescienceHelperNote += pumpers
      .map(([name], idx) => {
        const colorCode = mrtColorMap.get(this.playerWhitelist.get(name) ?? '') || '';
        const formattedName = `${colorCode}${name}|r`;
        return `${formattedName} !${idx + 1}`;
      })
      .join(' ');
    this.mrtFourTargetPrescienceHelperNote += '\n';
  }

  handlePrescienceHelperCopyClick = () => {
    navigator.clipboard.writeText(this.prescienceHelperMrtNote);
  };
  handleFourTargetCopyClick = () => {
    navigator.clipboard.writeText(this.mrtFourTargetPrescienceHelperNote);
  };

  bossFilterToggleButton: JSX.Element = (
    <div className="filter-container">
      <b>Only show boss damage</b>
      <div>
        <Toggle
          onClick={() => {
            this.filterBossDamage = !this.filterBossDamage;
          }}
        />
      </div>
    </div>
  );

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
              each of your Ebon Might windows. Refreshing Ebon Might is counted as a new window.
            </p>
            <p>
              Damage events that doesn't get amplified by your buffs will be ignored. <br />
              Tanks, Healers and other Augmentations are not included. <br />
            </p>
            {/*             <p>
              This module will also produce a note for{' '}
              <a href="https://www.curseforge.com/wow/addons/method-raid-tools">
                Method Raid Tools
              </a>{' '}
              that helps with <SpellLink spell={TALENTS.PRESCIENCE_TALENT} /> timings.
              <br />
              Make sure to click the copy button for either the{' '}
              <a href="https://wago.io/yrmx6ZQSG">Prescience Helper</a> WeakAura made by{' '}
              <b>HenryG</b> or the <a href="https://wago.io/KP-BlDV58">Frame Glows</a> WeakAura made
              by <b>Zephy</b> based on which Weak Aura you use.
            </p> */}

            {this.has4Pc && <BuffTargetHelperInfoLabel />}
          </div>
          <div>
            <BuffTargetHelperWarningLabel />
            <LazyLoadGuideSection
              loader={this.loadInterval.bind(this)}
              value={this.findTopPumpers.bind(this)}
              element={this.bossFilterToggleButton}
            />
          </div>
        </div>
      </SubSection>
    );
  }
}

export default BuffTargetHelper;
