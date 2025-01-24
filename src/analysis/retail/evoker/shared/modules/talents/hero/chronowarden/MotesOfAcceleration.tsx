import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { TALENTS_EVOKER } from 'common/TALENTS';
import TalentSpellText from 'parser/ui/TalentSpellText';
import SPELLS from 'common/SPELLS';
import Events, { ApplyBuffEvent, CastEvent, RefreshBuffEvent } from 'parser/core/Events';
import { InformationIcon, WarningIcon } from 'interface/icons';
/**
 * Casting Hover spawns 3 Motes of Acceleration for 30 sec.
 * Running over a Mote grants 20% movement speed for 30 sec. 5 sec ICD.
 * Can have Motes buffs from multiple Evokers at once.
 */
class MotesOfAcceleration extends Analyzer {
  motesSpawned = 0;
  motesCollected = 0;
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_EVOKER.MOTES_OF_ACCELERATION_TALENT);

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.HOVER), this.onCast);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.MOTES_OF_ACCELERATION_BUFF),
      this.onApplyRefreshBuff,
    );

    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.MOTES_OF_ACCELERATION_BUFF),
      this.onApplyRefreshBuff,
    );
  }

  onCast(event: CastEvent) {
    this.motesSpawned += 3;
  }

  onApplyRefreshBuff(event: ApplyBuffEvent | RefreshBuffEvent) {
    this.motesCollected += 1;
  }

  statistic() {
    let motesWasted = this.motesSpawned - this.motesCollected;
    if (motesWasted < 0) {
      motesWasted = 0;
    }
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
      >
        <TalentSpellText talent={TALENTS_EVOKER.MOTES_OF_ACCELERATION_TALENT}>
          <div>
            <InformationIcon /> {this.motesCollected}
            <small> motes collected</small>
            {motesWasted > 0 && (
              <>
                <br />
                <WarningIcon /> {motesWasted}
                <small> motes unused</small>
              </>
            )}
          </div>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default MotesOfAcceleration;
