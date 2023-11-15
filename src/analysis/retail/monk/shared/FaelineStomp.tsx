import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import SPECS from 'game/SPECS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { HealEvent } from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { isFromEssenceFont } from '../mistweaver/normalizers/CastLinkNormalizer';
import Combatants from 'parser/shared/modules/Combatants';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import { SpellLink, TooltipElement } from 'interface';
import { formatNumber, formatPercentage } from 'common/format';
import StatisticListBoxItem from 'parser/ui/StatisticListBoxItem';

class FaelineStomp extends Analyzer {
  static dependencies = {
    abilities: Abilities,
    spellUsable: SpellUsable,
    combatants: Combatants,
  };

  protected abilities!: Abilities;
  protected spellUsable!: SpellUsable;
  protected combatants!: Combatants;

  resets: number = 0;
  flsCasts: number = 0;
  targetsDamaged: number = 0;
  targetsHealed: number = 0;

  ///mistweaver specific params
  specIsMW: boolean = false;
  healing: number = 0;
  overhealing: number = 0;
  essenceFontHealing: number = 0;
  essenceFontOverhealing: number = 0;
  gomHealing: number = 0;
  gomOverhealing: number = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.FAELINE_STOMP_TALENT);
    this.specIsMW = this.selectedCombatant.specId === SPECS.MISTWEAVER_MONK.id;
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_MONK.FAELINE_STOMP_TALENT),
      this.casts,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.FAELINE_STOMP_RESET),
      this.reset,
    );
    this.addEventListener(
      Events.damage
        .by(SELECTED_PLAYER)
        .spell([SPELLS.FAELINE_STOMP_HEAL, TALENTS_MONK.FAELINE_STOMP_TALENT]),
      this.damage,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.FAELINE_STOMP_HEAL),
      this.heal,
    );

    if (this.specIsMW) {
      this.addEventListener(
        Events.heal.by(SELECTED_PLAYER).spell(SPELLS.FAELINE_STOMP_ESSENCE_FONT),
        this.onFaelineStompEssenceFontHeal,
      );
      this.addEventListener(
        Events.heal.by(SELECTED_PLAYER).spell([SPELLS.GUSTS_OF_MISTS, SPELLS.GUST_OF_MISTS_CHIJI]),
        this.onGustOfMistHeal,
      );
    }
  }

  get totalHealing() {
    return this.healing + this.essenceFontHealing + this.gomHealing;
  }

  get rawHealing() {
    return this.overhealing + this.gomOverhealing + this.essenceFontOverhealing;
  }
  get averageHealingPerCast() {
    return this.totalHealing / this.flsCasts;
  }

  get rawHealingPerCast() {
    return (this.totalHealing + this.rawHealing) / this.flsCasts;
  }

  casts() {
    this.flsCasts += 1;
  }

  reset() {
    if (this.spellUsable.isOnCooldown(TALENTS_MONK.FAELINE_STOMP_TALENT.id)) {
      this.spellUsable.endCooldown(TALENTS_MONK.FAELINE_STOMP_TALENT.id);
      this.resets += 1;
    }
  }

  damage() {
    this.targetsDamaged += 1;
  }

  heal(event: HealEvent) {
    this.targetsHealed += 1;
    this.healing += event.amount + (event.absorbed || 0);
    this.overhealing += event.overheal || 0;
  }

  ///Mistweaver specific functions
  onFaelineStompEssenceFontHeal(event: HealEvent) {
    this.essenceFontHealing += event.amount + (event.absorbed || 0);
    this.essenceFontOverhealing += event.overheal || 0;
  }

  onGustOfMistHeal(event: HealEvent) {
    const combatant = this.combatants.getEntity(event);
    if (
      isFromEssenceFont(event) &&
      combatant &&
      combatant.hasBuff(SPELLS.FAELINE_STOMP_ESSENCE_FONT.id) &&
      !combatant.hasBuff(SPELLS.ESSENCE_FONT_BUFF.id)
    ) {
      this.gomHealing += event.amount + (event.absorbed || 0);
      this.gomOverhealing += event.overheal || 0;
    }
  }

  talentHealingStatistic() {
    return (
      <StatisticListBoxItem
        title={<SpellLink spell={TALENTS_MONK.FAELINE_STOMP_TALENT} />}
        value={`${formatPercentage(
          this.owner.getPercentageOfTotalHealingDone(this.totalHealing),
        )} %`}
      />
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(99)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            {this.specIsMW && (
              <>
                {formatNumber(this.healing)} <SpellLink spell={TALENTS_MONK.FAELINE_STOMP_TALENT} />{' '}
                healing ({formatNumber(this.overhealing)} overheal) <br />
                {formatNumber(this.essenceFontHealing)}{' '}
                <SpellLink spell={TALENTS_MONK.ESSENCE_FONT_TALENT} /> healing (
                {formatNumber(this.essenceFontOverhealing)} overheal) <br />
                {formatNumber(this.gomHealing)} additional{' '}
                <SpellLink spell={SPELLS.GUSTS_OF_MISTS} /> healing (
                {formatNumber(this.gomOverhealing)} overheal)
                <br />
                {this.resets} <small>resets</small> <br />
                {(this.targetsDamaged / this.flsCasts).toFixed(2)} <small>Foes Hit per cast</small>{' '}
                <br />
                {(this.targetsHealed / this.flsCasts).toFixed(2)} <small>Allies Hit per cast</small>
              </>
            )}
          </>
        }
      >
        <TalentSpellText talent={TALENTS_MONK.FAELINE_STOMP_TALENT}>
          {this.specIsMW ? (
            <>
              <ItemHealingDone amount={this.totalHealing} />
              <br />
              <TooltipElement
                content={
                  <>
                    {formatNumber(this.rawHealingPerCast)} <small>raw healing per cast</small>
                  </>
                }
              >
                {formatNumber(this.averageHealingPerCast)} <small>healing per cast</small>
              </TooltipElement>
            </>
          ) : (
            <>
              {this.resets} <small>resets</small> <br />
              {(this.targetsDamaged / this.flsCasts).toFixed(2)} <small>Foes Hit per cast</small>{' '}
              <br />
              {(this.targetsHealed / this.flsCasts).toFixed(2)} <small>Allies Hit per cast</small>
            </>
          )}
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default FaelineStomp;
