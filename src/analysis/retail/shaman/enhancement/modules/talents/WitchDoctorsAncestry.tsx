import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import MaelstromWeaponTracker from '../resourcetracker/MaelstromWeaponTracker';
import { TALENTS_SHAMAN } from 'common/TALENTS';
import Events, { CastEvent } from 'parser/core/Events';
import UptimeIcon from 'interface/icons/Uptime';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { Trans } from '@lingui/macro';
import { formatNumber, formatPercentage } from 'common/format';
import TalentSpellText from 'parser/ui/TalentSpellText';

class WitchDoctorsAncestry extends Analyzer {
  static dependencies = {
    maelstromWeaponTracker: MaelstromWeaponTracker,
  };

  maelstromWeaponTracker!: MaelstromWeaponTracker;
  casts = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_SHAMAN.WITCH_DOCTORS_ANCESTRY_TALENT);

    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_SHAMAN.FERAL_SPIRIT_TALENT),
      this.onCast,
    );
  }

  onCast(event: CastEvent) {
    this.casts += 1;
  }

  get reduction() {
    return this.maelstromWeaponTracker.feralSpiritTotalCooldownReduction / 1000;
  }

  get wastedReduction() {
    return this.maelstromWeaponTracker.feralSpiritCooldownReductionWasted / 1000;
  }

  get averageReduction() {
    return this.reduction / this.casts || 0;
  }

  get wastedPercent() {
    return this.wastedReduction / (this.wastedReduction + this.reduction);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <Trans id="shaman.ehancement.witchDoctorsAncestry.statistic.tooltip">
            {formatNumber(this.reduction)} sec total effective reduction
            <br />
            {formatNumber(this.wastedReduction)} sec ({formatPercentage(this.wastedPercent)}%)
            wasted reduction.
          </Trans>
        }
      >
        <TalentSpellText talent={TALENTS_SHAMAN.WITCH_DOCTORS_ANCESTRY_TALENT}>
          <Trans id="shaman.ehancement.witchDoctorsAncestry.statistic">
            <UptimeIcon /> {formatNumber(this.averageReduction)} sec{' '}
            <small>average reduction</small>
          </Trans>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default WitchDoctorsAncestry;
