import React from 'react';

//Core
import CoreChecklist, { Rule, Requirement } from 'parser/shared/modules/features/Checklist';
import Abilities from 'parser/core/modules/Abilities';
import { GenericCastEfficiencyRequirement } from 'parser/shared/modules/features/Checklist/Requirements';
import { PreparationRule } from 'parser/shared/modules/features/Checklist/Rules';
import PrePotion from 'parser/shared/modules/items/PrePotion';
import SPELLS from 'common/SPELLS';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import SpellLink from 'common/SpellLink';
import Icon from "common/Icon";
import EnchantChecker from 'parser/shared/modules/items/EnchantChecker';
import ITEMS from 'common/ITEMS/hunter';
import ItemLink from 'common/ItemLink';
import ResourceIcon from 'common/ResourceIcon';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';

//Features
import AlwaysBeCasting from 'parser/hunter/beastmastery/modules/features/AlwaysBeCasting';
import TimeFocusCapped from 'parser/hunter/shared/modules/features/TimeFocusCapped';

//Talents
import KillerCobra from 'parser/hunter/beastmastery/modules/talents/KillerCobra';
import BarbedShot from 'parser/hunter/beastmastery/modules/spells/BarbedShot';
import AspectOfTheBeast from 'parser/hunter/beastmastery/modules/talents/AspectOfTheBeast';

//Spells
import BestialWrathAverageFocus from 'parser/hunter/beastmastery/modules/spells/bestialwrath/BestialWrathAverageFocus';

class Checklist extends CoreChecklist {
  static dependencies = {
    abilities: Abilities,

    //preparation rules
    prePotion: PrePotion,
    enchantChecker: EnchantChecker,

    //features:
    castEfficiency: CastEfficiency,
    alwaysBeCasting: AlwaysBeCasting,
    timeFocusCapped: TimeFocusCapped,

    //talents
    killerCobra: KillerCobra,
    aspectOfTheBeast: AspectOfTheBeast,

    //Spells
    direFrenzy: BarbedShot,
    bestialWrathAverageFocus: BestialWrathAverageFocus,
  };

