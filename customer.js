var mysql = require('mysql');
var inquirer = require("inquirer");
var table = require("console.table");
var password = require('./password/password.js');

var connection = mysql.createConnection({
  host: "localhost",

  port: 3306,

  user: "root",

  password: password.password.password,
  database: "storeDB"
});

connection.connect(function(err) {
   if (err)
   throw err;
    console.log("Connection as " + connection.threadId);
    displayItems();
  });

  function displayItems(){
    connection.query("SELECT * FROM products", function(err, res) {
        if (err) throw err;
console.table(res)
 console.log("\n");
 searchItems();
});

}
    
  

  function searchItems(){
    inquirer.prompt([
        {
        name: "item",
        type: "input",
        message: "Which item would you like to search? (Item ID only) ",
        validate: function(value) {
            if (isNaN(value) === false) {
              return true;
            }
            return false;
          }
    },
        {
        name: "amount",
        type: "input",
        message: "Please enter the quantity you would like (Integers only) ",
        validate: function(value) {
            if (isNaN(value) === false) {
              return true;
            }
            return false;
          }
    }
    ]).then(function(answer){

     

var inputAmount = answer.amount;
var itemSelect = answer.item;
var query = 'SELECT * FROM products WHERE ?';

connection.query(query,{
    item_id: itemSelect
}
, function(err, res){
    for (var i = 0; i < res.length; i++){

        
        var priceUpdate = res[i].price * inputAmount;
        var productUpdate = res[i].product_sales + priceUpdate;
        var newQuantity = res[i].stock_quantity - inputAmount;

        console.log("You chose the item: " + res[i].product_name);
        console.log("The current quantity is: " + res[i].stock_quantity);
        console.log("The price per quantity is: " + res[i].price.toFixed(2));


    if (inputAmount > res[i].stock_quantity){
        console.log("Insufficient quantity!");
        connection.end();

    }
    else if (inputAmount < res[i].stock_quantity){
        console.log("The quantity you will recieve is: " + inputAmount);
        console.log("\nThe price amount for your quantity is: " + priceUpdate.toFixed(2));
        console.log("The new quantity is: " + newQuantity)
        var query = connection.query(
            "UPDATE products SET ? WHERE ?",
            [{
                stock_quantity: newQuantity, 
            },
        {
            item_id: itemSelect
        }],
            function (err, res){
                console.log(res.affectedRows + " item updated")
             
            }
          )

          var query2 = connection.query(
            "UPDATE products SET ? WHERE ?",
            [{
                product_sales: productUpdate, 
            },
        {
            item_id: itemSelect
        }],
            function (err, res){
                connection.end();
            }
          )
    }
}
})


    });
  }
  
  