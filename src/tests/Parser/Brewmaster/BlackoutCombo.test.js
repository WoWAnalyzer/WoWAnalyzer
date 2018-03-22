import BlackoutCombo from 'Parser/Monk/Brewmaster/Modules/Spells/BlackoutCombo';
import SPELLS from 'common/SPELLS';
import processEvents from './Fixtures/processEvents';
import { SimpleFight, applybuff, refreshBuff, dpsCasts } from './Fixtures/SimpleFight';

describe('Brewmaster.BlackoutCombo', () => {
  let blackoutCombo;
  beforeEach(() => {
    blackoutCombo = new BlackoutCombo({
      toPlayer: () => true,
      byPlayer: () => true,
      toPlayerPet: () => false,
      byPlayerPet: () => false,
    });
  });
  it('blackout combo is active by default', () => {
    expect(blackoutCombo.active).toBe(true);
  });
  it('blackout combo checks to see if active while talent is not selected', () => {
    const hasTalentMethod = jest.fn();
    hasTalentMethod.mockReturnValue(false);
    const combatant = { selected: { hasTalent: hasTalentMethod } };
    blackoutCombo.combatants = combatant;
    blackoutCombo.triggerEvent({
      type: 'initialized',
    });
    expect(hasTalentMethod).toBeCalledWith(SPELLS.BLACKOUT_COMBO_TALENT.id);
    expect(blackoutCombo.active).toBe(false);
  });
  it('blackout combo checks to see if active while talent is selected', () => {
    const hasTalentMethod = jest.fn();
    hasTalentMethod.mockReturnValue(true);
    const combatant = { selected: { hasTalent: hasTalentMethod } };
    blackoutCombo.combatants = combatant;
    blackoutCombo.triggerEvent({
      type: 'initialized',
    });
    expect(hasTalentMethod).toBeCalledWith(SPELLS.BLACKOUT_COMBO_TALENT.id);
    expect(blackoutCombo.active).toBe(true);
  });
  it('blackout combo when no events have been found', () => {
    expect(blackoutCombo.blackoutComboBuffs).toBe(0);
    expect(blackoutCombo.lastBlackoutComboCast).toBe(0);
    expect(blackoutCombo.blackoutComboConsumed).toBe(0);
  });
  it('track blackout combo buffs applied', () => {
    processEvents([...applybuff, ...refreshBuff], blackoutCombo);
    expect(blackoutCombo.blackoutComboBuffs).toBe(4);
  });
  it('track when last blackout combo was applied', () => {
    processEvents([...applybuff, ...refreshBuff], blackoutCombo);
    expect(blackoutCombo.lastBlackoutComboCast).toBe(9000);
  });
  it('track blackout combos consumed by other spells', () => {
    processEvents(SimpleFight, blackoutCombo);
    expect(blackoutCombo.blackoutComboConsumed).toBe(3);
  });
  it('check to see if the object used to track spells os populated with no data', () => {
    expect(Object.keys(blackoutCombo.spellsBOCWasUsedOn).length).toBe(0);
  });
  it('check to see if the object used to track spells os populated with damage abilities that would consume', () => {
    processEvents(dpsCasts, blackoutCombo);
    expect(Object.keys(blackoutCombo.spellsBOCWasUsedOn).length).toBe(0);
  });
  it('track how many times keg smash consumed BOC', () => {
    processEvents(SimpleFight, blackoutCombo);
    expect(blackoutCombo.spellsBOCWasUsedOn[SPELLS.KEG_SMASH.id]).toBe(1);
  });
  it('track how many times breath of fire consumed BOC', () => {
    processEvents(SimpleFight, blackoutCombo);
    expect(blackoutCombo.spellsBOCWasUsedOn[SPELLS.BREATH_OF_FIRE.id]).toBe(1);
  });
  it('track how many times purifying brew consumed BOC', () => {
    processEvents(SimpleFight, blackoutCombo);
    expect(blackoutCombo.spellsBOCWasUsedOn[SPELLS.PURIFYING_BREW.id]).toBe(1);
  });
  it('track how many times ironskin brew consumed BOC when none were cast', () => {
    processEvents(SimpleFight, blackoutCombo);
    expect(blackoutCombo.spellsBOCWasUsedOn[SPELLS.IRONSKIN_BREW.id]).toBe(undefined);
  });
});
