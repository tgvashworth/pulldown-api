# pulldown-api

```
GET /urls/:identifier

[ ':url', ':url', ... ]
```

```javascript
var pda = require('pulldown-api');

pda.get('jquery', function (err, urls) {
  /// urls === [ '//...' ]
});

pd.urls('backboneapp', function (err, urls) {
  // urls === ['//...', '//...', '//...' ]
});
```