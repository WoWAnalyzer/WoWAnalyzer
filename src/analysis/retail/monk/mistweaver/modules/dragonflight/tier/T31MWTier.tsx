import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TIERS } from 'game/TIERS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveHealing, calculateOverhealing } from 'parser/core/EventCalculateLib';
import Events, { CastEvent, HealEvent, RefreshBuffEvent } from 'parser/core/Events';
import Combatants from 'parser/shared/modules/Combatants';
import BoringValueText from 'parser/ui/BoringValueText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { CHI_HARMONY_COLLECTION } from '../../../constants';
import { TALENTS_MONK } from 'common/TALENTS';
import { SpellLink, TooltipElement } from 'interface';
import HealingDone from 'parser/shared/modules/throughput/HealingDone';
import ItemSetLink from 'interface/ItemSetLink';
import { MONK_T31_ID } from 'common/ITEMS/dragonflight/tier';

const TWO_PIECE_BONUS = 0.5;

const TARGET_SPELLS = [
  SPELLS.VIVIFY,
  TALENTS_MONK.ENVELOPING_MIST_TALENT,
  SPELLS.EXPEL_HARM,
  TALENTS_MONK.SHEILUNS_GIFT_TALENT,
  TALENTS_MONK.SOOTHING_MIST_TALENT,
];

const TOOLTIP_SPELLS = [...TARGET_SPELLS, SPELLS.GUSTS_OF_MISTS];

const DROPDOWN_SPELLS = [
  ...TOOLTIP_SPELLS,
  SPELLS.ESSENCE_FONT_BUFF,
  SPELLS.INVIGORATING_MISTS_HEAL,
  SPELLS.FAELINE_STOMP_HEAL,
  SPELLS.FAELINE_STOMP_ESSENCE_FONT,
  SPELLS.AT_HEAL,
  SPELLS.AT_CRIT_HEAL,
  SPELLS.RISING_MIST_HEAL,
];

const TWO_PIECE_SPELLS = [
  ...DROPDOWN_SPELLS,
  TALENTS_MONK.REVIVAL_TALENT,
  TALENTS_MONK.RESTORAL_TALENT,
  TALENTS_MONK.RENEWING_MIST_TALENT,
  SPELLS.CHI_BURST_HEAL,
  SPELLS.CHI_WAVE_TALENT_HEAL,
  SPELLS.REFRESHING_JADE_WIND_HEAL,
  SPELLS.ZEN_PULSE_HEAL,
  SPELLS.ENVELOPING_BREATH_HEAL,
  SPELLS.YULONS_WHISPER_HEAL,
  SPELLS.SOOTHING_BREATH,
  SPELLS.ENVELOPING_MIST_TFT,
  SPELLS.SOOTHING_MIST_STATUE,
  SPELLS.BURST_OF_LIFE_HEAL,
  SPELLS.OVERFLOWING_MISTS_HEAL,
  SPELLS.GUST_OF_MISTS_CHIJI,
];

export interface ChiHarmonySourceMap {
  raw: number;
  amount: number;
  effective: number;
  overheal: number;
}

type ChiHarmonyTargetedSpells = {
  spellId: number;
  missedCasts: number;
  totalCasts: number;
};

