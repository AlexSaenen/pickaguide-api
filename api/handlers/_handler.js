'use strict';


class Handler {

  static assertInput(requirements, input) {
    return requirements.find(requirement => Object.keys(input).indexOf(requirement) === -1 || input[requirement] === null);
  }
}

exports.Handler = Handler;
