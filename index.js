const express = require('express');//npm install express
const mysql = require('mysql');//npm install mysql

const app = express();
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
  let sql =`SELECT customer_id, amount FROM sakila.payment`;
  con.query(sql, function (err, result) {
    if (err){
      res.status(500);
      res.send(JSON.stringify(err));
    }else{
      let totalPerCustomer = new Map();
      
      result.forEach ( record => {
        
        if(totalPerCustomer.get(record['customer_id']) === undefined){
          totalPerCustomer.set(record['customer_id'], {
            value: record['amount'], 
            customer:record['customer_id']
          });
        }else{
          totalPerCustomer.get(record['customer_id']).value += record['amount'];
        }
     });
      //console.log(totalPerCustomer);
      let arrayTotalPerCustomer = Array.from(totalPerCustomer.values());
      //console.log("arrayTotalPerCustomer",arrayTotalPerCustomer);
      const GOLD_VALUE = 100;
      let goldCustomers = arrayTotalPerCustomer.filter(el => el.value > GOLD_VALUE);	
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


/*
CREATE TABLE payment (
  payment_id SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
  customer_id SMALLINT UNSIGNED NOT NULL,
  staff_id TINYINT UNSIGNED NOT NULL,
  rental_id INT DEFAULT NULL,
  amount DECIMAL(5,2) NOT NULL,
  payment_date DATETIME NOT NULL,
  last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY  (payment_id),
  KEY idx_fk_staff_id (staff_id),
  KEY idx_fk_customer_id (customer_id),
  CONSTRAINT fk_payment_rental FOREIGN KEY (rental_id) REFERENCES rental (rental_id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_payment_customer FOREIGN KEY (customer_id) REFERENCES customer (customer_id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_payment_staff FOREIGN KEY (staff_id) REFERENCES staff (staff_id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
*/

console.log("API - JUST GOLD CUSTOMERS IS RUNNING");