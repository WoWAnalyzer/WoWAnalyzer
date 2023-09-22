import TALENTS from 'common/TALENTS/evoker';
import { formatNumber } from 'common/format';

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Events, { CastEvent } from 'parser/core/Events';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import {
  RICOCHETING_PYROCLAST_MULTIPLIER,
  RICOCHETING_PYROCLAST_MAX_MULTIPLIER,
} from '../../constants';
import { getEruptionDamageEvents } from '../normalizers/CastLinkNormalizer';

import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';

/**
 * Eruption deals 30% more damage per enemy struck, up to 150%.
 */
class RicochetingPyroclast extends Analyzer {
  ricochetingPyroclastDamage: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.RICOCHETING_PYROCLAST_TALENT);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.ERUPTION_TALENT),
      this.onCast,
    );
  }

  onCast(event: CastEvent) {
    const damageEvents = getEruptionDamageEvents(event);
    const multiplier =
      damageEvents.length <= RICOCHETING_PYROCLAST_MAX_MULTIPLIER / RICOCHETING_PYROCLAST_MULTIPLIER
        ? RICOCHETING_PYROCLAST_MULTIPLIER * damageEvents.length
        : RICOCHETING_PYROCLAST_MAX_MULTIPLIER;

    damageEvents.forEach((damEvent) => {
      this.ricochetingPyroclastDamage += calculateEffectiveDamage(damEvent, multiplier);
    });
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            <li>Damage: {formatNumber(this.ricochetingPyroclastDamage)}</li>
          </>
        }
      >
        <TalentSpellText talent={TALENTS.RICOCHETING_PYROCLAST_TALENT}>
          <ItemDamageDone amount={this.ricochetingPyroclastDamage} />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default RicochetingPyroclast;
