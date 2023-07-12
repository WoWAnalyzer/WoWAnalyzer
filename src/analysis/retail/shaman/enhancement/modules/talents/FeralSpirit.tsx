import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ResourceGenerated from 'parser/ui/ResourceGenerated';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import { TALENTS_SHAMAN } from 'common/TALENTS';

const FERAL_SPIRIT = {
  INITIAL_MAELSTROM_WEAPON_GAIN: 1,
  MAELSTROM_WEAPON_GAIN_INTERVAL: 3000,
  MAELSTROM_WEAPON_GAIN_PER_INTERVAL: 1,
  MAELSTROM_WEAPON_GAIN_TOTAL_DURATION: 15000,
};

class FeralSpirit extends Analyzer {
  protected maelstromWeaponGained: number = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_SHAMAN.FERAL_SPIRIT_TALENT);

    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_SHAMAN.FERAL_SPIRIT_TALENT),
      this.onFeralSpiritCast,
    );
  }

  onFeralSpiritCast(event: CastEvent): void {
    const expectedMaelstromGained =
      FERAL_SPIRIT.INITIAL_MAELSTROM_WEAPON_GAIN +
      FERAL_SPIRIT.MAELSTROM_WEAPON_GAIN_PER_INTERVAL *
        (FERAL_SPIRIT.MAELSTROM_WEAPON_GAIN_TOTAL_DURATION /
          FERAL_SPIRIT.MAELSTROM_WEAPON_GAIN_INTERVAL);

    this.maelstromWeaponGained += expectedMaelstromGained;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        size="flexible"
        category={STATISTIC_CATEGORY.GENERAL}
      >
        <BoringSpellValueText spell={TALENTS_SHAMAN.FERAL_SPIRIT_TALENT}>
          <>
            <ResourceGenerated
              amount={this.maelstromWeaponGained}
              resourceType={SPELLS.MAELSTROM_WEAPON_BUFF}
              approximate
            />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default FeralSpirit;
