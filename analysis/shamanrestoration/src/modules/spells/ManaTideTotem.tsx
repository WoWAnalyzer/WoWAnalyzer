import { Trans } from '@lingui/macro';
import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import ROLES from 'game/ROLES';
import { SpellLink } from 'interface';
import { SpecIcon } from 'interface';
import ManaIcon from 'interface/icons/Mana';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Combatant from 'parser/core/Combatant';
import Events, { SummonEvent } from 'parser/core/Events';
import Combatants from 'parser/shared/modules/Combatants';
import BoringValue from 'parser/ui/BoringValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import React from 'react';

import './ManaTideTotem.scss';

export const MANA_REGEN_PER_SECOND = 2000 / 5;

class ManaTideTotem extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  protected combatants!: Combatants;
  regenedMana = 0;
  sourceID = 0;

  constructor(options: Options) {
    super(options);

    this.addEventListener(
      Events.summon.by(SELECTED_PLAYER).spell(SPELLS.MANA_TIDE_TOTEM_CAST),
      this.mAnATiDeTotEm,
    );
  }

  mAnATiDeTotEm(event: SummonEvent) {
    this.sourceID = event.targetID;
  }

  get regenOnPlayer() {
    return this.selectedCombatant.getBuffUptime(SPELLS.MANA_TIDE_TOTEM_BUFF.id, this.sourceID);
  }
  get regenOnHealers() {
    return Object.values(this.regenPerHealer).reduce((uptime, player) => uptime + player.uptime, 0);
  }
  get regenPerHealer(): { [playerId: number]: { healer: Combatant; uptime: number } } {
    return Object.assign(
      {},
      ...Object.values(this.combatants.players)
        .filter((player) => player.spec.role === ROLES.HEALER)
        .map((player) => ({
          [player.id]: {
            healer: player,
            uptime: player.getBuffUptime(SPELLS.MANA_TIDE_TOTEM_BUFF.id, this.sourceID),
          },
        })),
    );
  }

  regenFromUptime(value: number) {
    return (value / 1000) * MANA_REGEN_PER_SECOND;
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        position={STATISTIC_ORDER.UNIMPORTANT(89)}
        dropdown={
          <table className="table table-condensed">
            <thead>
              <tr>
                <th>
                  <Trans id="common.player">Player</Trans>
                </th>
                <th>
                  <Trans id="common.stat.mana">Mana</Trans>
                </th>
              </tr>
            </thead>
            <tbody>
              {Object.values(this.regenPerHealer).map((p) => {
                const specClassName = p.healer.player.type.replace(' ', '');

                return (
                  <tr key={p.healer.id}>
                    <th className={specClassName}>
                      <SpecIcon icon={p.healer.player.icon} /> {p.healer.name}
                    </th>
                    <td>{formatNumber(this.regenFromUptime(p.uptime))}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        }
      >
        <BoringValue label={<SpellLink id={SPELLS.MANA_TIDE_TOTEM_CAST.id} />}>
          <div className="flex mtt-value">
            <div className="flex-sub icon">
              <ManaIcon />
            </div>
            <div className="flex-main value">
              {formatNumber(this.regenFromUptime(this.regenOnPlayer))}
              <br />
              <small>
                <Trans id="shaman.restoration.manaTideTotem.statistic.manaRestored">
                  Mana restored
                </Trans>
              </small>
            </div>
          </div>
          <div className="flex mtt-value">
            <div className="flex-sub icon">
              <ManaIcon />
            </div>
            <div className="flex-main value">
              {formatNumber(this.regenFromUptime(this.regenOnHealers))}
              <br />
              <small>
                <Trans id="shaman.restoration.manaTideTotem.statistic.healerManaRestored">
                  Mana restored (all Healers)
                </Trans>
              </small>
            </div>
          </div>
        </BoringValue>
      </Statistic>
    );
  }
}

export default ManaTideTotem;
