import React from 'react';

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Combatants from 'parser/shared/modules/Combatants';
import Events, { SummonEvent } from 'parser/core/Events';

import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';
import { formatNumber } from 'common/format';

import { Trans } from '@lingui/macro';
import ROLES from 'game/ROLES';

import Statistic from 'interface/statistics/Statistic';
import BoringValue from 'interface/statistics/components/BoringValueText';
import ManaIcon from 'interface/icons/Mana';

import './ManaTideTotem.scss'

const MANA_REGEN_PER_SECOND = 400 / 5;//Prepatch value

class ManaTideTotem extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  protected combatants!: Combatants;
  regenedMana = 0;
  sourceID = 0;

  constructor(options: Options) {
    super(options);

    this.addEventListener(Events.summon.by(SELECTED_PLAYER).spell(SPELLS.MANA_TIDE_TOTEM_CAST), this.mAnATiDeTotEm);
  }

  mAnATiDeTotEm(event: SummonEvent) {
    this.sourceID = event.targetID;
  }

  get regenOnPlayer() {
    return this.selectedCombatant.getBuffUptime(SPELLS.MANA_TIDE_TOTEM_BUFF.id, this.sourceID) / 1000 * MANA_REGEN_PER_SECOND;
  };
  get regenOnHealers() {
    return Object.values((this.combatants.players))
      .filter(player => player.spec.role === ROLES.HEALER)
      .reduce((uptime, player) => uptime + player.getBuffUptime(SPELLS.MANA_TIDE_TOTEM_BUFF.id, this.sourceID), 0) / 1000 * MANA_REGEN_PER_SECOND;
  };
  get regenOnGroup() {
    return Object.values((this.combatants.players))
      .reduce((uptime, player) => uptime + player.getBuffUptime(SPELLS.MANA_TIDE_TOTEM_BUFF.id, this.sourceID), 0) / 1000 * MANA_REGEN_PER_SECOND;
  };

  statistic() {
    return (
      <Statistic size='flexible'>
        <BoringValue label={<SpellLink id={SPELLS.MANA_TIDE_TOTEM_CAST.id} />}>
          <div className="flex mtt-value">
            <div className="flex-sub icon">
              <ManaIcon />
            </div>
            <div className="flex-main value">
              {formatNumber(this.regenOnPlayer)}
              <br /><small><Trans id="shaman.restoration.manaTideTotem.statistic.manaRestored">Mana restored</Trans></small>
            </div>
          </div>
          <div className="flex mtt-value">
            <div className="flex-sub icon">
              <ManaIcon />
            </div>
            <div className="flex-main value">
              {formatNumber(this.regenOnHealers)}
              <br /><small><Trans id="shaman.restoration.manaTideTotem.statistic.healerManaRestored">Mana restored (all Healers)</Trans></small>
            </div>
          </div>
        </BoringValue>
      </Statistic>
    );
  }
}

export default ManaTideTotem;
