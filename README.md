#LogDNA Challenge
Good user experience is core to what we do here at LogDNA. So we try to build features that taylor to our user's needs. In many cases, this means making these features flexible, or susceptable to human error. In this particular challenge, we are looking to improve user experience by doing some parsing of search terms for JSON fields.

Today, we do automatic parsing of JSON data upon ingestion. This allows the data to be searched on by JSON field names. However, we are still fairly primitive in this area. We would like to be better at this, and we will, but let's see if you're up to the task first.

In order for our search to run, we need to translate plain text queries into some form of JSON format that can then be consumed by services to perform search or filtering down the line. In this challenge, your job is to write a REST API service that takes as input a plain text string and as output generates a JSON that describes the search rule.

Search rules:
- terms are implicitly AND'd together unless quoted
- terms are implicitly an exact match
- multiple search terms can be nested using ()'s
- negation can be done using ! in front of search term
- OR'ing search terms can be done by explicitly using "OR" keyword
- AND'ing search terms can optionally be done by explicitly using "AND" keyword
- using '>', '>=', '<', '=<' denotes a non exact match on the term following respective symbol
- using '=' denotes an exact match on the term following respective symbol
- len(#) will allow us to match length of JSON data instead of actual value
- 'true', 'false' will be matched to their boolean values instead of string values

Some example input/outputs:

:error OR info
> { "$or": ["error", "info"] }

:>400 <500
> { "$and": [   
    { "$gt": "400" }
  , { "$lt": "500" }
] }

:="TEST DATA" OR >len(9)
> { "$or" [
    {
        "$eq": {
            "$quoted": "TEST DATA"
        }
    }, {
        "$gt": {
            "$len": 9
        }
    }
] }

:!false
> { "$not": false }

## Set up
- Run `npm install`
- Goto `config/config.js` and set the port
- Run `npm start`
- GET `/convert/?query=str` where str is the string query


## Restraints
- ` OR ` and ` AND ` MUST be padded with a single space
   - invalid: `"Hello    AND    World"` , `HelloANDWorld`
   - valid: `Hello AND World`
- Quotes must be pairs and be DOUBLE quotes
   - invalid: `Hello  AND  World"`, `'Hello' World`
   - valid: `"Hello AND World"`
- To search for the words "AND" or "OR", you must enclose them in quotes
   - invalid: `Hello AND OR`
   - valid: `Hello AND "OR"`
- If you use ` AND ` explicitly, then you must every time
   - invalid: `Hello AND World Goodbye`
   - valid: `Hello AND World AND Goodbye`, `Hello World Goodbye`
- No padding for parentheses
   - invalid: `( "Hello AND World ) OR ("hi" )`
   - valid: `(Hello AND World) OR ("hi")`
- Do not use `%20` or `%30` anywhere in queries as these are reserved for parsing purposes

## Tests
Load the `LogDNA%20Challenge%20Tests.postman_collection.json` into Postman and run the test cases. It includes the ones listed above and a couple more to show how efficiently it can deal with extremely nested strings.



