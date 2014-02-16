var faker = require('Faker'),
	q = require('q'),
	mysql = require('mysql');


//TODO mimick mysql command parameters.
//Command line parameters should take precedence to a config file,
//However I would like the config to match mite.config

var connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	database: 'directorpoint',
	password: '',
	debug:false,
	waitForConnections: false
});


connection.connect();

var query = function(sql, parameters, connection) {
	try {
		var deferred = q.defer();
		connection.on("error", function(err) {
			console.log('db error', err);
			return q.reject(err);
		})
		connection.query(sql, parameters, function(err, result) {
			if (err) {
				return deferred.reject(err)
			}
			deferred.resolve(result);
		});
		return deferred.promise;
	} catch (err) {
		console.log(err)
		return q.reject(err);
	}
}

var schema = {};
query("SHOW TABLES", [], connection).then(function(tables) {
	return tables.map(function(obj) {
		var tbl = obj[Object.keys(obj)[0]];
		return tbl;
	})
}).then(function(tables) {
	var queries = tables.map(function(tbl) {
		schema[tbl] = {}
		return query("SHOW COLUMNS FROM " + tbl, [], connection).then(function(results){
			schema[tbl].cols = results;
			//return q(results);
		});
	}).bind(this)
	queries.reduce(function(a,b){
		return a().then(b);
	}).then(function(result){
		console.log(schema)
		console.log("all done")
	})

}.bind(this));

//faker.Name.findName()