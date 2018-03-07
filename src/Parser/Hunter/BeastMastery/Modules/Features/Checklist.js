import React from 'react';

//Core
import CoreChecklist, { Rule, Requirement } from 'Parser/Core/Modules/Features/Checklist';
import { GenericCastEfficiencyRequirement } from 'Parser/Core/Modules/Features/Checklist/Requirements';
import { PreparationRule } from 'Parser/Core/Modules/Features/Checklist/Rules';
import Combatants from 'Parser/Core/Modules/Combatants';
import LegendaryCountChecker from 'Parser/Core/Modules/Items/LegendaryCountChecker';
import LegendaryUpgradeChecker from 'Parser/Core/Modules/Items/LegendaryUpgradeChecker';
import PrePotion from 'Parser/Core/Modules/Items/PrePotion';
import Wrapper from 'common/Wrapper';
import SPELLS from 'common/SPELLS';
import CastEfficiency from 'Parser/Core/Modules/CastEfficiency';
import SpellLink from 'common/SpellLink';
import Icon from "common/Icon";
import EnchantChecker from 'Parser/Core/Modules/Items/EnchantChecker';
import ITEMS from 'common/ITEMS/HUNTER';
import ItemLink from 'common/ItemLink';

//Features
import AlwaysBeCasting from 'Parser/Hunter/BeastMastery/Modules/Features/AlwaysBeCasting';

//Talents
import AMurderOfCrows from 'Parser/Hunter/BeastMastery/Modules/Talents/AMurderOfCrows';
import KillerCobra from 'Parser/Hunter/BeastMastery/Modules/Talents/KillerCobra';
import DireFrenzy from 'Parser/Hunter/BeastMastery/Modules/Talents/DireFrenzy';
import AspectOfTheBeast from 'Parser/Hunter/Shared/Modules/Talents/AspectOfTheBeast';

//Spells
import DireBeast from 'Parser/Hunter/BeastMastery/Modules/Spells/DireBeast/DireBeast';
import AspectOfTheWild from 'Parser/Hunter/BeastMastery/Modules/Spells/AspectOfTheWild';
import BestialWrathAverageFocus from 'Parser/Hunter/BeastMastery/Modules/Spells/BestialWrath/BestialWrathAverageFocus';

//Traits
import TitansThunder from 'Parser/Hunter/BeastMastery/Modules/Traits/TitansThunder';

//Items
import ParselsTongue from 'Parser/Hunter/BeastMastery/Modules/Items/ParselsTongue';
import QaplaEredunWarOrder from 'Parser/Hunter/BeastMastery/Modules/Items/QaplaEredunWarOrder';
import TheMantleOfCommand from 'Parser/Hunter/BeastMastery/Modules/Items/TheMantleOfCommand';
import SoulOfTheHuntmaster from 'Parser/Hunter/Shared/Modules/Items/SoulOfTheHuntmaster';
import RoarOfTheSevenLions from 'Parser/Hunter/BeastMastery/Modules/Items/RoarOfTheSevenLions';
import CallOfTheWild from 'Parser/Hunter/Shared/Modules/Items/CallOfTheWild';

class Checklist extends CoreChecklist {
  static dependencies = {
    combatants: Combatants,

    //general
    legendaryUpgradeChecker: LegendaryUpgradeChecker,
    legendaryCountChecker: LegendaryCountChecker,
    prePotion: PrePotion,

    //features:
    castEfficiency: CastEfficiency,
    alwaysBeCasting: AlwaysBeCasting,
    enchantChecker: EnchantChecker,

    //talents
    aMurderOfCrows: AMurderOfCrows,
    killerCobra: KillerCobra,
    aspectOfTheBeast: AspectOfTheBeast,

    //Spells
    aspectOfTheWild: AspectOfTheWild,
    direBeast: DireBeast,
    direFrenzy: DireFrenzy,
    bestialWrathAverageFocus: BestialWrathAverageFocus,

    //Traits
    titansThunder: TitansThunder,

    //Legendaries
    parselsTongue: ParselsTongue,
    qaplaEredunWarOrder: QaplaEredunWarOrder,
    theMantleOfCommand: TheMantleOfCommand,
    soulOfTheHuntmaster: SoulOfTheHuntmaster,
    roarOfTheSevenLions: RoarOfTheSevenLions,
    callOfTheWild: CallOfTheWild,
  };

