import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, HealEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import TALENTS from 'common/TALENTS/paladin';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import BoringValueText from 'parser/ui/BoringValueText';
import { SpellIcon } from 'interface';

class FillerFlashOfLight extends Analyzer {
  distanceSum = 0;
  distanceCount = 0;

  maxDistance = 0;

  sourceX: number | undefined;
  sourceY: number | undefined;

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.LIGHT_OF_DAWN_TALENT),
      this.cast,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.LIGHT_OF_DAWN_HEAL),
      this.onHeal,
    );
  }

  cast(event: CastEvent) {
    this.sourceX = event.x;
    this.sourceY = event.y;
  }

  onHeal(event: HealEvent) {
    if (!this.sourceX && !this.sourceY) {
      return;
    }

    this.distanceSum += this.calculateDistance(
      this.sourceX as number,
      this.sourceY as number,
      event.x,
      event.y,
    );
    this.distanceCount += 1;
  }

  calculateDistance(x1: number, y1: number, x2: number, y2: number) {
    return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2)) / 100;
  }

  statistic() {
    return (
      <Statistic
        key="Statistic"
        position={STATISTIC_ORDER.CORE(10)}
        tooltip={
          <>This is the average distance between you and the person healed with Light of Dawn.</>
        }
      >
        <BoringValueText
          label={
            <>
              <SpellIcon spell={TALENTS.LIGHT_OF_DAWN_TALENT} /> Average LoD Distance
            </>
          }
        >
          <>{(this.distanceSum / this.distanceCount).toFixed(2)} Yards</>
        </BoringValueText>
      </Statistic>
    );
  }
}

export default FillerFlashOfLight;
