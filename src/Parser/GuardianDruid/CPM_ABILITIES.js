import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';

export const SPELL_CATEGORY = {
    ROTATIONAL: 'Rotational Spell',
    COOLDOWNS: 'Cooldown',
    UTILITY: 'Utility',
  };

const debug = false;
  
const CPM_ABILITIES = [
// Rotational Spells
{
    spell: SPELLS.MANGLE_BEAR,
    category: SPELL_CATEGORY.ROTATIONAL,
    getCooldown: haste => null,
    noSuggestion: true,
},
{
    spell: SPELLS.BEAR_SWIPE,
    category: SPELL_CATEGORY.ROTATIONAL,
    getCooldown: haste => null,
},
{
    spell: SPELLS.MOONFIRE,
    category: SPELL_CATEGORY.ROTATIONAL,
    getCooldown: haste => null,
},
{
    spell:SPELLS.THRASH_BEAR,
    category: SPELL_CATEGORY.ROTATIONAL,
    getCooldown: (haste, combatant) => {
        const hasMightBuff = combatant.hasTalent(SPELLS.INCARNATION_OF_URSOC.id);    
        if (!hasMightBuff) {
            return 6;
        }
        const abilityTracker = combatant.owner.modules.abilityTracker;
        
        const mightBuff = abilityTracker.getAbility(SPELLS.INCARNATION_OF_URSOC.id).casts || 0;
        const fightDuration = combatant.owner.fightDuration/1000;
        const castsDuringMight = (mightBuff * 30) / (1.5 / (1+haste));
        const castsOutsideMight = (fightDuration - (mightBuff * 30)) / (6 / (1+haste));
        return fightDuration / (castsDuringMight + castsOutsideMight);
    },
    noSuggestion: true,
},
{
    spell: SPELLS.MAUL,
    category: SPELL_CATEGORY.ROTATIONAL,
    getCooldown: haste => null,
},
// Cooldowns
{
    spell: SPELLS.BARKSKIN,
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: (haste, combatant) => {
        const baseCd = combatant.hasTalent(SPELLS.SURVIVAL_OF_THE_FITTEST_TALENT.id) ? 90-(90/3) : 90;
        const cdTrait = combatant.traitsBySpellId[SPELLS.PERPETUAL_SPRING_TRAIT.id] || 0;
        debug && console.log('Barkskin CD ' + baseCd * (1 - (cdTrait * 3 / 100)));
        return baseCd * (1 - (cdTrait * 3 / 100));      
    },
},
{
    spell: SPELLS.SURVIVAL_INSTINCTS,
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: (haste, combatant) => {
        const baseCd = combatant.hasTalent(SPELLS.SURVIVAL_OF_THE_FITTEST_TALENT.id) ? 240-(240/3) : 240;
        debug && console.log('Survival CD ' + baseCd);
        return baseCd;      
    },
    charges:3,
    isActive: combatant => combatant.hasFinger(ITEMS.DUAL_DETERMINATION.id),
},
{
    spell: SPELLS.SURVIVAL_INSTINCTS,
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: (haste, combatant) => {
        const baseCd = combatant.hasTalent(SPELLS.SURVIVAL_OF_THE_FITTEST_TALENT.id) ? 240-(240/3) : 240;
        debug && console.log('Survival CD ' + baseCd);
        return baseCd;      
    },
    charges:2,
    isActive: combatant => !combatant.hasFinger(ITEMS.DUAL_DETERMINATION.id),
},
{
    spell: SPELLS.INCARNATION_OF_URSOC,
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: haste => 180,
    isActive: combatant => combatant.hasTalent(SPELLS.INCARNATION_OF_URSOC.id),
},
{
    spell: SPELLS.BRISTLING_FUR_TALENT,
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: haste => 40,
    isActive: combatant => combatant.hasTalent(SPELLS.BRISTLING_FUR_TALENT.id),
},
{
    spell: SPELLS.IRONFUR,
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: haste => null,
},
{
    spell: SPELLS.RAGE_OF_THE_SLEEPER,
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: haste => 90,
},
{
    spell: SPELLS.FRENZIED_REGENERATION,
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: haste => null,
},
// Raid utility
{
    spell: SPELLS.STAMPEDING_ROAR_BEAR,
    category: SPELL_CATEGORY.UTILITY,
    getCooldown: haste => 120,
    noSuggestion: true,
},
{
    spell: SPELLS.GROWL,
    category: SPELL_CATEGORY.UTILITY,
    getCooldown: haste => null,
    noSuggestion: true,
},
{
    spell: SPELLS.SKULL_BASH,
    category: SPELL_CATEGORY.UTILITY,
    getCooldown: haste => null,
    noSuggestion: true,
},

//To Do: Finish adding spells.

  
];

export default CPM_ABILITIES;