import SPELLS from 'common/SPELLS/shaman';
import TALENTS from 'common/TALENTS/shaman';
import { SHAMAN_MID2_ID } from 'common/ITEMS';
import { TIERS } from 'game/TIERS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import ItemSetBonus from 'parser/ui/ItemSetBonus';
import ItemSetBonuses from 'parser/ui/ItemSetBonuses';
import SpellLink from 'interface/SpellLink';
import SpellUsable from '../core/SpellUsable';
import Enemies from 'parser/shared/modules/Enemies';
import { MID2_SET_TITLE } from 'analysis/retail/shaman/shared/constants';

const SINGLE_TARGET_AMP = 2.0;
const CDR_PER_TRIGGER_MS = 2000;
const CL_DAMAGE_PER_STACK = 0.08;
const TRIGGER_BUFFER_MS = 100;

/**
 * 2-piece: Voltaic Blaze causes your primary target to erupt in a Fire Nova every 2 sec for 6 sec.
 *          Fire Nova deals 200% increased damage to the primary target of your Voltaic Blaze.
 * 4-piece: Fire Nova reduces the cooldown of Crash Lightning by 2.0 sec and increases the
 *          damage of your next Crash Lightning by 8%, stacking up to 5 times.
 */
class S2TierSet extends Analyzer.withDependencies({
  spellUsable: SpellUsable,
  enemies: Enemies,
}) {
  private readonly has2Piece: boolean;
  private readonly has4Piece: boolean;

  // 4-piece
  private effectiveCDR = 0;
  private wastedCDR = 0;
  private stacks = 0;
  private crashLightningDamage = 0;
  private fireNovaDamage = 0;

  private lastFireNova: number | null = null;

  constructor(options: Options) {
    super(options);
    this.has2Piece = this.selectedCombatant.has2PieceByTier(TIERS.MID2);
    this.has4Piece = this.selectedCombatant.has4PieceByTier(TIERS.MID2);
    this.active = this.has2Piece || this.has4Piece;
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.FIRE_NOVA_DAMAGE),
      this.onFireNovaDamage,
    );

    if (this.has4Piece) {
      this.addEventListener(
        Events.damage.by(SELECTED_PLAYER).spell(SPELLS.FIRE_NOVA_DAMAGE),
        this.onFireNovaPulse,
      );
      this.addEventListener(
        Events.cast.by(SELECTED_PLAYER).spell(TALENTS.CRASH_LIGHTNING_TALENT),
        this.onCrashLightningCast,
      );
      this.addEventListener(
        Events.damage.by(SELECTED_PLAYER).spell(TALENTS.CRASH_LIGHTNING_TALENT),
        this.onCrashLightningDamage,
      );
    }
  }

  onCrashLightningCast(event: CastEvent) {
    this.stacks = this.selectedCombatant.getBuffStacks(SPELLS.MIDNIGHT_S2_SHORT_CIRCUIT);
  }

  onFireNovaDamage(event: DamageEvent) {
    if (this.deps.enemies.getById(event.targetID)?.hasBuff(SPELLS.MIDNIGHT_S2_BURNING_CORE)) {
      this.fireNovaDamage += calculateEffectiveDamage(event, SINGLE_TARGET_AMP);
    }
  }

  onFireNovaPulse(event: DamageEvent) {
    // Debounce CDR, only applied once per pulse regardless of target count
    if ((this.lastFireNova ?? 0) + TRIGGER_BUFFER_MS > event.timestamp) {
      return;
    }
    this.lastFireNova = event.timestamp;

    const effectiveCdr = this.deps.spellUsable.reduceCooldown(
      TALENTS.CRASH_LIGHTNING_TALENT.id,
      CDR_PER_TRIGGER_MS,
    );
    const wastedCdr = CDR_PER_TRIGGER_MS - effectiveCdr;

    this.effectiveCDR += effectiveCdr;
    this.wastedCDR += wastedCdr;
  }

  private onCrashLightningDamage(event: DamageEvent) {
    this.crashLightningDamage += calculateEffectiveDamage(event, CL_DAMAGE_PER_STACK * this.stacks);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
      >
        <ItemSetBonuses setId={SHAMAN_MID2_ID} title={MID2_SET_TITLE}>
          <ItemSetBonus
            pieces={2}
            label={
              <>
                <SpellLink spell={SPELLS.FIRE_NOVA_DAMAGE} /> bonus
              </>
            }
          >
            <ItemDamageDone amount={this.fireNovaDamage} />
          </ItemSetBonus>
          {this.has4Piece && (
            <>
              <hr />
              <ItemSetBonus
                pieces={4}
                label={
                  <>
                    <SpellLink spell={TALENTS.CRASH_LIGHTNING_TALENT} /> bonus
                  </>
                }
                footnote={`${(this.effectiveCDR / 1000).toFixed(1)}s effective Crash Lightning CDR`}
              >
                <ItemDamageDone amount={this.crashLightningDamage} />
              </ItemSetBonus>
            </>
          )}
        </ItemSetBonuses>
      </Statistic>
    );
  }
}

export default S2TierSet;
