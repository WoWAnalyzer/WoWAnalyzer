import { Trans } from '@lingui/macro';
import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events, {
  CastEvent,
  DamageEvent,
  DeathEvent,
  EndChannelEvent,
  GlobalCooldownEvent,
  HealEvent,
} from 'parser/core/Events';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';

/**
 * Blackout Kick, Totm BoKs, Rising Sun Kick and Spinning Crane Kick generate stacks of Invoke Chi-Ji, the Red Crane, which reduce the cast time and mana
 * cost of Enveloping Mist by 33% per stack, up to 3 stacks.
 * These abilities also heal 2 nearby allies for a Gust of Mist heal.
 * Casting Enveloping Mist while Chiji is active applies Enveloping Breath on up to 6 nearby allies within 10 yards.
 */
const MAX_STACKS = 3;

class InvokeChiJi extends Analyzer {
  chijiActive: boolean = false;
  //healing breakdown vars
  gustHealing: number = 0;
  envelopHealing: number = 0;
  //stack breakdown vars
  chijiStackCount: number = 0;
  castsBelowMaxStacks: number = 0;
  wastedStacks: number = 0;
  freeCasts: number = 0;
  //missed GCDs vars
  missedGlobals: number = 0;
  chijiStart: number = 0;
  chijiGlobals: number = 0;
  chijiUses: number = 0;
  lastGlobal: number = 0;
  efGcd: number = 0;
  checkForSckDamage: number = -1;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(
      TALENTS_MONK.INVOKE_CHI_JI_THE_RED_CRANE_TALENT.id,
    );
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.GUST_OF_MISTS_CHIJI),
      this.handleGust,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.ENVELOPING_BREATH_HEAL),
      this.handleEnvelopingBreath,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_MONK.ENVELOPING_MIST_TALENT),
      this.handleEnvelopCast,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_MONK.INVOKE_CHI_JI_THE_RED_CRANE_TALENT),
      this.handleChijiStart,
    );
    this.addEventListener(Events.death.to(SELECTED_PLAYER), this.handleChijiDeath);
    this.addEventListener(Events.death.to(SELECTED_PLAYER_PET), this.handleChijiDeath);
    this.addEventListener(
      Events.damage
        .by(SELECTED_PLAYER)
        .spell([
          SPELLS.BLACKOUT_KICK,
          SPELLS.RISING_SUN_KICK_DAMAGE,
          SPELLS.BLACKOUT_KICK_TOTM,
          SPELLS.SPINNING_CRANE_KICK_DAMAGE,
        ]),
      this.handleStackGenerator,
    );
    //need a different eventlistener beacause chiji currently only applies 1 stack per cast of sck, not on each dmg event
    this.addEventListener(
      Events.GlobalCooldown.by(SELECTED_PLAYER).spell(SPELLS.SPINNING_CRANE_KICK),
      this.handleSpinningCraneKick,
    );
    this.addEventListener(Events.GlobalCooldown.by(SELECTED_PLAYER), this.handleGlobal);
    this.addEventListener(
      Events.EndChannel.by(SELECTED_PLAYER).spell(TALENTS_MONK.ESSENCE_FONT_TALENT),
      this.handleEssenceFontEnd,
    );
  }

  //missed gcd mangement
  handleChijiStart(event: CastEvent) {
    this.chijiActive = true;
    this.chijiStart = this.lastGlobal = event.timestamp;
    this.chijiGlobals += 1;
    this.chijiUses += 1;
  }

  handleChijiDeath(event: DeathEvent) {
    this.chijiActive = false;
  }

  handleGlobal(event: GlobalCooldownEvent) {
    if (this.chijiActive) {
      this.chijiGlobals += 1;
      //if timebetween globals is longer than the gcd add the difference to the missed gcd tally
      //we only care about accounting for channels of essence font during WoO, other than that it should be the gcd during chiji
      if (
        event.ability.guid === TALENTS_MONK.ESSENCE_FONT_TALENT.id &&
        this.selectedCombatant.hasBuff(SPELLS.WEAPONS_OF_ORDER_BUFF_AND_HEAL.id)
      ) {
        this.efGcd = event.duration;
      } else if (event.timestamp - this.lastGlobal > event.duration) {
        this.missedGlobals += (event.timestamp - this.lastGlobal - event.duration) / event.duration;
      }
      this.lastGlobal = event.timestamp;
    }
  }

  handleEssenceFontEnd(event: EndChannelEvent) {
    if (
      this.chijiActive &&
      this.selectedCombatant.hasBuff(SPELLS.WEAPONS_OF_ORDER_BUFF_AND_HEAL.id)
    ) {
      if (event.duration > this.efGcd) {
        this.lastGlobal = event.timestamp - this.efGcd;
      } else {
        this.lastGlobal = event.start + this.efGcd;
      }
    }
  }

  //healing management
  handleGust(event: HealEvent) {
    this.gustHealing += (event.amount || 0) + (event.absorbed || 0);
  }

  handleEnvelopingBreath(event: HealEvent) {
    this.envelopHealing += (event.amount || 0) + (event.absorbed || 0);
  }

  //stackbreakown management
  handleStackGenerator(event: DamageEvent) {
    if (this.chijiActive) {
      if (event.ability.guid === SPELLS.SPINNING_CRANE_KICK_DAMAGE.id) {
        if (this.checkForSckDamage > event.timestamp) {
          this.stackCount();
          this.checkForSckDamage = -1;
        }
      } else {
        this.stackCount();
      }
    }
  }

  handleSpinningCraneKick(event: GlobalCooldownEvent) {
    if (this.chijiActive) {
      this.checkForSckDamage = event.duration + this.lastGlobal;
    }
  }

  handleEnvelopCast(event: CastEvent) {
    //in some cases the last envelop is cast after chiji has expired but the buff can still be consumed
    if (
      this.chijiActive ||
      this.selectedCombatant.hasBuff(SPELLS.INVOKE_CHIJI_THE_RED_CRANE_BUFF.id)
    ) {
      if (this.chijiStackCount === MAX_STACKS) {
        this.freeCasts += 1;
      } else if (this.chijiStackCount < MAX_STACKS) {
        this.castsBelowMaxStacks += 1;
      }
      this.chijiStackCount = 0;
    }
  }

  stackCount() {
    if (this.chijiStackCount === MAX_STACKS) {
      this.wastedStacks += 1;
    } else {
      this.chijiStackCount += 1;
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(50)}
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <Trans id="monk.mistweaver.modules.talents.invokeChiJi.breakdown">
            Healing Breakdown:
            <ul>
              <li>{formatNumber(this.gustHealing)} healing from Chi-Ji Gust of Mist.</li>
              <li>{formatNumber(this.envelopHealing)} healing from Enveloping Breath.</li>
            </ul>
            Stack Breakdown:
            <ul>
              <li>{formatNumber(this.freeCasts)} free Enveloping Mist cast(s).</li>
              <li>
                {formatNumber(this.castsBelowMaxStacks)} Enveloping Mist cast(s) below max (
                {MAX_STACKS}) Chi-Ji stacks.
              </li>
              <li>
                {formatNumber(this.wastedStacks)} stack(s) wasted from overcapping Chi-Ji stacks.
              </li>
            </ul>
            Activity:
            <ul>
              <li>
                {(this.chijiGlobals / this.chijiUses).toFixed(2)} average gcds inside Chi-Ji window
              </li>
            </ul>
          </Trans>
        }
      >
        <TalentSpellText talent={TALENTS_MONK.INVOKE_CHI_JI_THE_RED_CRANE_TALENT}>
          <>
            <ItemHealingDone amount={this.gustHealing + this.envelopHealing} />
            <br />
            <Trans id="monk.mistweaver.modules.talents.invokeChiJi.missedGCDs">
              {formatNumber(this.missedGlobals)} missed GCDs
            </Trans>
          </>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default InvokeChiJi;
