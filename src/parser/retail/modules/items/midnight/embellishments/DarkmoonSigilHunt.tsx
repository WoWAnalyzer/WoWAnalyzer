import EmbellishmentAnalyzer from '../../EmbellishmentAnalyzer';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import Spell from 'common/SPELLS/Spell';
import Events from 'parser/core/Events';
import StatTracker from 'parser/shared/modules/StatTracker';
import STAT, { getIcon, getName } from 'parser/shared/modules/features/STAT';
import UptimeBar from 'parser/ui/UptimeBar';
import SpellLink from 'interface/SpellLink';
import { formatDuration, formatPercentage } from 'common/format';

const STAT_RATING = 56;

const BUFFS = {
  [SPELLS.DARKMOON_SIGIL_HUNT_HASTE.id]: {
    spell: SPELLS.DARKMOON_SIGIL_HUNT_HASTE,
    stat: STAT.HASTE,
  },
  [SPELLS.DARKMOON_SIGIL_HUNT_CRIT.id]: {
    spell: SPELLS.DARKMOON_SIGIL_HUNT_CRIT,
    stat: STAT.CRITICAL_STRIKE,
  },
  [SPELLS.DARKMOON_SIGIL_HUNT_MASTERY.id]: {
    spell: SPELLS.DARKMOON_SIGIL_HUNT_MASTERY,
    stat: STAT.MASTERY,
  },
  [SPELLS.DARKMOON_SIGIL_HUNT_VERSATILITY.id]: {
    spell: SPELLS.DARKMOON_SIGIL_HUNT_VERSATILITY,
    stat: STAT.VERSATILITY,
  },
} satisfies Record<number, { spell: Spell; stat: STAT }>;

class DarkmoonSigilHunt extends EmbellishmentAnalyzer.withDependencies({
  ...EmbellishmentAnalyzer.dependencies,
  statTracker: StatTracker,
}) {
  procs = 0;
  private statRating = STAT_RATING;

  constructor(options: Options) {
    super(ITEMS.DARKMOON_SIGIL_HUNT, 'any-slot', options);
    if (!this.active) {
      return;
    }

    // Using two Darkmoon Sigil: Hunt embellishments doubles the stat gain
    if (this.getItemSlots(ITEMS.DARKMOON_SIGIL_HUNT.effectId, 'any-slot').length >= 2) {
      this.statRating *= 2;
    }

    const rating = this.statRating;

    this.deps.statTracker.add(SPELLS.DARKMOON_SIGIL_HUNT_HASTE.id, { haste: rating });
    this.deps.statTracker.add(SPELLS.DARKMOON_SIGIL_HUNT_CRIT.id, { crit: rating });
    this.deps.statTracker.add(SPELLS.DARKMOON_SIGIL_HUNT_MASTERY.id, { mastery: rating });
    this.deps.statTracker.add(SPELLS.DARKMOON_SIGIL_HUNT_VERSATILITY.id, { versatility: rating });

    this.addEventListener(
      Events.applybuff.to(SELECTED_PLAYER).spell(Object.values(BUFFS).map((b) => b.spell)),
      () => (this.procs += 1),
    );
  }

  statisticParts() {
    const entries = Object.values(BUFFS)
      .map((buff) => {
        const uptime = this.selectedCombatant.getBuffUptime(buff.spell.id);
        return { ...buff, uptime };
      })
      .filter((e) => e.uptime > 0);

    const totalUptime = entries.reduce((sum, e) => sum + e.uptime, 0);
    const totalUptimePercent = totalUptime / this.owner.fightDuration;

    return {
      tooltip: (
        <>
          {this.procCount(this.procs)} with {formatPercentage(totalUptimePercent, 1)}% total uptime.
          {entries.map((entry) => {
            const StatIcon = getIcon(entry.stat);
            const statName = getName(entry.stat)!.toLowerCase();
            const uptimePercent = entry.uptime / this.owner.fightDuration;
            return (
              <p key={entry.spell.id}>
                <SpellLink spell={entry.spell} /> gave <StatIcon /> <b>{this.statRating}</b>{' '}
                {statName} for <b>{formatDuration(entry.uptime)}</b> (
                {formatPercentage(uptimePercent, 1)}%)
              </p>
            );
          })}
        </>
      ),
      content: (
        <>
          {entries.map((entry) => {
            const StatIcon = getIcon(entry.stat);
            const statName = getName(entry.stat);
            const uptimePercent = entry.uptime / this.owner.fightDuration;
            return (
              <p key={entry.spell.id}>
                <StatIcon /> {Math.round(this.statRating * uptimePercent)}{' '}
                <small>{statName} over time</small>
              </p>
            );
          })}
          <UptimeBar
            uptimeHistory={entries
              .flatMap((entry) =>
                this.selectedCombatant.getBuffHistory(entry.spell.id).map((b) => ({
                  start: b.start,
                  end: b.end ?? this.owner.fight.end_time,
                })),
              )
              .sort((a, b) => a.start - b.start)}
            start={this.owner.fight.start_time}
            end={this.owner.fight.end_time}
          />
        </>
      ),
    };
  }
}

export default DarkmoonSigilHunt;
