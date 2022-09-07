import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ResourceChangeEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

const SOTF_WRATH_BONUS_AP = 0.5;

class SoulOfTheForest extends Analyzer {
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.SOUL_OF_THE_FOREST_TALENT_BALANCE);
    this.addEventListener(Events.resourcechange.to(SELECTED_PLAYER), this.onEnergize);
  }

  gainedAP = 0;

  onEnergize(event: ResourceChangeEvent) {
    // we only care if we generated Astral Power by using Wrath while inside Solar Eclipse
    if (
      event.resourceChangeType !== RESOURCE_TYPES.ASTRAL_POWER.id ||
      event.ability.guid !== SPELLS.WRATH_MOONKIN.id ||
      !this.selectedCombatant.hasBuff(SPELLS.ECLIPSE_SOLAR.id)
    ) {
      return;
    }

    const apBeforeGain = event.resourceChange / (1 + SOTF_WRATH_BONUS_AP); //event.resourceChange contains the AP gained including modifiers, we need to calculate it back
    const bonusAP = apBeforeGain * SOTF_WRATH_BONUS_AP; // calculate how much we gained from the talent
    this.gainedAP += bonusAP;
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
        <BoringSpellValueText spellId={SPELLS.SOUL_OF_THE_FOREST_TALENT_BALANCE.id}>
          <>
            {formatNumber(this.gainedAP)} <small>additional Astral Power generated</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default SoulOfTheForest;
