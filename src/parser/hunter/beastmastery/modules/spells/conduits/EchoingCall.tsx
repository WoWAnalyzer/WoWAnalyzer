import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import React from 'react';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import SPELLS from 'common/SPELLS';
import Events, { DamageEvent } from 'parser/core/Events';
import HIT_TYPES from 'game/HIT_TYPES';
import { ECHOING_CALL_INCREASED_WILD_CALL_CHANCE } from 'parser/hunter/beastmastery/constants';

/**
 * Wild Call has a x%  increased chance to reset the cooldown of Barbed Shot.
 */
class EchoingCall extends Analyzer {

  conduitRank: number = 0;
  procChances: number = 0;

  constructor(options: any) {
    super(options);
    this.active = false;
    if (!this.active) {
      return;
    }

    this.conduitRank = 1; //TODO: Find out the proper way of parsing conduit ranks

    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.AUTO_SHOT), this.onAutoShotDamage);
  }

  onAutoShotDamage(event: DamageEvent) {
    if (event.hitType !== HIT_TYPES.CRIT) {
      return;
    }
    this.procChances += 1;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
        tooltip={(
          <>
            Since there is no way to track Wild Call resets, this is an approximation of how many resets Echoing Call granted you.
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.ECHOING_CALL_CONDUIT}>
          <>
            ≈{(this.procChances * ECHOING_CALL_INCREASED_WILD_CALL_CHANCE[this.conduitRank]).toFixed(1)} <small>resets</small></>
        </BoringSpellValueText>
      </Statistic>
    );
  }

}

export default EchoingCall;