  rules = [
    new Rule({
      name: 'Use core spells as often as possible',
      description: <>Spells such as <SpellLink id={SPELLS.KILL_COMMAND_CAST_BM.id} /> and <SpellLink id={SPELLS.DIRE_BEAST.id} /> should be used on cooldown. <SpellLink id={SPELLS.DIRE_FRENZY_TALENT.id} /> should never be capping stacks, but you also want to maximize buff uptime by spreading out the casts as much as possible. You'll want as many good casts of <SpellLink id={SPELLS.A_MURDER_OF_CROWS_TALENT_SHARED.id} />, <SpellLink id={SPELLS.TITANS_THUNDER.id} /> and <SpellLink id={SPELLS.ASPECT_OF_THE_WILD.id} /> as possible - this is achieved by lining them up with <SpellLink id={SPELLS.BESTIAL_WRATH.id} /> for each cast, and in preparation for each <SpellLink id={SPELLS.BESTIAL_WRATH.id} /> you want to have saved up some focus. <a href="https://www.icy-veins.com/wow/beast-mastery-hunter-pve-dps-rotation-cooldowns-abilities" target="_blank" rel="noopener noreferrer">More info.</a></>,
      requirements: () => {
        const combatant = this.selectedCombatant;
        return [
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.KILL_COMMAND_CAST_BM,
            onlyWithSuggestion: false,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.BESTIAL_WRATH,
            onlyWithSuggestion: false,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.A_MURDER_OF_CROWS_TALENT,
            when: combatant.hasTalent(SPELLS.A_MURDER_OF_CROWS_TALENT.id),
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.TITANS_THUNDER,
            onlyWithSuggestion: false,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.ASPECT_OF_THE_WILD,
            onlyWithSuggestion: false,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.BARRAGE_TALENT,
            when: combatant.hasTalent(SPELLS.BARRAGE_TALENT.id),
          }),
        ];
      },
    }),
    new Rule({
      name: <>Use your Dire ability properly</>,
      description: <>Using <SpellLink id={SPELLS.BARBED_SHOT.id} /> properly is a key to achieving high dps. This means maintaining the buff from <SpellLink id={SPELLS.BARBED_SHOT.id} /> as long as possible, and utilising the cooldown reduction from <SpellLink id={SPELLS.BARBED_SHOT.id} /> as much as possible, to ensure high uptime on <SpellLink id={SPELLS.BESTIAL_WRATH.id} /></>,
      requirements: () => {
        return [
          new Requirement({
            name: <>Uptime of <SpellLink id={SPELLS.BARBED_SHOT.id} /> </>,
            check: () => this.barbedShot.frenzyUptimeThreshold,
          }),
          new Requirement({
            name: <>3 Stacks Uptime of <SpellLink id={SPELLS.BARBED_SHOT.id} /> </>,
            check: () => this.barbedShot.frenzy3StackThreshold,
          }),
        ];
      },
    }),
    new Rule({
      name: <>Cooldown efficiency</>,
      description: <> Use <SpellLink id={SPELLS.BESTIAL_WRATH.id} /> & <SpellLink id={SPELLS.ASPECT_OF_THE_WILD.id} /> properly. This means having a high amount of focus going into <SpellLink id={SPELLS.BESTIAL_WRATH.id} /> windows, and by using your <SpellLink id={SPELLS.ASPECT_OF_THE_WILD.id} /> when <SpellLink id={SPELLS.BESTIAL_WRATH.id} /> is up.</>,
      requirements: () => {
        return [
          new Requirement({
            name: <>Average focus on <SpellLink id={SPELLS.BESTIAL_WRATH.id} /> cast</>,
            check: () => this.bestialWrathAverageFocus.focusOnBestialWrathCastThreshold,
          }),
          new Requirement({
            name: <><SpellLink id={SPELLS.ASPECT_OF_THE_WILD.id} /> casts w/o <SpellLink id={SPELLS.BESTIAL_WRATH.id} /> up</>,
            check: () => this.aspectOfTheWild.badCastThreshold,
          }),
        ];
      },
    }),
    new Rule({
      name: 'Pick the right tools for the fight',
      description: 'The throughput gain of some talents or legendaries might vary greatly. Consider switching to a more reliable alternative if something is underperforming regularly, even after trying to improve your usage of said talent or legendary.',
      requirements: () => {
        const combatant = this.selectedCombatant;
        return [
          new Requirement({
            name: <><SpellLink id={SPELLS.ASPECT_OF_THE_BEAST_TALENT.id} /> damage</>,
            when: combatant.hasTalent(SPELLS.ASPECT_OF_THE_BEAST_TALENT.id),
            check: () => this.aspectOfTheBeast.aspectOfTheBeastDamageThreshold,
          }),
          new Requirement({
            name: <>Wasted <SpellLink id={SPELLS.KILLER_COBRA_TALENT.id} /> resets</>,
            when: combatant.hasTalent(SPELLS.KILLER_COBRA_TALENT.id),
            check: () => this.killerCobra.wastedKillerCobraThreshold,
          }),
          new Requirement({
            name: <><SpellLink id={SPELLS.A_MURDER_OF_CROWS_TALENT_SHARED.id} /> casts with less than 7s remaining of <SpellLink id={SPELLS.BESTIAL_WRATH.id} /> duration</>,
            when: combatant.hasTalent(SPELLS.A_MURDER_OF_CROWS_TALENT_SHARED.id),
            check: () => this.aMurderOfCrows.shouldHaveSavedThreshold,
          }),
          new Requirement({
            name: <><SpellLink id={SPELLS.A_MURDER_OF_CROWS_TALENT_SHARED.id} /> casts without <SpellLink id={SPELLS.BESTIAL_WRATH.id} /> ready to cast after</>,
            when: combatant.hasTalent(SPELLS.A_MURDER_OF_CROWS_TALENT_SHARED.id),
            check: () => this.aMurderOfCrows.badCastThreshold,
          }),
          new Requirement({
            name: <><SpellLink id={SPELLS.KILLER_COBRA_TALENT.id} /> and <ItemLink id={ITEMS.QAPLA_EREDUN_WAR_ORDER.id} /></>,
            when: combatant.hasTalent(SPELLS.KILLER_COBRA_TALENT.id) && combatant.hasFeet(ITEMS.QAPLA_EREDUN_WAR_ORDER.id),
            check: () => this.qaplaEredunWarOrder.killerCobraThreshold,
          }),
          new Requirement({
            name: <><ItemLink id={ITEMS.QAPLA_EREDUN_WAR_ORDER.id} /> average reduction</>,
            when: combatant.hasFeet(ITEMS.QAPLA_EREDUN_WAR_ORDER.id),
            check: () => this.qaplaEredunWarOrder.wastedSuggestionThreshold,
          }),
          new Requirement({
            name: <><ItemLink id={ITEMS.PARSELS_TONGUE.id} /> buffs dropped</>,
            when: combatant.hasChest(ITEMS.PARSELS_TONGUE.id),
            check: () => this.parselsTongue.timesDroppedThreshold,
          }),
          new Requirement({
            name: <><ItemLink id={ITEMS.PARSELS_TONGUE.id} /> uptime</>,
            when: combatant.hasChest(ITEMS.PARSELS_TONGUE.id),
            check: () => this.parselsTongue.buffUptimeThreshold,
          }),
          new Requirement({
            name: <><ItemLink id={ITEMS.THE_MANTLE_OF_COMMAND.id} /> uptime</>,
            when: combatant.hasShoulder(ITEMS.THE_MANTLE_OF_COMMAND.id),
            check: () => this.theMantleOfCommand.buffUptimeThreshold,
          }),
          new Requirement({
            name: <>Other talent active with <ItemLink id={ITEMS.SOUL_OF_THE_HUNTMASTER.id} /></>,
            when: combatant.hasFinger(ITEMS.SOUL_OF_THE_HUNTMASTER.id),
            check: () => this.soulOfTheHuntmaster.suggestionThreshold,
          }),
          new Requirement({
            name: <><SpellLink id={SPELLS.ASPECT_OF_THE_WILD.id} /> gained from <ItemLink id={ITEMS.CALL_OF_THE_WILD.id} /></>,
            when: combatant.hasWrists(ITEMS.CALL_OF_THE_WILD.id),
            check: () => this.callOfTheWild.suggestionsThresholds,
          }),
          new Requirement({
            name: <><ResourceIcon id={RESOURCE_TYPES.FOCUS.id} /> Focus saved with <ItemLink id={ITEMS.ROAR_OF_THE_SEVEN_LIONS.id} /></>,
            when: combatant.hasWaist(ITEMS.ROAR_OF_THE_SEVEN_LIONS.id),
            check: () => this.roarOfTheSevenLions.focusSavedThreshold,
          }),
        ];
      },
    }),
    new Rule({
      name: <><Icon
        icon="spell_mage_altertime"
        alt="Casting downtime"
        style={{
          height: '1.3em',
          marginTop: '-.1em',
        }}
      /> Downtime & <ResourceIcon id={RESOURCE_TYPES.FOCUS.id} /> focus capping </>,
      description: <> Try to reduce the delay between casting spells. If everything is on cooldown, try and use <SpellLink id={SPELLS.COBRA_SHOT.id} /> to stay off the focus cap and do some damage.</>,
      requirements: () => {
        return [
          new Requirement({
            name: <><Icon
              icon="spell_mage_altertime"
              alt="Casting downtime"
              style={{
                height: '1.3em',
                marginTop: '-.1em',
              }}
            /> Downtime</>,
            check: () => this.alwaysBeCasting.suggestionThresholds,
          }),
          new Requirement({
            name: <><ResourceIcon id={RESOURCE_TYPES.FOCUS.id} /> Time focus capped</>,
            check: () => this.timeFocusCapped.suggestionThresholds,
          }),
        ];
      },
    }),
    new PreparationRule(),
  ];
}

export default Checklist;
