import Express from 'express';
import Sequelize from 'sequelize';
import Raven from 'raven';

import { fetchSpell as fetchSpellfromBattleNet } from 'helpers/wowCommunityApi';

import models from '../../models';

const Spell = models.Spell;

/**
 * Fetches Spell info(name and icon) from the battle net API.
 * After fetching from API it'll store in MySQL DB in order to reduce the number of calls to the battle net API
 * and reduce latency on subsequent calls
 */

function sendJson(res, json) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.send(json);
}
async function proxySpellApi(res, region, spellId) {
  try {
    console.log('Fetching Spell from Battle.net');
    const start = Date.now();
    const response = await fetchSpellfromBattleNet(region, spellId);
    const responseTime = Date.now() - start;
    console.log('Battle.net response time:', responseTime, 'ms');
    const json = JSON.parse(response);
    sendJson(res, json);
    return json;
  } catch (error) {
    const { statusCode, message, response } = error;
    console.log('Error fetching Spell', statusCode, message);
    const body = response ? response.body : null;
    // Ignore 404 - Spell not found errors. We check for the text so this doesn't silently break when the API endpoint changes.
    const isCharacterNotFoundError = statusCode === 404 && body && body.includes('Unable to get spell information.');
    if (!isCharacterNotFoundError) {
      Raven.installed && Raven.captureException(error);
    }
    res.status(statusCode || 500);
    sendJson(res, body);
    return null;
  }
}
async function storeSpell({ id, name, icon }) {
  await Spell.upsert({
    id,
    name,
    icon,
    lastSeenAt: Sequelize.fn('NOW'),
  });
}

const router = Express.Router();
router.get('/:region([A-Z]{2})/:id([0-9]+)', async (req, res) => {
  const { region, id } = req.params;
  let spell = await Spell.findById(id);
  if (spell) {
    res.send(spell);
    spell.update({
      lastSeenAt: Sequelize.fn('NOW'),
    });
  } else {
    spell = await proxySpellApi(res, region, id);
    storeSpell(spell);
  }
});
export default router;
