import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/shaman';
import SpellLink from 'interface/SpellLink';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import Enemies from 'parser/shared/modules/Enemies';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';

const AFFECTED_ABILITIES = [
  SPELLS.LIGHTNING_BOLT_OVERLOAD,
  SPELLS.LIGHTNING_BOLT,
  SPELLS.CHAIN_LIGHTNING_OVERLOAD,
  TALENTS.CHAIN_LIGHTNING_TALENT,
];

class Stormkeeper extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  protected enemies!: Enemies;

  private damageDoneByBuffedCasts = 0;
  private numLightningBoltCasts = 0;
  private numLightningBoltCastsWithElectrifiedShocks = 0;
  private numLightningBoltCastsWithSurgeOfPower = 0;

  constructor(options: Options) {
    super(options);
    this.active =
      this.selectedCombatant.getRepeatedTalentCount(TALENTS.STORMKEEPER_1_ELEMENTAL_TALENT) > 0;
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(AFFECTED_ABILITIES),
      this.onSKDamage,
    );
  }

  onSKDamage(event: DamageEvent) {
    if (!this.selectedCombatant.hasBuff(TALENTS.STORMKEEPER_1_ELEMENTAL_TALENT.id)) {
      return;
    }

    if (event.ability.guid === SPELLS.LIGHTNING_BOLT.id) {
      this.numLightningBoltCasts += 1;
      if (this.selectedCombatant.hasBuff(SPELLS.SURGE_OF_POWER_BUFF.id)) {
        this.numLightningBoltCastsWithSurgeOfPower += 1;
      }
      const target = this.enemies.getEntity(event);
      if (target) {
        this.numLightningBoltCastsWithElectrifiedShocks += 1;
      }
    }

    this.damageDoneByBuffedCasts += event.amount + (event.absorbed || 0);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        size="flexible"
        dropdown={
          <>
            <table className="table table-condensed">
              <thead>
                <tr>
                  <th>Ability</th>
                  <th>Number of Buffed Casts</th>
                </tr>
              </thead>
              <tbody>
                <tr key="SOP">
                  <th>
                    <SpellLink id={SPELLS.LIGHTNING_BOLT} />
                  </th>
                  <td>{this.numLightningBoltCasts}</td>
                </tr>
                <tr key="SOP">
                  <th>
                    <SpellLink id={SPELLS.SURGE_OF_POWER_BUFF} />
                  </th>
                  <td>{this.numLightningBoltCastsWithSurgeOfPower / this.numLightningBoltCasts}</td>
                </tr>
                <tr key="ElSh">
                  <th>
                    <SpellLink id={TALENTS.ELECTRIFIED_SHOCKS_TALENT} />
                  </th>
                  <td>
                    {this.numLightningBoltCastsWithElectrifiedShocks / this.numLightningBoltCasts}
                  </td>
                </tr>
              </tbody>
            </table>
          </>
        }
      >
        <BoringSpellValueText spellId={TALENTS.STORMKEEPER_1_ELEMENTAL_TALENT.id}>
          <>
            <ItemDamageDone amount={this.damageDoneByBuffedCasts} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Stormkeeper;
