import TALENTS from 'common/TALENTS/warlock';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyDebuffEvent,
  RefreshDebuffEvent,
  RemoveDebuffEvent,
  SpendResourceEvent,
} from 'parser/core/Events';
import { encodeTargetString } from 'parser/shared/modules/Enemies';
import CoreSpellUsable from 'parser/shared/modules/SpellUsable';

/*
  Soul Fire (Tier 15 Destruction talent):
    Burns the enemy's soul, dealing X Fire damage. Cooldown is reduced by 2 sec for every Soul Shard you spend.
 */

const SHADOWBURN_DEBUFF_DURATION = 5000;
const BUFFER = 50;
const debug = false;
const REDUCTION_MS_PER_SHARD = 2000;

type ShadowburnedEnemies = {
  [target: string]: {
    start: number;
    expectedEnd: number;
  };
};

class SpellUsable extends CoreSpellUsable {
  hasSB = false;
  hasSF = false;

  shadowburnedEnemies: ShadowburnedEnemies = {};

  constructor(options: Options) {
    super(options);
    this.hasSB = this.selectedCombatant.hasTalent(TALENTS.SHADOWBURN_TALENT);
    this.hasSF = this.selectedCombatant.hasTalent(TALENTS.SOUL_FIRE_TALENT);
    this.addEventListener(Events.SpendResource.by(SELECTED_PLAYER), this.onSpendResource);
    this.addEventListener(
      Events.applydebuff.by(SELECTED_PLAYER).spell(TALENTS.SHADOWBURN_TALENT),
      this._handleShadowburn,
    );
    this.addEventListener(
      Events.refreshdebuff.by(SELECTED_PLAYER).spell(TALENTS.SHADOWBURN_TALENT),
      this._handleShadowburn,
    );
    this.addEventListener(Events.removedebuff.by(SELECTED_PLAYER), this.onRemoveDebuff);
  }

  onSpendResource(event: SpendResourceEvent) {
    if (!this.hasSF) {
      return;
    }
    if (this.isOnCooldown(TALENTS.SOUL_FIRE_TALENT.id)) {
      // event.resourceChange is in multiples of 10 (2 shards = 20)
      const shardsSpent = event.resourceChange / 10;
      this.reduceCooldown(TALENTS.SOUL_FIRE_TALENT.id, shardsSpent * REDUCTION_MS_PER_SHARD);
    }
  }

  _handleShadowburn(event: ApplyDebuffEvent | RefreshDebuffEvent) {
    if (!this.hasSB) {
      return;
    }
    const target = encodeTargetString(event.targetID, event.targetInstance);
    this.shadowburnedEnemies[target] = {
      start: event.timestamp,
      expectedEnd: event.timestamp + SHADOWBURN_DEBUFF_DURATION,
    };
  }

  onRemoveDebuff(event: RemoveDebuffEvent) {
    if (!this.hasSB) {
      return;
    }
    if (event.ability.guid !== TALENTS.SHADOWBURN_TALENT.id) {
      return;
    }
    const target = encodeTargetString(event.targetID, event.targetInstance);
    if (!this.shadowburnedEnemies[target]) {
      debug && this.log(`Shadowburn debuff remove on untracked enemy: ${target}`);
      return;
    }
    // the Shadowburn debuff sometimes expires earlier than in full 5 seconds (e.g. on bosses), so we're checking for even earlier expiration
    const diedEarlier =
      this.shadowburnedEnemies[target].start <= event.timestamp &&
      event.timestamp <= this.shadowburnedEnemies[target].expectedEnd - BUFFER;
    if (diedEarlier && this.isOnCooldown(TALENTS.SHADOWBURN_TALENT.id)) {
      debug && this.log(`Shadowburned enemy died (${target}), cooldown reset.`);
      this.endCooldown(TALENTS.SHADOWBURN_TALENT.id);
    }
  }
}

export default SpellUsable;
