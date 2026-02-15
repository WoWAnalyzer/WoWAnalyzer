import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import TALENTS from 'common/TALENTS/evoker';
import SPELLS from 'common/SPELLS/evoker';
import Events, { DamageEvent } from 'parser/core/Events';
import { SHATTERING_STARS_MULTIPLIER_PER_RANK } from '../../constants';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import DonutChart from 'parser/ui/DonutChart';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import { formatNumber } from 'common/format';
import TalentSpellText from 'parser/ui/TalentSpellText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import { getEternitySurgeEventForShatteringStarDamage } from '../normalizers/CastLinkNormalizer';
import SpellLink from 'interface/SpellLink';

/**
 * Eternity Surge additionally releases a Shattering Star at your target
 * that deals 50% more damage per empower level reached.
 */
class ShatteringStars extends Analyzer {
  baseDamage = 0;
  empowermentLevelDamage = 0;

  scintillationExtraHitsDamage = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.SHATTERING_STARS_TALENT);

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.SHATTERING_STAR_DAMAGE),
      this.onDamage,
    );
  }

  protected onDamage(event: DamageEvent) {
    const empowerEndEvent = getEternitySurgeEventForShatteringStarDamage(event);
    const baseAmount = event.amount + (event.absorbed || 0);

    // No Empower End event means that this is triggered by Scintillation
    if (!empowerEndEvent) {
      this.scintillationExtraHitsDamage += baseAmount;
      return;
    }

    const uprankedDamage = this.getUprankedDamage(event, empowerEndEvent.empowermentLevel);

    this.baseDamage += baseAmount - uprankedDamage;
    this.empowermentLevelDamage += uprankedDamage;
  }

  protected getUprankedDamage(event: DamageEvent, empowerLevel: number) {
    const amountOfUprank = empowerLevel - 1;
    if (amountOfUprank === 0) {
      return 0;
    }

    return calculateEffectiveDamage(event, SHATTERING_STARS_MULTIPLIER_PER_RANK * amountOfUprank);
  }

  get shatteringStarsTotalDamage() {
    return this.baseDamage + this.empowermentLevelDamage + this.scintillationExtraHitsDamage;
  }

  get shatteringStarsStatisticsElement() {
    const items = [
      {
        color: 'rgb(123,188,93)',
        label: <SpellLink spell={TALENTS.ETERNITY_SURGE_TALENT} />,
        valueTooltip: formatNumber(this.baseDamage),
        value: this.baseDamage,
      },
      {
        color: 'rgb(41,134,204)',
        label: 'Empowerment amp',
        valueTooltip: formatNumber(this.empowermentLevelDamage),
        value: this.empowermentLevelDamage,
      },
      {
        color: 'rgb(183,65,14)',
        label: <SpellLink spell={TALENTS.SCINTILLATION_TALENT} />,
        valueTooltip: formatNumber(this.scintillationExtraHitsDamage),
        value: this.scintillationExtraHitsDamage,
      },
    ].sort((a, b) => b.value - a.value);

    return (
      <>
        <TalentSpellText talent={TALENTS.SHATTERING_STARS_TALENT}>
          <ItemDamageDone amount={this.shatteringStarsTotalDamage} />
        </TalentSpellText>
        <div className="pad">
          <label>Damage sources</label>
          <DonutChart items={items} />
        </div>
      </>
    );
  }

  get shatteringStarsTooltipElement() {
    return (
      <li>
        <SpellLink spell={TALENTS.SHATTERING_STARS_TALENT} /> damage:{' '}
        {formatNumber(this.shatteringStarsTotalDamage)}
      </li>
    );
  }

  statistic() {
    if (this.selectedCombatant.hasTalent(TALENTS.STAR_SALVO_TALENT)) {
      return null;
    }

    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={<>{this.shatteringStarsTooltipElement}</>}
      >
        {this.shatteringStarsStatisticsElement}
      </Statistic>
    );
  }
}

export default ShatteringStars;
