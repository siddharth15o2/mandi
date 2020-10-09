const data = require('./data.json');

const mysql = require('mysql');
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'world',
    multipleStatements: true
});

const sqlQueries = [
    'SET FOREIGN_KEY_CHECKS=0',
    'truncate states',
    'truncate districts',
    'SET FOREIGN_KEY_CHECKS=1'
];

connection.connect();

let state_values = [];

for (const state of data.states) {
    const {id, type, name, capital, code } = state;
    state_values.push(`(${id}, '${type}', '${name}',  '${capital}', '${code}', 1)`);
}

sqlQueries.push('insert into states (id, type, name,  capital, code, country_id) values ' + state_values.join(','));

let district_values = [];

for (const state of data.states) {
    for (const district of state.districts) {
        const {name} = district;
        district_values.push(`('${name}', ${state.id})`);
    }
}

sqlQueries.push('insert into districts (name, state_id) values' + district_values.join(','));
connection.query(sqlQueries.join('; '), function (error, results) {
    if (error) throw error;
    console.log(results)
});

connection.end();