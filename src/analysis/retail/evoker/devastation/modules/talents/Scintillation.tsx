import SPELLS from 'common/SPELLS/evoker';
import TALENTS from 'common/TALENTS/evoker';
import { formatNumber } from 'common/format';

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Events, { DamageEvent, HasRelatedEvent } from 'parser/core/Events';

import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { plotOneVariableBinomChart } from 'parser/shared/modules/helpers/Probability';

import { SCINTILLATION_PROC_CHANCE } from 'analysis/retail/evoker/devastation/constants';
import TalentSpellText from 'parser/ui/TalentSpellText';
import {
  ETERNITY_SURGE_FROM_CAST,
  MAX_ES_HIT_BUFFER_MS,
} from '../normalizers/EternitySurgeNormalizer';

/**
 * Disintegrate has a 15% chance each time it deals damage to launch a level 1 Eternity Surge at 50% power.
 */
class Scintillation extends Analyzer {
  scintillationDamage = 0;
  scintillationProcs = 0;
  scintillationProcChances = 0;

  lastScintillationProcTimestamp = 0;
  hasEternitySpan = false;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.SCINTILLATION_TALENT);
    this.hasEternitySpan = this.selectedCombatant.hasTalent(TALENTS.ETERNITYS_SPAN_TALENT);

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.DISINTEGRATE),
      this.onDisintegrateDamage,
    );

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.ETERNITY_SURGE_DAM),
      this.onHit,
    );
  }

  private onDisintegrateDamage() {
    this.scintillationProcChances += 1;
  }

  private onHit(event: DamageEvent) {
    if (HasRelatedEvent(event, ETERNITY_SURGE_FROM_CAST)) {
      return;
    }

    this.scintillationDamage += event.amount + (event.absorbed ?? 0);

    // With Eternity Span we'll shoot out two hits per proc
    if (
      this.hasEternitySpan &&
      event.timestamp - this.lastScintillationProcTimestamp < MAX_ES_HIT_BUFFER_MS
    ) {
      return;
    }

    this.scintillationProcs += 1;
    this.lastScintillationProcTimestamp = event.timestamp;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            <li>Procs: {Math.floor(this.scintillationProcs)}</li>
            <li>
              Expected procs:{' '}
              {Math.floor(this.scintillationProcChances * SCINTILLATION_PROC_CHANCE)}
            </li>
            <li>Damage: {formatNumber(this.scintillationDamage)}</li>
          </>
        }
      >
        <TalentSpellText talent={TALENTS.SCINTILLATION_TALENT}>
          <ItemDamageDone amount={this.scintillationDamage} />
        </TalentSpellText>
        {plotOneVariableBinomChart(
          this.scintillationProcs,
          this.scintillationProcChances,
          SCINTILLATION_PROC_CHANCE,
        )}
      </Statistic>
    );
  }
}

export default Scintillation;
