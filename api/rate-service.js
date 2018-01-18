const average = (data) => {
  const sum = data.reduce((total, value) => total + value, 0);
  const avg = sum / data.length;
  return avg;
};

const standardDeviation = (values) => {
  const avg = average(values);

  const squareDiffs = values.map((value) => {
    const diff = value - avg;
    const sqrDiff = diff * diff;
    return sqrDiff;
  });

  const avgSquareDiff = average(squareDiffs);

  const stdDev = Math.sqrt(avgSquareDiff);
  return stdDev;
};

const getSystemRating = (prices, rate, yourPrice) => {
  const mean = average(prices);
  const stdDev = standardDeviation(prices);
  const minPrice = mean - stdDev;
  const maxPrice = mean + stdDev;
  let newRate = rate;

  if (minPrice > yourPrice) {
    const percentage = yourPrice / minPrice;
    newRate = percentage * rate;
  }

  if (maxPrice < yourPrice) {
    newRate = 5;
  }

  return newRate;
};

module.exports = { getSystemRating };
