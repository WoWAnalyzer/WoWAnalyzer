import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { Options } from 'parser/core/Module';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Enemies from 'parser/shared/modules/Enemies';
import UptimeIcon from 'interface/icons/Uptime';

import TALENTS from 'common/TALENTS/priest';
import SPELLS from 'common/SPELLS';

import Events, { CastEvent } from 'parser/core/Events';

class SustainedPotency extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  protected enemies!: Enemies;

  durationSustainedPotency = 0;

  //When DA/VF is active, casting Halo extends its duration by 1 second.
  //When DA/VF is not active, casting Halo gives a buff, that causes the next DA/VF to be longer.
  //Every 1 Halo cast causes 2 additional Halos that aren't casts.
  //However, they all have a resource change event, so we use that to track the events during cooldowns

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.SUSTAINED_POTENCY_TALENT);

    this.addEventListener(
      Events.resourcechange.by(SELECTED_PLAYER).spell(TALENTS.HALO_SHADOW_TALENT),
      this.onHalo,
    );

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.VOIDFORM_TALENT),
      this.onCD,
    );
  }

  onCD(event: CastEvent) {
    const buffer = 50;
    //For some reason, the buffer does not work properly?
    //So we look 10ms backwards to see how many stacks we had at that time.
    //Usually, the buff falls off 1-3ms after the voidform cast finishes, but 1-3ms before the voidform buff starts.
    this.durationSustainedPotency += this.selectedCombatant.getBuffStacks(
      SPELLS.SHADOW_PRIEST_ARCHON_SUSTAINED_POTENCY_BUFF.id,
      event.timestamp - 10,
      buffer,
    );
  }

  onHalo() {
    if (this.selectedCombatant.hasBuff(SPELLS.VOIDFORM_BUFF.id)) {
      this.durationSustainedPotency += 1;
    }
  }

  statistic() {
    return (
      <Statistic size="flexible" category={STATISTIC_CATEGORY.HERO_TALENTS}>
        <BoringSpellValueText spell={TALENTS.SUSTAINED_POTENCY_TALENT}>
          <UptimeIcon /> <>{this.durationSustainedPotency}</>s <small>Increased Duration</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default SustainedPotency;
