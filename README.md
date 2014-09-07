# Pulldown API

Registry for [pulldown](https://github.com/jackfranklin/pulldown).

Add a set or alias by **submitting a pull request**.

## Endpoints

Method | URL | Description
---|---|---
GET | `/` | Get the current registry object
GET | `/set/:identifier` | Get the set for a given identifier. This will be a list of further identifiers or URLs.

## Terminology

Name | Description
---|---
Identifier | String used to identify a URL, alias or set.
Alias | An identifier that refers to another identifier in the registry. For example, `underscore` points to `underscore.js`.
Set | An array of identifiers or URLs.

## What it does

The Pulldown API is accessed when `pulldown` fails to resolve an identifier (say, `jquery`) to a URL locally. It checks its registry for a URL, alias or set associated with that identifier.

If it is found in the registry, a set is sent back to the client.

If it's not, the API searches CDNJS for a matching identifier. If it finds it, it returns a set containing the matched URL. Otherwise it returns a `404` with an empty set.

## Testing

To run the tests:

```
$ foreman start -p 9005
```

In another tab:

```
$ npm test
```

## License

MIT
