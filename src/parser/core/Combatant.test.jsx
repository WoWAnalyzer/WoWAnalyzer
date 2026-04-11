import COMBATANTINFO from 'parser/core/tests/COMBATANTINFO.json';

import { FullCombatant } from './Combatant';

function getCombatant(parser = null, combatantInfo = null) {
  const parserStub = {
    players: [
      {
        id: 11,
        name: 'Test',
      },
    ],
    fight: {
      start_time: 0,
    },
  };
  return new FullCombatant(
    parser || parserStub,
    { id: 11, name: 'Test', specID: 1 },
    combatantInfo || COMBATANTINFO,
  );
}

describe('Combatant', () => {
  describe('getGear', () => {
    it('returns the item equipped in each slot', () => {
      const combatant = getCombatant();
      expect(combatant.getGear('HEAD').id).toBe(138313);
      expect(combatant.getGear('NECK').id).toBe(132444);
      expect(combatant.getGear('SHOULDER').id).toBe(138322);
      expect(combatant.getGear('CHEST').id).toBe(140848);
      expect(combatant.getGear('WAIST').id).toBe(144404);
      expect(combatant.getGear('LEGS').id).toBe(147732);
      expect(combatant.getGear('FEET').id).toBe(140885);
      expect(combatant.getGear('WRISTS').id).toBe(140850);
      expect(combatant.getGear('HANDS').id).toBe(138310);
      expect(combatant.getGear('FINGER1').id).toBe(134533);
      expect(combatant.getGear('FINGER2').id).toBe(140897);
      expect(combatant.getGear('TRINKET1').id).toBe(144258);
      expect(combatant.getGear('TRINKET2').id).toBe(128710);
      expect(combatant.getGear('BACK').id).toBe(138370);
      expect(combatant.getGear('MAINHAND').id).toBe(128868);
    });
    it('exposes item-level data on the returned item', () => {
      expect(getCombatant().getGear('TRINKET1').itemLevel).toBe(940);
    });
    it('returns the empty placeholder for an unequipped slot', () => {
      // OFFHAND is empty in the fixture (id 0)
      expect(getCombatant().getGear('OFFHAND').id).toBe(0);
    });
    it('TRINKET1 and TRINKET2 resolve to distinct objects', () => {
      const combatant = getCombatant();
      const trinket1 = combatant.getGear('TRINKET1');
      const trinket2 = combatant.getGear('TRINKET2');
      expect(trinket1).not.toBe(trinket2);
      expect(trinket1.id).not.toBe(trinket2.id);
    });
    it('FINGER1 and FINGER2 resolve to distinct objects', () => {
      const combatant = getCombatant();
      const finger1 = combatant.getGear('FINGER1');
      const finger2 = combatant.getGear('FINGER2');
      expect(finger1).not.toBe(finger2);
      expect(finger1.id).not.toBe(finger2.id);
    });
  });

  describe('hasGear', () => {
    it('returns true when the slot holds the given item', () => {
      const combatant = getCombatant();
      expect(combatant.hasGear('HEAD', 138313)).toBe(true);
      expect(combatant.hasGear('MAINHAND', 128868)).toBe(true);
    });
    it('returns false when the slot holds a different item', () => {
      expect(getCombatant().hasGear('HEAD', 999999)).toBe(false);
    });
    it('does not match across slots', () => {
      // 138313 is in HEAD, not CHEST
      expect(getCombatant().hasGear('CHEST', 138313)).toBe(false);
    });
    it('returns false for an unequipped slot', () => {
      expect(getCombatant().hasGear('OFFHAND', 12345)).toBe(false);
    });
  });

  describe('getFinger / hasFinger', () => {
    it('hasFinger checks both fingers', () => {
      const combatant = getCombatant();
      expect(combatant.hasFinger(134533)).toBe(true);
      expect(combatant.hasFinger(140897)).toBe(true);
      expect(combatant.hasFinger(144258)).toBe(false); // trinket id
    });
    it('getFinger returns the matching item from either slot', () => {
      const combatant = getCombatant();
      expect(combatant.getFinger(134533)).toBe(combatant.getGear('FINGER1'));
      expect(combatant.getFinger(140897)).toBe(combatant.getGear('FINGER2'));
      expect(combatant.getFinger(999999)).toBeUndefined();
    });
  });

  describe('getTrinket / hasTrinket', () => {
    it('hasTrinket checks both trinket slots', () => {
      const combatant = getCombatant();
      expect(combatant.hasTrinket(144258)).toBe(true);
      expect(combatant.hasTrinket(128710)).toBe(true);
      expect(combatant.hasTrinket(140897)).toBe(false); // ring id
    });
    it('getTrinket returns the matching item from either slot', () => {
      const combatant = getCombatant();
      expect(combatant.getTrinket(144258)).toBe(combatant.getGear('TRINKET1'));
      expect(combatant.getTrinket(128710)).toBe(combatant.getGear('TRINKET2'));
      expect(combatant.getTrinket(999999)).toBeUndefined();
    });
  });

  describe('tierPieces', () => {
    it('returns the head, shoulder, chest, legs, and hands items in order', () => {
      const ids = getCombatant().tierPieces.map((item) => item.id);
      expect(ids).toEqual([138313, 138322, 140848, 147732, 138310]);
    });
  });

  describe('hasWeaponEnchant', () => {
    it('returns false when neither weapon carries the enchant', () => {
      // mainhand 128868 has no permanentEnchant in the fixture
      expect(getCombatant().hasWeaponEnchant({ effectId: 99999 })).toBe(false);
    });
  });
});
