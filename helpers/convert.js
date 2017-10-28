// Get required modules
var _ = require('underscore');

// Convert to length 
// @params
//   - length : The length given
// @returns
//   - {json} : A json object
function convert_len(length) {
	var len = {
		"$len": length
	};
	return len;
};

// Convert to greater than 
// @params
//   - value : The string query to be parsed
// @returns
//   - {json} : A json object
function convert_gt(value) {
	var gt = {
		"$gt" : value
	};
	return gt;
};

// Convert to greater than or equal to 
// @params
//   - value : The string query to be parsed
// @returns
//   - {json} : A json object
function convert_gte(value) {
	var gte = {
		"$gte" : value
	};
	return gte;
};

// Convert to less than or equal to 
// @params
//   - value : The string query to be parsed
// @returns
//   - {json} : A json object
function convert_lte(value) {
	var lte = {
		"$lte" : value
	};
	return lte;
};

// Convert to equal to 
// @params
//   - value : The string query to be parsed
// @returns
//   - {json} : A json object
function convert_eq(value) {
	var eq = {
		"$eq" : value
	};
	return eq;
};

// Convert to less than 
// @params
//   - value : The string query to be parsed
// @returns
//   - {json} : A json object
function convert_lt(value) {
	var lt = {
		"$lt" : value
	};
	return lt;
};

// Convert to quote 
// @params
//   - quote : The string quote
// @returns
//   - {json} : A json object
function convert_quote(quote) {
	var quoted = {
		"$quoted": decode_quote(quote)
	};
	return quoted;
};

// Convert to and 
// @params
//   - values : And array of strings to be parsed
// @returns
//   - {json} : A json object
function convert_and(values) {
	var and = {
		"$and": _.map(values, convert)
	};
	return and;
};

// Convert to or 
// @params
//   - values : And array of strings to be parsed
// @returns
//   - {json} : A json object
function convert_or(values) {
	var or = {
		"$or": _.map(values, convert)
	};
	return or;
};

// Convert to not 
// @params
//   - value : The string query to be parsed
// @returns
//   - {json} : A json object
function convert_not(value) {
	var not = {
		"$not": value
	};
	return not;
};

// Checks for the following in order:
//   - quotes
//   - not statements
//   - < <= > >= =
//   - len()
//   - true or false booleans
// Continues parsing process based on what is needed
// @params
//   - x : The string to be parsed
// @returns
//   - {json} : A json object
function process(x) {

	// Check for quotes
	if (x[0] == '"') {
		var temp = x.substring(1)
		temp = temp.substring(0,temp.indexOf('"'));
		// Note, quotes are not processed!
		return convert_quote(temp);
	}

	// Check for $not
	if(x[0] == '!'){
		return convert_not(convert(x.substring(1)))
	}

	// Check for $lt, $lte, $gt, $gte, and $eq
	switch(x[0]) {
	    case '<':
	    	if ( x[1] && x[1] == '='){
	    		return convert_lte(convert(x.substring(2)));
	    		break;
	    	}
	        return convert_lt(convert(x.substring(1)))
	        break;
	    case '>':
	    	if ( x[1] && x[1] == '='){
	    		return convert_gte(convert(x.substring(2)));
	    		break;
	    	}
	        return convert_gt(convert(x.substring(1)))
	        break;
	    case '=':
	        return convert_eq(process(x.substring(1)))
	        break;
	}

	// Check for len()
	if(/^len/.test(x)){
		// extract from parenthesis
		return convert_len(process(x.substring(4,5)))
	}

	// Check for true false
	if (/^true$/.test(x))
		return true
	if (/^false$/.test(x))
		return false

	return x
};

// Handles queries separated by AND, OR, or spaces
// @params
//   - x : The string to be parsed
// @returns
//   - {json} : A json object
function convert(x) {
	// Remove all encoding on parenthesis
	x = decode_parenthesis(x);

	// Catch any deeper nested parenthesis
	x = encode_parenthesis(x);

	// Encode all quotes to make it easier to parse quotes
	x = encode_quotes(x);

	// If enclosed in parenthesis, restart process in side this branch
	if (/^\(.*?\)$/.test(x) ) {
		return parse(x)
	}

	// For OR
	if (/ OR /.test(x)){
		var parsed = x.split(' OR ');
		return convert_or(parsed);
	}

	// For AND
	if (/ AND /.test(x)){
		var parsed = x.split(' AND ');
		return convert_and(parsed);
	}

	// If single item
	var parsed = x.split(' ');
	if (parsed.length == 1) {
		return process(parsed[0]);
	}

	// For spaces
	return convert_and(parsed);

};

// Starts conversion process
// This function handles parenthesis
// @params
//   - x : The string to be parsed
// @returns
//   - {json} : A json object
function parse(x) {
	// Encode all parentheses to make it easier to parse them
	x = encode_parenthesis(x);

	// For OR
	if (/ OR /.test(x)){
		var parsed = x.split(' OR ');
		return convert_or(parsed);
	}

	// For AND
	if (/ AND /.test(x)){
		var parsed = x.split(' AND ');
		return convert_and(parsed);
	}

	// For single item
	var parsed = x.split(' ');
	if (parsed.length == 1) {
		// Check for parenthesis in single item and remove them
		if ( /\(/.test( x ) ){
			var mar = parsed.match( /\((.*?)\)/g );
			parsed = mar[0]
		}
		return process(parsed[0]);
	}

	// For spaces
	return convert_and(parsed);
}

// Encode quotes 
// Removes spaces in quotes to aid parsing
// ex:
// "Hello World" -> "Hello%20World"
// @params
//   - x : The string to be encoded
// @returns
//   - {json} : A json object
function encode_quotes(x) {
	if ( /"/.test( x ) ){
		var mar = x.match( /"(.*?)"/g );
		for (var i = 0 ; i < mar.length ; i++)
	    	x = x.replace(mar[i],mar[i].split(" ").join("%20"));
	}
	return x;
};

// Decode quotes 
// Add spaces back to quotes
// ex:
// "Hello%20World" -> "Hello World"
// @params
//   - x : The string to be decoded
// @returns
//   - {json} : A json object
function decode_quote(x) {
	return x.split("%20").join(" ");
};

// Encode parentheses 
// Removes spaces in parentheses to aid parsing
// ex:
// "Hello AND World" -> "(Hello%3AND%30World)"
// @params
//   - x : The string to be encoded
// @returns
//   - {json} : A json object
function encode_parenthesis(x) {
	if ( /\(/.test( x ) ){
		var mar = x.match( /\((.*?)\)/g );
		for (var i = 0 ; i < mar.length ; i++)
			x = x.replace(mar[i],mar[i].split(" ").join("%30"));
	}
	return x;
}

// Decode parentheses 
// Add spaces back to parentheses and remove parentheses
// ex:
// "(Hello%3AND%30World)" -> "Hello AND World"
// @params
//   - x : The string to be decoded
// @returns
//   - {json} : A json object
function decode_parenthesis(x) {
	// If enclosed in parenthesis, remove them
	if (/^\(.*?\)$/.test(x) ) {
		x = x.substring(1,x.length-1)
	}
	return x.split("%30").join(" ");
};

module.exports = {
	parse: parse
}
