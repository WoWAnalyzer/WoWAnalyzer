import SPELLS from 'common/SPELLS';
import Spell from 'common/SPELLS/Spell';
import TALENTS from 'common/TALENTS/paladin';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, RemoveBuffEvent } from 'parser/core/Events';

import { getWingsSpell } from '../../constants';

interface Window {
  start: number;
  end: number;
}

export interface WingsWindowCoverage extends Window {
  /** Milliseconds of this window that had Sacred Weapon up. */
  covered: number;
}

/**
 * Blessing of the Forge rewards having Sacred Weapon up across the damage cooldown, so
 * coverage of that window is worth measuring on its own rather than as raw buff uptime.
 *
 * This only measures overlap. It deliberately does not judge individual Sacred Weapon
 * casts: in a 12.0.7 log the buff is refreshed by sources other than the player's own
 * casts, and cast-to-application mapping is not one-to-one, so per-cast waste cannot be
 * derived reliably from cast events alone.
 */
export default class SacredWeaponCoverage extends Analyzer {
  wingsSpell: Spell | undefined;

  private wingsWindows: Window[] = [];
  private buffWindows: Window[] = [];

  constructor(options: Options) {
    super(options);

    this.wingsSpell = getWingsSpell(this.selectedCombatant);
    this.active =
      this.wingsSpell !== undefined &&
      this.selectedCombatant.hasTalent(TALENTS.HOLY_ARMAMENTS_PROTECTION_TALENT);
    if (!this.active || !this.wingsSpell) {
      return;
    }

    this.addEventListener(
      Events.applybuff.to(SELECTED_PLAYER).spell(this.wingsSpell),
      this.onWingsApply,
    );
    this.addEventListener(
      Events.removebuff.to(SELECTED_PLAYER).spell(this.wingsSpell),
      this.onWingsRemove,
    );
    this.addEventListener(
      Events.applybuff.to(SELECTED_PLAYER).spell(SPELLS.SACRED_WEAPON_BUFF),
      this.onBuffApply,
    );
    this.addEventListener(
      Events.removebuff.to(SELECTED_PLAYER).spell(SPELLS.SACRED_WEAPON_BUFF),
      this.onBuffRemove,
    );
    this.addEventListener(Events.fightend, this.finalize);
  }

  private open(list: Window[], event: ApplyBuffEvent) {
    list.push({ start: event.timestamp, end: event.timestamp });
  }

  private close(list: Window[], event: RemoveBuffEvent) {
    const current = list[list.length - 1];
    if (!current) {
      // Buff was already up when the fight started.
      list.push({ start: this.owner.fight.start_time, end: event.timestamp });
    } else {
      current.end = event.timestamp;
    }
  }

  private onWingsApply(event: ApplyBuffEvent) {
    this.open(this.wingsWindows, event);
  }

  private onWingsRemove(event: RemoveBuffEvent) {
    this.close(this.wingsWindows, event);
  }

  private onBuffApply(event: ApplyBuffEvent) {
    this.open(this.buffWindows, event);
  }

  private onBuffRemove(event: RemoveBuffEvent) {
    this.close(this.buffWindows, event);
  }

  private finalize() {
    for (const list of [this.wingsWindows, this.buffWindows]) {
      const current = list[list.length - 1];
      if (current && current.end === current.start) {
        current.end = this.owner.fight.end_time;
      }
    }
  }

  /** Per-window coverage, in the order the cooldown was used. */
  get windows(): WingsWindowCoverage[] {
    return this.wingsWindows.map((w) => {
      let covered = 0;
      for (const b of this.buffWindows) {
        const overlap = Math.min(w.end, b.end) - Math.max(w.start, b.start);
        if (overlap > 0) {
          covered += overlap;
        }
      }
      return { ...w, covered: Math.min(covered, w.end - w.start) };
    });
  }

  get totalWingsDuration() {
    return this.wingsWindows.reduce((sum, w) => sum + (w.end - w.start), 0);
  }

  get totalCovered() {
    return this.windows.reduce((sum, w) => sum + w.covered, 0);
  }

  get percentCovered() {
    return this.totalWingsDuration === 0 ? 0 : this.totalCovered / this.totalWingsDuration;
  }

  /** Windows that were not fully covered, worth calling out individually. */
  get uncoveredWindows() {
    return this.windows.filter((w) => w.covered < w.end - w.start - 500);
  }
}
