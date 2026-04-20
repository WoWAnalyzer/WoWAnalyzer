import { formatThousands, formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warlock';
import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import Enemies from 'parser/shared/modules/Enemies';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

interface DarkglareCast {
  timestamp: number;
  dotCount: number;
}

const debug = false;

class Darkglare extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };
  protected enemies!: Enemies;

  darkglareDamage = 0;
  casts: DarkglareCast[] = [];

  private dotDebuffIds: number[] = [];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.SUMMON_DARKGLARE_TALENT);
    if (!this.active) {
      return;
    }

    const corruptionDebuff = this.selectedCombatant.hasTalent(TALENTS.WITHER_TALENT)
      ? SPELLS.WITHER_DEBUFF
      : SPELLS.CORRUPTION_DEBUFF;
    this.dotDebuffIds = [
      SPELLS.AGONY.id,
      corruptionDebuff.id,
      TALENTS.UNSTABLE_AFFLICTION_TALENT.id,
    ];

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.SUMMON_DARKGLARE_TALENT),
      this.onDarkglareCast,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER_PET).spell(SPELLS.SUMMON_DARKGLARE_DAMAGE),
      this.onDarkglareDamage,
    );
  }

  // Snapshot total DoTs active across all enemies at the time of each Darkglare cast.
  // DoT count drives the 10% per-DoT damage bonus on the Darkglare's beam.
  onDarkglareCast(event: CastEvent) {
    const ts = event.timestamp;
    const entities = Object.values(this.enemies.getEntities());
    let dotCount = 0;
    entities.forEach((enemy) => {
      this.dotDebuffIds.forEach((id) => {
        if (enemy.hasBuff(id, ts)) {
          dotCount += 1;
        }
      });
    });
    debug && console.log(`Darkglare cast at ${ts}: ${dotCount} DoTs active`);
    this.casts.push({ timestamp: ts, dotCount });
  }

  onDarkglareDamage(event: DamageEvent) {
    this.darkglareDamage += event.amount + (event.absorbed || 0);
  }

  statistic() {
    const avgDots =
      this.casts.length > 0
        ? this.casts.reduce((sum, c) => sum + c.dotCount, 0) / this.casts.length
        : 0;
    const formatDPS = (amount: number) =>
      `${formatNumber((amount / this.owner.fightDuration) * 1000)} DPS`;

    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(4)}
        size="flexible"
        tooltip={
          <>
            <p>
              Pet damage: {formatThousands(this.darkglareDamage)} (
              {this.owner.formatItemDamageDone(this.darkglareDamage)})
            </p>
            <p>Average DoTs active on your target at each cast: {avgDots.toFixed(1)}</p>
          </>
        }
      >
        <BoringSpellValueText spell={SPELLS.SUMMON_DARKGLARE}>
          <div>
            {formatDPS(this.darkglareDamage)} <small>pet damage</small>
          </div>
          <div>
            {avgDots.toFixed(1)} <small>avg DoTs active on cast</small>
          </div>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Darkglare;
