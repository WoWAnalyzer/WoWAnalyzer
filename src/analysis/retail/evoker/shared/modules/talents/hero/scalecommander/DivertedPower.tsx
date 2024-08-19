import SPELLS from 'common/SPELLS/evoker';
import TALENTS from 'common/TALENTS/evoker';

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';

import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { SpellLink } from 'interface';
import {
  EBSource,
  eventGeneratedEB,
  eventWastedEB,
} from '../../../normalizers/EssenceBurstCastLinkNormalizer';
import { formatPercentage } from 'common/format';
import Soup from 'interface/icons/Soup';
import { InformationIcon } from 'interface/icons';

/**
 * Bombardments have a chance to generate Essence Burst.
 */
class DivertedPower extends Analyzer {
  essenceBurstGenerated = 0;
  essenceBurstWasted = 0;

  procAttempts = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.DIVERTED_POWER_TALENT);

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.BOMBARDMENTS_DAMAGE),
      this.onDamage,
    );
  }

  onDamage(event: DamageEvent) {
    this.procAttempts += 1;

    if (eventGeneratedEB(event, EBSource.DivertedPower)) {
      this.essenceBurstGenerated += 1;
    } else if (eventWastedEB(event, EBSource.DivertedPower)) {
      this.essenceBurstWasted -= 1;
    }
  }

  get procRate() {
    return (this.essenceBurstGenerated + this.essenceBurstWasted) / this.procAttempts;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
        tooltip={
          <>
            <SpellLink spell={SPELLS.BOMBARDMENTS_DAMAGE} /> procs: {this.procAttempts}
          </>
        }
      >
        <TalentSpellText talent={TALENTS.DIVERTED_POWER_TALENT}>
          <div>
            <Soup /> {this.essenceBurstGenerated}
            <small>
              {' '}
              <SpellLink spell={SPELLS.ESSENCE_BURST_AUGMENTATION_BUFF} /> generated
            </small>
          </div>

          {this.essenceBurstWasted > 0 && (
            <div>
              <InformationIcon /> {this.essenceBurstWasted}
              <small>
                {' '}
                <SpellLink spell={SPELLS.ESSENCE_BURST_AUGMENTATION_BUFF} /> wasted
              </small>
            </div>
          )}

          <div>
            <InformationIcon /> {formatPercentage(this.procRate)}% <small>proc rate</small>
          </div>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default DivertedPower;
