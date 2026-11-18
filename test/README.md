# Browser tests

Each `*.test.mjs` checks one area of the map in Chrome and prints `PASS` or `FAIL` per check.

```
cd test
npm install            # puppeteer-core only; Chrome is not downloaded
node run.mjs           # all
node run.mjs search    # only files whose names contain one of the words
```

`run.mjs` rebuilds `dist/outheis-map.html` first. Needs Python 3 and Chrome or Chromium
(`CHROME=/path/to/chrome`, default `/usr/bin/google-chrome`). Screenshots go to a temporary
folder named at the end.
