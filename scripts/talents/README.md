# How to update talents

1. Go to https://dev.battle.net
2. Create a Mastery account (whatever that is... just make an account there)
3. Go to https://dev.battle.net/io-docs
4. Set API to US
5. Expand the data resources API "talents /wow/data/talents"
6. Hit "Try it!"
7. Click "Select content" and press CTRL-C to copy (note this might take some time during which CTRL-V will paste your previous output, be patient)
8. Be patient
9. CTRL-V in talents.json
10. run `node generateTalents.js` in this directory
