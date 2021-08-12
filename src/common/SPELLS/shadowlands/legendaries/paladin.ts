const legendaries = {
  //region Holy
  SHOCK_BARRIER: {
    id: 337824,
    name: 'Shock Barrier',
    icon: 'ability_paladin_blessedmending',
    bonusID: 7059,
  },
  //endregion

  //region Protection

  //endregion

  //region Retribution
  FINAL_VERDICT: {
    id: 337247,
    name: 'Final Verdict',
    icon: 'spell_paladin_templarsverdict',
    bonusID: 7064,
  },
  FINAL_VERDICT_RESET: {
    id: 337228,
    name: 'Final Verdict',
    icon: 'spell_paladin_hammerofwrath',
  },
  FINAL_VERDICT_FINISHER: {
    id: 336872,
    name: 'Final Verdict',
    icon: 'spell_paladin_templarsverdict',
  },
  RELENTLESS_INQUISITOR: {
    id: 337297,
    name: 'Relentless Inquisitor',
    icon: 'spell_holy_divinepurpose',
  },
  TEMPEST_OF_THE_LIGHTBRINGER: {
    id: 337257,
    name: 'Tempest of the Lightbringer',
    icon: 'ability_paladin_divinestorm',
  },
  THE_MAD_PARAGON: {
    id: 337594,
    name: 'The Mad Paragon',
    icon: 'ability_paladin_conviction',
  },

  //endregion

  //region Shared

  //endregion
} as const;
export default legendaries;
