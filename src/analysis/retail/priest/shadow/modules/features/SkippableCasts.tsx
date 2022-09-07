import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import GlobalCooldown from 'parser/shared/modules/GlobalCooldown';
import Haste from 'parser/shared/modules/Haste';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

const ONE_FILLER_GCD_HASTE_THRESHOLD = 1.4;

class SkippableCasts extends Analyzer {
  static dependencies = {
    haste: Haste,
    globalCooldown: GlobalCooldown,
  };
  _castsSinceLastVoidBolt = 0;
  protected haste!: Haste;
  protected globalCooldown!: GlobalCooldown;

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onCast);
  }

  _skippableCastsBetweenVoidbolts = 0;

  get skippableCastsBetweenVoidbolts() {
    return this._skippableCastsBetweenVoidbolts;
  }

  onCast(event: CastEvent) {
    const spellId = event.ability.guid;
    if (this.haste.current >= ONE_FILLER_GCD_HASTE_THRESHOLD) {
      if (spellId === SPELLS.VOID_BOLT.id) {
        this._castsSinceLastVoidBolt = 0;
      } else if (this.globalCooldown.isOnGlobalCooldown(spellId)) {
        this._castsSinceLastVoidBolt += 1;
        if (this._castsSinceLastVoidBolt > 1) {
          this._skippableCastsBetweenVoidbolts += 1;
        }
      }
    }
  }

  statistic() {
    const skippableCasts = this.skippableCastsBetweenVoidbolts;
    if (!skippableCasts) {
      // If there were no skippable casts there's no point to display the module. It'll probably be 1-2 patches before this displays anything of value.
      this.active = false;
      return;
    }
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(7)}
        size="flexible"
        tooltip={`There should only be 1 cast between Void Bolts casts when you exceed 140% haste. You casted a total of ${skippableCasts} extra abilities inbetween, wasting insanity generation & damage.`}
      >
        <BoringSpellValueText spellId={SPELLS.VOID_BOLT.id}>
          <>
            {skippableCasts} <small>Skippable casts</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default SkippableCasts;
