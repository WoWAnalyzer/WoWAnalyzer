import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import { formatNumber, formatDuration } from 'common/format';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Statistic from 'interface/statistics/Statistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText/index';
import Events from 'parser/core/Events';

import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';

import { ABILITIES_AFFECTED_BY_MASTERY } from '../../constants';

const HIT_COMBO_STRING = " and dropping the Hit Combo damage buff";

class ComboStrikes extends Analyzer {
  _lastSpellUsed = null;
  _lastThreeSpellsUsed = [];
  masteryDropSpellSequence = [];
  hasHitCombo = false;

  constructor(...args) {
    super(...args);
    this.hasHitCombo = this.selectedCombatant.hasTalent(SPELLS.HIT_COMBO_TALENT.id);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(ABILITIES_AFFECTED_BY_MASTERY), this.onMasteryCast);
  }

  onMasteryCast(event) {
    const spellId = event.ability.guid;
    const eventTimestamp = event.timestamp;
    // Track Details on the last 3 spells used - Need to populate up to 3 first, then begin to modify the array.
    if(this._lastThreeSpellsUsed.length < 3) {
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

    if(this._lastSpellUsed === spellId) {
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
        major: Number(hitComboMultiplier),
      },
      style: 'number',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => suggest(<span>You ignored your <SpellLink id={SPELLS.COMBO_STRIKES.id} /> buff by casting the same spell twice in a row, missing out on the damage increase from your mastery{HIT_COMBO_STRING}.</span>)
          .icon(SPELLS.COMBO_STRIKES.icon)
          .actual(i18n._(t('monk.windwalker.comboStrikes.masteryBreaksPerMinute')`${actual.toFixed(2)} mastery breaks per minute.`))
          .recommended(`mastery should be broken ${recommended} times`));
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(2)}
        size="flexible"
        tooltip={`This is the number of times you incorrectly cast the same spell twice in a row, missing out on the damage increase from your mastery${HIT_COMBO_STRING}.`}
        dropdown={(
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
                  {
                    this.masteryDropSpellSequence
                      .map((item, index) => (
                        <tr key={index}>
                          <th scope="row">{formatDuration((item[0].timestamp - this.owner.fight.start_time) / 1000)}</th>
                          <td><SpellIcon id={item[0].ability} style={{ height: '2.4em' }} /></td>
                          <td><SpellIcon id={item[1].ability} style={{ height: '2.4em' }} /></td>
                          {item[2] && item[2].ability && (
                            <td><SpellIcon id={item[2].ability} style={{ height: '2.4em' }} /></td>
                          )}
                        </tr>
                      ))
                  }
                </tbody>
              </table>
            </>
          ) : null
        )}
      >
        <BoringSpellValueText spell={SPELLS.COMBO_STRIKES}>
          {formatNumber(this.masteryDropEvents)} <small>Mastery benefit mistakes</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ComboStrikes;
