import { defineMessage } from '@lingui/macro';
import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import { formatDuration, formatNumber } from 'common/format';
import { SpellIcon, SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';

import { ABILITIES_AFFECTED_BY_MASTERY } from '../../constants';

interface MasteryCast {
  ability: number;
  timestamp: number;
}

const HIT_COMBO_STRING = ' and dropping the Hit Combo damage buff';

class ComboStrikes extends Analyzer {
  _lastSpellUsed: number | null = null;
  _lastThreeSpellsUsed: MasteryCast[] = [];
  masteryDropSpellSequence: MasteryCast[][] = [];
  hasHitCombo = false;

  constructor(options: Options) {
    super(options);
    this.hasHitCombo = this.selectedCombatant.hasTalent(TALENTS_MONK.HIT_COMBO_TALENT);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(ABILITIES_AFFECTED_BY_MASTERY),
      this.onMasteryCast,
    );
  }

  onMasteryCast(event: CastEvent) {
    const spellId = event.ability.guid;
    const eventTimestamp = event.timestamp;
    // Track Details on the last 3 spells used - Need to populate up to 3 first, then begin to modify the array.
    if (this._lastThreeSpellsUsed.length < 3) {
      this._lastThreeSpellsUsed.push({
        ability: spellId,
        timestamp: eventTimestamp,
      });
    } else {
      this._lastThreeSpellsUsed = this._lastThreeSpellsUsed.slice(1);
      this._lastThreeSpellsUsed.push({
        ability: spellId,
        timestamp: eventTimestamp,
      });
    }

    if (this._lastSpellUsed === spellId) {
      this.masteryDropSpellSequence.push(this._lastThreeSpellsUsed);
    }
    this._lastSpellUsed = spellId;
  }

  get masteryDropEvents() {
    return this.masteryDropSpellSequence.length;
  }

  get masteryDropsPerMinute() {
    return (this.masteryDropEvents / this.owner.fightDuration) * 1000 * 60;
  }

  get suggestionThresholds() {
    const hitComboMultiplier = this.hasHitCombo ? 1 : 2;
    return {
      actual: this.masteryDropsPerMinute,
      isGreaterThan: {
        minor: 0,
        average: 0.5 * hitComboMultiplier,
        major: hitComboMultiplier,
      },
      style: ThresholdStyle.DECIMAL,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <span>
          You ignored your <SpellLink spell={SPELLS.COMBO_STRIKES} /> buff by casting the same spell
          twice in a row, missing out on the damage increase from your mastery{HIT_COMBO_STRING}.
        </span>,
      )
        .icon(SPELLS.COMBO_STRIKES.icon)
        .actual(
          defineMessage({
            id: 'monk.windwalker.comboStrikes.masteryBreaksPerMinute',
            message: `${actual.toFixed(2)} mastery breaks per minute.`,
          }),
        )
        .recommended(`mastery should be broken ${recommended} times`),
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(2)}
        size="flexible"
        tooltip={`This is the number of times you incorrectly cast the same spell twice in a row, missing out on the damage increase from your mastery${HIT_COMBO_STRING}.`}
        dropdown={
          // only add a dropdown when there are any mastery breaks to show
          this.masteryDropEvents > 0 ? (
            <>
              <div>
                <span style={{ padding: '1.3em' }}>Spell sequence when mastery dropped.</span>
              </div>
              <table className="table table-condensed">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>1</th>
                    <th>2</th>
                    <th>3</th>
                  </tr>
                </thead>
                <tbody>
                  {this.masteryDropSpellSequence.map((item, index) => (
                    <tr key={index}>
                      <th scope="row">
                        {formatDuration(item[0].timestamp - this.owner.fight.start_time)}
                      </th>
                      {item[1] && item[1].ability && (
                        <td>
                          <SpellIcon spell={item[0].ability} style={{ height: '2.4em' }} />
                        </td>
                      )}
                      {item[1] && item[1].ability && (
                        <td>
                          <SpellIcon spell={item[1].ability} style={{ height: '2.4em' }} />
                        </td>
                      )}
                      {item[2] && item[2].ability && (
                        <td>
                          <SpellIcon spell={item[2].ability} style={{ height: '2.4em' }} />
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : null
        }
      >
        <BoringSpellValueText spell={SPELLS.COMBO_STRIKES}>
          {formatNumber(this.masteryDropEvents)} <small>Mastery benefit mistakes</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }

  get subStatistic() {
    return (
      <>
        {formatNumber(this.masteryDropEvents)} <small>Mastery benefit mistakes</small>
      </>
    );
  }
}

export default ComboStrikes;
