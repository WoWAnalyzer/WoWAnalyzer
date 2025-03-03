import SPELLS from 'common/SPELLS';
import Spell from 'common/SPELLS/Spell';
import TALENTS from 'common/TALENTS/hunter';
import SPECS from 'game/SPECS';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Abilities from 'parser/core/modules/Abilities';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import ExecuteHelper from 'parser/shared/modules/helpers/ExecuteHelper';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { KILL_SHOT_EXECUTE_RANGE } from '../constants';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import CastEfficiencyPanel from 'interface/guide/components/CastEfficiencyPanel';
import SpellLink from 'interface/SpellLink';
class KillShot extends ExecuteHelper {
  static executeSources = SELECTED_PLAYER;
  static lowerThreshold = KILL_SHOT_EXECUTE_RANGE;
  static singleExecuteEnablers: Spell[] = [TALENTS.HUNTERS_PREY_TALENT, SPELLS.DEATHBLOW_BUFF];
  static modifiesDamage = false;

  static dependencies = {
    ...ExecuteHelper.dependencies,
    abilities: Abilities,
  };

  maxCasts: number = 0;

  activeKillShotSpell =
    this.selectedCombatant.spec === SPECS.SURVIVAL_HUNTER
      ? TALENTS.KILL_SHOT_SURVIVAL_TALENT
      : TALENTS.KILL_SHOT_SHARED_TALENT;
  protected abilities!: Abilities;

  constructor(options: Options) {
    super(options);
    this.active = !this.selectedCombatant.hasTalent(TALENTS.BLACK_ARROW_TALENT);
    this.selectedCombatant.hasTalent(TALENTS.KILL_SHOT_SHARED_TALENT) ||
      this.selectedCombatant.hasTalent(TALENTS.KILL_SHOT_SURVIVAL_TALENT);
    const ctor = this.constructor as typeof ExecuteHelper;
    ctor.executeSpells.push(this.activeKillShotSpell);

    (options.abilities as Abilities).add({
      spell: this.activeKillShotSpell.id,
      category: SPELL_CATEGORY.ROTATIONAL,
      charges: 1,
      cooldown: 10,
      gcd: {
        base: 1500,
      },
      castEfficiency: {
        suggestion: true,
        recommendedEfficiency: 0.85,
        maxCasts: () => this.totalCasts,
      },
    });
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
      >
        <BoringSpellValueText spell={this.activeKillShotSpell}>
          <ItemDamageDone amount={this.damage} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
  get guideSubsectionSV() {
    const explanation = (
      <p>
        <strong>
          <SpellLink spell={TALENTS.KILL_SHOT_SURVIVAL_TALENT} />
        </strong>{' '}
        is an execute ability that can be cast on any target with a{' '}
        <SpellLink spell={TALENTS.DEATHBLOW_TALENT} /> proc. As Pack Leader, aim to use{' '}
        <SpellLink spell={TALENTS.TIP_OF_THE_SPEAR_TALENT} />
        in Single Target, but do not go out of your way to tip it in AoE. Always use it on cooldown
        as Pack Leader and do not cast in AoE as Sentinel. You may spend a{' '}
        <SpellLink spell={TALENTS.TIP_OF_THE_SPEAR_TALENT} /> on a cast as Sentinel but do not delay
        a cast specifically to tip it.
      </p>
    );

    const data = <CastEfficiencyPanel spell={TALENTS.KILL_SHOT_SURVIVAL_TALENT} useThresholds />;

    return explanationAndDataSubsection(explanation, data);
  }
}

export default KillShot;
