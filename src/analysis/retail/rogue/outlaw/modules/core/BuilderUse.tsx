import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, RemoveBuffEvent, RemoveBuffStackEvent } from 'parser/core/Events';
import { SpellLink } from 'interface';
import { consumedOpportunity } from '../../normalizers/CastLinkNormalizer';
import { BadColor, GoodColor } from 'interface/guide';
import { ResourceLink } from 'interface';
import DonutChart from 'parser/ui/DonutChart';
import Statistic from 'parser/ui/Statistic';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import RESOURCE_TYPES, { getResource } from 'game/RESOURCE_TYPES';
import { BUILDERS, getMaxComboPoints, rollTheBonesStage } from '../../constants';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/rogue';

/** SimC: `buff.opportunity.remains<2`, against Opportunity's own 12 second duration. */
const OPPORTUNITY_DURATION = 12000;
const OPPORTUNITY_EXPIRY_WINDOW = 2000;
/** The Opportunity cap once Fan the Hammer is talented, i.e. `buff.opportunity.max_stack`. */
const OPPORTUNITY_MAX_STACKS = 6;
/** SimC: `rtb_buffs<2` in the Fan the Hammer line. */
const DEAL_FATE_MIN_ROLL_THE_BONES_STAGE = 2;

export default class BuilderUse extends Analyzer {
  totalBuilderCasts = 0;
  wastedBuilderCasts = 0;

  /** Every wasted builder is counted under exactly one of these, so the donut can explain itself. */
  private pistolShotWithoutOpportunity = 0;
  private pistolShotAboveWindow = 0;
  private ambushNotEnabled = 0;

  /** Opportunity stacks that fell off without a Pistol Shot consuming them. */
  expiredOpportunityStacks = 0;

  private readonly hasAudacity = this.selectedCombatant.hasTalent(TALENTS.AUDACITY_TALENT);
  private readonly hasHiddenOpportunity = this.selectedCombatant.hasTalent(
    TALENTS.HIDDEN_OPPORTUNITY_TALENT,
  );
  private readonly hasFanTheHammer = this.selectedCombatant.hasTalent(
    TALENTS.FAN_THE_HAMMER_TALENT,
  );
  private readonly hasQuickDraw = this.selectedCombatant.hasTalent(TALENTS.QUICK_DRAW_TALENT);
  private readonly hasDealFate = this.selectedCombatant.hasTalent(TALENTS.DEAL_FATE_TALENT);
  private readonly maxComboPoints = getMaxComboPoints(this.selectedCombatant);

