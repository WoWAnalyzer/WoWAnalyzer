import SPELLS from 'common/SPELLS/evoker';
import TALENTS from 'common/TALENTS/evoker';
import { formatNumber } from 'common/format';

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Events, { CastEvent } from 'parser/core/Events';
import { getPupilDamageEvent } from '../normalizers/CastLinkNormalizer';

import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';

/**
 * When cast at an enemy, Living Flame strikes 1 additional enemy for 100% damage.
 */
class PupilOfAlexstrasza extends Analyzer {
  PupilOfAlexstraszaDamage: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.PUPIL_OF_ALEXSTRASZA_TALENT);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.LIVING_FLAME_CAST),
      this.onCast,
    );
  }

  onCast(event: CastEvent) {
    const damageEvent = getPupilDamageEvent(event);
    if (!damageEvent) {
      return;
    }

    this.PupilOfAlexstraszaDamage += damageEvent.amount + (damageEvent.absorbed ?? 0);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            <li>Damage: {formatNumber(this.PupilOfAlexstraszaDamage)}</li>
          </>
        }
      >
        <TalentSpellText talent={TALENTS.PUPIL_OF_ALEXSTRASZA_TALENT}>
          <ItemDamageDone amount={this.PupilOfAlexstraszaDamage} />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default PupilOfAlexstrasza;
