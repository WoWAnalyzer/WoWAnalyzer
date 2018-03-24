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
        [Sequelize.literal('UNIX_TIMESTAMP() DIV 60 - UNIX_TIMESTAMP(createdAt) DIV 60'), 'minutesAgo'],
      ],
      group: [
        // This rounds down (since integer division) and being based around EPOCH the result will never change. This is better than using GROUP BY DAY,HOUR,MINUTE since this seems to change based on the current seconds.
        Sequelize.literal('UNIX_TIMESTAMP(createdAt) DIV 60'),
      ],
      where: {
        createdAt: {
          [Sequelize.Op.gt]: Sequelize.fn('DATE_SUB', Sequelize.fn('NOW'), Sequelize.literal('INTERVAL 7 DAY')),
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
