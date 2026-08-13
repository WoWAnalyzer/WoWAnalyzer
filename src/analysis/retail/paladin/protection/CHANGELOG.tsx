import { change, date } from 'common/changelog';
import { apolex, emallson, TemaZpro } from 'CONTRIBUTORS';

// prettier-ignore
export default [
  change(date(2026, 8, 13), 'Replaced the hand-maintained spellbook with generated spell data, added a Holy Armaments module, renamed First Avenger to Soaring Shield, and updated Righteous Protector, Redoubt, Grand Crusader and Sanctified Wrath.', TemaZpro),
  change(date(2026, 8, 13), 'Split Dusk and Dawn into separate Blessing of Dusk and Blessing of Dawn modules, and added support for Lightbearer, Punishment, Divine Resonance, Unbreakable Spirit, Divine Purpose and Hammer of Wrath.', TemaZpro),
  change(date(2026, 8, 13), "Corrected Protection's Judgment in Always Be Casting, added Divine Shield to defensive buffs, and stopped counting its auto-taunt as a cast.", TemaZpro),
  change(date(2026, 8, 13), 'Added Vanguard proc tracking, showing procs generated, consumed, overcapped and expired.', apolex),
  change(date(2026, 8, 13), 'Added a Shield of the Righteous section showing every physical hit taken without the buff active, alongside its uptime.', apolex),
  change(date(2026, 8, 13), 'Holy Power waste is now graded separately inside and outside the damage cooldown, since Hammer of Wrath replacing Judgment there makes overcapping much easier.', apolex),
  change(date(2026, 8, 13), 'Added Sacred Weapon coverage of the damage cooldown window.', apolex),
  change(date(2026, 8, 13), 'Divine Toll and Divine Resonance cast Avenger\'s Shield without emitting a cast event; those are now attributed rather than being invisible.', apolex),
  change(date(2026, 8, 13), 'Fixed the per-cast Shield of the Righteous overcap amount, which was inverted and so ranked the worst casts as the best.', apolex),
  change(date(2026, 8, 13), 'Fixed Hammer of Wrath and Judgment using spell ids Protection never casts, which left both out of the spellbook and out of the rotation priority.', apolex),
  change(date(2026, 7, 30), 'Re-enabled the analyzer for Midnight: removed references to talents that no longer exist (Eye of Tyr, Moment of Glory, Holy Shield, Resolute Defender, Repentance, Bastion of Light, Inmost Light, Inspiring Vanguard) and fixed the Holy Armaments rename.', apolex),
  change(date(2025, 4, 27), 'More rotational work for Templar', emallson),
  change(date(2025, 4, 26), 'Added rotational analysis for Templar', emallson),
  change(date(2025, 4, 11), 'Initial updates for The War Within.', emallson),
];
