'use strict';

const jwt = require('jsonwebtoken');
const _ = require('lodash');

class Handler {
  static assertInput(requirements, input) {
    return requirements.find((requirement) => {
      return Object.keys(input).indexOf(requirement) === -1 || input[requirement] === null;
    });
  }

  static getIdFromToken(token) {
    const decodedToken = jwt.decode(token);
    const splitToken = _.split(decodedToken, ' ');

    if (splitToken.length < 3) {
      throw new Error('Missing attribute in the web token');
    } else {
      return splitToken[2];
    }
  }
}

exports.Handler = Handler;
