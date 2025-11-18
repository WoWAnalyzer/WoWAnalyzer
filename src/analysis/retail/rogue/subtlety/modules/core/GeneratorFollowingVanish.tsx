import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'interface/SpellIcon';
import SpellLink from 'interface/SpellLink';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { NumberThreshold, ThresholdStyle } from 'parser/core/ParseResults';
import BoringSpellValue from 'parser/ui/BoringSpellValue';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import type { ReactNode } from 'react';
import { abilityToSpell } from 'common/abilityToSpell';

class GeneratorFollowingVanish extends Analyzer {
  generatorSpells = [
    SPELLS.BACKSTAB.id,
    SPELLS.SHADOWSTRIKE.id,
    SPELLS.SHURIKEN_STORM.id,
    SPELLS.SHURIKEN_TOSS.id,
  ];

  lastCastPtr: CastEvent | null = null;
  badFollowingVanishCasts: [CastEvent, CastEvent][] = [];
  goodFollowingVanishCasts: [CastEvent, CastEvent][] = [];

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.trackAllCasts);
  }

  trackAllCasts(event: CastEvent) {
    if (this.lastCastPtr !== null && this.lastCastPtr.ability.guid === SPELLS.VANISH.id) {
      if (this.generatorSpells.includes(event.ability.guid)) {
        this.goodFollowingVanishCasts.push([this.lastCastPtr, event]);
      } else {
        this.badFollowingVanishCasts.push([this.lastCastPtr, event]);
      }
    }
    this.lastCastPtr = event;
  }

  get suggestionsThreshold(): NumberThreshold {
    return {
      actual: this.badFollowingVanishCasts.length,
      isGreaterThan: {
        minor: 1,
        average: 2,
        major: 3,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  statistic(): ReactNode {
    const tableEntries: ReactNode[] = this.badFollowingVanishCasts.map((castPair, idx) => (
      <tr key={idx}>
        <td>{this.owner.formatTimestamp(castPair[0].timestamp)}</td>
        <td>
          <SpellIcon spell={abilityToSpell(castPair[1].ability)} />
        </td>
        <td>{this.owner.formatTimestamp(castPair[1].timestamp)}</td>
      </tr>
    ));
    return (
      <>
        <Statistic
          position={STATISTIC_ORDER.DEFAULT}
          size="flexible"
          category={STATISTIC_CATEGORY.GENERAL}
          tooltip={
            <>
              You cast non-generators following <SpellLink spell={SPELLS.VANISH} />{' '}
              {formatNumber(this.badFollowingVanishCasts.length)} times and generators{' '}
              {formatNumber(this.goodFollowingVanishCasts.length)} times.
            </>
          }
          dropdown={
            <>
              <table className="table table-condensed">
                <thead>
                  <tr>
                    <th>Vanish Timestamp</th>
                    <th>Bad Spell Cast</th>
                    <th>Bad Cast Timestamp</th>
                  </tr>
                </thead>
                <tbody>{tableEntries}</tbody>
              </table>
            </>
          }
        >
          <BoringSpellValue
            spell={SPELLS.VANISH.id}
            value={`${this.badFollowingVanishCasts.length} non-generators cast`}
            label="Non-generators Cast After Vanish"
          />
        </Statistic>
      </>
    );
  }
}

export default GeneratorFollowingVanish;
