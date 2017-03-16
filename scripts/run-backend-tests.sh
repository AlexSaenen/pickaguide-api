#!/bin/bash
FILES=$(find test -type f -name '*.test.js')
CMD="echo \"Running backend tests\"";
for f in $FILES
do
  CMD="$CMD && PORT=3030 ./node_modules/.bin/mocha --full-trace --compilers js:babel-core/register $f --timeout 10000"
done

eval $CMD
