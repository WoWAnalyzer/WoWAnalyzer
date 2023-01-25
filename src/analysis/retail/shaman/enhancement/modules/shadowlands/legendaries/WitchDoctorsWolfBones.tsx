import { formatDuration } from 'common/format';
import SPELLS from 'common/SPELLS';
import CooldownIcon from 'interface/icons/Cooldown';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  EventType,
  RefreshBuffEvent,
} from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { TALENTS_SHAMAN } from 'common/TALENTS';

class WitchDoctorsWolfBones extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;
  protected lastTimestamp = 0;
  protected hasApplyBuffInThisTimestamp = false;
  protected totalCdrGained = 0;
  protected totalCdrWasted = 0;

  constructor(options: Options) {
    super(options);
    this.active = false;

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.MAELSTROM_WEAPON_BUFF),
      this.reduceFeralSpiritCooldown,
    );

    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.MAELSTROM_WEAPON_BUFF),
      this.reduceFeralSpiritCooldown,
    );

    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.MAELSTROM_WEAPON_BUFF),
      this.reduceFeralSpiritCooldown,
    );
  }

  reduceFeralSpiritCooldown(event: ApplyBuffStackEvent | ApplyBuffEvent | RefreshBuffEvent) {
    if (event.timestamp !== this.lastTimestamp) {
      this.hasApplyBuffInThisTimestamp = false;
    }

    if (event.type === EventType.RefreshBuff && this.hasApplyBuffInThisTimestamp) {
      return;
    }

    if (event.type === EventType.ApplyBuff || event.type === EventType.ApplyBuffStack) {
      this.hasApplyBuffInThisTimestamp = true;
    }

    if (this.spellUsable.isOnCooldown(TALENTS_SHAMAN.FERAL_SPIRIT_TALENT.id)) {
      this.spellUsable.reduceCooldown(TALENTS_SHAMAN.FERAL_SPIRIT_TALENT.id, 2000, event.timestamp);
      this.totalCdrGained += 2000;
    } else {
      this.totalCdrWasted += 2000;
    }

    this.lastTimestamp = event.timestamp;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(10)}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
      >
        <BoringSpellValueText spellId={TALENTS_SHAMAN.WITCH_DOCTORS_ANCESTRY_TALENT.id}>
          <>
            <CooldownIcon /> {formatDuration(this.totalCdrGained)}s{' '}
            <small> of Feral Spirit CDR</small>
            <br />
            <CooldownIcon /> {formatDuration(this.totalCdrWasted)}s{' '}
            <small> of Feral Spirit CDR wasted</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default WitchDoctorsWolfBones;
