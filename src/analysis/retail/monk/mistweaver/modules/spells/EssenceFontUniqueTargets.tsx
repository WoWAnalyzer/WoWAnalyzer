import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import { SpellIcon } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, HealEvent } from 'parser/core/Events';
import BoringValueText from 'parser/ui/BoringValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';

class EssenceFontUniqueTargets extends Analyzer {
  efCasts: number = 0;
  uniqueHits: number = 0;
  totalHits: number = 0;
  uniqueHitsBeforeCast: number = 0;
  currentHits: Set<string> = new Set<string>();

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_MONK.ESSENCE_FONT_TALENT),
      this.castEssenceFont,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.ESSENCE_FONT_BUFF),
      this.boltHit,
    );
  }

  castEssenceFont(event: CastEvent) {
    this.currentHits.clear();
    this.efCasts += 1;
  }

  boltHit(event: HealEvent) {
    // if this is here and is true then we don't care
    if (event.tick) {
      return;
    }

    this.totalHits += 1;
    const guid = this.formGUID(event);

    if (this.currentHits.has(guid)) {
      return;
    }

    this.currentHits.add(guid);
    this.uniqueHits += 1;
  }

  formGUID(event: HealEvent) {
    return event.targetID + '|' + (event.targetInstance || 0);
  }

  statistic() {
    const averageHits = this.uniqueHits / this.efCasts;
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(0)}
        size="flexible"
        category={STATISTIC_CATEGORY.THEORYCRAFT}
        tooltip={<>This is the average unique targets hit per essences font cast.</>}
      >
        <BoringValueText
          label={
            <>
              <SpellIcon spell={TALENTS_MONK.ESSENCE_FONT_TALENT} /> Average Unique Targets Hit
            </>
          }
        >
          {formatNumber(averageHits)}
        </BoringValueText>
      </Statistic>
    );
  }
}

export default EssenceFontUniqueTargets;
