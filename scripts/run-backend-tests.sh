#!/bin/bash
FILES=test/*.test.js
CMD="echo \"Running backend tests\"";
for f in $FILES
do
  CMD="$CMD && PORT=3001 ./node_modules/.bin/mocha $f --timeout 10000"
done

eval $CMD
