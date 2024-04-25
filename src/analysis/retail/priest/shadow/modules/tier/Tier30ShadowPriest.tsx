import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/priest';
import { PRIEST_DF4_ID } from 'common/ITEMS/dragonflight';
import { TIERS } from 'game/TIERS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import EventHistory from 'parser/shared/modules/EventHistory';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import BoringItemSetValueText from 'parser/ui/BoringItemSetValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import ItemInsanityGained from 'analysis/retail/priest/shadow/interface/ItemInsanityGained';

const bonusSI = 0.4; // Bonus damage for Shadowy Insight buffed Mind Blast from tier set
const bonusInsanity = 4; //Bonus insanity Shadowy Insight buffed Mind Blast
const bonusSA = 1.0; // Bonus damage for Shadowy Apparitions from tier set
const bonusDP = 0.18; // Bonus damage for Devouring Plague from tier set

class Tier30ShadowPriest extends Analyzer {
  static dependencies = {
    abilities: Abilities,
    eventHistory: EventHistory,
    spellUsable: SpellUsable,
  };
  protected abilities!: Abilities;
  protected eventHistory!: EventHistory;
  protected spellUsable!: SpellUsable;

  has4Piece: boolean = true;
  has2Piece: boolean = true;

  buffSI: boolean = false;
  buffTier: boolean = false;
  damageMB = 0;
  damageSA = 0;
  damageDP = 0;
  insanity = 0;

  constructor(options: Options) {
    super(options);
    this.has2Piece = this.selectedCombatant.has2PieceByTier(TIERS.DF4);
    this.has4Piece = this.selectedCombatant.has4PieceByTier(TIERS.DF4);
    this.active = this.has2Piece;

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.SHADOWY_INSIGHT_BUFF),
      this.onShadowyInsightBuffApplied,
    );

    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.SHADOWY_INSIGHT_BUFF),
      this.onShadowyInsightBuffRemoved,
    );

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.MIND_BLAST),
      this.onMindBlast,
    );

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.SHADOW_PRIEST_TIER_30_4_SET_BUFF),
      this.onTierBuffApplied,
    );

    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.SHADOW_PRIEST_TIER_30_4_SET_BUFF),
      this.onTierBuffRemoved,
    );

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.SHADOWY_APPARITION_DAMAGE),
      this.onShadowyApparitions,
    );

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(TALENTS.DEVOURING_PLAGUE_TALENT),
      this.onDevouringPlague,
    );
  }

  onShadowyInsightBuffApplied() {
    //console.log("SIBuffApplied");
    this.buffSI = true;
  }

  onShadowyInsightBuffRemoved() {
    //console.log("SIBuffRemoved");
    this.buffSI = false;
  }

  onMindBlast(event: DamageEvent) {
    //console.log("MBCast");
    if (this.buffSI) {
      //console.log("MBBuffCast");
      this.damageMB += calculateEffectiveDamage(event, bonusSI);
      this.insanity += bonusInsanity;
    }
  }

  onTierBuffApplied() {
    this.buffTier = true;
  }

  onTierBuffRemoved() {
    this.buffTier = false;
  }

  onShadowyApparitions(event: DamageEvent) {
    if (this.buffTier) {
      this.damageSA += calculateEffectiveDamage(event, bonusSA);
    }
  }

  onDevouringPlague(event: DamageEvent) {
    this.damageDP += calculateEffectiveDamage(event, bonusDP);
  }

  statistic() {
    if (this.has2Piece) {
      return (
        <Statistic
          category={STATISTIC_CATEGORY.ITEMS}
          size="flexible"
          tooltip="This is the extra damage these spells gained from the Tier Set"
        >
          <BoringItemSetValueText setId={PRIEST_DF4_ID} title="Grasp of the Furnace Seraph">
            {' '}
          </BoringItemSetValueText>
          <BoringSpellValueText spell={SPELLS.MIND_BLAST}>
            <ItemDamageDone amount={this.damageMB} />
            <ItemInsanityGained amount={this.insanity} />
          </BoringSpellValueText>
          {this.has4Piece ? (
            <>
              <BoringSpellValueText spell={SPELLS.SHADOWY_APPARITION}>
                <ItemDamageDone amount={this.damageSA} />
              </BoringSpellValueText>
              <BoringSpellValueText spell={TALENTS.DEVOURING_PLAGUE_TALENT}>
                <ItemDamageDone amount={this.damageDP} />
              </BoringSpellValueText>
            </>
          ) : null}
        </Statistic>
      );
    }
  }
}
export default Tier30ShadowPriest;
