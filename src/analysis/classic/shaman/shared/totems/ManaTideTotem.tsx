import { Trans } from '@lingui/macro';
import { formatNumber } from 'common/format';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { SpellLink } from 'interface';
import { SpecIcon } from 'interface';
import PeopleIcon from 'interface/icons/People';
import PersonIcon from 'interface/icons/Person';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Combatant from 'parser/core/Combatant';
import Events, { ResourceChangeEvent, SummonEvent } from 'parser/core/Events';
import Combatants from 'parser/shared/modules/Combatants';
import BoringValue from 'parser/ui/BoringValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import SPELLS from 'common/SPELLS/classic/shaman';

class ManaTideTotem extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  protected combatants!: Combatants;
  regenedMana = 0;
  sourceID = 0;
  manaTideEvents: ResourceChangeEvent[] = [];

  constructor(options: Options) {
    super(options);

    this.active = true;

    this.addEventListener(
      Events.summon.by(SELECTED_PLAYER).spell({ id: SPELLS.MANA_TIDE_TOTEM.id }),
      this.manaTideTotem,
    );

    this.addEventListener(
      Events.resourcechange.spell({ id: SPELLS.MANA_TIDE_TOTEM_BUFF.id }),
      this.manaTideTick,
    );
  }

  manaTideTotem(event: SummonEvent) {
    this.sourceID = event.targetID;
  }

  manaTideTick(event: ResourceChangeEvent) {
    if (event.sourceID !== this.sourceID || event.resourceChangeType !== RESOURCE_TYPES.MANA.id) {
      return;
    }

    this.manaTideEvents.push(event);
  }

  get regenOnPlayer() {
    return this.regenPerHealer[this.selectedCombatant.id].mana;
  }
  get regenOnHealers() {
    return Object.values(this.regenPerHealer).reduce((mana, player) => mana + player.mana, 0);
  }
  get regenPerHealer(): { [playerId: number]: { healer: Combatant; mana: number } } {
    return Object.assign(
      {},
      ...Object.values(this.combatants.players).map((player) => ({
        [player.id]: {
          healer: player,
          mana: this.manaTideEvents
            .filter((evt) => evt.targetID === player.id)
            .reduce((playerMana, evt) => playerMana + evt.resourceChange, 0),
        },
      })),
    );
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
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
              {Object.values(this.regenPerHealer)
                .filter((p) => p.mana > 0)
                .map((p) => {
                  const specClassName = p.healer.player.type.replace(' ', '');

                  return (
                    <tr key={p.healer.id}>
                      <th className={specClassName}>
                        <SpecIcon icon={p.healer.player.icon} /> {p.healer.name}
                      </th>
                      <td>{formatNumber(p.mana)}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        }
      >
        <BoringValue label={<SpellLink spell={SPELLS.MANA_TIDE_TOTEM} />}>
          <div>
            <PersonIcon /> {formatNumber(this.regenOnPlayer)}{' '}
            <small>
              <Trans id="shaman.restoration.manaTideTotem.statistic.manaRestored">
                Mana restored
              </Trans>
            </small>
            <br />
            <PeopleIcon /> {formatNumber(this.regenOnHealers)} <small>Mana restored (party)</small>
          </div>
        </BoringValue>
      </Statistic>
    );
  }
}

export default ManaTideTotem;
