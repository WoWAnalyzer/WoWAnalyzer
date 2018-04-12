/**
 * This mocks the Express library to make it testable with just mocking and regular code. No requests (faking) required.
 *
 * This way we can easily test handlers by mocking request and response properties and testing their calls like you'd do with any other JS code. This way we can test the code we want to test without having to go through all middlewares and feeding them accordingly. For example PassportJS can be worked around by mocking with the `user` property instead of having to do some complicated authentication not relevant to the code being tested.
 *
 * A downside of this approach compared to doing fake requests is that fake requests would also test the integration of the middleware and Express, possibly revealing middleware that doesn't interact well together. I don't think this should be the goal of a *unit* test though. The middleware (and Express) should be tested separetely, and then the entire thing should be tested with all app-wide middleware included (defined in the server/index file).
 *
 * This mock is currently extremely basic, the idea is to expand it as needed instead of fleshing a large part out that we might never need.
 */

const express = jest.genMockFromModule('express');

const routers = [];
express.Router = jest.fn(() => {
  // TODO: Make the router's base a fully mocked version of the actual returned router from Express
  const router = {
    get: jest.fn((path, ...args) => {
      const middleware = [...args];
      const action = middleware.pop();
      express.__paths[path] = {
        middleware,
        action,
      };
    }),
  };
  routers.push(router);
  return router;
});
express.__lastRouter = () => {
  return routers[this.routers.length - 1];
};
express.__paths = {};

export default express;
