import { Options } from 'parser/core/Analyzer';
import TALENTS from 'common/TALENTS/evoker';
import { DamageEvent } from 'parser/core/Events';
import { STAR_SALVO_MULTIPLIER } from '../../constants';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import DonutChart from 'parser/ui/DonutChart';
import { getEmpowerCastEvent } from 'analysis/retail/evoker/shared/modules/normalizers/EmpowerNormalizer';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import { formatNumber } from 'common/format';
import TalentSpellText from 'parser/ui/TalentSpellText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import { encodeEventTargetString } from 'parser/shared/modules/Enemies';
import { getEternitySurgeEventForShatteringStarDamage } from '../normalizers/CastLinkNormalizer';
import SpellLink from 'interface/SpellLink';
import { BadColor } from 'interface/guide';
import ShatteringStars from './ShatteringStars';

const SCINTILLATION_BUFFER_MS = 200;

/**
 * Increases Shattering Star damage by 35%.
 * Shattering Stars are exhaled at all of your Eternity Surge targets.
 */
class StarSalvo extends ShatteringStars {
  hasSpan = this.selectedCombatant.hasTalent(TALENTS.ETERNITYS_SPAN_TALENT);

  starSalvoExtraHitsDamage = 0;
  starSalvoAmpedDamage = 0;

  lastScintillationEvent: DamageEvent | undefined;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.STAR_SALVO_TALENT);
  }

  protected onDamage(event: DamageEvent) {
    const empowerEndEvent = getEternitySurgeEventForShatteringStarDamage(event);
    let baseAmount = event.amount + (event.absorbed || 0);

    const starSalvoAmpedDamage = calculateEffectiveDamage(event, STAR_SALVO_MULTIPLIER);
    this.starSalvoAmpedDamage += starSalvoAmpedDamage;

    baseAmount -= starSalvoAmpedDamage;

    // No Empower End event means that this is triggered by Scintillation
    if (!empowerEndEvent) {
      if (!this.hasSpan) {
        this.scintillationExtraHitsDamage += baseAmount;
        return;
      }

      if (
        this.lastScintillationEvent &&
        encodeEventTargetString(event) !== encodeEventTargetString(this.lastScintillationEvent) &&
        event.timestamp - this.lastScintillationEvent.timestamp < SCINTILLATION_BUFFER_MS
      ) {
        this.starSalvoExtraHitsDamage += baseAmount;
        return;
      }

      this.lastScintillationEvent = event;
      this.scintillationExtraHitsDamage += baseAmount;
      return;
    }

    const uprankedDamage = this.getUprankedDamage(event, empowerEndEvent.empowermentLevel);
    this.empowermentLevelDamage += uprankedDamage;

    baseAmount -= uprankedDamage;

    const empowerCastEvent = getEmpowerCastEvent(empowerEndEvent);

    if (!empowerCastEvent) {
      this.addDebugAnnotation(empowerEndEvent, {
        color: BadColor,
        summary: 'Unable to find cast event for Empower end event',
      });
    }

    if (
      !empowerCastEvent ||
      encodeEventTargetString(event) === encodeEventTargetString(empowerCastEvent)
    ) {
      this.baseDamage += baseAmount;
    } else {
      this.starSalvoExtraHitsDamage += baseAmount;
    }
  }

  statistic() {
    const starSalvoItems = [
      {
        color: 'rgb(123,188,93)',
        label: 'Extra hits',
        valueTooltip: formatNumber(this.starSalvoExtraHitsDamage),
        value: this.starSalvoExtraHitsDamage,
      },
      {
        color: 'rgb(41,134,204)',
        label: 'Damage amp',
        valueTooltip: formatNumber(this.starSalvoAmpedDamage),
        value: this.starSalvoAmpedDamage,
      },
    ].sort((a, b) => b.value - a.value);

    const totalDamageStarSalvoDamage = this.starSalvoExtraHitsDamage + this.starSalvoAmpedDamage;

    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            {this.shatteringStarsTooltipElement}
            <li>
              <SpellLink spell={TALENTS.STAR_SALVO_TALENT} /> damage:{' '}
              {formatNumber(totalDamageStarSalvoDamage)}
            </li>
          </>
        }
      >
        {this.shatteringStarsStatisticsElement}
        <>
          <TalentSpellText talent={TALENTS.STAR_SALVO_TALENT}>
            <ItemDamageDone amount={totalDamageStarSalvoDamage} />
          </TalentSpellText>
          <div className="pad">
            <label>Damage sources</label>
            <DonutChart items={starSalvoItems} />
          </div>
        </>
      </Statistic>
    );
  }
}

export default StarSalvo;
