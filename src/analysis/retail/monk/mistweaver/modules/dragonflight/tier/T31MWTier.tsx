import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TIERS } from 'game/TIERS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveHealing, calculateOverhealing } from 'parser/core/EventCalculateLib';
import Events, { CastEvent, HealEvent } from 'parser/core/Events';
import Combatants from 'parser/shared/modules/Combatants';
import BoringValueText from 'parser/ui/BoringValueText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { CHI_HARMONY_COLLECTION } from '../../../constants';
import { TALENTS_MONK } from 'common/TALENTS';
import { SpellLink } from 'interface';

const TWO_PIECE_BONUS = 0.5;

const TARGET_SPELLS = [
  SPELLS.VIVIFY,
  TALENTS_MONK.ENVELOPING_MIST_TALENT,
  SPELLS.EXPEL_HARM,
  TALENTS_MONK.SHEILUNS_GIFT_TALENT,
  TALENTS_MONK.SOOTHING_MIST_TALENT,
];

const TOOLTIP_SPELLS = [...TARGET_SPELLS, SPELLS.GUSTS_OF_MISTS];

export interface ChiHarmonySourceMap {
  rawAmount: number;
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
  };
  protected combatants!: Combatants;
  fourPieceSourceMap: Map<number, ChiHarmonySourceMap> = new Map<number, ChiHarmonySourceMap>();
  fourPieceEffective: number = 0;
  fourPieceOverheal: number = 0;
  has2Piece: boolean = true;
  has4Piece: boolean = true;
  twoPieceHealing: number = 0;
  twoPieceOverheal: number = 0;
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

    //verify if we need to add absorb healing event listeners
    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.handle2pcHeal);
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

  private missedCastsPerSpell(spellId: number) {
    const filteredMap = this.castMap.filter((x) => x.spellId === spellId);
    return filteredMap.reduce((sum, spell) => sum + spell.missedCasts, 0);
  }

  private totalCastsPerSpell(spellId: number) {
    const filteredMap = this.castMap.filter((x) => x.spellId === spellId);
    return filteredMap.reduce((sum, spell) => sum + spell.totalCasts, 0);
  }

  handleCast(event: CastEvent) {
    const combatant = this.combatants.getEntity(event);
    if (combatant) {
      const newCast: ChiHarmonyTargetedSpells = {
        spellId: event.ability.guid,
        missedCasts: Number(!combatant.hasBuff(SPELLS.CHI_HARMONY_HEAL_BONUS.id)),
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

  private addHealToSourceMap(event: HealEvent) {
    const current = this.fourPieceSourceMap.get(event.ability.guid);
    if (current) {
      current.effective += event.amount + (event.absorbed || 0);
      current.overheal += event.overheal || 0;
      current.rawAmount += event.amount + (event.absorbed || 0) + (event.overheal || 0);
    } else {
      this.fourPieceSourceMap.set(event.ability.guid, {
        effective: event.amount + (event.absorbed || 0),
        overheal: event.overheal || 0,
        rawAmount: event.amount + (event.absorbed || 0) + (event.overheal || 0),
      });
    }
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
          <strong>{formatNumber(this.twoPieceOverheal)}</strong> Overheal from 2 set
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
      >
        <BoringValueText label="Amirdrassil Tier Set (T31 Set Bonus)">
          <h4>2 Piece</h4>
          <ItemHealingDone amount={this.twoPieceHealing} />
          <br />
          {/* {formatPercentage(this.twoSetUptime)}%<small> uptime</small> */}
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
