import talents, { TALENTS_MONK } from 'common/TALENTS/monk';
import SPELLS from 'common/SPELLS/monk';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  AbsorbedEvent,
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  DamageEvent,
  GetRelatedEvents,
  HasRelatedEvent,
  HealEvent,
} from 'parser/core/Events';
import { calculateEffectiveDamage, calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Statistic from 'parser/ui/Statistic';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { SpellLink } from 'interface';
import { formatNumber, formatPercentage } from 'common/format';
import TalentSpellText from 'parser/ui/TalentSpellText';
import {
  SPIRITFONT_R1_ENV_RSK_INCREASE,
  SPIRITFONT_R2_ENV_RSK_INCREASE,
  SPIRITFONT_INCREASE_DURING_HOT,
  getCurrentRSKTalentDamage,
} from '../../constants';
import {
  AT_RSK,
  SPIRITFONT_PROC,
  SPIRITFONT_TFT,
} from '../../normalizers/EventLinks/EventLinkConstants';
import StatisticListBoxItem from 'parser/ui/StatisticListBoxItem';
import ItemDamageDone from 'parser/ui/ItemDamageDone';

class Spiritfont extends Analyzer {
  rskDamage = 0;
  rskDamageDuringSpiritfont = 0;
  rskHealing = 0;
  rskHealingDuringSpiritfont = 0;
  envHealing = 0;
  envHealingDuringSpiritfont = 0;
  tftSpiritfonts = 0;
  proccedSpiritfonts = 0;
  spiritfontHealing = 0;
  chiCocoonHealing = 0;

  envRskIncrease = 0;
  activeRSKTalent = SPELLS.RISING_SUN_KICK_DAMAGE;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(talents.SPIRITFONT_1_MISTWEAVER_TALENT);

    this.activeRSKTalent = getCurrentRSKTalentDamage(this.selectedCombatant);

    if (this.selectedCombatant.hasTalent(talents.SPIRITFONT_2_MISTWEAVER_TALENT)) {
      this.envRskIncrease =
        this.selectedCombatant.getTalentRank(talents.SPIRITFONT_2_MISTWEAVER_TALENT) === 1
          ? SPIRITFONT_R1_ENV_RSK_INCREASE
          : SPIRITFONT_R2_ENV_RSK_INCREASE;
    }

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(talents.ENVELOPING_MIST_TALENT),
      this.handleEnv,
    );
    this.addEventListener(
      Events.damage
        .by(SELECTED_PLAYER)
        .spell([SPELLS.RISING_SUN_KICK_DAMAGE, SPELLS.RUSHING_WIND_KICK_DAMAGE]),
      this.handleRsk,
    );
    this.addEventListener(
      Events.absorbed.by(SELECTED_PLAYER).spell(SPELLS.SPIRITFONT_CHI_COCOON),
      this.handleChiCocoon,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.SPIRITFONT_HOT),
      this.handleSpiritfontHeal,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.SPIRITFONT_BUFF),
      this.handleSfApply,
    );
    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.SPIRITFONT_BUFF),
      this.handleSfApply,
    );
  }

  handleSfApply(event: ApplyBuffEvent | ApplyBuffStackEvent) {
    if (HasRelatedEvent(event, SPIRITFONT_PROC)) {
      this.proccedSpiritfonts += 1;
    } else if (HasRelatedEvent(event, SPIRITFONT_TFT)) {
      this.tftSpiritfonts += 1;
    } else {
      this.tftSpiritfonts += 1; // fallback for tfts casted before combat
    }
  }

  handleSpiritfontHeal(event: HealEvent) {
    this.spiritfontHealing += event.amount + (event.absorbed || 0);
  }

  handleChiCocoon(event: AbsorbedEvent) {
    this.chiCocoonHealing += event.amount;
  }

  handleEnv(event: HealEvent) {
    const effectiveHealing = calculateEffectiveHealing(event, this.getSpiritfontMultiplier());
    if (this.selectedCombatant.hasBuff(SPELLS.SPIRITFONT_ACTIVE_BUFF)) {
      this.envHealingDuringSpiritfont += effectiveHealing;
    } else {
      this.envHealing += effectiveHealing;
    }
  }

  handleRsk(event: DamageEvent) {
    const multiplier = this.getSpiritfontMultiplier();
    const effectiveDamage = calculateEffectiveDamage(event, multiplier);
    const effectiveHealing = GetRelatedEvents<HealEvent>(event, AT_RSK).reduce(
      (total, ATEvent) => total + calculateEffectiveHealing(ATEvent, multiplier),
      0,
    );

    if (this.selectedCombatant.hasBuff(SPELLS.SPIRITFONT_ACTIVE_BUFF)) {
      this.rskDamageDuringSpiritfont += effectiveDamage;
      this.rskHealingDuringSpiritfont += effectiveHealing;
    } else {
      this.rskDamage += effectiveDamage;
      this.rskHealing += effectiveHealing;
    }
  }

  getSpiritfontMultiplier() {
    const multiplier = this.selectedCombatant.hasBuff(SPELLS.SPIRITFONT_ACTIVE_BUFF)
      ? this.envRskIncrease * SPIRITFONT_INCREASE_DURING_HOT
      : this.envRskIncrease;

    return multiplier;
  }

  get totalHealing() {
    return (
      this.rskHealing +
      this.envHealing +
      this.rskHealingDuringSpiritfont +
      this.envHealingDuringSpiritfont +
      this.tftSpiritfontHealing +
      this.proccedSpiritfontHealing +
      this.chiCocoonHealing
    );
  }

  get totalDamage() {
    return this.rskDamage + this.rskDamageDuringSpiritfont;
  }

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={<SpellLink spell={TALENTS_MONK.SPIRITFONT_1_MISTWEAVER_TALENT} />}
        value={`${formatPercentage(
          this.owner.getPercentageOfTotalHealingDone(this.totalHealing),
        )} %`}
      />
    );
  }

  get proccedSpiritfontHealing() {
    const total = this.proccedSpiritfonts + this.tftSpiritfonts;
    if (total === 0) return 0;
    return this.spiritfontHealing * (this.proccedSpiritfonts / total);
  }

  get tftSpiritfontHealing() {
    const total = this.proccedSpiritfonts + this.tftSpiritfonts;
    if (total === 0) return 0;
    return this.spiritfontHealing * (this.tftSpiritfonts / total);
  }

  get point1Healing() {
    return this.proccedSpiritfontHealing;
  }

  get point2And3Healing() {
    return (
      this.envHealing +
      this.rskHealing +
      this.envHealingDuringSpiritfont +
      this.rskHealingDuringSpiritfont
    );
  }

  get point4Healing() {
    return this.tftSpiritfontHealing + this.chiCocoonHealing;
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        position={STATISTIC_ORDER.CORE(1)}
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            <strong>
              Point 1 - <SpellLink spell={SPELLS.SPIRITFONT_BUFF} /> procs (
              {formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.point1Healing))}%):
            </strong>
            <ul>
              <li>
                Procced <SpellLink spell={SPELLS.SPIRITFONT_BUFF} />s ({this.proccedSpiritfonts}):{' '}
                {formatNumber(this.proccedSpiritfontHealing)}
              </li>
            </ul>
            <strong>
              Points 2-3 - <SpellLink spell={this.activeRSKTalent} />/
              <SpellLink spell={talents.ENVELOPING_MIST_TALENT} /> increase (
              {formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.point2And3Healing))}
              %):
            </strong>
            <ul>
              <li>
                Effective <SpellLink spell={talents.ENVELOPING_MIST_TALENT} /> healing:{' '}
                {formatNumber(this.envHealing + this.envHealingDuringSpiritfont)}
                {this.envHealingDuringSpiritfont > 0 && (
                  <>
                    {' '}
                    ({formatNumber(this.envHealingDuringSpiritfont)} during{' '}
                    <SpellLink spell={SPELLS.SPIRITFONT_BUFF} />)
                  </>
                )}
              </li>
              <li>
                Effective <SpellLink spell={this.activeRSKTalent} /> healing:{' '}
                {formatNumber(this.rskHealing + this.rskHealingDuringSpiritfont)}
                {this.rskHealingDuringSpiritfont > 0 && (
                  <>
                    {' '}
                    ({formatNumber(this.rskHealingDuringSpiritfont)} during{' '}
                    <SpellLink spell={SPELLS.SPIRITFONT_BUFF} />)
                  </>
                )}
              </li>
            </ul>
            <strong>
              Point 4 - <SpellLink spell={TALENTS_MONK.THUNDER_FOCUS_TEA_TALENT} /> &{' '}
              <SpellLink spell={SPELLS.SPIRITFONT_CHI_COCOON} /> (
              {formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.point4Healing))}%):
            </strong>
            <ul>
              <li>
                <SpellLink spell={TALENTS_MONK.THUNDER_FOCUS_TEA_TALENT} />{' '}
                <SpellLink spell={SPELLS.SPIRITFONT_BUFF} />s ({this.tftSpiritfonts}):{' '}
                {formatNumber(this.tftSpiritfontHealing)}
              </li>
              <li>
                <SpellLink spell={SPELLS.SPIRITFONT_CHI_COCOON} />
                s: {formatNumber(this.chiCocoonHealing)}
              </li>
            </ul>
          </>
        }
      >
        <TalentSpellText talent={talents.SPIRITFONT_1_MISTWEAVER_TALENT}>
          <ItemHealingDone amount={this.totalHealing} />
          <br />
          <ItemDamageDone amount={this.totalDamage} />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default Spiritfont;
