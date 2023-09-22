import SPELLS from 'common/SPELLS/evoker';
import TALENTS from 'common/TALENTS/evoker';
import { formatNumber } from 'common/format';

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Events, { CastEvent } from 'parser/core/Events';
import { getPupilDamageEvents } from '../normalizers/CastLinkNormalizer';

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
    const damageEvents = getPupilDamageEvents(event);
    if (damageEvents.length > 1) {
      damageEvents.forEach((damEvent) => {
        this.PupilOfAlexstraszaDamage += damEvent.amount + (damEvent.absorbed ?? 0);
      });
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            <li>Damage: {formatNumber(this.PupilOfAlexstraszaDamage / 2)}</li>
          </>
        }
      >
        <TalentSpellText talent={TALENTS.PUPIL_OF_ALEXSTRASZA_TALENT}>
          <ItemDamageDone amount={this.PupilOfAlexstraszaDamage / 2} />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default PupilOfAlexstrasza;
