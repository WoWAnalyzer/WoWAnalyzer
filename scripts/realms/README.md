# How to update realms

1. Get the realm list from https://us.api.battle.net/wow/realm/status?locale=en_US&apikey=
2. Make a request for each region and save them in the data folder
   - For EU realms you need to export using the Russian locale (ru_RU). This will use the Russian names for the Russian realm while leaving the other realms in their original locale.
3. Run `node reformatRealms.js`
4. A file `output.js` will be generated with the data we need