class T31TierSet extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    healingDone: HealingDone,
  };
  protected healingDone!: HealingDone;
  protected combatants!: Combatants;
  fourPieceSourceMap: Map<number, ChiHarmonySourceMap> = new Map<number, ChiHarmonySourceMap>();
  fourPieceEffective: number = 0;
  fourPieceOverheal: number = 0;
  has2Piece: boolean = true;
  has4Piece: boolean = true;
  twoPieceHealing: number = 0;
  twoPieceOverheal: number = 0;
  refreshes: number = 0;
  fourPieceHealing: number = 0;
  fourPieceHealingRaw: number = 0;
  castMap: ChiHarmonyTargetedSpells[] = [];

  constructor(options: Options) {
    super(options);
    this.has2Piece = this.selectedCombatant.has2PieceByTier(TIERS.T31);
    this.has4Piece = this.selectedCombatant.has4PieceByTier(TIERS.T31) && this.has2Piece;
    this.active = this.has2Piece;
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.CHI_HARMONY_HEAL_BONUS),
      this.handleRefresh,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(TWO_PIECE_SPELLS),
      this.handle2pcHeal,
    );
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(TARGET_SPELLS), this.handleCast);
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.GUSTS_OF_MISTS),
      this.handleGomHit,
    );
    if (this.has4Piece) {
      this.addEventListener(
        Events.heal.by(SELECTED_PLAYER).spell(SPELLS.CHI_HARMONY_HEAL),
        this.handle4PcHeal,
      );
    }
  }

  handleRefresh(event: RefreshBuffEvent) {
    this.refreshes += 1;
  }

  handleCast(event: CastEvent) {
    const combatant = this.combatants.getEntity(event);
    //the expel harm cast event doesn't have a target
    if (combatant || event.ability.guid === SPELLS.EXPEL_HARM.id) {
      const hasBuff = combatant
        ? combatant.hasBuff(SPELLS.CHI_HARMONY_HEAL_BONUS.id)
        : this.selectedCombatant.hasBuff(SPELLS.CHI_HARMONY_HEAL_BONUS.id);
      const newCast: ChiHarmonyTargetedSpells = {
        spellId: event.ability.guid,
        missedCasts: Number(!hasBuff),
        totalCasts: 1,
      };
      this.castMap.push(newCast);
    }
  }

  handleGomHit(event: HealEvent) {
    const combatant = this.combatants.getEntity(event);
    if (!combatant) {
      return;
    }
    const newCast: ChiHarmonyTargetedSpells = {
      spellId: event.ability.guid,
      missedCasts: Number(!combatant.hasBuff(SPELLS.CHI_HARMONY_HEAL_BONUS.id)),
      totalCasts: 1,
    };
    this.castMap.push(newCast);
  }

  handle2pcHeal(event: HealEvent) {
    const combatant = this.combatants.getEntity(event);
    if (!combatant || event.ability.guid === SPELLS.CHI_HARMONY_HEAL.id) {
      return;
    }

    if (combatant.hasBuff(SPELLS.CHI_HARMONY_HEAL_BONUS.id)) {
      this.twoPieceHealing += calculateEffectiveHealing(event, TWO_PIECE_BONUS);
      this.twoPieceOverheal += calculateOverhealing(event, TWO_PIECE_BONUS);
      this.fourPieceEffective += event.amount + (event.absorbed || 0);
      this.fourPieceOverheal += event.overheal || 0;
      this.addHealToSourceMap(event);
    }
  }
  handle4PcHeal(event: HealEvent) {
    this.fourPieceHealing += event.amount + (event.absorbed || 0);
    this.fourPieceHealingRaw += event.amount + (event.absorbed || 0) + (event.overheal || 0);
  }

  private missedCastsPerSpell(spellId: number) {
    const filteredMap = this.castMap.filter((x) => x.spellId === spellId);
    return filteredMap.reduce((sum, spell) => sum + spell.missedCasts, 0);
  }

  private totalCastsPerSpell(spellId: number) {
    const filteredMap = this.castMap.filter((x) => x.spellId === spellId);
    return filteredMap.reduce((sum, spell) => sum + spell.totalCasts, 0);
  }

  private addHealToSourceMap(event: HealEvent) {
    const current = this.fourPieceSourceMap.get(event.ability.guid);
    if (current) {
      current.amount += event.amount + (event.absorbed || 0);
      current.effective += calculateEffectiveHealing(event, TWO_PIECE_BONUS);
      current.overheal += event.overheal || 0;
      current.raw += event.amount + (event.absorbed || 0) + (event.overheal || 0);
    } else {
      this.fourPieceSourceMap.set(event.ability.guid, {
        amount: event.amount + (event.absorbed || 0),
        effective: calculateEffectiveHealing(event, TWO_PIECE_BONUS),
        overheal: event.overheal || 0,
        raw: event.amount + (event.absorbed || 0) + (event.overheal || 0),
      });
    }
  }

  private percentIncreaseBySpell(spellId: number, raw: boolean): number {
    //get the healing that was amped by 2pc
    const amplifiedHealing = this.fourPieceSourceMap.get(spellId);
    //get the total healing for the spell
    const totalHealing = this.healingDone.byAbility(spellId);
    if (amplifiedHealing && totalHealing) {
      if (raw) {
        const baseHealing = amplifiedHealing.raw / (1 + TWO_PIECE_BONUS);
        const baseTotal = totalHealing.raw - (amplifiedHealing.raw - baseHealing);
        const percentIncrease = totalHealing.raw / baseTotal - 1;
        return percentIncrease;
      } else {
        const totalPercentIncrease = amplifiedHealing.effective / totalHealing.effective;
        return totalPercentIncrease;
      }
    }
    return 0;
  }

  private sortedDropDownSpells() {
    return DROPDOWN_SPELLS.sort(
      (a, b) => this.percentIncreaseBySpell(b.id, false) - this.percentIncreaseBySpell(a.id, false),
    );
  }

  private specialNotation(spellId: number): string {
    if (spellId === SPELLS.AT_CRIT_HEAL.id) {
      return '(Crit)';
    } else if (spellId === SPELLS.FAELINE_STOMP_ESSENCE_FONT.id) {
      return '(Essence Font)';
    }
    return '';
  }

  private tooltip() {
    return (
      <>
        <strong>
          Casted abilities that targeted a player with{' '}
          <SpellLink spell={SPELLS.CHI_HARMONY_HEAL_BONUS} />
        </strong>
        {TOOLTIP_SPELLS.map(
          (spell) =>
            this.totalCastsPerSpell(spell.id) !== 0 && (
              <ul key={spell.id}>
                <li>
                  <SpellLink spell={spell} />:{' '}
                  <strong>
                    {this.totalCastsPerSpell(spell.id) - this.missedCastsPerSpell(spell.id)}
                  </strong>{' '}
                  -{' '}
                  {formatPercentage(
                    (this.totalCastsPerSpell(spell.id) - this.missedCastsPerSpell(spell.id)) /
                      this.totalCastsPerSpell(spell.id),
                  )}
                  % ({this.missedCastsPerSpell(spell.id)}/{this.totalCastsPerSpell(spell.id)}{' '}
                  missed)
                </li>
              </ul>
            ),
        )}
        <>
          <strong>{formatNumber(this.twoPieceOverheal)}</strong> Overheal from 2 set <br />
        </>
        <hr />
        {this.has4Piece && (
          <>
            <strong>4 Set:</strong>
            <br />
            {formatPercentage(
              (this.fourPieceEffective * CHI_HARMONY_COLLECTION) / this.fourPieceHealingRaw,
            )}
            % of healing from effective healing
            <br />
            {formatPercentage(
              (this.fourPieceOverheal * CHI_HARMONY_COLLECTION) / this.fourPieceHealingRaw,
            )}
            % of healing from overhealing
          </>
        )}
      </>
    );
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        position={STATISTIC_ORDER.CORE(0)}
        category={STATISTIC_CATEGORY.ITEMS}
        tooltip={this.tooltip()}
        dropdown={
          <table className="table table-condensed">
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>Spell</th>
                <th>Effective Increase</th>
                <th>Raw Increase</th>
              </tr>
            </thead>
            <tbody>
              {this.sortedDropDownSpells().map(
                (spell, index) =>
                  this.fourPieceSourceMap.get(spell.id) && (
                    <tr key={index}>
                      <td style={{ textAlign: 'left' }}>
                        <SpellLink spell={spell} /> {this.specialNotation(spell.id)}
                      </td>
                      <td>{formatPercentage(this.percentIncreaseBySpell(spell.id, false), 0)}%</td>
                      <td>{formatPercentage(this.percentIncreaseBySpell(spell.id, true), 0)}%</td>
                    </tr>
                  ),
              )}
            </tbody>
          </table>
        }
      >
        <BoringValueText
          label={
            <ItemSetLink id={MONK_T31_ID}>
              <>
                Mystic Heron's Discipline
                <br />
                (T31 Tier Set)
              </>
            </ItemSetLink>
          }
        >
          <h4>2 Piece</h4>
          <ItemHealingDone amount={this.twoPieceHealing} />
          <br />
          <TooltipElement
            content={
              <>
                Generally try to avoid refreshing <SpellLink spell={SPELLS.CHI_HARMONY_HEAL} />.{' '}
                <SpellLink spell={SPELLS.CHI_HARMONY_HEAL} /> does not pandemic, and refreshing the
                buff reduces the amount of time available to amplify and collect healing.
                <br />
                This <i>can</i> be beneficial if you are doing it to time your 4pc heal effectively.
              </>
            }
          >
            <strong>{formatNumber(this.refreshes)}</strong> <small>buff refreshes</small>
          </TooltipElement>
          <hr />
          {this.has4Piece && (
            <>
              <h4>4 Piece</h4>
              <ItemHealingDone amount={this.fourPieceHealing} />
            </>
          )}
        </BoringValueText>
      </Statistic>
    );
  }
}

export default T31TierSet;
