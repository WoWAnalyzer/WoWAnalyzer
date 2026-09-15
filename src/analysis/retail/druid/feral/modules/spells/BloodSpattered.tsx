import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import { TALENTS_DRUID } from 'common/TALENTS';
import Events, {
  ApplyDebuffEvent,
  DamageEvent,
  RefreshDebuffEvent,
  RemoveDebuffEvent,
} from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import TalentSpellText from 'parser/ui/TalentSpellText';
import ItemPercentDamageDone from 'parser/ui/ItemPercentDamageDone';
import { SpellLink } from 'interface';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import { encodeEventTargetString } from 'parser/shared/modules/Enemies';
import { FB_SPELLS } from 'analysis/retail/druid/feral/constants';

const BOOST_PER_RIP = 0.02;
const MAX_RIPS = 10;

/**
 * **Blood Spattered**
 * Spec Talent
 *
 * Ferocious Bite's damage to its primary target is increased by 2% for each enemy affected by your
 * Rip, up to 10 (cap +20%).
 */
class BloodSpattered extends Analyzer {
  damage = 0;
  /** Targets that currently have your Rip applied. */
  private targetsWithRip: Set<string> = new Set();

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.BLOOD_SPATTERED_TALENT);

    this.addEventListener(
      Events.applydebuff.by(SELECTED_PLAYER).spell(SPELLS.RIP),
      this.onRipApply,
    );
    this.addEventListener(
      Events.refreshdebuff.by(SELECTED_PLAYER).spell(SPELLS.RIP),
      this.onRipApply,
    );
    this.addEventListener(
      Events.removedebuff.by(SELECTED_PLAYER).spell(SPELLS.RIP),
      this.onRipRemove,
    );

    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(FB_SPELLS), this.onFbDamage);
  }

  onRipApply(event: ApplyDebuffEvent | RefreshDebuffEvent) {
    const target = encodeEventTargetString(event);
    if (target) {
      this.targetsWithRip.add(target);
    }
  }

  onRipRemove(event: RemoveDebuffEvent) {
    const target = encodeEventTargetString(event);
    if (target) {
      this.targetsWithRip.delete(target);
    }
  }

  onFbDamage(event: DamageEvent) {
    const ripCount = Math.min(this.targetsWithRip.size, MAX_RIPS);
    if (ripCount === 0) {
      return;
    }
    this.damage += calculateEffectiveDamage(event, ripCount * BOOST_PER_RIP);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(7)} // number based on talent row
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            Bonus damage from <SpellLink spell={TALENTS_DRUID.BLOOD_SPATTERED_TALENT} />: each{' '}
            <SpellLink spell={SPELLS.FEROCIOUS_BITE} /> is boosted by 2% per enemy with your{' '}
            <SpellLink spell={SPELLS.RIP} /> (capped at 10).
          </>
        }
      >
        <TalentSpellText talent={TALENTS_DRUID.BLOOD_SPATTERED_TALENT}>
          <ItemPercentDamageDone amount={this.damage} />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default BloodSpattered;
