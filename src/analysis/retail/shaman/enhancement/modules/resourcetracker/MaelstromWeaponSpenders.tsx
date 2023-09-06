import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import MaelstromWeaponTracker from './MaelstromWeaponTracker';
import ResourceBreakdown from 'parser/shared/modules/resources/resourcetracker/ResourceBreakdown';
import Panel from 'parser/ui/Panel';
import { MAELSTROM_WEAPON_ELIGIBLE_SPELLS } from '../../constants';
import Events, { DamageEvent, HealEvent } from 'parser/core/Events';
import typedKeys from 'common/typedKeys';
import { SpellLink } from 'interface';
import Abilities from 'parser/core/modules/Abilities';
import Spell from 'common/SPELLS/Spell';
import { formatThousands } from 'common/format';
import { TALENTS_SHAMAN } from 'common/TALENTS';
import SPELLS from 'common/SPELLS';

type SpenderAbility = {
  ability: Spell;
  amount: number;
};

export default class extends Analyzer {
  static dependencies = {
    maelstromWeaponTracker: MaelstromWeaponTracker,
    abilities: Abilities,
  };

  protected abilities!: Abilities;
  protected maelstromWeaponTracker!: MaelstromWeaponTracker;
  protected spenderValues: Record<number, SpenderAbility> = [];
  protected lastSpend: number = 0;

  constructor(options: Options) {
    super(options);

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(MAELSTROM_WEAPON_ELIGIBLE_SPELLS),
      this.onSpender,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(MAELSTROM_WEAPON_ELIGIBLE_SPELLS),
      this.onSpender,
    );
  }

  onSpender(event: DamageEvent | HealEvent) {
    let spellId = event.ability.guid;
    if (spellId === SPELLS.LIGHTNING_BOLT.id && event.timestamp === this.lastSpend) {
      return;
    }
    if (spellId === SPELLS.LAVA_BURST_DAMAGE.id) {
      spellId = TALENTS_SHAMAN.LAVA_BURST_TALENT.id;
    }
    const spender = this.spenderValues[spellId] ?? {
      ability: this.abilities.getAbility(spellId)?.spell,
      amount: 0,
    };
    spender.amount += event.amount;
    this.spenderValues[spellId] = spender;
    this.lastSpend = event.timestamp;
  }

  statistic() {
    return [
      <Panel key="spender-panel" title="Maelstrom Weapon usage" pad={false} position={120}>
        <ResourceBreakdown tracker={this.maelstromWeaponTracker} showSpenders showMaxSpenders />
      </Panel>,
      <Panel
        key="damage-per-spender"
        title="Maelstrom Weapon efficiency"
        pad={false}
        position={121}
      >
        <table className="data-table" style={{ width: '70%' }}>
          <thead>
            <tr>
              <th style={{ width: '30%' }}>Ability</th>
              <th className="text-right">Casts</th>
              <th className="text-right">Per Maelstrom</th>
              <th className="text-right">Average Cast</th>
              <th className="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {typedKeys(this.spenderValues).map((spellId: number) => {
              const spender = this.spenderValues[spellId];
              const spenderObj = this.maelstromWeaponTracker.spendersObj[spellId];
              return (
                <>
                  <tr key={spellId}>
                    <td>
                      <SpellLink spell={spender.ability} />
                    </td>
                    <td className="text-right">{spenderObj.casts}</td>
                    <td className="text-right">
                      {formatThousands(spender.amount / spenderObj.spent)}
                    </td>
                    <td className="text-right">
                      {formatThousands(spender.amount / spenderObj.casts)}
                    </td>
                    <td className="text-right">{formatThousands(spender.amount)}</td>
                  </tr>
                </>
              );
            })}
          </tbody>
        </table>
      </Panel>,
    ];
  }
}
