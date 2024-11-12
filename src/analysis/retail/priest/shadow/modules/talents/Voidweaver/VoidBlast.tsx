import SPELLS from 'common/SPELLS';
import Spell from 'common/SPELLS/Spell';
import TALENTS from 'common/TALENTS/priest';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, RemoveBuffEvent, UpdateSpellUsableEvent } from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import ExecuteHelper from 'parser/shared/modules/helpers/ExecuteHelper';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

class VoidBlast extends ExecuteHelper {
  static executeSources = SELECTED_PLAYER;
  static lowerThreshold = -1;
  static executeOutsideRangeEnablers: Spell[] = [
    SPELLS.SHADOW_PRIEST_VOIDWEAVER_ENTROPIC_RIFT_BUFF,
  ];
  static modifiesDamage = false;
  static executeSpells: Spell[] = [SPELLS.SHADOW_PRIEST_VOIDWEAVER_VOID_BLAST];
  static countCooldownAsExecuteTime = true;

  static dependencies = {
    ...ExecuteHelper.dependencies,
    abilities: Abilities,
  };

  maxCasts: number = 0;
  castVB = 0; //casts of Voidblast
  missVB = 0; //missed possible casts of Void Blast
  lostCharges = 0; //previous events charges of Void Blast

  timeWasted = 0; //the time at max charges during this rift.
  riftEndTime = 0; //the timestamp of rift end
  recentMax = 0; //Last time we were at max charges
  atMaxCharges = false; //If we are at max charges of Void Blast

  protected abilities!: Abilities;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.VOID_BLAST_TALENT);

    this.addEventListener(
      Events.UpdateSpellUsable.by(SELECTED_PLAYER).spell(
        SPELLS.SHADOW_PRIEST_VOIDWEAVER_VOID_BLAST,
      ),
      this.onVBUpdate,
    );

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SHADOW_PRIEST_VOIDWEAVER_VOID_BLAST),
      this.onVBCast,
    );

    this.addEventListener(
      Events.applybuff
        .by(SELECTED_PLAYER)
        .spell(SPELLS.SHADOW_PRIEST_VOIDWEAVER_ENTROPIC_RIFT_BUFF),
      this.startRift,
    );

    this.addEventListener(
      Events.removebuff
        .by(SELECTED_PLAYER)
        .spell(SPELLS.SHADOW_PRIEST_VOIDWEAVER_ENTROPIC_RIFT_BUFF),
      this.endRift,
    );

    this.addEventListener(Events.fightend, this.adjustMaxCasts);

    const ctor = this.constructor as typeof ExecuteHelper;
    ctor.executeSpells.push(SPELLS.SHADOW_PRIEST_VOIDWEAVER_VOID_BLAST);

    (options.abilities as Abilities).add({
      spell: SPELLS.SHADOW_PRIEST_VOIDWEAVER_VOID_BLAST.id,
      category: SPELL_CATEGORY.ROTATIONAL,
      cooldown: (haste: number) => 9 / (1 + haste),
      gcd: {
        base: 1500,
      },
      charges: 1 + (this.selectedCombatant.hasTalent(TALENTS.THOUGHT_HARVESTER_TALENT) ? 1 : 0),
      castEfficiency: {
        suggestion: true,
        recommendedEfficiency: 0.95,
        maxCasts: () => this.maxCasts,
      },
    });
  }

  onVBUpdate(event: UpdateSpellUsableEvent) {
    //console.log("VB event", event.chargesAvailable)

    //If we have charges at the end of the rift, then we should have cast them.
    this.lostCharges = event.chargesAvailable;

    //Check if we are at max charges, and if so tell how much time until we are not.
    if (event.isOnCooldown && this.atMaxCharges) {
      //this is the timestamp when we stop being at max charges
      this.atMaxCharges = false;
      this.timeWasted += event.timestamp - this.recentMax;
      //console.log("endmaxcharge", this.owner.formatTimestamp(event.timestamp))
    }

    if (!event.isOnCooldown) {
      //this is the timestamp when we start being at max charges.
      this.atMaxCharges = true;
      this.recentMax = event.timestamp;
      //console.log("start max charge", this.owner.formatTimestamp(event.timestamp))
    }
  }

  onVBCast(event: CastEvent) {
    this.castVB += 1;
  }

  calculateMissedVB() {
    //We should pool in order to have 2 charges of voidBlast when entering the form,
    //Any charges we gain during Rift we should spend.
    //Any time at max charges is potentially an additional charge that we didn't gain.

    //TODO: make sure time channeling Void Torrent is not counted as wasted
    //Since the rift duration is paused during Void Torrent, we don't have to worry about being at max stacks during that channel.
    //Since we should be pooling for 2 charges, this shouldn't be occuring.
    //TODO: If we are not at max charges at the start of the Rift(end of void torrent), add the time until we would regain that charge as wasted time.
    //TODO: Fix edge case where where the rift ends but a cast of VoidBlast still occurs.

    //If we end the Rift at max charges, the time since we hit max charges is added to wasted time.
    if (this.atMaxCharges) {
      this.timeWasted += this.riftEndTime - this.recentMax;
    }
    const cooldown =
      this.abilities.getAbility(SPELLS.SHADOW_PRIEST_VOIDWEAVER_VOID_BLAST.id)!.cooldown * 1000;
    const wastedCD = Math.floor(this.timeWasted / cooldown);

    //missed casts are = charges left at end + time not on cooldown/CD
    const missedCasts = this.lostCharges + wastedCD;

    this.missVB += missedCasts;

    //console.log("TOTAL MISSED DURING THIS RIFT", missedCasts,"=", this.lostCharges,"+", wastedCD)
    //console.log("CASTS TOTAL SO FAR", this.castVB,"/",this.missVB)
  }

  startRift() {
    this.timeWasted = 0; //Reset wasted time for this rift.
    this.lostCharges = 0;
    this.atMaxCharges = false;
  }

  endRift(event: RemoveBuffEvent) {
    this.riftEndTime = event.timestamp;
    //Calculate missed potential casts of Void Blast during this rift.
    this.calculateMissedVB();
  }

  adjustMaxCasts() {
    this.maxCasts = this.castVB + this.missVB;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
      >
        <BoringSpellValueText spell={SPELLS.SHADOW_PRIEST_VOIDWEAVER_VOID_BLAST}>
          <ItemDamageDone amount={this.damage} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default VoidBlast;
