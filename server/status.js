import Sequelize from 'sequelize';
import models from './models';

const WclApiResponse = models.WclApiResponse;

class ApiController {
  static handle(req, res) {
    const handler = new ApiRequestHandler(req, res);

    // Set header already so that all request, good or bad, have it
    res.setHeader('Access-Control-Allow-Origin', '*');

    handler.handle();
  }
}

class ApiRequestHandler {
  req = null;
  res = null;

  constructor(req, res) {
    this.req = req;
    this.res = res;
  }

  async handle() {
    // TODO: Add an `updatedAt` column that is refreshed when
    const results = await WclApiResponse.findAll({
      attributes: [
        [Sequelize.fn('COUNT', Sequelize.col('wclResponseTime')), 'numRequests'],
        [Sequelize.fn('AVG', Sequelize.col('wclResponseTime')), 'avgResponseTime'],
        [Sequelize.fn('MAX', Sequelize.col('wclResponseTime')), 'maxResponseTime'],
        [Sequelize.fn('TIMESTAMPDIFF', Sequelize.literal('MINUTE'), Sequelize.col('createdAt'), Sequelize.fn('NOW')), 'minutesAgo'],
      ],
      group: [
        Sequelize.fn('DAY', Sequelize.col('createdAt')),
        Sequelize.fn('HOUR', Sequelize.col('createdAt')),
        Sequelize.fn('MINUTE', Sequelize.col('createdAt')),
      ],
      where: {
        'createdAt': {
          $gt: Sequelize.fn('DATE_SUB', Sequelize.fn('NOW'), Sequelize.literal('INTERVAL 24 HOUR')),
        },
      },
    });
    this.sendJson(results);
  }

  sendJson(json) {
    this.res.setHeader('Content-Type', 'application/json; charset=utf-8');
    this.res.send(json);
  }
}

export default ApiController.handle;
