# How to update realms

1. Get the realm list from 
2. Make a request for each region and save them in the data folder
   - Use locales:
     - For EU realms you need to export using the Russian locale (ru_RU). This will use the Russian names for the Russian realm while leaving the other realms in their original locale.
    - EU: https://eu.api.blizzard.com/data/wow/realm/index?namespace=dynamic-eu&locale=ru_RU&access_token=
    - KR: https://kr.api.blizzard.com/data/wow/realm/index?namespace=dynamic-kr&locale=ko_KR&access_token=
    - TW: https://tw.api.blizzard.com/data/wow/realm/index?namespace=dynamic-tw&locale=zh_TW&access_token=
    - US: https://us.api.blizzard.com/data/wow/realm/index?namespace=dynamic-us&locale=en_US&access_token=
   - Since a WoW API for CN realms isn't available we need to get our list from somewhere else. We assume that the realm list from gamepedia is up to date.
        - open https://wow.gamepedia.com/Realms_list 
        - execute the snippet below in your browsers console 
        - paste the output into the data/CN.json file 
    ```
    const realms = { realms: [] };
    document.querySelectorAll('ul>li>a').forEach(function(elem, index) {
        if (elem.getAttribute('href').includes('_China') &&!elem.innerText.toString().includes('Servers in China')) {
            const text = elem.innerText;
            const realmName = text.replace(/ *\([^)]*\) */g, "").trim();
            realms.realms.push({
                name: realmName,
                slug: realmName,
            });
        }
    });

    console.info(JSON.stringify(realms));
    ```
   
3. Run `node reformatRealms.js`
4. A file `output.js` will be generated with the data we need
5. Paste the content of `output.js` into `/src/common/REALMS.js`
