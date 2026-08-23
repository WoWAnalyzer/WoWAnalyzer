import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, HealEvent, RefreshBuffEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import { SpellLink } from 'interface';
import { TALENTS_EVOKER } from 'common/TALENTS';
import {
  getEchoConsumptions,
  getMerithrasGeneratingCast,
  getMerithrasHealing,
} from '../../normalizers/EventLinking/helpers';

interface MerithrasCastData {
  cast: CastEvent;
  effectiveHealing: number;
  overhealing: number;
  echoConsumptions: number;
}

class MerithrasBlessing extends Analyzer {
  castHealing = 0;
  absorbHealing = 0;
  badRefreshes: number[] = [];
  lastRefresh = 0;
  castData: MerithrasCastData[] = [];

  dreamBreathCasts = [TALENTS_EVOKER.DREAM_BREATH_TALENT.id, SPELLS.DREAM_BREATH_FONT.id];

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.MERITHRAS_BLESSING_BUFF),
      this.onRefresh,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.MERITHRAS_BLESSING_CAST),
      this.onHeal,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.MERITHRAS_BLESSING_ABSORB),
      this.onAbsorb,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.MERITHRAS_BLESSING_CAST),
      this.onCast,
    );
  }

  onCast(event: CastEvent) {
    const healingEvents = getMerithrasHealing(event);
    const echoConsumptions = getEchoConsumptions(event);

    let effectiveHealing = 0;
    let overhealing = 0;

    for (const heal of healingEvents) {
      if (heal.amount) {
        effectiveHealing += heal.amount + (heal.absorbed || 0);
      }
      if (heal.overheal) {
        overhealing += heal.overheal;
      }
    }

    this.castData.push({
      cast: event,
      effectiveHealing,
      overhealing,
      echoConsumptions: echoConsumptions.length > 0 ? echoConsumptions.length : 0,
    });
  }

  onRefresh(event: RefreshBuffEvent) {
    const generatingCast = getMerithrasGeneratingCast(event);
    if (
      generatingCast &&
      this.dreamBreathCasts.includes(generatingCast.ability.guid) &&
      (event.timestamp - 50 > this.lastRefresh || this.lastRefresh === 0)
    ) {
      this.lastRefresh = event.timestamp;
      this.badRefreshes.push(event.timestamp);
    }
  }
  onHeal(event: HealEvent) {
    this.castHealing += event.amount + (event.absorbed || 0);
  }
  onAbsorb(event: HealEvent) {
    this.absorbHealing += event.amount + (event.absorbed || 0);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(5)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <div className="pad">
          <label>
            <SpellLink spell={TALENTS_EVOKER.MERITHRAS_BLESSING_1_PRESERVATION_TALENT} />
          </label>
          <div className="value">
            <div>
              <small>
                <SpellLink spell={SPELLS.MERITHRAS_BLESSING_CAST} />
              </small>
              <div>
                <ItemHealingDone amount={this.castHealing} />
              </div>
            </div>
            <div>
              <small>
                <SpellLink spell={SPELLS.MERITHRAS_BLESSING_ABSORB} />
              </small>
            </div>
            <div>
              <ItemHealingDone amount={this.absorbHealing} />
            </div>
          </div>
        </div>
      </Statistic>
    );
  }
}

export default MerithrasBlessing;
