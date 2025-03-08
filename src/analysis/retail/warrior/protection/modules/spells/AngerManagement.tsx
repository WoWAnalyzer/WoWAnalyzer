import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { SpellIcon, SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BoringValueText from 'parser/ui/BoringValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TALENTS from 'common/TALENTS/warrior';
import ItemCooldownReduction from 'parser/ui/ItemCooldownReduction';

const RAGE_NEEDED_FOR_A_PROC = 10;
const CDR_PER_PROC = 1000; // ms

class AngerManagement extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;

  hasAvatar = false;
  avatarEffectiveCDR = 0;
  avatarWastedCDR = 0;

  hasShieldWall = false;
  shieldWallEffectiveCDR = 0;
  shieldWallWastedCDR = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.ANGER_MANAGEMENT_TALENT);
    this.hasAvatar = this.selectedCombatant.hasTalent(TALENTS.AVATAR_TALENT);
    this.hasShieldWall = this.selectedCombatant.hasTalent(TALENTS.SHIELD_WALL_TALENT);

    if (!this.active) {
      return;
    }
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onCast);
  }

  onCast(event: CastEvent) {
    const classResources = event.classResources?.find((e) => e.type === RESOURCE_TYPES.RAGE.id);
    if (!classResources || !classResources.cost) {
      return;
    }
    const rageSpend = classResources.cost / RAGE_NEEDED_FOR_A_PROC;
    const reduction = (rageSpend / RAGE_NEEDED_FOR_A_PROC) * CDR_PER_PROC;

    if (this.hasAvatar) {
      if (!this.spellUsable.isOnCooldown(TALENTS.AVATAR_TALENT.id)) {
        this.avatarWastedCDR += reduction;
      } else {
        const effectiveReduction = this.spellUsable.reduceCooldown(
          TALENTS.AVATAR_TALENT.id,
          reduction,
        );
        this.avatarEffectiveCDR += effectiveReduction;
        this.avatarWastedCDR += reduction - effectiveReduction;
      }
    }

    if (this.hasShieldWall) {
      if (!this.spellUsable.isOnCooldown(TALENTS.SHIELD_WALL_TALENT.id)) {
        this.shieldWallWastedCDR += reduction;
      } else {
        const effectiveReduction = this.spellUsable.reduceCooldown(
          TALENTS.SHIELD_WALL_TALENT.id,
          reduction,
        );
        this.shieldWallEffectiveCDR += effectiveReduction;
        this.shieldWallWastedCDR += reduction - effectiveReduction;
      }
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringValueText
          label={
            <>
              <SpellLink spell={TALENTS.ANGER_MANAGEMENT_TALENT} /> Cooldown Reduction
            </>
          }
        >
          <SpellIcon spell={TALENTS.AVATAR_TALENT} />{' '}
          <ItemCooldownReduction effective={this.avatarEffectiveCDR} waste={this.avatarWastedCDR} />
          <br />
          <SpellIcon spell={TALENTS.SHIELD_WALL_TALENT} />{' '}
          <ItemCooldownReduction
            effective={this.shieldWallEffectiveCDR}
            waste={this.shieldWallWastedCDR}
          />
        </BoringValueText>
      </Statistic>
    );
  }
}

export default AngerManagement;
