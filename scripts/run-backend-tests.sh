#!/bin/bash
FILES=test/*.test.js
CMD="echo \"Running backend tests\"";
for f in $FILES
do
  CMD="$CMD && PORT=3000 ./node_modules/.bin/mocha-es6 $f --timeout 10000"
done

eval $CMD
