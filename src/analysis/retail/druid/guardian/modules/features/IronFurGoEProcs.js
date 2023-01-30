import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import Analyzer from 'parser/core/Analyzer';
import BoringSpellValue from 'parser/ui/BoringSpellValue';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import GuardianOfElune from './GuardianOfElune';

class IronFurGoEProcs extends Analyzer {
  static dependencies = {
    guardianOfElune: GuardianOfElune,
  };

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.GUARDIAN_OF_ELUNE_TALENT);
  }

  statistic() {
    const nonGoEIronFur = this.guardianOfElune.nonGoEIronFur;
    const GoEIronFur = this.guardianOfElune.GoEIronFur;
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(10)}
        size="flexible"
        tooltip={
          <>
            You cast <strong>{nonGoEIronFur + GoEIronFur}</strong> total {SPELLS.IRONFUR.name} and{' '}
            <strong>{GoEIronFur}</strong> were buffed by 2s.
          </>
        }
      >
        <BoringSpellValue
          spellId={SPELLS.IRONFUR.id}
          value={`${formatPercentage(nonGoEIronFur / (nonGoEIronFur + GoEIronFur))}%`}
          label="Unbuffed Ironfur"
        />
      </Statistic>
    );
  }
}

export default IronFurGoEProcs;
