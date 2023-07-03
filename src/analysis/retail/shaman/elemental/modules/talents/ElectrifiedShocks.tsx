import SPELLS from 'common/SPELLS';
import Spell from 'common/SPELLS/Spell';
import TALENTS from 'common/TALENTS/shaman';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import Events, { DamageEvent } from 'parser/core/Events';
import Enemies from 'parser/shared/modules/Enemies';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';

const ElectrifiedShocksIncrease = 0.15;

type Stats = {
  spell: Spell;
  damageGained: number;
  casts: number;
  buffedCasts: number;
};

class ElectrifiedShocks extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  protected enemies!: Enemies;

  private casts = {
    damageGained: 0,
    lightningBolt: {
      spell: SPELLS.LIGHTNING_BOLT,
      damageGained: 0,
      casts: 0,
      buffedCasts: 0,
    },
    chainLightning: {
      spell: SPELLS.CHAIN_LIGHTNING_INSTANT,
      damageGained: 0,
      casts: 0,
      buffedCasts: 0,
    },
  };

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.ELECTRIFIED_SHOCKS_TALENT);
    if (!this.active) {
      return;
    }

    [
      SPELLS.LIGHTNING_BOLT,
      SPELLS.LIGHTNING_BOLT_INSTANT,
      SPELLS.LIGHTNING_BOLT_OVERLOAD,
      SPELLS.LIGHTNING_BOLT_OVERLOAD_HIT,
    ].forEach((spell) =>
      this.addEventListener(
        Events.damage.by(SELECTED_PLAYER).spell(spell),
        this.onLightningBoltDamage,
      ),
    );

    [
      TALENTS.CHAIN_LIGHTNING_TALENT,
      SPELLS.CHAIN_LIGHTNING_INSTANT,
      SPELLS.CHAIN_LIGHTNING_OVERLOAD,
      SPELLS.CHAIN_LIGHTNING_OVERLOAD_UNLIMITED_RANGE,
    ].forEach((spell) =>
      this.addEventListener(
        Events.damage.by(SELECTED_PLAYER).spell(spell),
        this.onChainLightningDamage,
      ),
    );
  }

  onLightningBoltDamage(event: DamageEvent) {
    const stats = this.casts.lightningBolt;
    this.updateStats(event, stats);
  }

  onChainLightningDamage(event: DamageEvent) {
    const stats = this.casts.chainLightning;
    this.updateStats(event, stats);
  }

  private updateStats(event: DamageEvent, stats: Stats) {
    stats.casts += 1;
    const target = this.enemies.getEntity(event);
    if (target && target.hasBuff(TALENTS.ELECTRIFIED_SHOCKS_DEBUFF.id)) {
      stats.buffedCasts += 1;
      const damage = calculateEffectiveDamage(event, ElectrifiedShocksIncrease);
      stats.damageGained += damage;
      this.casts.damageGained += damage;
    }
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
                  <th>Casts</th>
                  <th>Buffed</th>
                  <th>Damage</th>
                </tr>
              </thead>
              <tbody>
                <tr key={SPELLS.LIGHTNING_BOLT.id}>
                  <th>
                    <SpellLink id={SPELLS.LIGHTNING_BOLT.id} />
                  </th>
                  <td>{this.casts.lightningBolt.casts}</td>
                  <td>
                    {Math.floor(
                      (this.casts.lightningBolt.buffedCasts /
                        (this.casts.lightningBolt.casts || 1)) *
                        100,
                    )}
                    %
                  </td>
                </tr>
                <tr key={TALENTS.CHAIN_LIGHTNING_TALENT.id}>
                  <th>
                    <SpellLink id={TALENTS.CHAIN_LIGHTNING_TALENT.id} />
                  </th>
                  <td>{this.casts.chainLightning.casts}</td>
                  {/* TODO: percent formatting? */}
                  <td>
                    {Math.floor(
                      (this.casts.chainLightning.buffedCasts /
                        (this.casts.chainLightning.casts || 1)) *
                        100,
                    )}
                    %
                  </td>
                </tr>
              </tbody>
            </table>
          </>
        }
      >
        <BoringSpellValueText spellId={TALENTS.ELECTRIFIED_SHOCKS_TALENT.id}>
          <>
            <ItemDamageDone amount={this.casts.damageGained} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ElectrifiedShocks;
