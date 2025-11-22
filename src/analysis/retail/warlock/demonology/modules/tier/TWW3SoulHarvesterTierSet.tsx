import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_WARLOCK } from 'common/TALENTS';
import { TIERS } from 'game/TIERS';
import { WARLOCK_TWW3_ID } from 'common/ITEMS';
import ItemSetLink from 'interface/ItemSetLink';
import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  DamageEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

/**
 * Manaforge Omega (TWW S3) Tier Set - Soul Harvester Hero Talent
 *
 * 2pc: Shadow of Death unleashes your demonic soul to assault your current target
 * for 12 sec, dealing Shadow damage (Soul Swipe) to the target and enemies within 10 yds.
 *
 * 4pc: Demonic Soul damage increased by 45% and Wicked Reaping damage increased by 45%.
 * Your demonic soul generates 1 Soul Shard every 3 sec while assaulting enemies.
 */
class TWW3SoulHarvesterTierSet extends Analyzer {
  has2Piece: boolean;

  // Tracking for 2pc
  soulSwipeDamage = 0;
  soulSwipeHits = 0;
  succulentSoulActiveTime = 0;
  currentSucculentSoul: { start: number; end: number | null } | null = null;
  succulentSoulHistory: { start: number; end: number }[] = [];

  constructor(options: Options) {
    super(options);
    // Check if player has TWW3 tier set and Soul Harvester hero talent
    this.has2Piece = this.selectedCombatant.has2PieceByTier(TIERS.TWW3);
    const isSoulHarvester = this.selectedCombatant.hasTalent(
      TALENTS_WARLOCK.SHADOW_OF_DEATH_TALENT,
    );

    if (!this.has2Piece || !isSoulHarvester) {
      this.active = false;
      return;
    }

    // Track Succulent Soul buff
    this.addEventListener(
      Events.applybuff.to(SELECTED_PLAYER).spell(SPELLS.SUCCULENT_SOUL_BUFF),
      this.onSucculentSoulStart,
    );
    this.addEventListener(
      Events.refreshbuff.to(SELECTED_PLAYER).spell(SPELLS.SUCCULENT_SOUL_BUFF),
      this.onSucculentSoulRefresh,
    );
    this.addEventListener(
      Events.removebuff.to(SELECTED_PLAYER).spell(SPELLS.SUCCULENT_SOUL_BUFF),
      this.onSucculentSoulEnd,
    );
    // succulent damage is pet damage
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER_PET).spell(SPELLS.SOUL_SWIPE),
      this.onSoulSwipeDamage,
    );
  }

  onSucculentSoulStart(event: ApplyBuffEvent) {
    this.currentSucculentSoul = {
      start: event.timestamp,
      end: null,
    };
  }

  onSucculentSoulRefresh(event: RefreshBuffEvent) {
    // Just keep the current buff tracking active
  }

  onSucculentSoulEnd(event: RemoveBuffEvent) {
    if (this.currentSucculentSoul) {
      this.currentSucculentSoul.end = event.timestamp;
      const duration = event.timestamp - this.currentSucculentSoul.start;
      this.succulentSoulActiveTime += duration;
      this.succulentSoulHistory.push({
        start: this.currentSucculentSoul.start,
        end: event.timestamp,
      });
      this.currentSucculentSoul = null;
    }
  }

  onSoulSwipeDamage(event: DamageEvent) {
    const damage = event.amount + (event.absorbed || 0);
    this.soulSwipeDamage += damage;
    this.soulSwipeHits += 1;
  }

  get succulentSoulUptime() {
    return this.succulentSoulActiveTime / this.owner.fightDuration;
  }

  get averageSucculentSoulDuration() {
    if (this.succulentSoulHistory.length === 0) {
      return 0;
    }
    const totalDuration = this.succulentSoulHistory.reduce(
      (sum, soul) => sum + (soul.end - soul.start),
      0,
    );
    return totalDuration / this.succulentSoulHistory.length / 1000; // Convert to seconds
  }

  statistic() {
    // Only show this statistic if we have tier set and detected Soul Swipe damage
    if (!this.has2Piece || this.soulSwipeHits === 0) {
      return null;
    }

    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(2)}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
        tooltip={
          <>
            <strong>2-piece:</strong>
            <ul>
              <li>Succulent Soul Uptime: {formatPercentage(this.succulentSoulUptime)}%</li>
              <li>Average Duration: {this.averageSucculentSoulDuration.toFixed(1)}s</li>
              <li>Soul Swipe Hits: {this.soulSwipeHits}</li>
            </ul>
          </>
        }
      >
        <BoringSpellValueText spell={SPELLS.SUCCULENT_SOUL_BUFF}>
          <small>
            <ItemSetLink id={WARLOCK_TWW3_ID}>TWW Season 3 Tier Set (Soul Harvester)</ItemSetLink>
          </small>
          <div>
            <ItemDamageDone amount={this.soulSwipeDamage} />
          </div>
          <div>
            {formatPercentage(this.succulentSoulUptime)}% <small>Succulent Soul uptime</small>
          </div>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default TWW3SoulHarvesterTierSet;
