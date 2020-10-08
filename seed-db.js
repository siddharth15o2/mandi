const data = require('./data.json');

const mysql = require('mysql');
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'world'
});

connection.connect();

let values = [];

for (let i = 0; i < data.states.length; i++) {
    const { type, name, capital, code } = data.states[i];
    values.push(`('${type}', '${name}',  '${capital}', '${code}', 1)`);
}

const query = 'insert into states (type, name,  capital, code, country_id) values ' + values.join(',');

connection.query(query, function (error, results) {
    if (error) throw error;
    console.log(results)
});

connection.end();