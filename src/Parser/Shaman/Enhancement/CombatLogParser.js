import React from 'react';

import ITEMS from 'common/ITEMS';

import Tab from 'Main/Tab';

import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
import DamageDone from 'Parser/Core/Modules/DamageDone';

import Abilities from './Modules/Main/Abilities';
import Maelstrom from './Modules/Main/Maelstrom';

import CooldownThroughputTracker from './Modules/Features/CooldownThroughputTracker';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
// import ShamanStats from './Modules/ShamanCore/ShamanStats';
import AlphaWolf from './Modules/ShamanCore/AlphaWolf';
import Flametongue from './Modules/ShamanCore/Flametongue';
import FlametongueRefresh from './Modules/ShamanCore/FlametongueRefresh';
import Landslide from './Modules/ShamanCore/Landslide';
import Frostbrand from './Modules/ShamanCore/Frostbrand';
import FuryOfAir from './Modules/ShamanCore/FuryOfAir';
import Rockbiter from './Modules/ShamanCore/Rockbiter';
import Tier20_2set from './Modules/Items/Tier20_2set';
import Tier21_2set from './Modules/Items/Tier21_2set';
import Tier21_4set from './Modules/Items/Tier21_4set';


// import SmolderingHeart from './Modules/Legendaries/SmolderingHeart';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // ShamanCore
    damageDone: [DamageDone, { showStatistic: true }],
    // shamanStats: ShamanStats,
    flametongue: Flametongue,
    landslide: Landslide,
    frostbrand: Frostbrand,
    furyOfAir: FuryOfAir,
    rockbiter: Rockbiter,
    flametongueRefresh: FlametongueRefresh,
    alphaWolf: AlphaWolf,
    // Features
    alwaysBeCasting: AlwaysBeCasting,
    abilities: Abilities,
    cooldownThroughputTracker: CooldownThroughputTracker,
    // Legendaries:
    // Tier
    tier20_2set: Tier20_2set,
    tier21_2set: Tier21_2set,
    tier21_4set: Tier21_4set,
  };

  generateResults() {
    const results = super.generateResults();

    // first row of talents
    // const hasWindSong = this.selectedCombatant.hasTalent(SPELLS.WINDSONG_TALENT.id);
    // const hasHotHand = this.selectedCombatant.hasTalent(SPELLS.HOT_HAND_TALENT.id);
    // 4th row of talents
    // 5th row of talents
    // const hasOvercharge = this.selectedCombatant.hasTalent(SPELLS.HAILSTORM_TALENT.id);
    // 6th row of talents
    // const hasCrashingStorm = this.selectedCombatant.hasTalent(SPELLS.CRASHING_STORM_TALENT.id);
    // const hasSundering = this.selectedCombatant.hasTalent(SPELLS.SUNDERING_TALENT.id);
    // last row of talents
    // const hasAscendance = this.selectedCombatant.hasTalent(SPELLS.ASCENDANCE_TALENT_ENHANCEMENT.id);
    // const hasEarthenSpike = this.selectedCombatant.hasTalent(SPELLS.EARTHEN_SPIKE_TALENT.id);
    // const hasBoulderfist = this.selectedCombatant.hasTalent(SPELLS.BOULDERFIST_TALENT.id);

    // const abilityTracker = this.modules.abilityTracker;
    // const getAbility = spellId => abilityTracker.getAbility(spellId);

    // const flametongue = getAbility(SPELLS.FLAMETONGUE.id);
    // const frostbrand = getAbility(SPELLS.FROSTBRAND.id);
    // const stormBringer = getAbility(SPELLS.STORMBRINGER.id);

    // Legendaries
    // const hasUncertainReminder = this.selectedCombatant.hasHead(ITEMS.UNCERTAIN_REMINDER.id);
    // const hasEmalons = this.selectedCombatant.hasChest(ITEMS.EMALONS_CHARGED_CORE.id);
    // const hasAkainus = this.selectedCombatant.hasWrists(ITEMS.AKAINUS_ABSOLUTE_JUSTICE.id);
    // const hasSmolderingHeart = this.selectedCombatant.hasHands(ITEMS.SMOLDERING_HEART.id);
    // const hasStorm = this.selectedCombatant.hasWaist(ITEMS.STORM_TEMPESTS.id);
    // const hasRoots = this.selectedCombatant.hasLegs(ITEMS.ROOTS_OF_SHALADRASSIL.id);
    // const hasSpiritual = this.selectedCombatant.hasFeet(ITEMS.SPIRITUAL_JOURNEY.id);
    // const hasSoul = this.selectedCombatant.hasFinger(ITEMS.SOUL_OF_THE_FARSEER.id);
    // const hasEOTN = this.selectedCombatant.hasFinger(ITEMS.EYE_OF_THE_TWISTING_NETHER.id);
    // const hasSephuz = this.selectedCombatant.hasFinger(ITEMS.SEPHUZS_SECRET.id);

    this.modules.combatants.selected._combatantInfo.gear.forEach((value) => {
      const equippedItem = ITEMS[value.id];

      if (equippedItem !== undefined && equippedItem.quality === 5) {
        results.items.push({
          item: equippedItem,
          result: (
            <dfn data-tip="">
              Equipped Legendary
            </dfn>
          ),
        });
      }
    });

    results.tabs = [
      { // TODO: Move this to an Analyzer module
        title: 'Maelstrom',
        url: 'maelstrom',
        render: () => (
          <Tab title="Maelstrom" style={{ padding: '15px 22px' }}>
            <Maelstrom
              reportCode={this.report.code}
              actorId={this.playerId}
              start={this.fight.start_time}
              end={this.fight.end_time}
            />
          </Tab>
        ),
      },
      ...results.tabs,
    ];

    return results;
  }
}

export default CombatLogParser;
