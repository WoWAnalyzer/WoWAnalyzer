# Events

The following events are available:

* `begincast` triggered when player starts casting any **channeled** spell
* `cast` triggered when something was successfully cast. *Can also be triggered by procs and other weird things, even boss mechanics sometimes show up as player casts.*
* `miss`
* `damage` triggered by any kind of damage event, either by players or ennemies.
* `heal` triggered by healing done. This can have an `abosrbed` property that is used for healing absorbs (a debuff that consumes a certain amount of healing, like the Time debuff on Chronomatic Anomaly). This is NOT used for absorbs such as Power Word: Shield.
* `absorbed` triggered by absorb healing, like from Power Word: Shield.
* `healabsorbed` ???
* `applybuff` triggered when a buff is applied.
* `applydebuff` triggered when a debuff is applied.
* `applybuffstack` triggered when a buff stack is gained.
* `applydebuffstack` triggered when a debuff stack is gained.
* `refreshbuff` triggered when a buff is refreshed. You will rarely need this as `applybuff` -> `removebuff` usually suffices.
* `refreshdebuff` triggered when a debuff is refreshed. You will rarely need this as `applydebuff` -> `removedebuff` usually suffices.
* `removebuff` triggered when a buff is removed.
* `removedebuff` triggered when a debuff is removed.
* `removebuffstack` triggered when a buff stack is removed.
* `removedebuffstack` triggered when a debuff stack is removed.
* `summon` ???
* `create` ???
* `death` probably triggered by deaths...
* `destroy` ???
* `extraattacks` ???
* `aurabroken` ???
* `dispel` ???
* `interrupt` ???
* `steal` ???
* `leech` ???
* `energize` triggered when an effect gives resources (e.g. Mana from Blessing of Wisdom).
* `drain` triggered when an effect drains resources (e.g. the extra Energy spend for Ferocious Bite)
* `resurrect` ???
* `encounterstart` never triggered as we filter by selected player's actor id and this has no actor id. Use `on_initialized()` instead.
* `encounterend` never triggered as we filter by selected player's actor id and this has no actor id. Use `on_finished()` instead.

Please update this list if you find something new and interesting.
