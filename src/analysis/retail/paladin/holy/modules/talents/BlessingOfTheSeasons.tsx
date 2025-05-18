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

const BUFFS = [
  SPELLS.BLESSING_OF_AUTUMN_TALENT,
  SPELLS.BLESSING_OF_WINTER_TALENT,
  SPELLS.BLESSING_OF_SPRING_TALENT,
  SPELLS.BLESSING_OF_SUMMER_TALENT,
];

export class BlessingOfTheSeasons extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;

  applyCount: Map<number, number> = new Map<number, number>(
    BUFFS.map((spell) => {
      return [spell.id, 0];
    }),
  );

  totalHealing = 0;
  totalOverhealing = 0;

  springHealingAmp = 0.15;
  springHealingTakenAmp = 0.3;
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

    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(BUFFS), this.onApply);
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(BUFFS), this.onRemove);

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
      this.spellUsable.applyCooldownRateChange('ALL', 1.3);
    }
  }

  onRemove(event: RemoveBuffEvent) {
    const buffId = event.ability.guid;

    if (buffId == SPELLS.BLESSING_OF_AUTUMN_TALENT.id) {
      this.spellUsable.removeCooldownRateChange('ALL', 1.3);
    }
  }

  handleSpring(event: HealEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.BLESSING_OF_SPRING_TALENT.id)) {
      return;
    }

    this.springHealing += ((event.amount || 0) + (event.absorbed || 0)) * this.springHealingAmp;
    this.springOverhealing += (event.overheal || 0) * this.springHealingAmp;
  }

  handleSummerHealing(event: HealEvent) {
    this.summerHealing += (event.amount || 0) + (event.absorbed || 0);
    this.summerOverhealing += event.overheal || 0;
  }

  handleSummerDamage(event: DamageEvent) {
    this.summerDamage += (event.amount || 0) + (event.absorbed || 0);
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
          is a unique ability that cycles through 4 different buffs.{' '}
          <SpellLink spell={SPELLS.BLESSING_OF_AUTUMN_TALENT} /> provides pretty minor CDR, you can
          throw it on whoever you want including you.{' '}
          <SpellLink spell={SPELLS.BLESSING_OF_WINTER_TALENT} /> is your main mana refund tool, you
          should use it on yourself more often than not. Finally,{' '}
          <SpellLink spell={SPELLS.BLESSING_OF_SPRING_TALENT} /> gives a nice healing boost that you
          probably would want to keep for yourself.
        </p>
        <p>
          <SpellLink spell={TALENTS.BLESSING_OF_SUMMER_TALENT} /> is the most powerful one and
          converts healing into damage and vice versa. It has two use cases : either you use it on
          someone's that is actively healing to proc damage. Or you want to do healing and you can
          throw it on a non-pet DPS spec in cooldowns.
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
        spellId={TALENTS.BLESSING_OF_SUMMER_TALENT.id}
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

    const effectiveCdr = 30 * 1.3 - 30;
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
        <TalentSpellText talent={TALENTS.BLESSING_OF_THE_SEASONS_TALENT}>
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
