import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { TIERS } from 'game/TIERS';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import { SpellLink } from 'interface';
import ItemPercentDamageDone from 'parser/ui/ItemPercentDamageDone';

const TOUCH_COSMOS = {
  DAMAGE_BONUS: 0.35,
  STARSURGE_DELAY: 3200,
  STARSURGE_MIN: 100,
  STARSURGE_COST: 40,
  STARFALL_COST: 50,

  AFFECTED_CAST: [SPELLS.STARSURGE_MOONKIN, SPELLS.STARFALL_CAST],
  AFFECTED_DAMAGE: [SPELLS.STARSURGE_MOONKIN, SPELLS.STARFALL],
};

class TouchTheCosmos extends Analyzer {
  totalDamage = 0;
  totcBuffedAbilities: { [key: number]: number } = {};
  totcActivationTimestamp: number | null = null;
  totcConsumptionTimestamp: number | null = null;
  listCastStarsurge: number[];
  listCastStarsurgeTimestamps: number[];
  savedAP = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.has4PieceByTier(TIERS.T29);
    this.listCastStarsurge = [];
    this.listCastStarsurgeTimestamps = [];

    Object.values(TOUCH_COSMOS.AFFECTED_CAST).forEach((spell) => {
      this.totcBuffedAbilities[spell.id] = 0;
    });

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TOUCH_COSMOS.AFFECTED_CAST),
      this.onCast,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(TOUCH_COSMOS.AFFECTED_DAMAGE),
      this.onDamage,
    );
  }

  onCast(event: CastEvent) {
    const hasTouchCosmos = this.selectedCombatant.hasBuff(SPELLS.TOUCH_THE_COSMOS.id);
    if (!hasTouchCosmos) {
      return;
    }

    this.totcBuffedAbilities[event.ability.guid] += 1;
    if (event.ability.guid === SPELLS.STARSURGE_MOONKIN.id) {
      //Append a Starsurge CastEvent and keep its timestamp
      this.listCastStarsurge.push(1);
      this.listCastStarsurgeTimestamps.push(event.timestamp);
      this.savedAP += TOUCH_COSMOS.STARSURGE_COST;
    }
    if (event.ability.guid === SPELLS.STARFALL_CAST.id) {
      this.savedAP += TOUCH_COSMOS.STARFALL_COST;
    }
  }

  onDamage(event: DamageEvent) {
    let checkCastList = true;

    //Starsurge
    if (event.ability.guid === SPELLS.STARSURGE_MOONKIN.id) {
      while (checkCastList) {
        if (!this.listCastStarsurge) {
          // No CastEvent remaining, discard this source of damage. Ex: Wraths from Convoke
          return;
        }
        if (
          event.timestamp < (this.listCastStarsurgeTimestamps[0] + TOUCH_COSMOS.STARSURGE_MIN || 0)
        ) {
          // DamageEvent before a CastEvent, discard this source of damage.
          return;
        }
        if (
          event.timestamp >
          (this.listCastStarsurgeTimestamps[0] || Infinity) + TOUCH_COSMOS.STARSURGE_DELAY
        ) {
          // DamageEvent to long after a CastEvent, discard this CastEvent
          // (this is why their is a while loop) and try the next one.
          this.listCastStarsurge.shift();
          this.listCastStarsurgeTimestamps.shift();
        } else {
          // DamageEvent and CastEvent are within an acceptable timeframe, match theem together
          this.listCastStarsurge.shift();
          this.totalDamage += calculateEffectiveDamage(event, TOUCH_COSMOS.DAMAGE_BONUS);
          this.listCastStarsurgeTimestamps.shift();
          checkCastList = false;
        }
      }
    }
    //Starfall
    if (event.ability.guid === SPELLS.STARFALL.id) {
      return;
    }
  }

  statistic() {
    const dpsAdded = this.totalDamage / (this.owner.fightDuration / 1000);
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(11)}
        size="flexible"
        tooltip={`This approximate DPS increase of ${formatNumber(
          dpsAdded,
        )} only considers the damage increase from the bonus damage on Starsurge`}
        dropdown={
          <>
            <table className="table table-condensed">
              <thead>
                <tr>
                  <th>Ability</th>
                  <th>Number of Free Casts</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(this.totcBuffedAbilities).map((e) => (
                  <tr key={e}>
                    <th>
                      <SpellLink id={Number(e)} />
                    </th>
                    <td>{this.totcBuffedAbilities[Number(e)]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        }
      >
        <BoringSpellValueText spellId={SPELLS.TOUCH_THE_COSMOS.id}>
          <>
            {formatNumber(this.savedAP)}{' '}
            <small> Astral Power Saved (accounted toward Pulsar) </small>
            <br />
            <ItemPercentDamageDone greaterThan amount={this.totalDamage} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default TouchTheCosmos;
