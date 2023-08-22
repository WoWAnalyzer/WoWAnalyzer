import SPELLS from 'common/SPELLS/evoker';
import TALENTS from 'common/TALENTS/evoker';
import { formatNumber } from 'common/format';

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import { TECTONIC_LOCUS_MULTIPLIER } from '../../constants';

import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';

/**
 * Upheaval deals 50% increased damage to the primary target, and launches them higher.
 */
class TectonicLocus extends Analyzer {
  tectonicLocusDamage: number = 0;
  currentMainTargetID: number = 0;

  upheaval = [SPELLS.UPHEAVAL, SPELLS.UPHEAVAL_FONT];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.RICOCHETING_PYROCLAST_TALENT);

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(this.upheaval), this.onCast);

    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.UPHEAVAL_DAM), this.onHit);
  }

  onCast(event: CastEvent) {
    this.currentMainTargetID = event.targetID ?? 0;
  }

  onHit(event: DamageEvent) {
    if (event.targetID === this.currentMainTargetID) {
      this.tectonicLocusDamage += calculateEffectiveDamage(event, TECTONIC_LOCUS_MULTIPLIER);
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
            <li>Damage: {formatNumber(this.tectonicLocusDamage)}</li>
          </>
        }
      >
        <TalentSpellText talent={TALENTS.TECTONIC_LOCUS_TALENT}>
          <ItemDamageDone amount={this.tectonicLocusDamage} />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default TectonicLocus;
