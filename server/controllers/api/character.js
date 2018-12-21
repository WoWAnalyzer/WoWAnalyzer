import Express from 'express';
import Sequelize from 'sequelize';
import Raven from 'raven';

import { fetchCharacter as fetchCharacterFromBattleNet } from 'helpers/wowCommunityApi';

import models from '../../models';

const Character = models.Character;

/**
 * Handle requests for character information, and return data from the Blizzard API.
 *
 * This takes 3 formats since at different points of the app we know different types of data:
 *
 * When we are in a Warcraft Logs report that was exported for rankings, we have a character id and the region, realm and name of the character. In that case we call:
 * /140165460/EU/Tarren Mill/Mufre - exported fights
 * This will create a new character with all that data so it can be discovered if we only have partial data. It will then send the battle.net character data.
 *
 * When we are in a Warcraft Logs report that hasn't been exported yet (this primarily happens during prime time where the WCL export queue is slow), we only have a character id. We try to fetch the character info in the hopes that it was stored in the past:
 * /140165460 - unexported fights
 * This will look for the character data by the character id. If it doesn't exist then return 404. If it does exist it will send the battle.net character data.
 *
 * The final option is when the user enters his region, realm and name in the character search box. Then we don't have the character id and call:
 * /EU/Tarren Mill/Mufre - character search
 * This will skip looking for the character and just send the battle.net character data.
 *
 * The caching stratagy being used here is to always return cached data first if it exists. then refresh in the background
 */
function sendJson(res, json) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.send(json);
}
function send404(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.sendStatus(404);
}

async function getCharacterFromBlizzardApi(region, realm, name) {
  try {
    console.log('Fetching character from Battle.net');
    const start = Date.now();
    const response = await fetchCharacterFromBattleNet(region, realm, name);
    const responseTime = Date.now() - start;
    console.log('Battle.net response time:', responseTime, 'ms');
    const data = JSON.parse(response);
    // This is the only field that we need and isn't always otherwise obtainable (e.g. when this is fetched by character id)
    // eslint-disable-next-line prefer-const
    const { talents, ...other } = data;
    let json = { region, ...other };
    if (talents) {
      const selectedSpec = talents.find(e => e.selected);
      json = {
        ...json,
        spec: selectedSpec.spec.name,
        role: selectedSpec.spec.role,
        talents: selectedSpec.calcTalent,
      };
    }
    return json;
  } catch (error) {
    const { statusCode, message, response } = error;
    console.log('Error fetching character', statusCode, message);
    const body = response ? response.body : null;
    // Ignore 404 - Character not found errors. We check for the text so this doesn't silently break when the API endpoint changes.
    const isCharacterNotFoundError = statusCode === 404 && body && body.includes('Character not found.');
    if (!isCharacterNotFoundError) {
      Raven.installed && Raven.captureException(error);
    }
    return null;
  }
}
async function getStoredCharacter(id, realm, region, name) {
  if (id) {
    return Character.findById(id);
  }
  if (realm && name && region) {
    return Character.findOne({
      where: {
        name,
        region,
        realm,
      },
    });
  }
  return null;
}

async function storeCharacter(char) {
  await Character.upsert({
    ...char,
    lastSeenAt: Sequelize.fn('NOW'),
  });
}

const characterIdFromThumbnailRegex = /\/([0-9]+)-/;

const router = Express.Router();

router.get('/:id([0-9]+)', async (req, res) => {
  const character = await getStoredCharacter(req.params.id);
  if (!character) {
    send404(res);
    return;
  }
  sendJson(res, character);
  const charFromApi = await getCharacterFromBlizzardApi(character.region, character.realm, character.name);
  character.update({
    ...charFromApi,
    lastSeenAt: Sequelize.fn('NOW'),
  });
});

router.get('/:region([A-Z]{2})/:realm([^/]{2,})/:name([^/]{2,})', async (req, res) => {
  const { region, realm, name } = req.params;

  const storedCharacter = await getStoredCharacter(null, realm, region, name);
  if (storedCharacter) {
    sendJson(res, storedCharacter);
  }

  const characterFromApi = await getCharacterFromBlizzardApi(region, realm, name);
  if (!storedCharacter && !characterFromApi) {
    send404(res);
    return;
  } else if (!storedCharacter && characterFromApi) {
    sendJson(res, characterFromApi);
    if (characterFromApi.thumbnail) {
      const [, characterId] = characterIdFromThumbnailRegex.exec(characterFromApi.thumbnail);
      // noinspection JSIgnoredPromiseFromCall Nothing depends on this, so it's quicker to let it run asynchronous
      storeCharacter({ id: characterId, ...characterFromApi });
    }
    return;
  }

  if (storeCharacter && characterFromApi) {
    storedCharacter.update({
      ...characterFromApi,
      lastSeenAt: Sequelize.fn('NOW'),
    });
    return;
  }
});

router.get('/:id([0-9]+)/:region([A-Z]{2})/:realm([^/]{2,})/:name([^/]{2,})', async (req, res) => {
  const { id, region, realm, name } = req.params;
  const storedCharacter = await Character.findById(req.params.id);
  if (storedCharacter) {
    sendJson(res, storedCharacter);
  }

  // noinspection JSIgnoredPromiseFromCall Nothing depends on this, so it's quicker to let it run asynchronous
  const charFromApi = await getCharacterFromBlizzardApi(region, realm, name);

  if (charFromApi && !storedCharacter) {
    sendJson(res, charFromApi);
    storeCharacter({ id, ...charFromApi });
    return;
  }
  if (storedCharacter && charFromApi) {
    storedCharacter.update({ 
      ...charFromApi, 
      lastSeenAt: Sequelize.fn('NOW'),
    });
  }
  if (!storedCharacter && !charFromApi) {
    send404(res);
    return;
  }
});

export default router;
