import TALENTS from 'common/TALENTS/deathknight';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, ResourceChangeEvent } from 'parser/core/Events';
import BoringResourceValue from 'parser/ui/BoringResourceValue';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

const DEATHSTRIKE_COST = 40;

class Heartbreaker extends Analyzer {
  rpGains: number[] = [];
  hsCasts = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.HEARTBREAKER_TALENT);
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.HEART_STRIKE_TALENT),
      this.onCast,
    );
    this.addEventListener(
      Events.resourcechange.spell(TALENTS.HEARTBREAKER_TALENT),
      this.onEnergize,
    );
  }

  onCast(event: CastEvent) {
    this.hsCasts += 1;
  }

  onEnergize(event: ResourceChangeEvent) {
    if (event.resourceChangeType !== RESOURCE_TYPES.RUNIC_POWER.id) {
      return;
    }
    this.rpGains.push(event.resourceChange);
  }

  get totalRPGained() {
    return this.rpGains.reduce((a, b) => a + b, 0);
  }

  get averageHeartStrikeHits() {
    return (this.rpGains.length / this.hsCasts).toFixed(2);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(1)}
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <>
            Resulting in about {Math.floor(this.totalRPGained / DEATHSTRIKE_COST)} extra Death
            Strikes.
            <br />
            Your Heart Strike hit on average {this.averageHeartStrikeHits} targets.
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS.HEARTBREAKER_TALENT}>
          <BoringResourceValue
            resource={RESOURCE_TYPES.RUNIC_POWER}
            value={this.totalRPGained}
            label="Runic Power generated"
          />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Heartbreaker;
