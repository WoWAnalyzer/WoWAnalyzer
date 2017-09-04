export default `
BLood Death Knight V1

Added spells to the SPELLS DEATH KNIGHT list
Added spells to the always be casting list. Made a stat box for it.
Added the following Modules:
  BLOODPLAGUEUPTIME: Keeps track of your blood plague desease uptime.
  BONESHIELDUPTIME: Keeps track of your bonesheild buff uptime. Does not track stacks.
  OSSUARYUPTIME: Keepts track of your OSSUARY talent uptime. This also makes sure your keeping 5 stacks of boneshield up.
  RUNICPOWERWASTED: Measures how much runic power you generated and how much was generated beyond the max amount. Lists the wasted amount as a percent.
  WASTEDDEATHANDDECAY: This calculates how many crimson scorge procs you let expire without using them to cast a free death and decay.

Added the following to Cast Efficiency:
  Icebound Fortitude: Made it a minor suggestion. Defensive CDs should be used smartly, instead on CD.
  Blood Mirror: Should only show if you took the talent. Made it a minor suggestion. Defensive CDs should be used smartly, instead on CD.  
  Blood Boil
  Consumption: Artifact ability.
  Blooddrinker: Should only show if you took the talent.
   
ToDo
Tweak cast efficency ratios. 
Seems to be a problem with getting Dancing Rune Weapon to show.
Figure out a good way to display Death Strikes information that will lead to better usage.
Figure out a good way to display Icebound fortitude and vampiric blood information that will lead to better usage.
Maybe try to break down runic power gains/waste per ability.
Display if they break Blooddrinker channeling early.
Talent info/recommendations.
Morrowrend usage.
See if there is a good way to calculate missed DnD casts efficency. Since it gets reset by procs hard to calculate.
See if there is a good way to calculate Vampiric Blood casts. Since you can shave off seconds from its CD during combat hard to calculate.


`;
