import type { JSX } from 'react';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/paladin';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  DamageEvent,
  HealEvent,
  RemoveBuffEvent,
  ResourceChangeEvent,
} from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import { GapHighlight } from 'parser/ui/CooldownBar';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import SpellLink from 'interface/SpellLink';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../guide/Guide';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import Statistic from 'parser/ui/Statistic';
import TalentSpellText from 'parser/ui/TalentSpellText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import SpellIcon from 'interface/SpellIcon';
import { formatNumber } from 'common/format';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import ItemCooldownReduction from 'parser/ui/ItemCooldownReduction';
import ItemManaGained from 'parser/ui/ItemManaGained';
import { TooltipElement } from 'interface/Tooltip';
import {
  BLESSING_OF_AUTUMN_REDUCTION,
  BLESSING_OF_SEASONS_DURATION,
  BLESSING_OF_SPRING_INCREASE,
  BLESSING_OF_SPRING_TAKEN_INCREASE,
  BLESSING_OF_WINTER_RESTORE,
  BLESSING_OF_SEASONS_BUFFS,
} from '../../constants';
import { calculateEffectiveHealing, calculateOverhealing } from 'parser/core/EventCalculateLib';

export class BlessingOfTheSeasons extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;

  applyCount: Map<number, number> = new Map<number, number>(
    BLESSING_OF_SEASONS_BUFFS.map((spell) => {
      return [spell.id, 0];
    }),
  );

  totalHealing = 0;
  totalOverhealing = 0;

  springHealing = 0;
  springOverhealing = 0;

  summerHealing = 0;
  summerOverhealing = 0;
  summerDamage = 0;

  winterMana = 0;

  autumnCdr = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.BLESSING_OF_SUMMER_TALENT);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(BLESSING_OF_SEASONS_BUFFS),
      this.onApply,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(BLESSING_OF_SEASONS_BUFFS),
      this.onRemove,
    );

    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.handleSpring);

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.BLESSING_OF_SUMMER_HEAL),
      this.handleSummerHealing,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.BLESSING_OF_SUMMER_DAMAGE),
      this.handleSummerDamage,
    );

    this.addEventListener(
      Events.resourcechange.by(SELECTED_PLAYER).spell(SPELLS.BLESSING_OF_WINTER_TALENT),
      this.handleWinterManaGain,
    );
  }

  onApply(event: ApplyBuffEvent) {
    const buffId = event.ability.guid;
    if (event.sourceID == this.selectedCombatant.id) {
      this.applyCount.set(buffId, this.applyCount.get(buffId)! + 1);
    }

    if (buffId == SPELLS.BLESSING_OF_AUTUMN_TALENT.id) {
      this.spellUsable.applyCooldownRateChange('ALL', 1 + BLESSING_OF_AUTUMN_REDUCTION);
    }
  }

  onRemove(event: RemoveBuffEvent) {
    const buffId = event.ability.guid;

    if (buffId == SPELLS.BLESSING_OF_AUTUMN_TALENT.id) {
      this.spellUsable.removeCooldownRateChange('ALL', 1 + BLESSING_OF_AUTUMN_REDUCTION);
    }
  }

  handleSpring(event: HealEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.BLESSING_OF_SPRING_TALENT.id)) {
      return;
    }

    this.springHealing += calculateEffectiveHealing(event, BLESSING_OF_SPRING_INCREASE);
    this.springOverhealing += calculateOverhealing(event, BLESSING_OF_SPRING_INCREASE);
  }

  handleSummerHealing(event: HealEvent) {
    this.summerHealing += event.amount + (event.absorbed || 0);
    this.summerOverhealing += event.overheal || 0;
  }

  handleSummerDamage(event: DamageEvent) {
    this.summerDamage += event.amount + (event.absorbed || 0);
  }

  handleWinterManaGain(event: ResourceChangeEvent) {
    this.winterMana += event.resourceChange;
  }

  get guideSubsection(): JSX.Element {
    const explanation = (
      <>
        <p>
          <b>
            <SpellLink spell={TALENTS.BLESSING_OF_SUMMER_TALENT} />
          </b>{' '}
          is a unique ability that cycles through 4 different buffs that can be applied to yourself
          or other players.
          <div>
            <SpellLink spell={SPELLS.BLESSING_OF_AUTUMN_TALENT} /> is mostly going on yourself. It
            will provide a total of {BLESSING_OF_SEASONS_DURATION * BLESSING_OF_AUTUMN_REDUCTION}{' '}
            seconds of cooldown reduction to all spells over its {BLESSING_OF_SEASONS_DURATION}{' '}
            duration. It is important to note that it does not reduce the cooldown of items like
            trinkets or racials, so it may misalign the targets cooldown from their trinket if used
            on a person with on-use trinkets.
          </div>
          <div>
            <SpellLink spell={SPELLS.BLESSING_OF_WINTER_TALENT} /> provides{' '}
            {(BLESSING_OF_WINTER_RESTORE * 100 * BLESSING_OF_SEASONS_DURATION) / 2}% mana over its{' '}
            {BLESSING_OF_SEASONS_DURATION} duration. It can only be used on healers, so it will
            mostly be used on yourself, but you can also use it on another healer if you are feeling
            friendly.
          </div>
          <div>
            <SpellLink spell={SPELLS.BLESSING_OF_SPRING_TALENT} /> provides a{' '}
            {BLESSING_OF_SPRING_INCREASE * 100}% buff to healing done and{' '}
            {BLESSING_OF_SPRING_TAKEN_INCREASE * 100}% buff to healing taken. The buff to healing
            done is the important part here and means it should ideally be used on the healer that
            will be doing the most healing over its duration, but most of the time it is fine to
            just use it on yourself.
          </div>
          <div>
            <SpellLink spell={TALENTS.BLESSING_OF_SUMMER_TALENT} /> causes a portion of all healing
            to be converted into damage and vice versa. You'll simply cast it on a healer when you
            want it to deal damage, and on a dps player if you want it to heal. In reality, you will
            almost always cast this on a healer with their cooldowns. Cast it on yourself when you
            are about to press <SpellLink spell={TALENTS.AVENGING_WRATH_TALENT} /> and{' '}
            <SpellLink spell={TALENTS.DIVINE_TOLL_TALENT} /> otherwise using it on another healer
            with their major ramp window. If you want it to heal, then simply use it on any non-pet
            class dps that does the most damage in the next 30 seconds.
          </div>
        </p>
      </>
    );

    const data = (
      <div>
        <RoundedPanel>
          <strong>
            <SpellLink spell={TALENTS.BLESSING_OF_SUMMER_TALENT} /> cast efficiency
          </strong>
          <div className="flex-main chart" style={{ padding: 15 }}>
            {this.subStatistic()}
          </div>
        </RoundedPanel>
      </div>
    );

    return explanationAndDataSubsection(explanation, data, GUIDE_CORE_EXPLANATION_PERCENT);
  }

  subStatistic() {
    return (
      <CastEfficiencyBar
        spell={TALENTS.BLESSING_OF_SUMMER_TALENT}
        gapHighlightMode={GapHighlight.FullCooldown}
        minimizeIcons
        slimLines
        useThresholds
      />
    );
  }

  statistic() {
    this.totalHealing = this.springHealing + this.summerHealing;
    this.totalOverhealing = this.springOverhealing + this.summerOverhealing;

    const effectiveCdr =
      BLESSING_OF_SEASONS_DURATION * (1 + BLESSING_OF_AUTUMN_REDUCTION) -
      BLESSING_OF_SEASONS_DURATION;
    this.autumnCdr = this.applyCount.get(SPELLS.BLESSING_OF_AUTUMN_TALENT.id)! * effectiveCdr;

    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            Note: uses of Seasons (besides <SpellLink spell={TALENTS.BLESSING_OF_SUMMER_TALENT} />)
            on other players are not factored into this calculation, therefore lowering your
            effective values as a result. <br />
            <br />- Effective Healing: {formatNumber(this.totalHealing)} <br />- Overhealing:{' '}
            {formatNumber(this.totalOverhealing)} <br />
            <br />
            <table className="table table-condensed">
              <thead>
                <tr>
                  <th>Buff</th>
                  <th>Count</th>
                  <th>Values</th>
                </tr>
              </thead>
              <tbody>
                <tr key="spring">
                  <td>
                    <SpellLink spell={SPELLS.BLESSING_OF_SPRING_TALENT} />
                  </td>
                  <td>{this.applyCount.get(SPELLS.BLESSING_OF_SPRING_TALENT.id)!}</td>
                  <td>{formatNumber(this.springHealing)} healing</td>
                </tr>
                <tr key="summer">
                  <td>
                    <SpellLink spell={SPELLS.BLESSING_OF_SUMMER_TALENT} />
                  </td>
                  <td>{this.applyCount.get(SPELLS.BLESSING_OF_SUMMER_TALENT.id)!}</td>
                  <td>
                    {formatNumber(this.summerHealing)} healing | {formatNumber(this.summerDamage)}{' '}
                    damage
                  </td>
                </tr>
                <tr key="autumn">
                  <td>
                    <SpellLink spell={SPELLS.BLESSING_OF_AUTUMN_TALENT} />
                  </td>
                  <td>{this.applyCount.get(SPELLS.BLESSING_OF_AUTUMN_TALENT.id)!}</td>
                  <td>{formatNumber(this.autumnCdr)} seconds of CDR applied onto all spells</td>
                </tr>
                <tr key="winter">
                  <td>
                    <SpellLink spell={SPELLS.BLESSING_OF_WINTER_TALENT} />
                  </td>
                  <td>{this.applyCount.get(SPELLS.BLESSING_OF_WINTER_TALENT.id)!}</td>
                  <td>{formatNumber(this.winterMana)} mana gained</td>
                </tr>
              </tbody>
            </table>
          </>
        }
      >
        <TalentSpellText talent={TALENTS.BLESSING_OF_SUMMER_TALENT}>
          <TooltipElement
            content={
              <>
                <SpellIcon spell={SPELLS.BLESSING_OF_SPRING_TALENT} />{' '}
                <ItemHealingDone amount={this.springHealing} /> <br />
                <SpellIcon spell={SPELLS.BLESSING_OF_SUMMER_HEAL} />{' '}
                <ItemHealingDone amount={this.summerHealing} /> <br />
              </>
            }
          >
            <ItemHealingDone amount={this.totalHealing} /> <br />
          </TooltipElement>
          <ItemDamageDone amount={this.summerDamage} />
          <br />
          <ItemCooldownReduction effective={this.autumnCdr * 1000} approximate />
          <br />
          <ItemManaGained amount={this.winterMana} useAbbrev customLabel="mana" />
        </TalentSpellText>
      </Statistic>
    );
  }
}
