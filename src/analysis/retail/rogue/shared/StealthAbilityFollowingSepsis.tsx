import SPELLS from 'common/SPELLS';
import Spell from 'common/SPELLS/Spell';
import TALENTS from 'common/TALENTS/rogue';
import SPECS from 'game/SPECS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import BoringSpellValue from 'parser/ui/BoringSpellValue';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import * as React from 'react';

const STEALTH_ABILITIES: Spell[] = [
  SPELLS.PICK_POCKET,
  SPELLS.CHEAP_SHOT,
  SPELLS.SAP,
  SPELLS.AMBUSH,
  SPELLS.SHADOWSTRIKE,
];

const debug = false;

/**
 * Analyzer to track the usage of the correct stealth abilities following
 * completion of the Sepsis DoT.
 */
class StealthAbilityFollowingSepsis extends Analyzer {
  protected properStealthAbility: Spell;
  protected badCasts: CastEvent[] = [];

  constructor(options: Options) {
    super(options);

    const specId = this.selectedCombatant.specId;
    // Outlaw and Assassination should use Ambush, Sub should use Shadowstrike.
    this.properStealthAbility =
      specId === SPECS.OUTLAW_ROGUE.id || specId === SPECS.ASSASSINATION_ROGUE.id
        ? SPELLS.AMBUSH
        : SPELLS.SHADOWSTRIKE;

    this.active = this.selectedCombatant.hasTalent(TALENTS.SEPSIS_TALENT.id);
    if (!this.active) {
      return;
    }

    STEALTH_ABILITIES.forEach((ability) => {
      this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(ability), this.onStealthAbility);
    });
  }

  onStealthAbility(event: CastEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.SEPSIS_BUFF.id, event.timestamp)) {
      return;
    }
    if (event.ability.guid !== this.properStealthAbility.id) {
      debug && console.log(`Recorded bad cast with id ${event.ability.guid}`);
      this.badCasts.push(event);
      event.meta = event.meta || {};
      event.meta.isInefficientCast = true;
      event.meta.inefficientCastReason = `You used the incorrect Stealth ability. You should've used ${this.properStealthAbility.name}.`;
    } else {
      debug && console.log(`Recurded good cast with id ${event.ability.guid}`);
    }
  }

  statistic(): React.ReactNode {
    const tableEntries: React.ReactNode[] = [];
    this.badCasts.forEach((cast: CastEvent, idx: number) => {
      tableEntries.push(
        <>
          <tr key={idx}>
            <td>{this.owner.formatTimestamp(cast.timestamp)}</td>
            <td>
              <SpellLink id={cast.ability.guid} />
            </td>
          </tr>
        </>,
      );
    });
    let tooltip: React.ReactElement | null;
    if (this.badCasts.length === 0) {
      tooltip = (
        <>
          You used <SpellLink id={this.properStealthAbility.id} />
          following the completion of <SpellLink id={TALENTS.SEPSIS_TALENT.id} />
          every time! Great job!
        </>
      );
    } else {
      tooltip = (
        <>
          You used the incorrect stealth ability instead of{' '}
          <SpellLink id={this.properStealthAbility.id} />
          following the completion of <SpellLink id={TALENTS.SEPSIS_TALENT.id} />
        </>
      );
    }

    let dropdown: React.ReactElement | null = null;
    if (this.badCasts.length !== 0) {
      dropdown = (
        <>
          <table className="table table-condensed">
            <thead>
              <tr>
                <th>Cast Timestamp</th>
                <th>Bad Ability</th>
              </tr>
            </thead>
            <tbody>{tableEntries}</tbody>
          </table>
        </>
      );
    }

    return (
      <>
        <Statistic
          position={STATISTIC_ORDER.DEFAULT}
          size="flexible"
          category={STATISTIC_CATEGORY.COVENANTS}
          tooltip={tooltip}
          dropdown={dropdown}
        >
          <BoringSpellValue
            spellId={TALENTS.SEPSIS_TALENT.id}
            value={`${this.badCasts.length}`}
            label="Bad Casts after Sepsis Finishes"
          />
        </Statistic>
      </>
    );
  }
}

export default StealthAbilityFollowingSepsis;