  rules = [
    new Rule({
      name: 'Use core spells as often as possible',
      description: <Wrapper>Spells such as <SpellLink id={SPELLS.KILL_COMMAND.id} icon /> and <SpellLink id={SPELLS.DIRE_BEAST.id} icon /> should be used on cooldown. <SpellLink id={SPELLS.DIRE_FRENZY_TALENT.id} icon /> should never be capping stacks, but you also want to maximize buff uptime by spreading out the casts as much as possible. You'll want as many good casts of <SpellLink id={SPELLS.A_MURDER_OF_CROWS_TALENT_SHARED.id} icon />, <SpellLink id={SPELLS.TITANS_THUNDER.id} icon /> and <SpellLink id={SPELLS.ASPECT_OF_THE_WILD.id} icon /> as possible - this is achieved by lining them up with <SpellLink id={SPELLS.BESTIAL_WRATH.id} icon /> for each cast, and in preparation for each <SpellLink id={SPELLS.BESTIAL_WRATH.id} icon /> you want to have saved up some focus. <a href="https://www.icy-veins.com/wow/beast-mastery-hunter-pve-dps-rotation-cooldowns-abilities" target="_blank" rel="noopener noreferrer">More info.</a></Wrapper>,
      requirements: () => {
        const combatant = this.combatants.selected;
        return [
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.KILL_COMMAND,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.BESTIAL_WRATH,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.A_MURDER_OF_CROWS_TALENT_SHARED,
            when: combatant.hasTalent(SPELLS.A_MURDER_OF_CROWS_TALENT_SHARED.id),
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.TITANS_THUNDER,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.ASPECT_OF_THE_WILD,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.BARRAGE_TALENT,
            when: combatant.hasTalent(SPELLS.BARRAGE_TALENT.id),
          }),
        ];
      },
    }),
    new Rule({
      name: <Wrapper> Use your Dire ability properly</Wrapper>,
      description: <Wrapper>Using either <SpellLink id={SPELLS.DIRE_BEAST.id} icon /> or <SpellLink id={SPELLS.DIRE_FRENZY_TALENT.id} icon /> properly is a key to achieving high dps. This means maintaining the buff from <SpellLink id={SPELLS.DIRE_FRENZY_TALENT.id} icon /> as long as possible, and utilising the cooldown reduction from <SpellLink id={SPELLS.DIRE_BEAST.id} icon />/<SpellLink id={SPELLS.DIRE_FRENZY_TALENT.id} icon /> as much as possible, to ensure high uptime on <SpellLink id={SPELLS.BESTIAL_WRATH.id} icon /></Wrapper>,
      requirements: () => {
        return [
          new Requirement({
            name: <Wrapper>Casts with less than 3s CD on <SpellLink id={SPELLS.BESTIAL_WRATH.id} icon /></Wrapper>,
            when: !this.combatants.selected.hasTalent(SPELLS.DIRE_FRENZY_TALENT.id),
            check: () => this.direBeast.badDireBeastThreshold,
          }),
          new Requirement({
            name: <Wrapper>Uptime of <SpellLink id={SPELLS.DIRE_FRENZY_TALENT.id} icon /> </Wrapper>,
            when: this.combatants.selected.hasTalent(SPELLS.DIRE_FRENZY_TALENT.id),
            check: () => this.direFrenzy.direFrenzyUptimeThreshold,
          }),
          new Requirement({
            name: <Wrapper>3 Stacks Uptime of <SpellLink id={SPELLS.DIRE_FRENZY_TALENT.id} icon /> </Wrapper>,
            when: this.combatants.selected.hasTalent(SPELLS.DIRE_FRENZY_TALENT.id),
            check: () => this.direFrenzy.direFrenzy3StackThreshold,
          }),
        ];
      },
    }),
    new Rule({
      name: <Wrapper>Cooldown efficiency</Wrapper>,
      description: <Wrapper> Use <SpellLink id={SPELLS.BESTIAL_WRATH.id} icon /> & <SpellLink id={SPELLS.ASPECT_OF_THE_WILD.id} icon /> properly. This means having a high amount of focus going into <SpellLink id={SPELLS.BESTIAL_WRATH.id} icon /> windows, and by using your <SpellLink id={SPELLS.ASPECT_OF_THE_WILD.id} icon /> when <SpellLink id={SPELLS.BESTIAL_WRATH.id} icon /> is up.</Wrapper>,
      requirements: () => {
        return [
          new Requirement({
            name: <Wrapper>Average focus on <SpellLink id={SPELLS.BESTIAL_WRATH.id} icon /> cast</Wrapper>,
            check: () => this.bestialWrathAverageFocus.focusOnBestialWrathCastThreshold,
          }),
          new Requirement({
            name: <Wrapper><SpellLink id={SPELLS.ASPECT_OF_THE_WILD.id} icon /> casts w/o <SpellLink id={SPELLS.BESTIAL_WRATH.id} icon /> up</Wrapper>,
            check: () => this.aspectOfTheWild.badCastThreshold,
          }),
        ];
      },
    }),
    new Rule({
      name: 'Pick the right tools for the fight',
      description: 'The throughput gain of some talents or legendaries might vary greatly. Consider switching to a more reliable alternative if something is underperforming regularly.',
      requirements: () => {
        const combatant = this.combatants.selected;
        return [
          new Requirement({
            name: <Wrapper><SpellLink id={SPELLS.ASPECT_OF_THE_BEAST_TALENT.id} icon /> damage</Wrapper>,
            when: combatant.hasTalent(SPELLS.ASPECT_OF_THE_BEAST_TALENT.id),
            check: () => this.aspectOfTheBeast.aspectOfTheBeastDamageThreshold,
          }),
          new Requirement({
            name: <Wrapper>Wasted <SpellLink id={SPELLS.KILLER_COBRA_TALENT.id} icon /> resets</Wrapper>,
            when: combatant.hasTalent(SPELLS.KILLER_COBRA_TALENT.id),
            check: () => this.killerCobra.wastedKillerCobraThreshold,
          }),
          new Requirement({
            name: <Wrapper><SpellLink id={SPELLS.A_MURDER_OF_CROWS_TALENT_SHARED.id} icon /> casts with less than 7s remaining of <SpellLink id={SPELLS.BESTIAL_WRATH.id} icon /> duration</Wrapper>,
            when: combatant.hasTalent(SPELLS.A_MURDER_OF_CROWS_TALENT_SHARED.id),
            check: () => this.aMurderOfCrows.shouldHaveSavedThreshold,
          }),
          new Requirement({
            name: <Wrapper><SpellLink id={SPELLS.A_MURDER_OF_CROWS_TALENT_SHARED.id} icon /> casts without <SpellLink id={SPELLS.BESTIAL_WRATH.id} icon /> ready to cast after</Wrapper>,
            when: combatant.hasTalent(SPELLS.A_MURDER_OF_CROWS_TALENT_SHARED.id),
            check: () => this.aMurderOfCrows.badCastThreshold,
          }),
          new Requirement({
            name: <Wrapper><SpellLink id={SPELLS.KILLER_COBRA_TALENT.id} icon /> and <ItemLink id={ITEMS.QAPLA_EREDUN_WAR_ORDER.id} icon /></Wrapper>,
            when: combatant.hasTalent(SPELLS.KILLER_COBRA_TALENT.id) && combatant.hasFeet(ITEMS.QAPLA_EREDUN_WAR_ORDER.id),
            check: () => this.qaplaEredunWarOrder.killerCobraThreshold,
          }),
          new Requirement({
            name: <Wrapper><ItemLink id={ITEMS.QAPLA_EREDUN_WAR_ORDER.id} icon /> average reduction</Wrapper>,
            when: combatant.hasFeet(ITEMS.QAPLA_EREDUN_WAR_ORDER.id),
            check: () => this.qaplaEredunWarOrder.wastedSuggestionThreshold,
          }),
          new Requirement({
            name: <Wrapper><ItemLink id={ITEMS.PARSELS_TONGUE.id} icon /> buffs dropped</Wrapper>,
            when: combatant.hasChest(ITEMS.PARSELS_TONGUE.id),
            check: () => this.parselsTongue.timesDroppedThreshold,
          }),
          new Requirement({
            name: <Wrapper><ItemLink id={ITEMS.PARSELS_TONGUE.id} icon /> uptime</Wrapper>,
            when: combatant.hasChest(ITEMS.PARSELS_TONGUE.id),
            check: () => this.parselsTongue.buffUptimeThreshold,
          }),
          new Requirement({
            name: <Wrapper><ItemLink id={ITEMS.THE_MANTLE_OF_COMMAND.id} icon /> uptime</Wrapper>,
            when: combatant.hasShoulder(ITEMS.THE_MANTLE_OF_COMMAND.id),
            check: () => this.theMantleOfCommand.buffUptimeThreshold,
          }),
          new Requirement({
            name: <Wrapper>Other talent active with <ItemLink id={ITEMS.SOUL_OF_THE_HUNTMASTER.id} icon /></Wrapper>,
            when: combatant.hasFinger(ITEMS.SOUL_OF_THE_HUNTMASTER.id),
            check: () => this.soulOfTheHuntmaster.suggestionThreshold,
          }),
          new Requirement({
            name: <Wrapper><SpellLink id={SPELLS.ASPECT_OF_THE_WILD.id} icon /> gained from <ItemLink id={ITEMS.CALL_OF_THE_WILD.id} icon /></Wrapper>,
            when: combatant.hasWrists(ITEMS.CALL_OF_THE_WILD.id),
            check: () => this.callOfTheWild.suggestionsThresholds,
          }),
        ];
      },
    }),
    new Rule({
      name: <Wrapper><Icon
        icon='spell_mage_altertime'
        alt='Casting downtime'
        style={{
          height: '1.3em',
          marginTop: '-.1em',
        }}
      /> Downtime</Wrapper>,
      description: <Wrapper> Try to reduce the delay between casting spells. If everything is on cooldown, try and use <SpellLink id={SPELLS.COBRA_SHOT.id} icon /> to stay off the focus cap and do some damage.</Wrapper>,
      requirements: () => {
        return [
          new Requirement({
            name: <Wrapper><Icon
              icon='spell_mage_altertime'
              alt='Casting downtime'
              style={{
                height: '1.3em',
                marginTop: '-.1em',
              }}
            /> Downtime</Wrapper>,
            check: () => this.alwaysBeCasting.suggestionThresholds,
          }),
        ];
      },
    }),
    new PreparationRule(),
  ];
}

export default Checklist;
