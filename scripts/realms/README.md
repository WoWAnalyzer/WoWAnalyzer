# How to update realms

1. Get the realm list from each region's API url.
2. Make a request for each region and save them to `/scripts/realms/data`.
   - RETAIL
     - EU: https://eu.api.blizzard.com/data/wow/realm/index?namespace=dynamic-eu&locale=ru_RU&access_token=
       - Note: The Russian locale (ru_RU) is used for EU realms. This generates Russian names for Russian realms while leaving the other realms in their original locale.
     - KR: https://kr.api.blizzard.com/data/wow/realm/index?namespace=dynamic-kr&locale=ko_KR&access_token=
     - TW: https://tw.api.blizzard.com/data/wow/realm/index?namespace=dynamic-tw&locale=zh_TW&access_token=
     - US: https://us.api.blizzard.com/data/wow/realm/index?namespace=dynamic-us&locale=en_US&access_token=
     - CN: The WoW API is not available for Chinese realms. Assuming the realm list from gamepedia is up to date:
       - Open https://wow.gamepedia.com/Realms_list
       - Execute the snippet below in your browsers console
       - Paste the output into the data/CN.json file
   - CLASSIC
     - EU: https://eu.api.blizzard.com/data/wow/realm/index?namespace=dynamic-classic-eu&locale=ru_RU&access_token=
     - KR: https://kr.api.blizzard.com/data/wow/realm/index?namespace=dynamic-classic-kr&locale=ko_KR&access_token=
     - TW: https://tw.api.blizzard.com/data/wow/realm/index?namespace=dynamic-classic-tw&locale=zh_TW&access_token=
     - US: https://us.api.blizzard.com/data/wow/realm/index?namespace=dynamic-classic-us&locale=en_US&access_token=
3. Run `node reformatRealms.js`
4. A file `output.js` will be generated with the data we need
5. Paste the content of `output.js` into `/src/game/REALMS.js`

Code snippet for Chinese realms:

```js
const realms = { realms: [] };
document.querySelectorAll('ul>li>a').forEach(function (elem, index) {
  if (
    elem.getAttribute('href').includes('_China') &&
    !elem.innerText.toString().includes('Servers in China')
  ) {
    const text = elem.innerText;
    const realmName = text.replace(/ *\([^)]*\) */g, '').trim();
    realms.realms.push({
      name: realmName,
      slug: realmName,
    });
  }
});

console.info(JSON.stringify(realms));
```
