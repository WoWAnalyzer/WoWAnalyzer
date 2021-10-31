import { formatDuration } from 'common/format';
import SPELLS from 'common/SPELLS';
import HIT_TYPES from 'game/HIT_TYPES';
import COVENANTS from 'game/shadowlands/COVENANTS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent, HealEvent, CastEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import React from 'react';

// the Real ICD is 750 but lmao server stuff is making it more
const ICD = 800;
const CDR = 5000;

export default class SinisterTeachings extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;

  lastCDREvent: number = 0;
  totalCDR: number = 0;
  spellThatGrantedCDR: Map<number, number> = new Map<number, number>();
  totalFOCasts: number = 0;
  firstCheck: boolean = true;

  constructor(options: Options) {
    super(options);

    this.active =
      this.selectedCombatant.hasCovenant(COVENANTS.VENTHYR.id) &&
      this.selectedCombatant.hasLegendaryByBonusID(SPELLS.SINISTER_TEACHINGS.bonusID);

    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.FALLEN_ORDER_CAST),
      this.countCasts,
    );

    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.trackEvent);

    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.trackEvent);
  }

  countCasts(event: CastEvent) {
    this.totalFOCasts += 1;
  }

  trackEvent(event: DamageEvent | HealEvent) {
    // KLUDGE check if buff is actually applied before the fight
    if (this.firstCheck) {
      this.firstCheck = false;
      this.totalFOCasts += 1;
    }

    if (event.hitType !== HIT_TYPES.CRIT) {
      return;
    }

    if (!this.selectedCombatant.hasBuff(SPELLS.FALLEN_ORDER_CAST.id)) {
      return;
    }

    const currentTime = event.timestamp;

    if (this.lastCDREvent > currentTime) {
      return;
    }

    //weird catch for pre-casts
    if (this.spellUsable.isOnCooldown(SPELLS.FALLEN_ORDER_CAST.id)) {
      this.spellUsable.reduceCooldown(SPELLS.FALLEN_ORDER_CAST.id, CDR);
    }

    this.lastCDREvent = currentTime + ICD;

    const guid = event.ability.guid;
    this.totalCDR += CDR;

    if (!this.spellThatGrantedCDR.has(guid)) {
      this.spellThatGrantedCDR.set(guid, 0);
    }

    const currentCDRFromSpell = this.spellThatGrantedCDR.get(guid)!;

    this.spellThatGrantedCDR.set(guid, currentCDRFromSpell + CDR);
  }

  /** The dropdown table in the base form of this statistic */
  get baseTable(): React.ReactNode {
    return (
      <>
        <table className="table table-condensed">
          <thead>
            <tr>
              <th>Spell</th>
              <th>CDR</th>
            </tr>
          </thead>
          <tbody>
            {Array.from(this.spellThatGrantedCDR).map((guid, index) => (
              <tr key={index}>
                <td>
                  <SpellLink id={guid[0]} />
                </td>
                <td>{formatDuration(guid[1] / this.totalFOCasts)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </>
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE()}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
        tooltip="This list shows the average CDR provided by each spell. If it shows zero the event provided less than one second on average but did provide some cdr at some point."
        dropdown={this.baseTable}
      >
        <BoringSpellValueText spellId={SPELLS.SINISTER_TEACHINGS.id}>
          {formatDuration(this.totalCDR / this.totalFOCasts)} average CDR
        </BoringSpellValueText>
      </Statistic>
    );
  }
}
