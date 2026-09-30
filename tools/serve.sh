#!/bin/sh
# Serve dist on :8766 for the length of one command, then stop: tools/serve.sh node tools/test33-batch7.mjs
cd "$(dirname "$0")/.."
python3 -m http.server 8766 --bind 127.0.0.1 --directory dist >/dev/null 2>&1 &
S=$!
until curl -s -o /dev/null http://127.0.0.1:8766/; do :; done
"$@"; R=$?
kill $S
exit $R