  /** SimC: `1+talent.quick_draw+(talent.quick_draw*talent.fan_the_hammer.rank)`. */
  private readonly fanTheHammerRequiredDeficit =
    1 +
    (this.selectedCombatant.hasTalent(TALENTS.QUICK_DRAW_TALENT)
      ? 1 + this.selectedCombatant.getTalentRank(TALENTS.FAN_THE_HAMMER_TALENT)
      : 0);

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(BUILDERS), this.onCastBuilder);

    [Events.removebuff, Events.removebuffstack].forEach((event) =>
      this.addEventListener(
        event.by(SELECTED_PLAYER).spell(SPELLS.OPPORTUNITY),
        this.onOpportunityRemoved,
      ),
    );
  }

  private onOpportunityRemoved(event: RemoveBuffEvent | RemoveBuffStackEvent) {
    if (!consumedOpportunity(event)) {
      this.expiredOpportunityStacks += 1;
    }
  }

  get effectiveBuilderCasts() {
    return this.totalBuilderCasts - this.wastedBuilderCasts;
  }

  get chart() {
    const items = [
      {
        color: GoodColor,
        label: 'Effective Builders',
        value: this.effectiveBuilderCasts,
      },
      {
        color: BadColor,
        label: 'Wasted Builders',
        value: this.wastedBuilderCasts,
      },
    ];

    return (
      <>
        <DonutChart items={items} />
        {this.breakdown}
      </>
    );
  }

  /** A donut slice on its own says a cast was wrong without saying why, so spell each reason out. */
  private get breakdown() {
    const reasons: React.ReactNode[] = [];

    if (this.pistolShotWithoutOpportunity > 0) {
      reasons.push(
        <li key="no-opportunity">
          {this.pistolShotWithoutOpportunity} <SpellLink spell={SPELLS.PISTOL_SHOT} /> without{' '}
          <SpellLink spell={SPELLS.OPPORTUNITY} />
        </li>,
      );
    }
    if (this.pistolShotAboveWindow > 0) {
      reasons.push(
        <li key="above-window">
          {this.pistolShotAboveWindow} <SpellLink spell={SPELLS.PISTOL_SHOT} /> above the{' '}
          {this.maxComboPoints - this.fanTheHammerRequiredDeficit} Combo Point window, where{' '}
          <SpellLink spell={SPELLS.SINISTER_STRIKE} /> was the correct builder
        </li>,
      );
    }
    if (this.ambushNotEnabled > 0) {
      reasons.push(
        <li key="ambush">
          {this.ambushNotEnabled} <SpellLink spell={SPELLS.AMBUSH} /> without{' '}
          <SpellLink spell={SPELLS.AUDACITY_TALENT_BUFF} /> or stealth
        </li>,
      );
    }
    if (this.expiredOpportunityStacks > 0) {
      reasons.push(
        <li key="expired">
          {this.expiredOpportunityStacks} <SpellLink spell={SPELLS.OPPORTUNITY} /> stacks expired
          unspent — Combo Points you never generated
        </li>,
      );
    }

    if (reasons.length === 0) {
      return null;
    }

    return (
      <small>
        <ul>{reasons}</ul>
      </small>
    );
  }

  statistic() {
    return (
      <Statistic position={STATISTIC_ORDER.CORE(5)}>
        <div className="pad">
          <label>
            <ResourceLink id={RESOURCE_TYPES.COMBO_POINTS.id} /> builder usage
          </label>
          {this.chart}
        </div>
      </Statistic>
    );
  }

  private onCastBuilder(event: CastEvent) {
    this.totalBuilderCasts += 1;

    if (!this.matchesPriorityList(event)) {
      this.wastedBuilderCasts += 1;
    }
  }

  private opportunityUp(timestamp: number) {
    return this.selectedCombatant.hasBuff(SPELLS.OPPORTUNITY.id, timestamp);
  }

  /** SimC: `buff.opportunity.stack>=buff.opportunity.max_stack|buff.opportunity.remains<2`. */
  private opportunityMustBeSpent(timestamp: number) {
    if (
      this.selectedCombatant.getBuffStacks(SPELLS.OPPORTUNITY.id, timestamp) >=
      OPPORTUNITY_MAX_STACKS
    ) {
      return true;
    }

    const opportunity = this.selectedCombatant.getBuff(SPELLS.OPPORTUNITY.id, timestamp);
    if (!opportunity) {
      return false;
    }

    return opportunity.start + OPPORTUNITY_DURATION - timestamp < OPPORTUNITY_EXPIRY_WINDOW;
  }

  /** SimC: `combo_points>1|rtb_buffs<2|!talent.deal_fate`. */
  private dealFateAllowsPistolShot(event: CastEvent, comboPoints: number) {
    return (
      comboPoints > 1 ||
      rollTheBonesStage(this.selectedCombatant, event.timestamp) <
        DEAL_FATE_MIN_ROLL_THE_BONES_STAGE ||
      !this.hasDealFate
    );
  }

  private pistolShotMatches(event: CastEvent, comboPoints: number) {
    if (!this.opportunityUp(event.timestamp)) {
      this.pistolShotWithoutOpportunity += 1;
      return false;
    }

    const audacityDown = !this.selectedCombatant.hasBuff(
      SPELLS.AUDACITY_TALENT_BUFF.id,
      event.timestamp,
    );

    // SimC: `talent.audacity&talent.hidden_opportunity&buff.opportunity.up&!buff.audacity.up`
    if (this.hasAudacity && this.hasHiddenOpportunity && audacityDown) {
      return true;
    }

    const deficit = this.maxComboPoints - comboPoints;

    const matches = this.hasFanTheHammer
      ? this.opportunityMustBeSpent(event.timestamp) ||
        (deficit >= this.fanTheHammerRequiredDeficit &&
          this.dealFateAllowsPistolShot(event, comboPoints))
      : // SimC: `combo_points.deficit<=1|talent.quick_draw|talent.audacity&!buff.audacity.up`
        deficit <= 1 || this.hasQuickDraw || (this.hasAudacity && audacityDown);

    if (!matches) {
      this.pistolShotAboveWindow += 1;
    }

    return matches;
  }

  /** SimC: `ambush,if=talent.hidden_opportunity&buff.audacity.up`, then `ambush,if=talent.hidden_opportunity`. */
  private ambushMatches(event: CastEvent) {
    const matches =
      this.hasHiddenOpportunity &&
      (this.selectedCombatant.hasBuff(SPELLS.AUDACITY_TALENT_BUFF.id, event.timestamp) ||
        this.selectedCombatant.hasBuff(SPELLS.SUBTERFUGE_BUFF.id, event.timestamp) ||
        this.selectedCombatant.hasBuff(SPELLS.STEALTH_BUFF.id, event.timestamp) ||
        this.selectedCombatant.hasBuff(SPELLS.VANISH_BUFF.id, event.timestamp));

    if (!matches) {
      this.ambushNotEnabled += 1;
    }

    return matches;
  }

  private matchesPriorityList(event: CastEvent) {
    const comboPoints = getResource(event.classResources, RESOURCE_TYPES.COMBO_POINTS.id)?.amount;

    // Missing combo point data is not evidence of a mistake.
    if (comboPoints === undefined) {
      return true;
    }

    switch (event.ability.guid) {
      case SPELLS.PISTOL_SHOT.id:
        return this.pistolShotMatches(event, comboPoints);
      case SPELLS.AMBUSH.id:
      case SPELLS.AMBUSH_PROC.id:
        return this.ambushMatches(event);
      // Sinister Strike is the unconditional fallback, and the target count Blade Flurry needs
      // cannot be judged from a cast alone.
      default:
        return true;
    }
  }
}
