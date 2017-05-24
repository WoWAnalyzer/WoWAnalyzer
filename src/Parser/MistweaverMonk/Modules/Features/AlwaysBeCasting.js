import SPELLS from 'common/SPELLS';

import CoreAlwaysBeCasting from 'Parser/Core/Modules/AlwaysBeCasting';

class AlwaysBeCasting extends CoreAlwaysBeCasting {
  static ABILITIES_ON_GCD = [
    SPELLS.EFFUSE.id,
    SPELLS.ENVELOPING_MISTS.id,
    SPELLS.ESSENCE_FONT.id,
    SPELLS.RENEWING_MIST.id,
    SPELLS.VIVIFY.id,
    SPELLS.REVIVAL.id,
    SPELLS.SHEILUNS_GIFT.id,
    SPELLS.CHI_BURST_TALENT.id,
    SPELLS.CHI_WAVE_TALENT.id,
    SPELLS.ZEN_PULSE_TALENT.id,
    SPELLS.REFRESHING_JADE_WIND_TALENT.id,
    SPELLS.INVOKE_CHIJI_TALENT.id,
  ];
}

export default AlwaysBeCasting;
