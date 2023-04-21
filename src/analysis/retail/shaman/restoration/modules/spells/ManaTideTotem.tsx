import { Trans } from '@lingui/macro';
import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/shaman';
import ROLES from 'game/ROLES';
import { SpecIcon } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Combatant from 'parser/core/Combatant';
import Events, { SummonEvent } from 'parser/core/Events';
import Combatants from 'parser/shared/modules/Combatants';
import ItemManaGained from 'parser/ui/ItemManaGained';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';

import './ManaTideTotem.scss';

export const MANA_REGEN_PER_SECOND = 10000 / 5;

class ManaTideTotem extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  protected combatants!: Combatants;
  regenedMana = 0;
  sourceID = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.MANA_TIDE_TOTEM_TALENT);

    this.addEventListener(
      Events.summon.by(SELECTED_PLAYER).spell(TALENTS.MANA_TIDE_TOTEM_TALENT),
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
        .filter((player) => player.spec?.role === ROLES.HEALER)
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
        category={STATISTIC_CATEGORY.TALENTS}
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
        <TalentSpellText talent={TALENTS.MANA_TIDE_TOTEM_TALENT}>
          <ItemManaGained
            amount={this.regenFromUptime(this.regenOnPlayer)}
            useAbbrev
            customLabel="player mana"
          />
          <br />
          <ItemManaGained amount={this.regenFromUptime(this.regenOnHealers)} useAbbrev />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default ManaTideTotem;
