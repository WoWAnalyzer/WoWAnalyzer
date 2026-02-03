import SPELLS from 'common/SPELLS/evoker';
import TALENTS from 'common/TALENTS/evoker';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { EmpowerEndEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { SpellLink } from 'interface';
import { plotOneVariableBinomChart } from 'parser/shared/modules/helpers/Probability';
import {
  EBSource,
  eventGeneratedEB,
  eventWastedEB,
} from '../../../normalizers/EssenceBurstCastLinkNormalizer';
import { ESSENCE_WELL_ESSENCE_CHANCE } from 'analysis/retail/evoker/shared/constants';
import Soup from 'interface/icons/Soup';
import { InformationIcon } from 'interface/icons';

/**
 * Fire Breath has a 50% chance to generate Essence Burst.
 */
class EssenceWell extends Analyzer {
  fireBreathCasts = 0;
  essenceBurstGenerated = 0;
  essenceBurstWasted = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.ESSENCE_WELL_TALENT);

    this.addEventListener(
      Events.empowerEnd.by(SELECTED_PLAYER).spell([SPELLS.FIRE_BREATH, SPELLS.FIRE_BREATH_FONT]),
      this.onEmpowerEnd,
    );
  }

  onEmpowerEnd(event: EmpowerEndEvent) {
    this.fireBreathCasts += 1;

    if (eventGeneratedEB(event, EBSource.EssenceWell)) {
      this.essenceBurstGenerated += 1;
    } else if (eventWastedEB(event, EBSource.EssenceWell)) {
      this.essenceBurstWasted += 1;
    }
  }

  statistic() {
    const procs = this.essenceBurstGenerated + this.essenceBurstWasted;

    return (
      <Statistic
        position={STATISTIC_ORDER.CORE()}
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
        tooltip={
          <>
            <li>Procs: {procs}</li>
            <li>
              Expected procs: {Math.floor(this.fireBreathCasts * ESSENCE_WELL_ESSENCE_CHANCE)}
            </li>
            {this.essenceBurstWasted > 0 && (
              <>
                Wasted <SpellLink spell={SPELLS.ESSENCE_BURST_BUFF} /> represent the amount you lost
                out on due to overcapping.
              </>
            )}
          </>
        }
      >
        <TalentSpellText talent={TALENTS.ESSENCE_WELL_TALENT}>
          <div>
            <Soup /> {this.essenceBurstGenerated}{' '}
            <small>
              <SpellLink spell={SPELLS.ESSENCE_BURST_AUGMENTATION_BUFF} /> generated
            </small>
          </div>
          {this.essenceBurstWasted > 0 && (
            <div>
              <InformationIcon /> {this.essenceBurstWasted}{' '}
              <small>
                <SpellLink spell={SPELLS.ESSENCE_BURST_AUGMENTATION_BUFF} /> wasted
              </small>
            </div>
          )}
        </TalentSpellText>
        {plotOneVariableBinomChart(procs, this.fireBreathCasts, ESSENCE_WELL_ESSENCE_CHANCE)}
      </Statistic>
    );
  }
}

export default EssenceWell;
