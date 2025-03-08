import Spell from 'common/SPELLS/Spell';
import talents from 'common/TALENTS/monk';
import { formatDurationMinSec } from 'common/format';
import RESOURCE_TYPES, { getResource } from 'game/RESOURCE_TYPES';
import SPECS from 'game/SPECS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import Statistic from 'parser/ui/Statistic';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { ReactNode } from 'react';

export default class EfficientTraining extends Analyzer.withDependencies({
  spellUsable: SpellUsable,
}) {
  readonly cdrSpell: Spell;
  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(talents.EFFICIENT_TRAINING_TALENT);
    this.cdrSpell =
      this.selectedCombatant.specId === SPECS.BREWMASTER_MONK.id
        ? talents.WEAPONS_OF_ORDER_TALENT
        : talents.STORM_EARTH_AND_FIRE_TALENT;

    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.processEnergySpent);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(this.cdrSpell),
      this.updateCastCount,
    );
  }

  private energyCounter = 0;
  private totalCdr = 0;
  private castCount = 0;

  private updateCastCount() {
    this.castCount += 1;
  }

  private processEnergySpent(event: CastEvent) {
    if (!event.classResources) {
      // no resources -> no energy spent
      return;
    }
    const energyChange = getResource(event.classResources, RESOURCE_TYPES.ENERGY.id);

    if (!energyChange || !energyChange.cost) {
      return;
    }

    this.energyCounter += energyChange.cost;

    if (this.energyCounter >= CDR_THRESHOLD) {
      this.energyCounter -= CDR_THRESHOLD;
      this.totalCdr += this.deps.spellUsable.reduceCooldown(this.cdrSpell.id, CDR_AMOUNT);
    }
  }

  statistic(): ReactNode {
    return (
      <Statistic category={STATISTIC_CATEGORY.HERO_TALENTS} size="flexible">
        <TalentSpellText talent={talents.EFFICIENT_TRAINING_TALENT}>
          {formatDurationMinSec(this.totalCdr / 1000)} CDR{' '}
          <small>
            ({formatDurationMinSec(this.totalCdr / 1000 / Math.max(1, this.castCount))} per cast)
          </small>
        </TalentSpellText>
      </Statistic>
    );
  }
}

const CDR_THRESHOLD = 50;
const CDR_AMOUNT = 1000;
