import { formatDuration, formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import HIT_TYPES from 'game/HIT_TYPES';
import { TALENTS_MONK } from 'common/TALENTS';
import { Talent } from 'common/TALENTS/types';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { HealEvent, DamageEvent, CastEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import HealingDone from 'parser/shared/modules/throughput/HealingDone';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { SpellLink } from 'interface';

const UPLIFTED_SPIRITS_REDUCTION = 1000;
const BASE_COOLDOWN = 60 * 3 * 1000;

/**
 * Every time you cast rising sun kick it reduces revival's cooldown by 1 second and whenever you cast revival x% of that healing is done again as a hot over 10 seconds
 */
class UpliftedSpirits extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    healingDone: HealingDone,
  };
  cooldownReductionUsed: number = 0;
  totalRskCdr: number = 0;
  totalVivifyCdr: number = 0;
  cooldownReductionWasted: number = 0;
  activeTalent!: Talent;
  totalCasts: number = 0;
  protected spellUsable!: SpellUsable;
  protected healingDone!: HealingDone;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.UPLIFTED_SPIRITS_TALENT);
    if (!this.active) {
      return;
    }
    this.activeTalent = this.selectedCombatant.hasTalent(TALENTS_MONK.REVIVAL_TALENT)
      ? TALENTS_MONK.REVIVAL_TALENT
      : TALENTS_MONK.RESTORAL_TALENT;
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.RISING_SUN_KICK_DAMAGE),
      this.rskHit,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell([SPELLS.VIVIFY, SPELLS.INVIGORATING_MISTS_HEAL]),
      this.vivifyHit,
    );
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(this.activeTalent), this.onCast);
  }

  rskHit(event: DamageEvent) {
    // Cooldown Reduction on Revival
    if (this.spellUsable.isOnCooldown(this.activeTalent.id)) {
      this.cooldownReductionUsed += this.spellUsable.reduceCooldown(
        this.activeTalent.id,
        UPLIFTED_SPIRITS_REDUCTION,
      );
    } else {
      this.cooldownReductionWasted += UPLIFTED_SPIRITS_REDUCTION;
    }
    this.totalRskCdr += UPLIFTED_SPIRITS_REDUCTION;
  }

  vivifyHit(event: HealEvent) {
    if (event.hitType !== HIT_TYPES.CRIT) {
      return;
    }
    if (this.spellUsable.isOnCooldown(this.activeTalent.id)) {
      this.cooldownReductionUsed += this.spellUsable.reduceCooldown(
        this.activeTalent.id,
        UPLIFTED_SPIRITS_REDUCTION,
      );
    } else {
      this.cooldownReductionWasted += UPLIFTED_SPIRITS_REDUCTION;
    }
    this.totalVivifyCdr += UPLIFTED_SPIRITS_REDUCTION;
  }

  onCast(event: CastEvent) {
    this.totalCasts += 1;
  }

  get usHealing() {
    return this.healingDone.byAbility(SPELLS.UPLIFTED_SPIRITS_HEAL.id).effective;
  }

  get rsrOverHealing() {
    return this.healingDone.byAbility(SPELLS.UPLIFTED_SPIRITS_HEAL.id).overheal;
  }

  get averageCdr() {
    // didnt use any cdr
    if (this.totalCasts <= 1) {
      return 0;
    }
    return this.cooldownReductionUsed / this.totalCasts - 1;
  }

  statistic() {
    const healing = this.usHealing;
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(15)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            Effective Cooldown Reduction: {formatNumber(this.cooldownReductionUsed / 1000)} Seconds
            <br />
            Wasted Cooldown Reduction: {formatNumber(this.cooldownReductionWasted / 1000)} Seconds
            <br />
            Total reduction from <SpellLink spell={SPELLS.VIVIFY} />:{' '}
            {formatNumber(this.totalVivifyCdr / 1000)} Seconds
            <br />
            Total reduction from <SpellLink spell={TALENTS_MONK.RISING_SUN_KICK_TALENT} />:{' '}
            {formatNumber(this.totalRskCdr / 1000)} Seconds
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS_MONK.UPLIFTED_SPIRITS_TALENT}>
          <ItemHealingDone amount={healing} />
          <div>
            {formatDuration(BASE_COOLDOWN - this.averageCdr)}{' '}
            <small>
              average <SpellLink spell={this.activeTalent} /> cooldown
            </small>
          </div>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default UpliftedSpirits;
