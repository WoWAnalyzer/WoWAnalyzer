import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warlock';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, ApplyBuffStackEvent, CastEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

// uses the empowered demonbolt to track PS usage: 334581
// buff lasts until cores expire/are consumed
// applyBuffEvents are logged before the castEvent is
// Example event order: apply PS > cast PS > apply cores
// "00:26.749","Apply Buff","Power Siphon","Yumiblood → Yumiblood",""
// "00:26.764","Apply Buff Stack","[2]  Power Siphon","Yumiblood → Yumiblood",""
// "00:26.764","Cast","Yumiblood casts  Power Siphon","",""
// "00:27.284","Refresh Buff","Power Siphon","Yumiblood → Yumiblood",""
// "00:27.284","Apply Buff","Yumiblood gains  Demonic Core  from Yumiblood","",""
// "00:27.284","Apply Buff Stack","Yumiblood gains  Demonic Core  (2) from Yumiblood","",""
// "00:27.760","Begin Cast","Yumiblood begins casting  Demonbolt","",""
// "00:27.760","Cast","Yumiblood casts  Demonbolt on Magmorax","",""
// "00:27.761","Remove Buff Stack","[1]  Power Siphon","Yumiblood → Yumiblood",""
// "00:27.778","Remove Buff Stack","Yumiblood's Demonic Core  (1) fades from Yumiblood","",""
// "00:27.778","Refresh Buff","Yumiblood's Demonic Core  is refreshed by Yumiblood","",""
// "00:29.530","Apply Buff Stack","Yumiblood gains  Demonic Core  (2) from Yumiblood","",""
// "00:29.530","Apply Buff Stack","Yumiblood gains  Demonic Core  (3) from Yumiblood","",""
// "00:29.530","Refresh Buff","Yumiblood's Demonic Core  is refreshed by Yumiblood","",""
// "00:29.578","Begin Cast","Yumiblood begins casting  Demonbolt","",""
// "00:29.579","Cast","Yumiblood casts  Demonbolt on Magmorax","",""
// "00:29.581","Remove Buff","Power Siphon","Yumiblood → Yumiblood",""
// "00:29.597","Remove Buff Stack","Yumiblood's Demonic Core  (2) fades from Yumiblood","",""
// "00:29.597","Refresh Buff","Yumiblood's Demonic Core  is refreshed by Yumiblood","",""

const debug = false;

interface PSCast {
  event: CastEvent;
  buffOne: ApplyBuffEvent;
  buffTwo?: ApplyBuffStackEvent;
}

class PowerSiphon extends Analyzer {
  private casts: PSCast[] = [];
  private tempPSBuffs: [ApplyBuffEvent?, ApplyBuffStackEvent?] = [];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.POWER_SIPHON_TALENT);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.POWER_SIPHON_TALENT),
      this.handlePowerSiphonCast,
    );
    this.addEventListener(
      Events.applybuff.to(SELECTED_PLAYER).spell(SPELLS.POWER_SIPHON_BUFF),
      this.handlePowerSiphonApplyBuff,
    );
    this.addEventListener(
      Events.applybuffstack.to(SELECTED_PLAYER).spell(SPELLS.POWER_SIPHON_BUFF),
      this.handlePowerSiphonApplyBuffStack,
    );
  }

  private handlePowerSiphonCast(event: CastEvent) {
    debug && this.log('castevent', event);
    if (this.tempPSBuffs[0] === undefined) {
      this.error('Unexpected PS cast, no PS buff:', this.tempPSBuffs);
      return;
    }

    this.casts.push({
      event,
      buffOne: this.tempPSBuffs[0],
      buffTwo: this.tempPSBuffs[1],
    });
    this.tempPSBuffs = [];
  }

  private handlePowerSiphonApplyBuff(event: ApplyBuffEvent) {
    debug && this.log('applybuffevent', event);
    if (this.tempPSBuffs[0] !== undefined) {
      this.warn('Unexpected PS ApplyBuffEvent, tempPSBuffs:', this.tempPSBuffs, this.casts);
    }
    this.tempPSBuffs[0] = event;
  }

  private handlePowerSiphonApplyBuffStack(event: ApplyBuffStackEvent) {
    debug && this.log('applybuffstackevent', event);
    if (this.tempPSBuffs[0] === undefined || this.tempPSBuffs[1] !== undefined) {
      this.warn('Unexpected PS ApplyBuffStackEvent, tempPSBuffs:', this.tempPSBuffs);
    }
    this.tempPSBuffs[1] = event;
  }

  get numCasts() {
    return this.casts.length;
  }

  get totalImpsSiphoned() {
    return this.casts.reduce((acc, cur) => acc + (cur.buffTwo ? 2 : 1), 0);
  }

  get doubleImpSiphons() {
    return this.casts.reduce((acc, cur) => acc + (cur.buffTwo ? 1 : 0), 0);
  }

  get singleImpSiphons() {
    return this.casts.reduce((acc, cur) => acc + (cur.buffTwo ? 0 : 1), 0);
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={`Sacrificed ${this.totalImpsSiphoned} imps`}
      >
        <BoringSpellValueText spell={TALENTS.POWER_SIPHON_TALENT}>
          {this.doubleImpSiphons}/{this.numCasts} <small>casts with 2 imps</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default PowerSiphon;
