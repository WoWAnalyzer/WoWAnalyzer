import EmbellishmentAnalyzer from '../../EmbellishmentAnalyzer';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import ITEMS from 'common/ITEMS';
import Events, { ApplyBuffEvent, DeathEvent, EventType, FightEndEvent } from 'parser/core/Events';
import SPELLS from 'common/SPELLS';
import Spell from 'common/SPELLS/Spell';
import STAT, { getIcon, getName } from 'parser/shared/modules/features/STAT';
import { formatDuration, formatPercentage } from 'common/format';
import SpellLink from 'interface/SpellLink';
import StatTracker, { StatBuff } from 'parser/shared/modules/StatTracker';

// stat gain doesn't appear to scale with item level or embellishment rank
const STAT_GAIN_PER_STACK = 89;
const BUFFS = {
  [SPELLS.DARKMOON_SIGIL_ASCENSION_CRIT.id]: {
    spell: SPELLS.DARKMOON_SIGIL_ASCENSION_CRIT,
    stat: STAT.CRITICAL_STRIKE,
  },
  [SPELLS.DARKMOON_SIGIL_ASCENSION_HASTE.id]: {
    spell: SPELLS.DARKMOON_SIGIL_ASCENSION_HASTE,
    stat: STAT.HASTE,
  },
  [SPELLS.DARKMOON_SIGIL_ASCENSION_MASTERY.id]: {
    spell: SPELLS.DARKMOON_SIGIL_ASCENSION_MASTERY,
    stat: STAT.MASTERY,
  },
  [SPELLS.DARKMOON_SIGIL_ASCENSION_VERSATILITY.id]: {
    spell: SPELLS.DARKMOON_SIGIL_ASCENSION_VERSATILITY,
    stat: STAT.VERSATILITY,
  },
} satisfies Record<number, { spell: Spell; stat: STAT }>;

interface Ascendance {
  startTime: number;
  endTime?: number;
  spell: Spell;
  intensity: number;
  stat: STAT;
}

class DarkmoonSigilAscension extends EmbellishmentAnalyzer.withDependencies({
  ...EmbellishmentAnalyzer.dependencies,
  statTracker: StatTracker,
}) {
  private statGainPerStack: number = STAT_GAIN_PER_STACK;
  private intensity: number = 0;
  private history: Ascendance[] = [];

  constructor(options: Options) {
    super(ITEMS.DARKMOON_SIGIL_ASCENSION, 'any-slot', options);
    if (!this.active) {
      return;
    }

    // using two darkmoon sigil ascension embellishments or a writhing armor patch doubles the stats gained per stack
    if (
      this.getItemSlots(ITEMS.DARKMOON_SIGIL_ASCENSION.effectId, 'any-slot').length === 2 ||
      this.getItemSlots(ITEMS.WRITHING_ARMOR_BANDING.effectId, 'any-slot').length === 1
    ) {
      this.statGainPerStack *= 2;
    }

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(Object.values(BUFFS).map((buff) => buff.spell)),
      this.onApply,
    );
    // all stacks are lost on death
    [Events.fightend, Events.death].forEach((filter) => {
      this.addEventListener(filter.by(SELECTED_PLAYER), this.onFinalise);
    });
  }

  onApply(event: ApplyBuffEvent) {
    /** every ~8s the stat provided rotates and the current buff falls off. A new buff is then applied at the next level of intensity */
    if (this.intensity < 10) {
      this.intensity += 1;
    }

    const buff = BUFFS[event.ability.guid];
    if (this.currentBuff?.intensity !== this.intensity || this.currentBuff?.stat !== buff.stat) {
      const statBuff: StatBuff = {};

      if (this.currentBuff) {
        this.currentBuff.endTime = event.timestamp;
        this.addStatChange(
          statBuff,
          this.currentBuff.stat,
          -this.currentBuff.intensity * this.statGainPerStack,
        );
      }
      this.history.push({
        startTime: event.timestamp,
        spell: buff.spell,
        stat: buff.stat,
        intensity: this.intensity,
      });

      this.addStatChange(
        statBuff,
        this.currentBuff!.stat,
        this.currentBuff!.intensity * this.statGainPerStack,
      );
      this.deps.statTracker.forceChangeStats(statBuff, event);
    }
  }

  addStatChange(statBuff: StatBuff, stat: STAT, change: number) {
    switch (stat) {
      case STAT.CRITICAL_STRIKE:
        statBuff.crit = change;
        break;
      case STAT.HASTE:
        statBuff.haste = change;
        break;
      case STAT.MASTERY:
        statBuff.mastery = change;
        break;
      case STAT.VERSATILITY:
        statBuff.versatility = change;
        break;
    }
  }

  onFinalise(event: FightEndEvent | DeathEvent) {
    if (this.currentBuff) {
      this.currentBuff.endTime = event.timestamp;
    }
    if (event.type === EventType.Death) {
      this.intensity = 0;
    }
  }

  get currentBuff() {
    return this.history.at(-1);
  }

  statisticParts() {
    if (this.currentBuff) {
      this.currentBuff.endTime ??= this.owner.fight.end_time;
    }
    const aggregatedStats = new Map<
      string,
      { stat: STAT; total: number; procs: number; duration: number }
    >();
    this.history.forEach((event) => {
      const { stat, intensity, startTime, endTime } = event;
      const multipliedIntensity = intensity * this.statGainPerStack;

      if (!aggregatedStats.has(stat)) {
        aggregatedStats.set(stat, {
          stat: stat,
          total: 0,
          procs: 0,
          duration: 0,
        });
      }
      const aggregatedStat = aggregatedStats.get(stat)!;
      aggregatedStat.total += multipliedIntensity;
      aggregatedStat.procs += 1;
      aggregatedStat.duration += endTime! - startTime;
    });

    const averageStats = Array.from(aggregatedStats.values()).sort((a, b) =>
      a.stat.localeCompare(b.stat),
    );

    return {
      tooltip: Object.keys(BUFFS).map((spellId) => {
        const buff = BUFFS[Number(spellId)];
        const entry = aggregatedStats.get(buff.stat);
        if (!entry) {
          return <p key={spellId}>Didn't proc</p>;
        }

        const StatIcon = getIcon(buff.stat);
        const statName = getName(buff.stat)!.toLowerCase();
        const uptimePercentage = entry.duration / this.owner.fightDuration;
        const totalAmount = Math.round(entry.total / entry.procs);

        return (
          <p key={spellId}>
            The <SpellLink spell={buff.spell} /> {statName} buff gave <StatIcon />{' '}
            <b>{totalAmount}</b> {statName}, and had a total uptime of{' '}
            <b>{formatDuration(entry.duration)}</b>, {formatPercentage(uptimePercentage, 1)}% of the
            fight.
          </p>
        );
      }),
      content: averageStats.map((entry) => {
        const stat = entry.stat as STAT;
        const StatIcon = getIcon(stat);
        const statName = getName(stat);
        const uptimePercentage = entry.duration / this.owner.fightDuration;
        const totalAmount = Math.round(entry.total / entry.procs);
        const calculatedAverage = Math.round(totalAmount * uptimePercentage);

        return (
          <p key={stat}>
            <StatIcon /> {calculatedAverage} <small>{statName} over time</small>
          </p>
        );
      }),
    };
  }
}

export default DarkmoonSigilAscension;
