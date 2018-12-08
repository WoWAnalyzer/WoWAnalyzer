import Express from 'express';
import Sequelize from 'sequelize';
import Raven from 'raven';

import { fetchItem as fetchItemfromBattleNet } from 'helpers/wowCommunityApi';

import models from '../../models';

const Item = models.Item;

/**
 * Fetches Item info(name and icon) from the battle net API.
 * After fetching from API it'll store in MySQL DB in order to reduce the number of calls to the battle net API
 * and reduce latency on subsequent calls
 */

function sendJson(res, json) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.send(json);
}
async function proxyItemApi(res, region, itemId) {
  try {
    console.log('Fetching item from Battle.net');
    const start = Date.now();
    const response = await fetchItemfromBattleNet(region, itemId);
    const responseTime = Date.now() - start;
    console.log('Battle.net response time:', responseTime, 'ms');
    const json = JSON.parse(response);
    sendJson(res, json);
    return json;
  } catch (error) {
    const { statusCode, message, response } = error;
    console.log('Error fetching item', statusCode, message);
    const body = response ? response.body : null;
    // Ignore 404 - Item not found errors. We check for the text so this doesn't silently break when the API endpoint changes.
    // Example boody of good 404:
    // {
    //   "status": "nok",
    //   "reason": "Unable to get item information."
    // }
    const isItemNotFoundError = statusCode === 404 && body && body.includes('Unable to get item information.');
    if (!isItemNotFoundError) {
      Raven.installed && Raven.captureException(error);
    }
    res.status(statusCode || 500);
    sendJson(res, body);
    return null;
  }
}
async function storeItem({ id, name, icon }) {
  await Item.upsert({
    id,
    name,
    icon,
    lastSeenAt: Sequelize.fn('NOW'),
  });
}

const router = Express.Router();
router.get('/:region([A-Z]{2})/:id([0-9]+)', async (req, res) => {
  const { region, id } = req.params;
  let item = await Item.findById(id);
  if (item) {
    res.send(item);
    item.update({
      lastSeenAt: Sequelize.fn('NOW'),
    });
  } else {
    item = await proxyItemApi(res, region, id);
    storeItem(item);
  }
});
export default router;
