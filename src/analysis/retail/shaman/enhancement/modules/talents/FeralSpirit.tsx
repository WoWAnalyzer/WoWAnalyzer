import SPELLS from 'common/SPELLS';
import Analyzer, { Options } from 'parser/core/Analyzer';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ResourceGenerated from 'parser/ui/ResourceGenerated';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import TALENTS from 'common/TALENTS/shaman';
import { MaelstromWeaponTracker } from '../resourcetracker';

class FeralSpirit extends Analyzer {
  static dependencies = {
    resourceTracker: MaelstromWeaponTracker,
  };

  resourceTracker!: MaelstromWeaponTracker;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.FERAL_SPIRIT_TALENT);

    if (!this.active) {
      return;
    }
  }

  statistic() {
    const feralSpirits = this.resourceTracker.buildersObj[TALENTS.FERAL_SPIRIT_TALENT.id];
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        size="flexible"
        category={STATISTIC_CATEGORY.GENERAL}
      >
        <BoringSpellValueText spell={TALENTS.FERAL_SPIRIT_TALENT}>
          <>
            <ResourceGenerated
              amount={feralSpirits.generated + feralSpirits.wasted}
              resourceType={SPELLS.MAELSTROM_WEAPON_BUFF}
            />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default FeralSpirit;
