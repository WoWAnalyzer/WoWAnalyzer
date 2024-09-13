import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import { SpellLink } from 'interface';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  HealEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import { Uptime } from 'parser/ui/UptimeBar';
import { SPELL_COLORS, VIVACIOUS_VIVIFICATION_BOOST } from '../../constants';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../Guide';
import RenewingMist from './RenewingMist';
import Vivify from './Vivify';
import uptimeBarSubStatistic from 'parser/ui/UptimeBarSubStatistic';
import BaseCelestialAnalyzer from './BaseCelestialAnalyzer';
import { formatPercentage } from 'common/format';
import { isVivaciousVivification } from '../../normalizers/CastLinkNormalizer';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import Statistic from 'parser/ui/Statistic';
import TalentSpellText from 'parser/ui/TalentSpellText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';

class VivaciousVivification extends Analyzer {
  static dependencies = {
    vivify: Vivify,
    renewingMist: RenewingMist,
    baseCelestial: BaseCelestialAnalyzer,
  };
  protected baseCelestial!: BaseCelestialAnalyzer;
  protected renewingMist!: RenewingMist;
  protected vivify!: Vivify;
  currentRenewingMists: number = 0;
  totalCasts: number = 0;
  totalHealed: number = 0;
  wastedApplications: number = 0;
  unusableUptimes: Uptime[] = []; // a wasted window is when we have buff and good rem count and we aren't in celestial window

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.VIVACIOUS_VIVIFICATION_TALENT);
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.refreshbuff.to(SELECTED_PLAYER).spell(SPELLS.VIVIFICATION_BUFF),
      this.onRefresh,
    );
    this.addEventListener(
      Events.applybuff.to(SELECTED_PLAYER).spell(SPELLS.VIVIFICATION_BUFF),
      this.onBuffApply,
    );
    this.addEventListener(
      Events.removebuff.to(SELECTED_PLAYER).spell(SPELLS.RENEWING_MIST_HEAL),
      this.onRemRemove,
    );
    this.addEventListener(
      Events.removebuff.to(SELECTED_PLAYER).spell(SPELLS.VIVIFICATION_BUFF),
      this.onBuffRemove,
    );
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.VIVIFY), this.onVivifyHeal);
    this.unusableUptimes.push({
      start: this.owner.fight.start_time,
      end: -1,
    });
  }

  get isUsable() {
    return (
      this.renewingMist.currentRenewingMists >= this.vivify.estimatedAverageReMs &&
      this.selectedCombatant.hasBuff(SPELLS.VIVIFICATION_BUFF.id) &&
      !this.baseCelestial.celestialActive
    );
  }

  get inUsablePeriod() {
    return this.unusableUptimes.at(-1)!.end > 0;
  }

  endUsablePeriod(timestamp: number) {
    this.unusableUptimes.push({
      start: timestamp,
      end: -1,
    });
  }

  startUsablePeriod(timestamp: number) {
    this.unusableUptimes.at(-1)!.end = timestamp;
  }

  // We waste a buff if the buff refreshes, not in celestial, and sufficient rems active
  onRefresh(event: RefreshBuffEvent) {
    if (this.isUsable) {
      this.wastedApplications += 1;
    }
  }

  // when we gain buff, have sufficient rems, and not in celestial then we start usable period
  onBuffApply(event: ApplyBuffEvent) {
    if (!this.inUsablePeriod && this.isUsable) {
      this.startUsablePeriod(event.timestamp);
    }
  }

  // We enter unusable period if our ReM count becomes too low or if we consume the buff
  onRemRemove(event: RemoveBuffEvent) {
    if (this.inUsablePeriod && !this.isUsable) {
      this.endUsablePeriod(event.timestamp);
    }
  }

  // if we consume buff and we were in usable period, then end usable period
  onBuffRemove(event: RemoveBuffEvent) {
    if (this.inUsablePeriod) {
      this.endUsablePeriod(event.timestamp);
    }
  }

  onVivifyHeal(event: HealEvent) {
    if (isVivaciousVivification(event)) {
      this.totalHealed += calculateEffectiveHealing(event, VIVACIOUS_VIVIFICATION_BOOST);
    }
  }

  get guideSubsection(): JSX.Element {
    const explanation = (
      <p>
        <b>
          <SpellLink spell={TALENTS_MONK.VIVACIOUS_VIVIFICATION_TALENT} />
        </b>{' '}
        is a buff that continuously procs every 10s. It increases the healing of your next{' '}
        <SpellLink spell={SPELLS.VIVIFY} /> by {formatPercentage(VIVACIOUS_VIVIFICATION_BOOST)}%
        while also making it instant cast. Try to consume this buff without letting it refresh as
        healing and mana warrant.
      </p>
    );
    this.unusableUptimes.at(-1)!.end = this.owner.fight.end_time;
    const styleObj = {
      fontSize: 20,
    };
    const styleObjInner = {
      fontSize: 15,
    };
    const data = (
      <div>
        <RoundedPanel>
          <strong>
            <SpellLink spell={TALENTS_MONK.VIVACIOUS_VIVIFICATION_TALENT} /> utilization
          </strong>
          <small>
            Grey periods indicate times that you could have used your{' '}
            <SpellLink spell={TALENTS_MONK.VIVACIOUS_VIVIFICATION_TALENT} /> buff effectively, but
            did not.
          </small>

          {uptimeBarSubStatistic(
            this.owner.fight,
            {
              spells: [SPELLS.VIVIFICATION_BUFF],
              uptimes: this.unusableUptimes,
              color: SPELL_COLORS.VIVIFY,
            },
            undefined,
            undefined,
            undefined,
            'utilization',
          )}
          <div style={styleObj}>
            <b>{this.wastedApplications}</b>{' '}
            <small style={styleObjInner}>wasted applications</small>
          </div>
        </RoundedPanel>
      </div>
    );
    return explanationAndDataSubsection(explanation, data, GUIDE_CORE_EXPLANATION_PERCENT);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.UNIMPORTANT(50)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <TalentSpellText talent={TALENTS_MONK.VIVACIOUS_VIVIFICATION_TALENT}>
          <ItemHealingDone amount={this.totalHealed} />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default VivaciousVivification;
