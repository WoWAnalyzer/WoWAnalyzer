import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/hunter';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import AverageTargetsHit from 'parser/ui/AverageTargetsHit';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import CastEfficiencyPanel from 'interface/guide/components/CastEfficiencyPanel';
import SpellLink from 'interface/SpellLink';
/**
 * Cost: 20 focus, 40 yd range. 30 Second cooldown.
 * Fires an explosive shot at your target. After 3 sec, the shot will explode, dealing (291% of Attack power) Fire damage to all enemies within 8 yds. Deals reduced damage beyond 5 targets.
 *
 * Existing Explosive Shot explodes on the target if a new application occurs.
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/Rn9XxCYLm1q7KFNW#fight=3&type=damage-done&source=15&ability=212680
 */

class ExplosiveShot extends Analyzer {
  hits = 0;
  damage = 0;
  casts = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.EXPLOSIVE_SHOT_TALENT);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.EXPLOSIVE_SHOT_TALENT),
      this.onCast,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.EXPLOSIVE_SHOT_DAMAGE),
      this.onDamage,
    );
  }

  onCast() {
    this.casts += 1;
  }

  onDamage(event: DamageEvent) {
    this.hits += 1;
    this.damage += event.amount + (event.absorbed || 0);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spell={TALENTS.EXPLOSIVE_SHOT_TALENT}>
          <>
            <ItemDamageDone amount={this.damage} />
            <br />
            <AverageTargetsHit casts={this.casts} hits={this.hits} unique />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
  get guideSubsectionSV() {
    const explanation = (
      <p>
        <strong>
          <SpellLink spell={TALENTS.EXPLOSIVE_SHOT_TALENT} />
        </strong>{' '}
        deals damage after 3 second delay Always use it on cooldown. You may spend a{' '}
        <SpellLink spell={TALENTS.TIP_OF_THE_SPEAR_TALENT} /> on a cast but do not delay a cast
        specifically to tip it. Cast prior to using{' '}
        <SpellLink spell={TALENTS.COORDINATED_ASSAULT_TALENT} /> as Explosive Shot does not snapshot
        its damage on cast.
      </p>
    );

    const data = <CastEfficiencyPanel spell={TALENTS.EXPLOSIVE_SHOT_TALENT} useThresholds />;

    return explanationAndDataSubsection(explanation, data);
  }
}

export default ExplosiveShot;
