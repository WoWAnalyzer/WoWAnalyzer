import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { TALENTS_DRUID } from 'common/TALENTS';
import { hardcastTargetsHit } from 'analysis/retail/druid/balance/normalizers/CastLinkNormalizer';
import TalentSpellText from 'parser/ui/TalentSpellText';
import ItemPercentDamageDone from 'parser/ui/ItemPercentDamageDone';

const TWIN_MOONS_BONUS_DAMAGE = 0.1;

/**
 * **Twin Moons**
 * Spec Talent
 *
 * Moonfire deals 10% increased damage and also hits another nearby enemy within 15 yds of the target.
 */
export default class TwinMoons extends Analyzer {
  damage = 0;
  extraHits = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.TWIN_MOONS_TALENT);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.MOONFIRE_DEBUFF),
      this.onDamage,
    );
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.MOONFIRE_CAST), this.onCast);
  }

  onDamage(event: DamageEvent) {
    this.damage += calculateEffectiveDamage(event, TWIN_MOONS_BONUS_DAMAGE);
  }

  onCast(event: CastEvent) {
    if (hardcastTargetsHit(event) >= 2) {
      this.extraHits += 1;
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(7)}
        size="flexible"
        tooltip={`The listed damage value counts ONLY the boost to Moonfire's damage, and does not account for the saved GCDs incurred by producing extra moonfire debuffs.`}
      >
        <TalentSpellText talent={TALENTS_DRUID.TWIN_MOONS_TALENT}>
          <>
            <ItemPercentDamageDone amount={this.damage} />
            <br />
            {this.owner.getPerMinute(this.extraHits).toFixed(1)}{' '}
            <small>extra moonfires per minute</small>
          </>
        </TalentSpellText>
      </Statistic>
    );
  }
}
