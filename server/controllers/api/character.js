import Express from 'express';
import Sequelize from 'sequelize';
import Raven from 'raven';
import { StatusCodeError } from 'request-promise-native/errors';

import WowCommunityApi from 'helpers/WowCommunityApi';

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
  const response = await WowCommunityApi.fetchCharacter(region, realm, name);
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
}
async function getStoredCharacter(id, realm, region, name) {
  if (id) {
    return Character.findByPk(id);
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

async function fetchCharacter(region, realm, name, res = null) {
  try {
    // noinspection JSIgnoredPromiseFromCall Nothing depends on this, so it's quicker to let it run asynchronous
    const charFromApi = await getCharacterFromBlizzardApi(region, realm, name);
    if (res) {
      sendJson(res, charFromApi);
    }
    if (charFromApi && charFromApi.thumbnail) {
      const [, characterId] = characterIdFromThumbnailRegex.exec(charFromApi.thumbnail);
      // noinspection JSIgnoredPromiseFromCall Nothing depends on this, so it's quicker to let it run asynchronous
      storeCharacter({ id: characterId, ...charFromApi });
    } else {
      throw new Error('Corrupt response received');
    }
  } catch (error) {
    const { statusCode, message, response } = error;
    console.log('Error fetching character', statusCode, message);
    if (!res) {
      return;
    }
    const body = response ? response.body : null;
    // Ignore 404 - Character not found errors. We check for the text so this doesn't silently break when the API endpoint changes.
    const isCharacterNotFoundError = statusCode === 404 && body && body.includes('Character not found.');
    if (isCharacterNotFoundError) {
      send404(res);
    } else {
      Raven.installed && Raven.captureException(error);
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.status(statusCode || 500);
      sendJson(res, {
        error: 'Blizzard API error',
        message: body || message,
      });
    }
  }
}

const characterIdFromThumbnailRegex = /\/([0-9]+)-/;

const router = Express.Router();

router.get('/:id([0-9]+)', async (req, res) => {
  const { id } = req.params;
  const character = await getStoredCharacter(id);
  if (!character) {
    // No character found, and we can't find a character by just its id, so this is all we can do.
    send404(res);
    return;
  }

  // Match found, send cached info and then refresh.
  sendJson(res, character);

  // noinspection JSIgnoredPromiseFromCall
  fetchCharacter(character.region, character.realm, character.name);
});
router.get('/:region([A-Z]{2})/:realm([^/]{2,})/:name([^/]{2,})', async (req, res) => {
  const { region, realm, name } = req.params;

  const storedCharacter = await getStoredCharacter(null, realm, region, name);

  let responded = false;
  //checking if thumbnail exists in cache here because Parses.js will throw up without it here
  //If it's not here then it's better to wait on the API call to come back
  if (storedCharacter && storedCharacter.thumbnail) {
    sendJson(res, storedCharacter);
    responded = true;
  }

  // noinspection JSIgnoredPromiseFromCall
  fetchCharacter(region, realm, name, !responded ? res : null);
});
router.get('/:id([0-9]+)/:region([A-Z]{2})/:realm([^/]{2,})/:name([^/]{2,})', async (req, res) => {
  const { id, region, realm, name } = req.params;
  const storedCharacter = await getStoredCharacter(id);
  let responded = false;
  if (storedCharacter) {
    sendJson(res, storedCharacter);
    responded = true;
  }

  // noinspection JSIgnoredPromiseFromCall
  fetchCharacter(region, realm, name, !responded ? res : null);
});

export default router;
