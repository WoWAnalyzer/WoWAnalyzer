import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, { CastEvent, GetRelatedEvents } from 'parser/core/Events';
import Enemies from 'parser/shared/modules/Enemies';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import { TOUCH_OF_MAGI_DURATION } from './constants';

export default class Supernova extends Analyzer {
  static dependencies = {
    enemies: Enemies,
    abilityTracker: AbilityTracker,
  };
  protected enemies!: Enemies;
  protected abilityTracker!: AbilityTracker;

  hasUnerringProficiency: boolean = this.selectedCombatant.hasTalent(
    TALENTS.UNERRING_PROFICIENCY_TALENT,
  );
  casts: SupernovaCast[] = [];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.SUPERNOVA_TALENT);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.NETHER_PRECISION_BUFF),
      this.onSupernova,
    );
  }

  onSupernova(event: CastEvent) {
    const targetsHit = GetRelatedEvents(event, 'SpellDamage');
    const unerringBuff = this.selectedCombatant.getBuff(
      TALENTS.UNERRING_PROFICIENCY_TALENT.id,
      event.timestamp - 10,
    );
    const unerringStacks = unerringBuff ? unerringBuff.stacks : 0;
    const touchedEnemy = targetsHit.find((e) => {
      const enemy = this.enemies.getEntity(e);
      return enemy?.hasBuff(SPELLS.TOUCH_OF_THE_MAGI_DEBUFF.id);
    });
    const touchDebuff =
      touchedEnemy &&
      this.enemies.getEntity(touchedEnemy)?.getBuff(SPELLS.TOUCH_OF_THE_MAGI_DEBUFF.id);
    const touchRemaining =
      touchDebuff && TOUCH_OF_MAGI_DURATION - (event.timestamp - touchDebuff.start);

    this.casts.push({
      ordinal: this.casts.length + 1,
      timestamp: event.timestamp,
      targetsHit: targetsHit.length || 0,
      unerringStacks: this.hasUnerringProficiency ? unerringStacks : undefined,
      touchRemaining,
    });
  }

  get averageTargetsHit() {
    let totalHits = 0;
    this.casts.forEach((s) => (totalHits += s.targetsHit));
    return totalHits / this.abilityTracker.getAbility(TALENTS.SUPERNOVA_TALENT.id).casts;
  }
}

export interface SupernovaCast {
  ordinal: number;
  timestamp: number;
  targetsHit: number;
  unerringStacks?: number;
  touchRemaining?: number;
}
