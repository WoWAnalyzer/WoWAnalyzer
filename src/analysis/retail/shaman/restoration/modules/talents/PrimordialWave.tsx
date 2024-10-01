import { formatPercentage, formatThousands } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/shaman';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, CastEvent, HealEvent, RemoveBuffEvent } from 'parser/core/Events';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { RESTORATION_COLORS } from '../../constants';
import {
  isFromHardcast,
  isHealingWaveFromPrimordialWave,
  isRiptideFromPrimordialWave,
  wasPrimordialWaveConsumed,
} from '../../normalizers/CastLinkNormalizer';
import RiptideTracker from '../core/RiptideTracker';
import DonutChart from 'parser/ui/DonutChart';
import { SpellLink, TooltipElement } from 'interface';
import StatisticListBoxItem from 'parser/ui/StatisticListBoxItem';
import WarningIcon from 'interface/icons/Warning';
import CheckmarkIcon from 'interface/icons/Checkmark';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { GapHighlight } from 'parser/ui/CooldownBar';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../Guide';
import TalentSpellText from 'parser/ui/TalentSpellText';

class PrimordialWave extends Analyzer {
  static dependencies = {
    riptideTracker: RiptideTracker,
  };

  protected riptideTracker!: RiptideTracker;
  pwaveRiptides: number = 0;
  pwaveHealingWaveCasts: number = 0;
  pwaveHealingWaveHits: number = 0;
  healing = 0;
  riptideHealing = 0;
  waveHealing = 0;
  overHealing = 0;
  riptideOverHealing = 0;
  waveOverHealing = 0;
  wastedBuffs = 0;
  buffCount = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.PRIMORDIAL_WAVE_RESTORATION_TALENT);

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.PRIMORDIAL_WAVE_HEAL),
      this._onPWaveHeal,
    );

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(TALENTS.RIPTIDE_TALENT),
      this._riptideHeal,
    );

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.HEALING_WAVE_TALENT),
      this._waveCast,
    );

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(TALENTS.HEALING_WAVE_TALENT),
      this._waveHeal,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.PRIMORDIAL_WAVE_BUFF),
      this._onPWaveApply,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.PRIMORDIAL_WAVE_BUFF),
      this._onPWaveRemove,
    );
  }

  get totalHealing() {
    return this.healing + this.riptideHealing + this.waveHealing;
  }

  get averageHealingWaveTargets() {
    return this.pwaveHealingWaveHits / this.pwaveHealingWaveCasts;
  }

  get riptideOverhealingPercent() {
    return formatPercentage(
      this.riptideOverHealing / (this.riptideHealing + this.riptideOverHealing),
    );
  }

  get healingWaveOverhealingPercent() {
    return formatPercentage(this.waveOverHealing / (this.waveHealing + this.waveOverHealing));
  }

  get pwaveOverhealingPercent() {
    return formatPercentage(this.overHealing / (this.healing + this.overHealing));
  }

  get buffIcon() {
    return this.wastedBuffs > 0 ? <WarningIcon /> : <CheckmarkIcon />;
  }

  _onPWaveApply(event: ApplyBuffEvent) {
    this.buffCount += 1;
  }

  _onPWaveRemove(event: RemoveBuffEvent) {
    if (wasPrimordialWaveConsumed(event)) {
      return;
    }
    this.wastedBuffs += 1;
  }

  _onPWaveHeal(event: HealEvent) {
    this.healing += event.amount + (event.absorbed || 0);
    this.overHealing += event.overheal || 0;
  }

  _riptideHeal(event: HealEvent) {
    const spellId = event.ability.guid;
    const targetId = event.targetID;
    if (event.tick) {
      if (!this.riptideTracker.hots[targetId] || !this.riptideTracker.hots[targetId][spellId]) {
        return;
      }
      const riptide = this.riptideTracker.hots[targetId][spellId];
      if (this.riptideTracker.fromPrimordialWave(riptide)) {
        this.riptideHealing += event.amount + (event.absorbed || 0);
        this.riptideOverHealing += event.overheal || 0;
      }
    } else if (isRiptideFromPrimordialWave(event)) {
      this.riptideHealing += event.amount + (event.absorbed || 0);
      this.riptideOverHealing += event.overheal || 0;
    }
  }

  _waveCast(event: CastEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.PRIMORDIAL_WAVE_BUFF.id)) {
      return;
    }
    this.pwaveHealingWaveCasts += 1;
    return;
  }

  _waveHeal(event: HealEvent) {
    if (isFromHardcast(event)) {
      return;
    }
    if (isHealingWaveFromPrimordialWave(event)) {
      this.waveHealing += event.amount + (event.absorbed || 0);
      this.waveOverHealing += event.overheal || 0;
      this.pwaveHealingWaveHits += 1;
    }
  }

  renderPrimoridalWaveChart() {
    const items = [
      {
        color: RESTORATION_COLORS.HEALING_WAVE,
        label: 'Healing Wave',
        spellId: TALENTS.HEALING_WAVE_TALENT.id,
        value: this.waveHealing,
        valueTooltip:
          formatThousands(this.waveHealing) +
          ' (' +
          this.healingWaveOverhealingPercent +
          '% overheal)',
      },
      {
        color: RESTORATION_COLORS.RIPTIDE,
        label: 'Riptide',
        spellId: TALENTS.RIPTIDE_TALENT.id,
        value: this.riptideHealing,
        valueTooltip:
          formatThousands(this.riptideHealing) +
          ' (' +
          this.riptideOverhealingPercent +
          '% overheal)',
      },
      {
        color: RESTORATION_COLORS.PRIMORDIAL_WAVE,
        label: 'Primordial Wave',
        spellId: TALENTS.PRIMORDIAL_WAVE_RESTORATION_TALENT.id,
        value: this.healing,
        valueTooltip:
          formatThousands(this.healing) + ' (' + this.pwaveOverhealingPercent + '% overheal)',
      },
    ];
    return <DonutChart items={items} />;
  }

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={<SpellLink spell={TALENTS.PRIMORDIAL_WAVE_RESTORATION_TALENT} />}
        value={`${formatPercentage(
          this.owner.getPercentageOfTotalHealingDone(this.totalHealing),
        )} %`}
      />
    );
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.CORE(2)}
        tooltip={
          <>
            <ul>
              <li>
                Average Riptides Per <SpellLink spell={TALENTS.HEALING_WAVE_TALENT} />:{' '}
                {this.averageHealingWaveTargets.toFixed(2)}
              </li>
              <li>
                {formatThousands(this.waveHealing)} healing via{' '}
                <SpellLink spell={TALENTS.HEALING_WAVE_TALENT} /> cleave,{' '}
                {this.healingWaveOverhealingPercent}% Overheal
              </li>
              <li>
                {formatThousands(this.healing)} healing via{' '}
                <SpellLink spell={TALENTS.PRIMORDIAL_WAVE_RESTORATION_TALENT} />,{' '}
                {this.pwaveOverhealingPercent}% Overheal
              </li>
              <li>
                {formatThousands(this.riptideHealing)} healing via{' '}
                <SpellLink spell={TALENTS.RIPTIDE_TALENT} />, {this.riptideOverhealingPercent}%
                Overheal
              </li>
            </ul>
          </>
        }
      >
        <TalentSpellText talent={TALENTS.PRIMORDIAL_WAVE_RESTORATION_TALENT}>
          <ItemHealingDone amount={this.totalHealing} />
          <br />
          <TooltipElement
            content={
              <>
                The number of <SpellLink spell={TALENTS.PRIMORDIAL_WAVE_RESTORATION_TALENT} /> buffs
                that expired without casting <SpellLink spell={TALENTS.HEALING_WAVE_TALENT} /> (
                {this.wastedBuffs} wasted of {this.buffCount} total)
              </>
            }
          >
            {this.buffIcon} {this.wastedBuffs}
            <small> wasted buffs</small>
          </TooltipElement>
        </TalentSpellText>
        <aside className="pad">
          <hr />
          <header>
            <label>Breakdown of Primordial Wave Healing</label>
          </header>
          {this.renderPrimoridalWaveChart()}
        </aside>
      </Statistic>
    );
  }

  /** Guide subsection describing the proper usage of Primordial Wave */
  get guideSubsection(): JSX.Element {
    const explanation = (
      <p>
        <b>
          <SpellLink spell={TALENTS.PRIMORDIAL_WAVE_RESTORATION_TALENT} />
        </b>{' '}
        is a powerful ability that heals an ally, applies a{' '}
        <SpellLink spell={TALENTS.RIPTIDE_TALENT} />, and makes your next{' '}
        <SpellLink spell={TALENTS.HEALING_WAVE_TALENT} /> cleave all allies with an active{' '}
        <SpellLink spell={TALENTS.RIPTIDE_TALENT} /> HoT. This cleave effect can be combined with{' '}
        spells that increase the healing of <SpellLink spell={TALENTS.HEALING_WAVE_TALENT} /> such
        as <SpellLink spell={TALENTS.UNLEASH_LIFE_TALENT} />{' '}
      </p>
    );

    const data = (
      <div>
        <RoundedPanel>
          <strong>
            <SpellLink spell={TALENTS.PRIMORDIAL_WAVE_RESTORATION_TALENT} /> cast efficiency
          </strong>
          <div className="flex-main chart" style={{ padding: 15 }}>
            {this.guideSubStatistic()}
          </div>
        </RoundedPanel>
      </div>
    );

    return explanationAndDataSubsection(explanation, data, GUIDE_CORE_EXPLANATION_PERCENT);
  }

  guideSubStatistic() {
    return (
      <CastEfficiencyBar
        spellId={TALENTS.PRIMORDIAL_WAVE_RESTORATION_TALENT.id}
        gapHighlightMode={GapHighlight.FullCooldown}
        useThresholds
      />
    );
  }
}

export default PrimordialWave;
