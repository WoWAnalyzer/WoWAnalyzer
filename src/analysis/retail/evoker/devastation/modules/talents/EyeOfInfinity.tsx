import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/evoker';
import { formatNumber } from 'common/format';

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Events, { CastEvent } from 'parser/core/Events';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';

import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { EYE_OF_INFINITY_MULTIPLIER } from 'analysis/retail/evoker/devastation/constants';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { getEternitySurgeDamageEvents } from '../normalizers/CastLinkNormalizer';
import { encodeEventTargetString } from 'parser/shared/modules/Enemies';
import { getEmpowerEndEvent } from 'analysis/retail/evoker/shared/modules/normalizers/EmpowerNormalizer';

class EyeOfInfinity extends Analyzer {
  totalDamage = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.EYE_OF_INFINITY_TALENT);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell([SPELLS.ETERNITY_SURGE, SPELLS.ETERNITY_SURGE_FONT]),
      this.onCast,
    );
  }

  private onCast(event: CastEvent) {
    const empowerEndEvent = getEmpowerEndEvent(event);
    if (!empowerEndEvent) return;

    const damageEvents = getEternitySurgeDamageEvents(empowerEndEvent);
    if (!damageEvents.length) return;

    const target = encodeEventTargetString(event);
    if (!target) {
      this.totalDamage += calculateEffectiveDamage(damageEvents[0], EYE_OF_INFINITY_MULTIPLIER);
    }

    const mainTargetEvent = damageEvents.find(
      (damageEvent) => encodeEventTargetString(damageEvent) === target,
    );
    if (mainTargetEvent) {
      // Target can die during travel time
      this.totalDamage += calculateEffectiveDamage(mainTargetEvent, EYE_OF_INFINITY_MULTIPLIER);
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            <li>Damage: {formatNumber(this.totalDamage)}</li>
          </>
        }
      >
        <TalentSpellText talent={TALENTS.EYE_OF_INFINITY_TALENT}>
          <ItemDamageDone amount={this.totalDamage} />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default EyeOfInfinity;
