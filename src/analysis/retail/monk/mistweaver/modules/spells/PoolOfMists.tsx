import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, CastEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import HotTrackerMW from '../core/HotTrackerMW';
import { POOL_OF_MISTS_CDR } from '../../constants';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import SpellLink from 'interface/SpellLink';
import { formatDuration, formatNumber } from 'common/format';
import ItemCooldownReduction from 'parser/ui/ItemCooldownReduction';
import Statistic from 'parser/ui/Statistic';
import TalentSpellText from 'parser/ui/TalentSpellText';
import SpellIcon from 'interface/SpellIcon';

class PoolOfMists extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    hotTracker: HotTrackerMW,
  };

  protected spellUsable!: SpellUsable;
  protected hotTracker!: HotTrackerMW;

  remCDR: number = 0;
  remWaste: number = 0;
  remEffective: number = 0;

  rskCDR: number = 0;
  rskWaste: number = 0;
  rskEffective: number = 0;

  get extraRSKCasts() {
    return (
      this.rskEffective /
      this.spellUsable.fullCooldownDuration(TALENTS_MONK.RISING_SUN_KICK_TALENT.id)
    );
  }

  get extraReMCasts() {
    return (
      this.remEffective /
      this.spellUsable.fullCooldownDuration(TALENTS_MONK.RENEWING_MIST_TALENT.id)
    );
  }

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.POOL_OF_MISTS_TALENT);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.RENEWING_MIST_HEAL),
      this.onApplyRem,
    );

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_MONK.RISING_SUN_KICK_TALENT),
      this.onRisingSunKick,
    );
  }

  private onApplyRem(event: ApplyBuffEvent) {
    const playerId = event.targetID;
    const spellId = SPELLS.RENEWING_MIST_HEAL.id;

    if (!this.hotTracker.hasHot(event, spellId)) {
      return;
    }
    const hot = this.hotTracker.hots[playerId][spellId];
    if (
      (this.hotTracker.fromRapidDiffusion(hot) || this.hotTracker.fromHardcast(hot)) &&
      !this.hotTracker.fromBounce(hot)
    ) {
      this.rskCDR += POOL_OF_MISTS_CDR;
      if (this.spellUsable.isOnCooldown(TALENTS_MONK.RISING_SUN_KICK_TALENT.id)) {
        const reduction = this.spellUsable.reduceCooldown(
          TALENTS_MONK.RISING_SUN_KICK_TALENT.id,
          POOL_OF_MISTS_CDR,
        );
        this.rskEffective += reduction;
        this.rskWaste += POOL_OF_MISTS_CDR - reduction;
      } else {
        this.rskWaste += POOL_OF_MISTS_CDR;
      }
    }
  }

  private onRisingSunKick(event: CastEvent) {
    this.remCDR += POOL_OF_MISTS_CDR;
    if (this.spellUsable.isOnCooldown(TALENTS_MONK.RENEWING_MIST_TALENT.id)) {
      const reduction = this.spellUsable.reduceCooldown(
        TALENTS_MONK.RENEWING_MIST_TALENT.id,
        POOL_OF_MISTS_CDR,
      );
      this.remEffective += reduction;
      this.remWaste += POOL_OF_MISTS_CDR - reduction;
    } else {
      this.remWaste += POOL_OF_MISTS_CDR;
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(11)}
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <ul>
            <li>
              Total <SpellLink spell={TALENTS_MONK.RENEWING_MIST_TALENT} /> reduction:{' '}
              {formatDuration(this.remCDR)} ({formatDuration(this.remWaste)} wasted)
            </li>
            <ul>
              <li>{formatNumber(this.extraReMCasts)} additional casts</li>
            </ul>
            <li>
              Total <SpellLink spell={TALENTS_MONK.RISING_SUN_KICK_TALENT} /> reduction:{' '}
              {formatDuration(this.rskCDR)} ({formatDuration(this.rskWaste)} wasted)
            </li>
            <ul>
              <li>{formatNumber(this.extraRSKCasts)} additional casts</li>
            </ul>
          </ul>
        }
      >
        <TalentSpellText talent={TALENTS_MONK.POOL_OF_MISTS_TALENT}>
          <SpellIcon spell={TALENTS_MONK.RENEWING_MIST_TALENT} />{' '}
          <ItemCooldownReduction effective={this.remEffective} />
          <div></div>
          <SpellIcon spell={TALENTS_MONK.RISING_SUN_KICK_TALENT} />{' '}
          <ItemCooldownReduction effective={this.rskEffective} />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default PoolOfMists;
