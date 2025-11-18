import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_WARLOCK } from 'common/TALENTS';
import { TIERS } from 'game/TIERS';
import { WARLOCK_TWW3_ID } from 'common/ITEMS';
import ItemSetLink from 'interface/ItemSetLink';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  CastEvent,
  DamageEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

/**
 * Manaforge Omega (TWW S3) Tier Set - Diabolist Hero Talent
 *
 * 2pc: Hand of Gul'dan cast at full power summons a Demonic Oculus, up to 3.
 * Consuming Demonic Art flings your Demonic Oculi at your current target,
 * exploding for Fire damage to the target and nearby enemies.
 *
 * 4pc: Demonic Oculi analyze the battle while active and deliver information
 * to you as they explode, increasing your Intellect by 2% for 10 sec.
 */
class TWW3DiabolistTierSet extends Analyzer {
  has2Piece: boolean;

  // Tracking for 2pc
  oculusSummons = 0;
  oculusExplosions = 0;
  oculusDamage = 0;
  handOfGuldanCasts = 0;
  fullPowerHandOfGuldanCasts = 0;

  constructor(options: Options) {
    super(options);
    // Check if player has TWW3 tier set and Diabolist hero talent
    this.has2Piece = this.selectedCombatant.has2PieceByTier(TIERS.TWW3);
    const isDiabolist = this.selectedCombatant.hasTalent(TALENTS_WARLOCK.RUINATION_TALENT);

    if (!this.has2Piece || !isDiabolist) {
      this.active = false;
      return;
    }

    // 2pc events
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.HAND_OF_GULDAN_CAST),
      this.onHandOfGuldan,
    );
    // Track Oculus buff applications (each buff = 1 full power HoG)
    this.addEventListener(
      Events.applybuff.to(SELECTED_PLAYER).spell(SPELLS.DEMONIC_OCULUS_BUFF),
      this.onOculusBuff,
    );
    // Also track stack applications
    this.addEventListener(
      Events.applybuffstack.to(SELECTED_PLAYER).spell(SPELLS.DEMONIC_OCULUS_BUFF),
      this.onOculusBuff,
    );
    // Track when Oculus buffs are removed (when they explode)
    this.addEventListener(
      Events.removebuff.to(SELECTED_PLAYER).spell(SPELLS.DEMONIC_OCULUS_BUFF),
      this.onOculusExplosion,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.EYE_BLAST),
      this.onOculusDamage,
    );
  }

  onHandOfGuldan(event: CastEvent) {
    // Track all Hand of Gul'dan casts
    this.handOfGuldanCasts += 1;
    // Full power casts are tracked via the Oculus buff application
  }

  onOculusBuff(event: ApplyBuffEvent | ApplyBuffStackEvent) {
    // Each buff application means a full power (3-shard) Hand of Gul'dan was cast
    this.fullPowerHandOfGuldanCasts += 1;
    this.oculusSummons += 1;
  }

  onOculusExplosion(event: RemoveBuffEvent) {
    // When an Oculus buff is removed, it explodes
    this.oculusExplosions += 1;
  }

  onOculusDamage(event: DamageEvent) {
    this.oculusDamage += event.amount + (event.absorbed || 0);
  }

  statistic() {
    // Only show this statistic if we have tier set and detected damage
    if (!this.has2Piece || this.oculusDamage === 0) {
      return null;
    }

    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(1)}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
        tooltip={
          <>
            <strong>2-piece:</strong>
            <ul>
              <li>Hand of Gul'dan Casts: {this.handOfGuldanCasts}</li>
              <li>Full Power (3-shard) Casts: {this.fullPowerHandOfGuldanCasts}</li>
              <li>Oculus Summons: {this.oculusSummons}</li>
              <li>Total Explosions: {this.oculusExplosions}</li>
            </ul>
          </>
        }
      >
        <BoringSpellValueText spell={SPELLS.DEMONIC_OCULUS_BUFF}>
          <small>
            <ItemSetLink id={WARLOCK_TWW3_ID}>TWW Season 3 Tier Set (Diabolist)</ItemSetLink>
          </small>
          <div>
            {formatNumber(this.oculusDamage)} <small>total damage</small>
          </div>
          <div>
            <ItemDamageDone amount={this.oculusDamage} />
          </div>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default TWW3DiabolistTierSet;
