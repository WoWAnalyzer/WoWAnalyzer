import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/evoker';
import { formatNumber } from 'common/format';

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Events, { DamageEvent } from 'parser/core/Events';

import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { plotOneVariableBinomChart } from 'parser/shared/modules/helpers/Probability';

import { SCINTILLATION_PROC_CHANCE } from 'analysis/retail/evoker/devastation/constants';
import TalentSpellText from 'parser/ui/TalentSpellText';

const { ETERNITY_SURGE_DAM, ETERNITY_SURGE, ETERNITY_SURGE_FONT, DISINTEGRATE } = SPELLS;

class Scintillation extends Analyzer {
  scintillationProcs: number = 0;
  scintillationDamage: number = 0;
  awaitingEternitySurgeHit: boolean = false;
  allowScintillationDetection: boolean = false;
  lastEternitySurgeHit: number = 0;
  scintProcNoted: number = 0;

  scintillationProcChances: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.SCINTILLATION_TALENT);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell([ETERNITY_SURGE, ETERNITY_SURGE_FONT]),
      () => {
        this.awaitingEternitySurgeHit = true;
        this.allowScintillationDetection = false;
      },
    );

    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(DISINTEGRATE), () => {
      this.allowScintillationDetection = true;
      this.scintillationProcChances += 1;
    });

    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(ETERNITY_SURGE_DAM), this.onHit);
  }

  onHit(event: DamageEvent) {
    if (this.awaitingEternitySurgeHit) {
      this.lastEternitySurgeHit = event.timestamp;
      this.awaitingEternitySurgeHit = false;
      this.allowScintillationDetection = true;
      return;
    }
    if (this.allowScintillationDetection && event.timestamp > this.lastEternitySurgeHit) {
      this.scintProcNoted = event.timestamp;
      this.scintillationProcs += 1;
      this.allowScintillationDetection = false;
    }
    if (event.timestamp === this.scintProcNoted) {
      this.scintillationDamage += event.amount + (event.absorbed ?? 0);
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
