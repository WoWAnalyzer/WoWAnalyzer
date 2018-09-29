import SPELLS from 'common/SPELLS';
import { SimpleFight, applybuff, refreshBuff, dpsCasts } from 'tests/parser/brewmaster/fixtures/SimpleFight';
import TestCombatLogParser from 'tests/TestCombatLogParser';

import BlackoutCombo from './BlackoutCombo';

describe('Brewmaster.BlackoutCombo', () => {
  let parser;
  let blackoutCombo;
  beforeEach(() => {
    parser = new TestCombatLogParser();
    blackoutCombo = new BlackoutCombo(parser);
  });
  it('blackout combo is active by default', () => {
    expect(blackoutCombo.active).toBe(true);
  });
  it('blackout combo checks to see if active while talent is not selected', () => {
    parser.selectedCombatant.hasTalent = jest.fn(() => false);
    blackoutCombo = new BlackoutCombo(parser);
    expect(parser.selectedCombatant.hasTalent).toBeCalledWith(SPELLS.BLACKOUT_COMBO_TALENT.id);
    expect(blackoutCombo.active).toBe(false);
  });
  it('blackout combo checks to see if active while talent is selected', () => {
    parser.selectedCombatant.hasTalent = jest.fn(() => true);
    blackoutCombo = new BlackoutCombo(parser);
    expect(parser.selectedCombatant.hasTalent).toBeCalledWith(SPELLS.BLACKOUT_COMBO_TALENT.id);
    expect(blackoutCombo.active).toBe(true);
  });
  it('blackout combo when no events have been found', () => {
    expect(blackoutCombo.blackoutComboBuffs).toBe(0);
    expect(blackoutCombo.lastBlackoutComboCast).toBe(0);
    expect(blackoutCombo.blackoutComboConsumed).toBe(0);
  });
  it('track blackout combo buffs applied', () => {
    parser.processEvents([...applybuff, ...refreshBuff]);
    expect(blackoutCombo.blackoutComboBuffs).toBe(4);
  });
  it('track when last blackout combo was applied', () => {
    parser.processEvents([...applybuff, ...refreshBuff]);
    expect(blackoutCombo.lastBlackoutComboCast).toBe(9000);
  });
  it('track blackout combos consumed by other spells', () => {
    parser.processEvents(SimpleFight);
    expect(blackoutCombo.blackoutComboConsumed).toBe(3);
  });
  it('check to see if the object used to track spells os populated with no data', () => {
    expect(Object.keys(blackoutCombo.spellsBOCWasUsedOn).length).toBe(0);
  });
  it('check to see if the object used to track spells os populated with damage abilities that would consume', () => {
    parser.processEvents(dpsCasts);
    expect(Object.keys(blackoutCombo.spellsBOCWasUsedOn).length).toBe(0);
  });
  it('track how many times keg smash consumed BOC', () => {
    parser.processEvents(SimpleFight);
    expect(blackoutCombo.spellsBOCWasUsedOn[SPELLS.KEG_SMASH.id]).toBe(1);
  });
  it('track how many times breath of fire consumed BOC', () => {
    parser.processEvents(SimpleFight);
    expect(blackoutCombo.spellsBOCWasUsedOn[SPELLS.BREATH_OF_FIRE.id]).toBe(1);
  });
  it('track how many times purifying brew consumed BOC', () => {
    parser.processEvents(SimpleFight);
    expect(blackoutCombo.spellsBOCWasUsedOn[SPELLS.PURIFYING_BREW.id]).toBe(1);
  });
  it('track how many times ironskin brew consumed BOC when none were cast', () => {
    parser.processEvents(SimpleFight);
    expect(blackoutCombo.spellsBOCWasUsedOn[SPELLS.IRONSKIN_BREW.id]).toBe(undefined);
  });
});
