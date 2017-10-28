
// Get required modules
var convert = require('../helpers/convert');
var express = require('express');
var router  = express.Router();

// GET a json conversion for string
// @params
//   - query : The string query to be parsed
// @returns
//   - {json} : A json object
router.get('/', function(req, res, next) {
	res.json(convert.parse(req.query.query));
});

module.exports = router;