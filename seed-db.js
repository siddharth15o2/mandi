const data = require('./data.json');

const mysql = require('mysql');
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'world',
    multipleStatements: true
});

connection.connect();

let state_values = [];

for (let i = 0; i < data.states.length; i++) {
    const {id, type, name, capital, code } = data.states[i];
    state_values.push(`(${id}, '${type}', '${name}',  '${capital}', '${code}', 1)`);
}

const state_query = 'truncate states; insert into states (id, type, name,  capital, code, country_id) values ' + state_values.join(',');

let district_values = [];

for (let i = 0; i < data.states.length; i++) {
    const state_id = data.states[i].id ;
    for (let j = 0; j < data.states[i].districts.length; j++) {
        const {name} = data.states[i].districts[j];
        district_values.push(`('${name}', ${state_id})`);
    }   
}

const district_query = 'truncate districts; insert into districts (name, state_id) values' + district_values.join(',');
connection.query('SET FOREIGN_KEY_CHECKS=0;' + state_query + ';' + district_query + '; SET FOREIGN_KEY_CHECKS=1;' , function (error, results) {
    if (error) throw error;
    console.log(results)
});

connection.end();