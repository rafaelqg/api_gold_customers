const express = require('express');//npm install express
const mysql = require('mysql2');//npm install mysql2

//npm install express swagger-ui-express yamljs
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

const app = express();
const swaggerDocument = YAML.load('./openapi-spec.yaml');

//http://localhost:80/openapi-docs/
app.use('/openapi-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(80);//initialize web server

//initialize mysql connection
const MYSQL_IP="localhost";
const MYSQL_LOGIN="root";
const MYSQL_PASSWORD="root";

let con = mysql.createConnection({
  host:  MYSQL_IP,
  user: MYSQL_LOGIN,
  password: MYSQL_PASSWORD,
  database: "sakila"
});

con.connect(function(err) {
  if (err){
    console.log(err);
    throw err;
  }
  console.log("Connection with mysql established");
});

app.get('/get_gold_customers', function (req, res) {
  let sql =`SELECT p.customer_id, p.amount, concat(concat(first_name, " "), c.last_name) as customer_name FROM sakila.payment p
join customer c  on  c.customer_id = p.customer_id`;
  con.query(sql, function (err, result) {
    if (err){
      res.status(500);
      res.send(JSON.stringify(err));
    }else{
      let totalPerCustomer = new Map();
      console.log(result);
      
      result.forEach ( record => {
        
        if(totalPerCustomer.get(record['customer_id']) === undefined){
          totalPerCustomer.set(record['customer_id'], {
            value: Number.parseFloat(record['amount']), 
            customer:record['customer_id'],
            customer_name:record['customer_name']
          });
        }else{
          totalPerCustomer.get(record['customer_id']).value += Number.parseFloat(record['amount']);
        }
     });
      //console.log(totalPerCustomer);
      let arrayTotalPerCustomer = Array.from(totalPerCustomer.values());
      console.log("arrayTotalPerCustomer",arrayTotalPerCustomer);
      const GOLD_VALUE = 130;
      let goldCustomers = arrayTotalPerCustomer.filter(el => el.value >= GOLD_VALUE);	
      //CORS
      res.status(200);
      res.setHeader('Content-Type', 'application/json');
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods","POST,GET,OPTIONS,PUT,DELETE,HEAD");
      res.setHeader("Access-Control-Allow-Headers","X-PINGOTHER,Origin,X-Requested-With,Content-Type,Accept");
      res.setHeader("Access-Control-Max-Age","1728000");
      res.send(JSON.stringify(goldCustomers));
      
    }
  });
});

//Define route parameters in your endpoint
app.get("/clientes/:id", (req, res) => {
  const id = req.params.id;
  if (id === undefined) {
    res.status(400);
    res.send(JSON.stringify({ error: "Missing id parameter" }));
  }
  let sql =`SELECT customer_id, concat(concat(first_name, " "), last_name) as customer_name FROM sakila.customer WHERE customer_id = ?`;
  con.query(sql, [id], function (err, result) {
    if (err){
      res.status(500);
      res.send(JSON.stringify(err));
    }else{
      customers = [];
        result.forEach ( record => {
          customers.push({
              id:record['customer_id'],
              customer_name:record['customer_name']
            });
          
      });
    }
    //CORS
    res.status(200);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods","POST,GET,OPTIONS,PUT,DELETE,HEAD");
    res.setHeader("Access-Control-Allow-Headers","X-PINGOTHER,Origin,X-Requested-With,Content-Type,Accept");
    res.setHeader("Access-Control-Max-Age","1728000");
    res.send(JSON.stringify(customers));
    });
});

//total per month_year
//Gráfico de dispersão ou linhas: exiba por mês/ano, considerando todos os dados disponíveis no banco de dados, o total de vendas ocorridas naquele período.

app.get('/payments_per_month_year', function (req, res) {
  let sql =`SELECT customer_id,amount, year(payment_date) as year, month(payment_date) as month, amount FROM sakila.payment`;
  con.query(sql, function (err, result) {
    if (err){
      res.status(500);
      res.send(JSON.stringify(err));
    }else{
      let totalPerMonth = new Map()
      //console.log(result);
      
      result.forEach ( record => {
        let periodKey = record['year']+"_"+ record['month'];
        if(totalPerMonth.get(periodKey) === undefined){
          totalPerMonth.set(periodKey , {
            value: Number.parseFloat(record['amount']), 
            year : record['year'],
            month: record['month']
          });
        }else{
          totalPerMonth.get(periodKey).value += Number.parseFloat(record['amount']);
        }
     });
      //console.log(totalPerCustomer);
      let arrayTotalPerMonth = Array.from(totalPerMonth.values());
 
      //CORS
      res.status(200);
      res.setHeader('Content-Type', 'application/json');
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods","POST,GET,OPTIONS,PUT,DELETE,HEAD");
      res.setHeader("Access-Control-Allow-Headers","X-PINGOTHER,Origin,X-Requested-With,Content-Type,Accept");
      res.setHeader("Access-Control-Max-Age","1728000");
      res.send(JSON.stringify(arrayTotalPerMonth));
      
    }
  });
});

app.get('/ratings_proportion', function (req, res) {
  let sql =`SELECT film_id, rating  FROM sakila.film`;
  con.query(sql, function (err, result) {
    if (err){
      res.status(500);
      res.send(JSON.stringify(err));
    }else{
      let totalPerRating = new Map()
      //console.log(result);
      let totalElements = result.length;
      result.forEach ( record => {
        let ratingKey = record['rating'];
        if(totalPerRating.get(ratingKey) === undefined){
          totalPerRating.set(ratingKey , {
            value: 1, 
            rating: ratingKey,
          });
        }else{
          totalPerRating.get(ratingKey).value++;
        }
     });
      //console.log(totalPerCustomer);
      let arrayTotalPerRating = Array.from(totalPerRating.values());
      arrayTotalPerRating = arrayTotalPerRating.map( el => {
        el.proportion = el.value/totalElements;
        return el;
      });
      //CORS
      res.status(200);
      res.setHeader('Content-Type', 'application/json');
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods","POST,GET,OPTIONS,PUT,DELETE,HEAD");
      res.setHeader("Access-Control-Allow-Headers","X-PINGOTHER,Origin,X-Requested-With,Content-Type,Accept");
      res.setHeader("Access-Control-Max-Age","1728000");
      res.send(JSON.stringify(arrayTotalPerRating));
      
    }
  });
});


console.log("API - JUST GOLD CUSTOMERS IS RUNNING");