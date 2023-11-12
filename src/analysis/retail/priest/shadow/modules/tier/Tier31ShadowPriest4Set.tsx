import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/priest';
import { TIERS } from 'game/TIERS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffStackEvent, CastEvent } from 'parser/core/Events';
import { consumedT31Buff, getHits } from './Tier31ShadowPriest4SetNormalizer';
import Abilities from 'parser/core/modules/Abilities';
import EventHistory from 'parser/shared/modules/EventHistory';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import ItemDamageDone from 'parser/ui/ItemDamageDone';

const bonusSWP = 2.25; // multiplier per stack for Shadow Word Pain
const bonusSC = 0.5; // multiplier per stack for Shadow Crash

class Tier31ShadowPriest4Set extends Analyzer {
  static dependencies = {
    abilities: Abilities,
    eventHistory: EventHistory,
    spellUsable: SpellUsable,
  };
  protected abilities!: Abilities;
  protected eventHistory!: EventHistory;
  protected spellUsable!: SpellUsable;
  has4Piece: boolean = true;

  stacks = 0; //current stacks of buff
  totalStacks = 0; //total Possible Stacks

  damageSC = 0; //damage to Shadow Crash
  stacksSC = 0; //Stacks spent on Shadow Crash

  stacksSWP = 0; //Stacks spent on Shadow Word Pain
  damageSWP = 0; //damage to Shadow Word Pain

  constructor(options: Options) {
    super(options);
    this.has4Piece = this.selectedCombatant.has4PieceByTier(TIERS.T31);
    this.active = this.has4Piece;

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.SHADOW_PRIEST_TIER_31_4_SET_BUFF),
      this.onBuffApplied,
    );

    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.SHADOW_PRIEST_TIER_31_4_SET_BUFF),
      this.onBuffStack,
    );

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.SHADOW_CRASH_TALENT),
      this.onShadowCrash,
    );

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SHADOW_WORD_PAIN),
      this.onShadowWordPain,
    );

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(TALENTS.SHADOW_WORD_DEATH_TALENT),
      this.onShadowWordDeath,
    );
  }

  onBuffApplied() {
    this.stacks = 1;
  }

  onBuffStack(Event: ApplyBuffStackEvent) {
    this.stacks = Event.stack;
  }

  onShadowCrash(Event: CastEvent) {
    //SC cast occurs after stacks are removed
    if (consumedT31Buff(Event)) {
      this.stacksSC += this.stacks;
      getHits(Event).forEach((e) => {
        this.damageSC += calculateEffectiveDamage(e, this.stacks * bonusSC);
      });
    }
  }

  onShadowWordPain(Event: CastEvent) {
    //shadow word pain cast occurs before stacks are removed
    if (consumedT31Buff(Event)) {
      this.stacksSWP += this.stacks;
      getHits(Event).forEach((e) => {
        this.damageSWP += calculateEffectiveDamage(e, this.stacks * bonusSWP);
      });
    }
  }

  onShadowWordDeath() {
    this.totalStacks += 1;
  }

  statistic() {
    const damageTotal = this.damageSC + this.damageSWP;
    const sumStacks = this.stacksSC + this.stacksSWP;
    if (this.has4Piece) {
      return (
        <Statistic category={STATISTIC_CATEGORY.ITEMS} size="flexible">
          <BoringSpellValueText spell={SPELLS.SHADOW_PRIEST_TIER_31_4_SET_BUFF}>
            <ItemDamageDone amount={damageTotal} />
            <div>
              {sumStacks}/{this.totalStacks} <small>Used/Total Stacks</small>
            </div>
          </BoringSpellValueText>
          <BoringSpellValueText spell={TALENTS.SHADOW_CRASH_TALENT}>
            <div>{this.stacksSC} stacks used</div>
            <ItemDamageDone amount={this.damageSC} />{' '}
          </BoringSpellValueText>
          <BoringSpellValueText spell={SPELLS.SHADOW_WORD_PAIN}>
            <div>{this.stacksSWP} stacks used</div>
            <ItemDamageDone amount={this.damageSWP} />
          </BoringSpellValueText>
        </Statistic>
      );
    }
  }
}
export default Tier31ShadowPriest4Set;
