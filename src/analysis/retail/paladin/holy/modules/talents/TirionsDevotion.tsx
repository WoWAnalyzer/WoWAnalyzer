import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/paladin';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import Statistic from 'parser/ui/Statistic';
import BoringValueText from 'parser/ui/BoringValueText';
import { SpellIcon } from 'interface';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { formatDuration } from 'common/format';

class TirionsDevotion extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;

  wastedCDR: number = 0;
  effectiveCDR: number = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.TIRIONS_DEVOTION_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.cast
        .by(SELECTED_PLAYER)
        .spell([
          TALENTS.LIGHT_OF_DAWN_TALENT,
          SPELLS.WORD_OF_GLORY,
          SPELLS.SHIELD_OF_THE_RIGHTEOUS,
        ]),
      this.cast,
    );
  }

  cast(event: CastEvent) {
    if (!event.classResources) {
      return;
    }

    const exists = event.classResources.find((e) => e.type === RESOURCE_TYPES.HOLY_POWER.id);

    if (!exists) {
      return;
    }

    const totalCDR = exists.amount * 1000;

    const effectiveCdr = this.spellUsable.reduceCooldown(SPELLS.LAY_ON_HANDS.id, totalCDR);
    this.effectiveCDR += effectiveCdr;
    this.wastedCDR += totalCDR - effectiveCdr;
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <>
            Effective CDR: {formatDuration(this.effectiveCDR)}
            <br />
            Wasted CDR: {formatDuration(this.wastedCDR)}
          </>
        }
      >
        <BoringValueText
          label={
            <>
              <SpellIcon spell={TALENTS.TIRIONS_DEVOTION_TALENT} /> Total CDR
            </>
          }
        >
          {formatDuration(this.effectiveCDR)} <small>CDR</small>
        </BoringValueText>
      </Statistic>
    );
  }
}

export default TirionsDevotion;
