import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/evoker';

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Events, { DamageEvent } from 'parser/core/Events';

import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';

const { ETERNITY_SURGE_DAM, ETERNITY_SURGE, ETERNITY_SURGE_FONT } = SPELLS;

class Scintillation extends Analyzer {
  lastEternitySurgeCast: number = 0;
  scintillationProcs: number = 0;
  scintillationDamage: number = 0;
  waitingForEternitySurgeHit: boolean = false;

  constructor(options: Options) {
    super(options);

    this.addEventListener(
      Events.empowerEnd.by(SELECTED_PLAYER).spell([ETERNITY_SURGE, ETERNITY_SURGE_FONT]),
      (event) => {
        this.lastEternitySurgeCast = event.timestamp;
        this.waitingForEternitySurgeHit = true;
      },
    );

    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(ETERNITY_SURGE_DAM), this.onHit);
  }

  onHit(event: DamageEvent) {
    // Filter after first ES hit from eternity surge cast, so we only grab Scintilation procs
    if (!this.waitingForEternitySurgeHit) {
      this.scintillationProcs += 1;
      this.scintillationDamage += event.amount;
    } else {
      this.waitingForEternitySurgeHit = false;
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.GENERAL}
      >
        <BoringSpellValueText spellId={TALENTS.SCINTILLATION_TALENT.id}>
          <ItemDamageDone amount={this.scintillationDamage} /> <br />
          <span style={{ fontSize: '65%' }}>{Math.floor(this.scintillationProcs)} procs.</span>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Scintillation;
