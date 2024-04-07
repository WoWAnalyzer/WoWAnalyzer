import SPELLS from 'common/SPELLS/evoker';
import TALENTS from 'common/TALENTS/evoker';

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { ANACHRONISM_ESSCENCE_CHANCE } from '../../constants';

import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { SpellLink } from 'interface';
import { plotOneVariableBinomChart } from 'parser/shared/modules/helpers/Probability';
import {
  EBSource,
  eventGeneratedEB,
} from '../../../shared/modules/normalizers/EssenceBurstCastLinkNormalizer';

/**
 * Prescience has a 35% chance to grant Essence Burst.
 */
class Anachronism extends Analyzer {
  prescienceCasts: number = 0;
  essenceBurstGenerated: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.ANACHRONISM_TALENT);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.PRESCIENCE_TALENT),
      this.onCast,
    );
  }

  onCast(event: CastEvent) {
    this.prescienceCasts += 1;
    if (eventGeneratedEB(event, EBSource.Prescience)) {
      this.essenceBurstGenerated += 1;
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
            <li>Procs: {Math.floor(this.essenceBurstGenerated)}</li>
            <li>
              Expected procs: {Math.floor(this.prescienceCasts * ANACHRONISM_ESSCENCE_CHANCE)}
            </li>
          </>
        }
      >
        <TalentSpellText talent={TALENTS.ANACHRONISM_TALENT}>
          {this.essenceBurstGenerated}{' '}
          <small>
            <SpellLink spell={SPELLS.ESSENCE_BURST_AUGMENTATION_BUFF} /> generated
          </small>
        </TalentSpellText>
        {plotOneVariableBinomChart(
          this.essenceBurstGenerated,
          this.prescienceCasts,
          ANACHRONISM_ESSCENCE_CHANCE,
        )}
      </Statistic>
    );
  }
}

export default Anachronism;
