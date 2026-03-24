import { formatThousands, formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warlock';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

import SoulShardTracker from '../soulshards/SoulShardTracker';

/*
  Shadowburn (Tier 30 Destruction talent):
    Blasts a target for X Shadowflame damage. If the target dies within 5 sec and yields experience or honor, Shadowburn's cooldown is reset.
    Generates 3 Soul Shard Fragments.
 */
const FRAGMENTS_PER_CHAOS_BOLT = 20;

class Shadowburn extends Analyzer {
  get dps() {
    return (this.damage / this.owner.fightDuration) * 1000;
  }

  static dependencies = {
    soulShardTracker: SoulShardTracker,
    abilityTracker: AbilityTracker,
  };

  protected soulShardTracker!: SoulShardTracker;
  protected abilityTracker!: AbilityTracker;

  damage = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.SHADOWBURN_TALENT);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(TALENTS.SHADOWBURN_TALENT),
      this.onShadowburnDamage,
    );
  }

  onShadowburnDamage(event: DamageEvent) {
    this.damage += (event.amount || 0) + (event.absorbed || 0);
  }

  statistic() {
    const avg = this.abilityTracker.getAbilityDamagePerCast(SPELLS.CHAOS_BOLT.id);
    const fragments = this.soulShardTracker.getGeneratedBySpell(TALENTS.SHADOWBURN_TALENT.id);
    const estimatedDamage = Math.floor(fragments / FRAGMENTS_PER_CHAOS_BOLT) * avg;
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <>
            {formatThousands(this.damage)} damage
            <br />
            <br />
            If fragments generated with Shadowburn were used on Chaos Bolts, they would deal an
            estimated {formatThousands(estimatedDamage)} damage (
            {this.owner.formatItemDamageDone(estimatedDamage)}). This is estimated using average
            Chaos Bolt damage over the fight.
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS.SHADOWBURN_TALENT}>
          {formatNumber(this.dps)} DPS{' '}
          <small>
            {formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.damage))} % of total
          </small>{' '}
          <br />
          {fragments} <small>generated Fragments</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Shadowburn;
