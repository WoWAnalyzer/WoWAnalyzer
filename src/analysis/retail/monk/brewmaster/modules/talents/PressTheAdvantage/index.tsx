import styled from '@emotion/styled';
import SPELLS from 'common/SPELLS';
import talents from 'common/TALENTS/monk';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events, { DamageEvent, RemoveBuffEvent } from 'parser/core/Events';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import TalentSpellText from 'parser/ui/TalentSpellText';
import getDamageBonus from '../../core/GetDamageBonus';
import SharedBrews from '../../core/SharedBrews';
import { ptaBonusCast, ptaBonusDamage } from './normalizer';

const PTA_DMG_MODIFIER = 0.01;
const PTA_BREW_CDR = 500;

const deps = {
  brews: SharedBrews,
};

type PtaConsumerData = {
  spellId: number;
  count: number;
  totalDamage: number;
};

const BreakdownTable = styled.table`
  td {
    padding: 0 0.5em;
  }
  td:first-child {
    text-align: right;
  }
`;

export default class PressTheAdvantage extends Analyzer.withDependencies(deps) {
  private buffDamageContribution = 0;
  private directDamageContribution = 0;
  public brewCDRTotal = 0;
  public wastedBrewCDR = 0;
  public meleeCount = 0;

  /**
   * The number of times that PTA expired without being consumed.
   */
  private ptaExpirations = 0;
  private readonly ptaConsumers: Map<number, PtaConsumerData> = new Map();

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(talents.PRESS_THE_ADVANTAGE_TALENT);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.accumulateBuffedDamage);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER_PET), this.accumulateBuffedDamage);
    this.addEventListener(
      Events.damage.spell(SPELLS.PRESS_THE_ADVANTAGE_DMG),
      this.accumulateDirectDamage,
    );

    // the normalizer handles connecting removebuff events to the free casts that they triggered
    this.addEventListener(
      Events.removebuff.spell(SPELLS.PRESS_THE_ADVANTAGE_BUFF),
      this.processPtaConsumption,
    );
  }

  private accumulateBuffedDamage(event: DamageEvent) {
    if (event.ability.guid === SPELLS.PRESS_THE_ADVANTAGE_DMG.id) {
      // yes, this buffs itself. don't want to double-count the damage
      return;
    }
    const currentStackCount = this.selectedCombatant.getBuffStacks(
      SPELLS.PRESS_THE_ADVANTAGE_BUFF.id,
    );
    this.buffDamageContribution += getDamageBonus(event, PTA_DMG_MODIFIER * currentStackCount);
  }

  private accumulateDirectDamage(event: DamageEvent) {
    this.directDamageContribution += event.amount + (event.absorbed ?? 0);
    // every direct damage hit generates cdr
    this.applyBrewCdr();
    this.meleeCount += 1;
  }

  private applyBrewCdr() {
    const amount = this.deps.brews.reduceCooldown(PTA_BREW_CDR);
    this.brewCDRTotal += amount;
    this.wastedBrewCDR += PTA_BREW_CDR - amount;
  }

  private processPtaConsumption(event: RemoveBuffEvent) {
    const cast = ptaBonusCast(event);
    if (!cast) {
      // natural expiration
      this.ptaExpirations += 1;
      return;
    }

    const damage = ptaBonusDamage(event);

    if (!this.ptaConsumers.has(cast.ability.guid)) {
      this.ptaConsumers.set(cast.ability.guid, {
        spellId: cast.ability.guid,
        count: 0,
        totalDamage: 0,
      });
    }
    const tracker = this.ptaConsumers.get(cast.ability.guid)!;
    tracker.count += 1;

    // we *shouldn't* need to worry about double-counting this because it occurs *after* the buff is removed
    tracker.totalDamage += damage
      .map((event) => event.amount + (event.absorbed ?? 0))
      .reduce((a, b) => a + b, 0);
  }

  get totalDamage() {
    const bonusCastContribution = Array.from(this.ptaConsumers.values())
      .map((consumer) => consumer.totalDamage)
      .reduce((a, b) => a + b, 0);
    return this.buffDamageContribution + this.directDamageContribution + bonusCastContribution;
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <BreakdownTable>
            <tr>
              <td>% Damage Bonus</td>
              <td>
                <ItemDamageDone amount={this.buffDamageContribution} />
              </td>
            </tr>
            <tr>
              <td>On-Hit Damage</td>
              <td>
                <ItemDamageDone amount={this.directDamageContribution} />
              </td>
              <td>{this.meleeCount} Hits</td>
            </tr>
            <tr>
              <td colSpan={2} style={{ textAlign: 'left' }}>
                Extra Spell Casts
              </td>
            </tr>
            {Array.from(this.ptaConsumers.values()).map((consumer) => (
              <tr key={consumer.spellId}>
                <td>
                  <SpellLink spell={consumer.spellId} />
                </td>
                <td>
                  <ItemDamageDone amount={consumer.totalDamage} />
                </td>
                <td>{consumer.count} Casts</td>
              </tr>
            ))}
          </BreakdownTable>
        }
      >
        <TalentSpellText talent={talents.PRESS_THE_ADVANTAGE_TALENT}>
          <ItemDamageDone amount={this.totalDamage} />
        </TalentSpellText>
      </Statistic>
    );
  }
}
