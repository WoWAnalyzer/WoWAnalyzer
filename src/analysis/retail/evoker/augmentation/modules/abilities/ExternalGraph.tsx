import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TALENTS from 'common/TALENTS/evoker';
import SPELLS from 'common/SPELLS';
import Events, { DamageEvent } from 'parser/core/Events';
import DonutChart from 'parser/ui/DonutChart';
import { formatNumber } from 'common/format';

class ExternalGraph extends Analyzer {
  personalDamage = 0;
  externalDamage = 0;
  fakeExternalDamage = 0;
  petDamage = 0;

  externalSpells = [
    TALENTS.EBON_MIGHT_TALENT,
    SPELLS.PRESCIENCE_BUFF,
    SPELLS.BREATH_OF_EONS_DAMAGE,
    SPELLS.FATE_MIRROR_DAMAGE,
    SPELLS.SHIFTING_SANDS_BUFF,
  ].map((x) => x.id);

  fakeExternalSpells = [
    SPELLS.INFERNOS_BLESSING_DAMAGE,
    SPELLS.BLISTERING_SCALES_DAM,
    SPELLS.BOMBARDMENTS_DAMAGE,
  ].map((x) => x.id);

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER_PET), this.onPetDamage);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onPersonalDamage);
  }

  onPetDamage(event: DamageEvent) {
    this.petDamage += event.amount;
  }

  onPersonalDamage(event: DamageEvent) {
    if (event.supportID === this.selectedCombatant.id) {
      // Either EM/Prescience/Sands on self, which will be included in the original event,
      // or Bombardments, which fires twice, so we ignore the second one.
      return;
    }
    const playerId = event.supportID ? event.supportID : event.sourceID;
    if (playerId === this.selectedCombatant.id) {
      this.personalDamage += event.amount;
    } else if (this.externalSpells.includes(event.ability.guid)) {
      this.externalDamage += event.amount;
    } else if (this.fakeExternalSpells.includes(event.ability.guid)) {
      this.fakeExternalDamage += event.amount;
    } else {
      // Backup, shouldn't actually fire
      this.personalDamage += event.amount;
    }
  }

  statistic() {
    const damageSources = [
      {
        color: 'rgb(255, 255, 0)',
        label: 'External damage',
        spellId: TALENTS.EBON_MIGHT_TALENT.id,
        valueTooltip: formatNumber(this.externalDamage),
        value: this.externalDamage,
      },
      {
        color: 'rgb(254, 59, 59)',
        label: '"Fake external" damage',
        spellId: SPELLS.INFERNOS_BLESSING_BUFF.id,
        valueTooltip: formatNumber(this.fakeExternalDamage),
        value: this.fakeExternalDamage,
      },
      {
        color: 'rgb(129, 52, 5)',
        label: 'Personal damage',
        spellId: TALENTS.ERUPTION_TALENT.id,
        valueTooltip: formatNumber(this.personalDamage),
        value: this.personalDamage,
      },
      {
        color: 'rgb(212, 81, 19)',
        label: 'Pet damage',
        spellId: TALENTS.DUPLICATE_1_AUGMENTATION_TALENT.id,
        valueTooltip: formatNumber(this.petDamage),
        value: this.petDamage,
      },
    ];
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(1)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <div className="pad">
          <label>Damage sources breakdown</label>
          <DonutChart items={damageSources} />
        </div>
      </Statistic>
    );
  }
}

export default ExternalGraph;
