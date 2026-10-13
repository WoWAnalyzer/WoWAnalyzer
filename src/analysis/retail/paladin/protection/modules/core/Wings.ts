import SPELLS from 'common/SPELLS/paladin';
import TALENTS from 'common/TALENTS/paladin';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, FightEndEvent, UpdateSpellUsableEvent } from 'parser/core/Events';

const RIGHTEOUS_PROTECTOR_WINGS_BASE = 12000;
const WINGS_BASE = 20000;
const WINGS_DURATION_RATIOS = { perfect: 20 / 12, good: 18 / 12, ok: 15 / 12 };
export const HOLY_BULWARK_PERFECT_BEFORE = 2500;

export interface WingsCast {
  start: number;
  duration: number;
  fightEnded: boolean;
  hammerOfWrathCasts: number;
  divineTollDelay?: number;
}

export interface HolyBulwarkCast {
  timestamp: number;
  before?: number;
  after?: number;
  atMaxCharges: boolean;
}

export default class Wings extends Analyzer {
  spell = this.selectedCombatant.hasTalent(TALENTS.SENTINEL_TALENT)
    ? SPELLS.SENTINEL
    : TALENTS.AVENGING_WRATH_TALENT;
  durationThresholds: Record<keyof typeof WINGS_DURATION_RATIOS, number>;
  casts: WingsCast[] = [];
  holyBulwarkCasts: HolyBulwarkCast[] = [];
  wingsWithPerfectBulwark = 0;

  private hammerOfWrathCasts: number[] = [];
  private divineTollCasts: number[] = [];
  private holyArmamentsUpdates: UpdateSpellUsableEvent[] = [];

  constructor(options: Options) {
    super(options);

    const base = this.selectedCombatant.hasTalent(TALENTS.RIGHTEOUS_PROTECTOR_TALENT)
      ? RIGHTEOUS_PROTECTOR_WINGS_BASE
      : WINGS_BASE;
    const extension =
      this.selectedCombatant.getTalentRank(TALENTS.ZEALOTS_PARAGON_TALENT) /
      TALENTS.ZEALOTS_PARAGON_TALENT.maxRanks;
    const threshold = (ratio: number) =>
      Math.round((base * (1 + (ratio - 1) * extension)) / 1000) * 1000;
    this.durationThresholds = {
      perfect: threshold(WINGS_DURATION_RATIOS.perfect),
      good: threshold(WINGS_DURATION_RATIOS.good),
      ok: threshold(WINGS_DURATION_RATIOS.ok),
    };

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.HAMMER_OF_WRATH_PROTECTION),
      this.onHammerOfWrath,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.DIVINE_TOLL_TALENT),
      this.onDivineToll,
    );
    this.addEventListener(
      Events.UpdateSpellUsable.spell([
        SPELLS.SACRED_WEAPON_TALENT,
        TALENTS.HOLY_ARMAMENTS_PROTECTION_TALENT,
      ]),
      this.onHolyArmamentsUpdate,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.HOLY_ARMAMENTS_PROTECTION_TALENT),
      this.onHolyBulwark,
    );
    this.addEventListener(Events.fightend, this.onFightEnd);
  }

  get windows(): [number, number][] {
    return this.casts.map(({ start, duration }) => [start, start + duration]);
  }

  get uptime() {
    return this.selectedCombatant.getBuffUptime(this.spell.id) / this.owner.fightDuration;
  }

  private onHammerOfWrath(event: CastEvent) {
    this.hammerOfWrathCasts.push(event.timestamp);
  }

  private onDivineToll(event: CastEvent) {
    this.divineTollCasts.push(event.timestamp);
  }

  private onHolyArmamentsUpdate(event: UpdateSpellUsableEvent) {
    this.holyArmamentsUpdates.push(event);
  }

  private onHolyBulwark(event: CastEvent) {
    const lastUpdate = this.holyArmamentsUpdates.findLast(
      (update) => update.timestamp < event.timestamp,
    );
    this.holyBulwarkCasts.push({
      timestamp: event.timestamp,
      atMaxCharges:
        lastUpdate === undefined || lastUpdate.chargesAvailable >= lastUpdate.maxCharges,
    });
  }

  private onFightEnd(event: FightEndEvent) {
    const between = (timestamps: number[], start: number, end: number) =>
      timestamps.filter((timestamp) => timestamp >= start && timestamp <= end);

    this.casts = this.selectedCombatant.getBuffHistory(this.spell.id).map((buff) => {
      const end = buff.end ?? event.timestamp;
      const divineToll = between(this.divineTollCasts, buff.start, end)[0];
      return {
        start: buff.start,
        duration: end - buff.start,
        fightEnded: end >= event.timestamp,
        hammerOfWrathCasts: between(this.hammerOfWrathCasts, buff.start, end).length,
        divineTollDelay: divineToll === undefined ? undefined : divineToll - buff.start,
      };
    });

    const wingsStarts = this.casts.map(({ start }) => start);
    this.holyBulwarkCasts.forEach((bulwark) => {
      const nextWings = wingsStarts.find((start) => start >= bulwark.timestamp);
      const previousWings = wingsStarts.findLast((start) => start < bulwark.timestamp);
      bulwark.before = nextWings === undefined ? undefined : nextWings - bulwark.timestamp;
      bulwark.after = previousWings === undefined ? undefined : bulwark.timestamp - previousWings;
    });
    this.wingsWithPerfectBulwark = wingsStarts.filter((start) =>
      this.holyBulwarkCasts.some(
        ({ timestamp }) => timestamp <= start && start - timestamp < HOLY_BULWARK_PERFECT_BEFORE,
      ),
    ).length;
  }
}
