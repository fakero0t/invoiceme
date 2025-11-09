/**
 * Artillery processor for generating dynamic test data
 */

module.exports = {
  generateRandomString,
  generateRandomNumber,
  generateFutureDate,
};

function generateRandomString(context, events, done) {
  context.vars.randomString = Math.random().toString(36).substring(7);
  return done();
}

function generateRandomNumber(context, events, done) {
  context.vars.randomNumber = Math.floor(Math.random() * 10000);
  return done();
}

function generateFutureDate(context, events, done) {
  const future = new Date();
  future.setDate(future.getDate() + 30);
  context.vars.futureDate = future.toISOString();
  return done();
}

