import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ResourceChangeEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { TALENTS_DRUID } from 'common/TALENTS';

const SOTF_WRATH_BONUS_AP = 0.6;

class SoulOfTheForest extends Analyzer {
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.SOUL_OF_THE_FOREST_BALANCE_TALENT);
    this.addEventListener(Events.resourcechange.to(SELECTED_PLAYER), this.onEnergize);
  }

  gainedAP = 0;

  onEnergize(event: ResourceChangeEvent) {
    // we only care if we generated Astral Power by using Wrath while inside Solar Eclipse
    if (
      event.resourceChangeType !== RESOURCE_TYPES.ASTRAL_POWER.id ||
      !this.selectedCombatant.hasBuff(SPELLS.ECLIPSE_SOLAR.id)
    ) {
      return;
    }
    if (event.ability.guid === SPELLS.WRATH_MOONKIN.id) {
      const apBeforeGain = event.resourceChange / (1 + SOTF_WRATH_BONUS_AP); //event.resourceChange contains the AP gained including modifiers, we need to calculate it back
      const bonusAP = apBeforeGain * SOTF_WRATH_BONUS_AP; // calculate how much we gained from the talent
      this.gainedAP += bonusAP;
    }
    // TODO: Add some way to check Starfire targets hit
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(7)}
        size="flexible"
        tooltip={`You gained ${formatNumber(
          this.gainedAP,
        )} additional Astral Power by taking this talent.`}
      >
        <BoringSpellValueText spell={TALENTS_DRUID.SOUL_OF_THE_FOREST_BALANCE_TALENT}>
          <>
            {formatNumber(this.gainedAP)} <small>additional Astral Power generated</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default SoulOfTheForest;
