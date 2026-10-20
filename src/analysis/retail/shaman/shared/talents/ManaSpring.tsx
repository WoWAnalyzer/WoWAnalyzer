import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/shaman';
import { formatNumber } from 'common/format';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, ResourceChangeEvent } from 'parser/core/Events';
import ItemManaGained from 'parser/ui/ItemManaGained';
import ManaIcon from 'interface/icons/Mana';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import Statistic from 'parser/ui/Statistic';
import TalentSpellText from 'parser/ui/TalentSpellText';
import Combatants from 'parser/shared/modules/Combatants';
import ROLES from 'game/ROLES';
import SPECS from 'game/SPECS';
import Combatant from 'parser/core/Combatant';
import { SpecIcon } from 'interface';

class ManaSpring extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };
  protected manaTargets: Record<number, number> = [];
  protected totalManaRestored = 0;
  protected wasted = 0;
  protected manaRestoredToSelf = 0;
  protected combatants!: Combatants;
  protected manaBySpell: Record<number, number> = {};
  protected lastTriggerSpellId: number | null = null;
  protected pendingSelfGains: { amount: number; timestamp: number }[] = [];

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.MANA_SPRING_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.resourcechange
        .by(SELECTED_PLAYER)
        .spell([SPELLS.MANA_SPRING_ENHANCEMENT, SPELLS.MANA_SPRING_RESTORATION]),
      this.onManaRestored,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell([TALENTS.RIPTIDE_TALENT, TALENTS.LAVA_BURST_TALENT]),
      this.onTriggerCast,
    );
  }

  onTriggerCast(event: CastEvent) {
    this.lastTriggerSpellId = event.ability.guid;
  }

  onManaRestored(event: ResourceChangeEvent) {
    const target = event.targetID;

    if (target === this.selectedCombatant.id) {
      this.manaRestoredToSelf += event.resourceChange;

      if (this.lastTriggerSpellId !== null) {
        this.attribute(this.lastTriggerSpellId, event.resourceChange);
      }
    }

    const player = this.combatants.players[target];
    if (player?.spec?.role === ROLES.HEALER || player?.spec?.id === SPECS.ARCANE_MAGE.id) {
      this.totalManaRestored += event.resourceChange;
      if (!this.manaTargets[target]) {
        this.manaTargets[target] = 0;
      }
      this.manaTargets[target] += event.resourceChange;
      this.wasted += event.waste;
    }
  }

  private attribute(spellId: number, amount: number) {
    this.manaBySpell[spellId] = (this.manaBySpell[spellId] ?? 0) + amount;
  }

  manaRestoredBy(spellId: number) {
    return this.manaBySpell[spellId] ?? 0;
  }

  get selfManaRestored() {
    return this.manaRestoredToSelf;
  }

  get regenPerTarget(): Record<number, { target: Combatant; amount: number }> {
    return Object.assign(
      {},
      ...Object.values(this.combatants.players)
        .filter((x) => this.manaTargets[x.id])
        .map((player) => ({
          [player.id]: {
            target: player,
            amount: this.manaTargets[player.id],
          },
        })),
    );
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        position={STATISTIC_ORDER.UNIMPORTANT()}
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            <p>
              Mana restored:
              <ul>
                {Object.values(this.regenPerTarget).map((p) => {
                  return (
                    <li key={p.target.player.id}>
                      <SpecIcon icon={p.target.player.icon} /> {p.target.name}:{' '}
                      {formatNumber(p.amount)}
                    </li>
                  );
                })}
              </ul>
              Mana Wasted: <ManaIcon /> {formatNumber(this.wasted)} wasted
            </p>
            <small>Only mana restored to healers and arcane mages is included.</small>
          </>
        }
      >
        <TalentSpellText talent={TALENTS.MANA_SPRING_TALENT}>
          <ItemManaGained amount={this.totalManaRestored} useAbbrev />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default ManaSpring;
