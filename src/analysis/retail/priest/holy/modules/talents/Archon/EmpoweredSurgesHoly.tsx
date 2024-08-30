import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { Options } from 'parser/core/Module';
import Combatants from 'parser/shared/modules/Combatants';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { buffedBySurgeOfLight, getHealFromSurge } from '../../../normalizers/CastLinkNormalizer';

import { TALENTS_PRIEST } from 'common/TALENTS';
import Events, { RemoveBuffEvent, RemoveBuffStackEvent } from 'parser/core/Events';
import SPELLS from 'common/SPELLS';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';

//https://www.warcraftlogs.com/reports/WT19GKp2VHqLarbD#fight=19``&type=auras&source=122

const EMPOWERED_SURGES_AMP = 0.3;
class EmpoweredSurgesHoly extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  protected combatants!: Combatants;

  empoweredSurgesHealing = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_PRIEST.EMPOWERED_SURGES_TALENT);
    //tracks spending of Surge of Light
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.SURGE_OF_LIGHT_BUFF),
      this.onSurgeOfLightHeal,
    );

    this.addEventListener(
      Events.removebuffstack.by(SELECTED_PLAYER).spell(SPELLS.SURGE_OF_LIGHT_BUFF),
      this.onSurgeOfLightHeal,
    );
  }

  onSurgeOfLightHeal(event: RemoveBuffEvent | RemoveBuffStackEvent) {
    // linked heal event exists from surge of light consumption
    const healEvent = getHealFromSurge(event);

    if (healEvent) {
      if (buffedBySurgeOfLight(event)) {
        // calculate effective healing from bonus
        this.empoweredSurgesHealing += calculateEffectiveHealing(healEvent, EMPOWERED_SURGES_AMP);
      }
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(99)}
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
      >
        <TalentSpellText talent={TALENTS_PRIEST.EMPOWERED_SURGES_TALENT}>
          <ItemPercentHealingDone amount={this.empoweredSurgesHealing} />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default EmpoweredSurgesHoly;
