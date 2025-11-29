import type { Raid } from 'game/raids';
import background from './backgrounds/VSDRMQD.jpg';
import { Beloren } from 'game/raids/vs_dr_mqd/Beloren';
import { Chimaerus } from 'game/raids/vs_dr_mqd/Chimaerus';
import { CrownOfTheCosmos } from 'game/raids/vs_dr_mqd/CrownOfTheCosmos';
import { ImperatorAverzian } from 'game/raids/vs_dr_mqd/ImperatorAverzian';
import { VaelgorEzzorak } from 'game/raids/vs_dr_mqd/VaelgorEzzorak';
import { Vorasius } from 'game/raids/vs_dr_mqd/Vorasius';
import { Salhadaar } from 'game/raids/vs_dr_mqd/Salhadaar';
import { MidnightFalls } from 'game/raids/vs_dr_mqd/MidnightFalls';
import { LightblindedVanguard } from 'game/raids/vs_dr_mqd/LightblindedVanguard';

export default {
  name: 'VS / DR / MQD',
  background,
  bosses: {
    // Voidspire
    ImperatorAverzian,
    Vorasius,
    Salhadaar,
    VaelgorEzzorak,
    LightblindedVanguard,
    CrownOfTheCosmos,
    // DR
    Chimaerus,
    // MQD
    Beloren,
    MidnightFalls,
  },
} satisfies Raid;
