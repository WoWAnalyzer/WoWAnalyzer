import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SharedBrews from '../../core/SharedBrews';
import talents from 'common/TALENTS/monk';
import Events, { AnyEvent, CastEvent, DamageEvent } from 'parser/core/Events';
import SPELLS from 'common/SPELLS';
import Enemies from 'parser/shared/modules/Enemies';
import { formatDuration } from 'common/format';
import { GoodColor } from 'interface/guide';

const BONUS_CDR = 1000;
const KS_BUFFER = 250;

export default class BonedustBrew extends Analyzer.withDependencies({
  brews: SharedBrews,
  enemies: Enemies,
}) {
  private totalCdr = 0;
  private _wastedCdr = 0;
  private lastKsTriggerTimestamp = -Infinity;
  public triggers = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(talents.BONEDUST_BREW_TALENT);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.TIGER_PALM),
      this.onTigerPalm,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(talents.KEG_SMASH_TALENT),
      this.onKegSmash,
    );
  }

  private onTigerPalm(event: CastEvent) {
    // the TP case is easy: check if the target has BDB and apply CDR if so
    this.reduceCooldown(event);
  }

  private onKegSmash(event: DamageEvent) {
    // Keg Smash is more complicated: we need to check if *any damaged target* has it.
    // travel time is *usually* so short that we can rely on the cast time, and bdb is removed in tww anyway

    // not using event links because (again) this is going away in TWW
    if (Math.abs(event.timestamp - this.lastKsTriggerTimestamp) < KS_BUFFER) {
      // last trigger was from the same cast
      this.addDebugAnnotation(event, {
        color: '#666',
        summary: `Keg Smash damage did not gain BDB CDR due to gain ${formatDuration(event.timestamp - this.lastKsTriggerTimestamp, 2)} ago`,
      });
      return;
    }

    if (this.reduceCooldown(event)) {
      this.lastKsTriggerTimestamp = event.timestamp;
    }
  }

  private reduceCooldown(event: AnyEvent) {
    const enemy = this.deps.enemies.getEntity(event);
    if (enemy?.hasBuff(talents.BONEDUST_BREW_TALENT.id, null, 100, 0, this.selectedCombatant.id)) {
      const cdr = this.deps.brews.reduceCooldown(BONUS_CDR);
      this.totalCdr += cdr;
      this._wastedCdr += BONUS_CDR - cdr;
      this.triggers += 1;
      this.addDebugAnnotation(event, {
        color: GoodColor,
        summary: `Reduced cooldown of brews by ${BONUS_CDR}ms (${cdr}ms actual, ${BONUS_CDR - cdr} wasted)`,
      });
      return true;
    }
    return false;
  }

  get effectiveCdr() {
    return this.totalCdr;
  }
  get wastedCdr() {
    return this._wastedCdr;
  }
}
