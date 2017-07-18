'use strict';

const assertInput = (requirements, input) => {
  return requirements.find(requirement => Object.keys(input).indexOf(requirement) === -1 || input[requirement] === null);
};

module.exports = { assertInput };
