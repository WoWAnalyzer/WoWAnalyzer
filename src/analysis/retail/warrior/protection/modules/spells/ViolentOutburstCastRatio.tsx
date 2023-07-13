import SPELLS from 'common/SPELLS/warrior';
import { SpellIcon } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TALENTS from 'common/TALENTS/warrior';

class ViolentOutburstCastRatio extends Analyzer {
  hasBuff = false;

  ssUsage = 0;
  tcUsage = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.VIOLENT_OUTBURST_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.VIOLENT_OUTBURST_BUFF),
      this.gainBuff,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.VIOLENT_OUTBURST_BUFF),
      this.removeBuff,
    );

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SHIELD_SLAM), this.ssCast);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.THUNDER_CLAP), this.tcCast);
  }

  gainBuff() {
    this.hasBuff = true;
  }

  ssCast() {
    if (this.hasBuff) {
      this.ssUsage += 1;
    }
  }

  tcCast() {
    if (this.hasBuff) {
      this.tcUsage += 1;
    }
  }

  removeBuff() {
    this.hasBuff = false;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spell={TALENTS.VIOLENT_OUTBURST_TALENT}>
          <SpellIcon spell={SPELLS.THUNDER_CLAP} /> {this.tcUsage} :{' '}
          <SpellIcon spell={SPELLS.SHIELD_SLAM} /> {this.ssUsage}
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ViolentOutburstCastRatio;
