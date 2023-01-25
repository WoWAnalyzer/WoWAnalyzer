import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import { TALENTS_DRUID } from 'common/TALENTS';
import Events, { DamageEvent } from 'parser/core/Events';
import Enemies from 'parser/shared/modules/Enemies';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import { getRampantFerocityHits } from 'analysis/retail/druid/feral/normalizers/RampantFerocityLinkNormalizer';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { SpellLink } from 'interface';
import TalentSpellText from 'parser/ui/TalentSpellText';
import ItemPercentDamageDone from 'parser/ui/ItemPercentDamageDone';

const BLEED_SPELL_IDS = [
  SPELLS.RIP.id,
  SPELLS.RAKE_BLEED.id,
  SPELLS.THRASH_FERAL.id,
  SPELLS.THRASH_BEAR.id,
  SPELLS.FERAL_FRENZY_DEBUFF.id,
  SPELLS.TEAR.id,
  SPELLS.FRENZIED_ASSAULT.id,
];

const BOOST_PER_BLEED_PER_RANK = 0.05;

/**
 * **Taste for Blood**
 * Spec Talent
 *
 * Ferocious Bite deals 5% increased damage for each of your Bleeds on the target.
 */
class TasteForBlood extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  enemies!: Enemies;

  rank: number;

  /** Extra damage to Ferocious Bite due to this talent's boost */
  fbBoostDamage = 0;
  /** Extra damage to Rampant Ferocity due to this talent's boost */
  rfBoostDamage = 0;

  /** Total FB hits and total bleeds tallied (for calculating average) */
  totalFbHits = 0;
  totalBleedCount = 0;

  constructor(options: Options) {
    super(options);
    this.rank = this.selectedCombatant.getTalentRank(TALENTS_DRUID.TASTE_FOR_BLOOD_TALENT);
    this.active = this.rank > 0;

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.FEROCIOUS_BITE),
      this.onFbDamage,
    );
  }

  onFbDamage(event: DamageEvent) {
    const target = this.enemies.getEntity(event);
    if (target) {
      this.totalFbHits += 1;
      const bleedCount = BLEED_SPELL_IDS.reduce(
        (acc, id) => acc + (target.hasBuff(id, null, 0, 0, this.selectedCombatant.id) ? 1 : 0),
        0,
      );
      this.totalBleedCount += bleedCount;

      const boost = BOOST_PER_BLEED_PER_RANK * this.rank * bleedCount;
      this.fbBoostDamage += calculateEffectiveDamage(event, boost);
      getRampantFerocityHits(event).forEach(
        (e) => (this.rfBoostDamage += calculateEffectiveDamage(e, boost)),
      );
    }
  }

  get avgBleeds() {
    return this.totalFbHits === 0 ? 0 : this.totalBleedCount / this.totalFbHits;
  }

  get totalDamage() {
    return this.fbBoostDamage + this.rfBoostDamage;
  }

  statistic() {
    const hasRf = this.selectedCombatant.hasTalent(TALENTS_DRUID.RAMPANT_FEROCITY_TALENT);
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(5)} // number based on talent row
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            Average bleeds on bite hit: <strong>{this.avgBleeds.toFixed(1)}</strong>
            {hasRf && (
              <>
                <br />
                <br />
                Damage Breakdown:
                <ul>
                  <li>
                    <SpellLink id={SPELLS.FEROCIOUS_BITE.id} />:
                    <strong>{this.owner.formatItemDamageDone(this.fbBoostDamage)}</strong>
                  </li>
                  <li>
                    <SpellLink id={SPELLS.RAMPANT_FEROCITY.id} />:
                    <strong>{this.owner.formatItemDamageDone(this.rfBoostDamage)}</strong>
                  </li>
                </ul>
              </>
            )}
          </>
        }
      >
        <TalentSpellText talent={TALENTS_DRUID.TASTE_FOR_BLOOD_TALENT}>
          <ItemPercentDamageDone amount={this.totalDamage} />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default TasteForBlood;
