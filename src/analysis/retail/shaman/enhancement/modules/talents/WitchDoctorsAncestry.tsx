import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import MaelstromWeaponTracker from '../resourcetracker/MaelstromWeaponTracker';
import TALENTS from 'common/TALENTS/shaman';
import Events, { ResourceChangeEvent } from 'parser/core/Events';
import UptimeIcon from 'interface/icons/Uptime';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { formatNumber, formatPercentage } from 'common/format';
import TalentSpellText from 'parser/ui/TalentSpellText';
import SpellUsable from '../core/SpellUsable';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';

const WITCH_DOCTORS_ANCESTRY_REDUCTION_MS = 1000;

class WitchDoctorsAncestry extends Analyzer {
  static dependencies = {
    maelstromWeaponTracker: MaelstromWeaponTracker,
    spellUsable: SpellUsable,
  };

  cooldownPerMaelstromGained: number = WITCH_DOCTORS_ANCESTRY_REDUCTION_MS;
  feralSpiritTotalCooldownReduction = 0;
  feralSpiritCooldownReductionWasted = 0;
  spellUsable!: SpellUsable;

  maelstromWeaponTracker!: MaelstromWeaponTracker;
  casts = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.WITCH_DOCTORS_ANCESTRY_TALENT);

    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.FERAL_SPIRIT_TALENT),
      () => (this.casts += 1),
    );

    this.addEventListener(Events.resourcechange.by(SELECTED_PLAYER), this.onResource);
  }

  onResource(event: ResourceChangeEvent) {
    if (event.resourceChangeType !== RESOURCE_TYPES.MAELSTROM_WEAPON.id) {
      return;
    }

    this.reduceFeralSpiritCooldown(event.resourceChange);
  }

  get reduction() {
    return this.feralSpiritTotalCooldownReduction / 1000;
  }

  get wastedReduction() {
    return this.feralSpiritCooldownReductionWasted / 1000;
  }

  get averageReduction() {
    return this.reduction / this.casts || 0;
  }

  get wastedPercent() {
    return this.wastedReduction / (this.wastedReduction + this.reduction);
  }

  reduceFeralSpiritCooldown(maelstromGained: number = 1) {
    if (this.spellUsable.isOnCooldown(TALENTS.FERAL_SPIRIT_TALENT.id)) {
      const effectiveReduction = this.spellUsable.reduceCooldown(
        TALENTS.FERAL_SPIRIT_TALENT.id,
        this.cooldownPerMaelstromGained * maelstromGained,
      );
      this.feralSpiritTotalCooldownReduction += effectiveReduction;
      this.feralSpiritCooldownReductionWasted +=
        this.cooldownPerMaelstromGained * maelstromGained - effectiveReduction;
    } else {
      this.feralSpiritCooldownReductionWasted += this.cooldownPerMaelstromGained * maelstromGained;
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <>
            {formatNumber(this.reduction)} sec total effective reduction
            <br />
            {formatNumber(this.wastedReduction)} sec ({formatPercentage(this.wastedPercent)}%)
            wasted reduction.
          </>
        }
      >
        <TalentSpellText talent={TALENTS.WITCH_DOCTORS_ANCESTRY_TALENT}>
          <>
            <UptimeIcon /> {formatNumber(this.averageReduction)} sec{' '}
            <small>average reduction</small>
          </>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default WitchDoctorsAncestry;
