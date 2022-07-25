const Order = require("./Order");

const OrderState = Object.freeze({
    WELCOMING:   Symbol("welcoming"),
    SIZE:   Symbol("size"),
    TOPPINGS:   Symbol("toppings"),
    FRIES: Symbol('fries'),
    FRIES_SIZE: Symbol('fries_size'),
    FRIES_TOPPINGS: Symbol('fries_topping'),
    DRINKS:  Symbol("drinks"),
    DIPS: Symbol("dips"),
});

module.exports = class NachosOrder extends Order{
    constructor(sNumber, sUrl){
        super(sNumber, sUrl);
        this.stateCur = OrderState.WELCOMING;
        this.sSize = "";
        this.sToppings = "";
        this.sDrinks = "";
        this.sItem = "nachos";
        this.sItem2 = "";
        this.sFries_size = '';
        this.sFries_topping = '';
        this.sDips = '';
        this.sTotal_Price = 0;
        this.address = "";
    }
    handleInput(sInput){
        let aReturn = [];
        switch(this.stateCur){
            case OrderState.WELCOMING:
                this.stateCur = OrderState.SIZE;
                aReturn.push("Welcome to Keval's Nachos.");
                aReturn.push("What bowl size would you like to have?");
                break;
            case OrderState.SIZE:
                this.stateCur = OrderState.TOPPINGS
                this.sSize = sInput;
                if(this.sSize.toLowerCase()=='small'){
                    this.sTotal_Price = this.sTotal_Price+10;
                } else if(this.sSize.toLowerCase()=='medium'){
                    this.sTotal_Price = this.sTotal_Price+15;
                } else if(this.sSize.toLowerCase()=='large'){
                    this.sTotal_Price = this.sTotal_Price+20;
                }
                aReturn.push("What toppings would you like to add to your nachos?");
                break;
            case OrderState.TOPPINGS:
                this.stateCur = OrderState.FRIES
                this.sToppings = sInput;
                this.sTotal_Price = this.sTotal_Price+5;
                aReturn.push("Would you like to have Fries?");
                break;
            case OrderState.FRIES:
                if(sInput.toLowerCase() != "no"){
                    this.stateCur = OrderState.FRIES_SIZE;
                    this.sItem2 = 'FRIES';
                    this.sTotal_Price = this.sTotal_Price+15;
                    aReturn.push("What bowl size would you like to have of fries?");
                }else{
                    this.stateCur = OrderState.DIPS;
                    aReturn.push("Would you like to have Dips?");
                }
                break;
            case OrderState.FRIES_SIZE:
                this.stateCur = OrderState.FRIES_TOPPINGS;
                this.sFries_size = sInput;
                this.sTotal_Price = this.sTotal_Price+5;
                aReturn.push("What topping would you like to have on fries?");
                break;
            case OrderState.FRIES_TOPPINGS:
                this.stateCur = OrderState.DIPS;
                this.sTotal_Price = this.sTotal_Price+5;
                this.sFries_topping= sInput;
                aReturn.push("Would you like to have Dips?");
                break;
            case OrderState.DIPS:
                this.stateCur = OrderState.DRINKS;
                this.sTotal_Price = this.sTotal_Price+5;
                if(sInput.toLowerCase() != "no"){
                    this.sDips = sInput;
                }
                aReturn.push("Would you like to have Drinks?");
                break;
            case OrderState.DRINKS:
                this.stateCur = OrderState.PAYMENT;
                if(sInput.toLowerCase() != "no"){
                    this.sTotal_Price = this.sTotal_Price+6;
                    this.sDrinks = sInput;
                }
                aReturn.push("Thank-you for your order of");
                aReturn.push(`${this.sSize} ${this.sItem} with ${this.sToppings} Toppings`);
                if(this.sItem2){
                    aReturn.push(`${this.sFries_size} ${this.sItem2} with ${this.sFries_topping} Toppings`);
                }
                if(this.sDips){
                    aReturn.push(`Add On Dips ${this.sDips}`);
                }
                if(this.sDrinks){
                    aReturn.push(this.sDrinks);
                }
                if(this.sTotal_Price>0){
                    aReturn.push(`The total cost is: ${this.sTotal_Price}`);
                }
                aReturn.push(`Please pay for your order here`);
                aReturn.push(`${this.sUrl}/payment/${this.sNumber}/`);
                break;
            case OrderState.PAYMENT:
                  console.log(sInput);
                  this.address=sInput.purchase_units[0].shipping;
                  this.isDone(true);
                  let d = new Date();
                  d.setMinutes(d.getMinutes() + 20);
                  aReturn.push(`Your order will be delivered at ${d.toTimeString()} on this address ${this.address.address_line_1} ,
                   ${sInput.purchase_units[0].shipping.admin_area_2} ${sInput.purchase_units[0].shipping.admin_area_1} ${sInput.purchase_units[0].shipping.country_code}`);
                  break;
        }
        return aReturn;
    }
    renderForm(sTitle = "-1", sTotal_Price = "-1"){
        // your client id should be kept private
        if(sTitle != "-1"){
          this.sItem = sTitle;
        }
        if(sTotal_Price != "-1"){
          this.sTotal_Price = sTotal_Price;
        }
        const sClientID = process.env.SB_CLIENT_ID || 'AbHa-j8ecvrue9HrvwR_89lpwdds7CflYiNEKzUDt49o90eYBDtcheLL-tCNpX7fxeak6YiHBNtWqdDv'
        return(`
        <!DOCTYPE html>
    
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1"> <!-- Ensures optimal rendering on mobile devices. -->
          <meta http-equiv="X-UA-Compatible" content="IE=edge" /> <!-- Optimal Internet Explorer compatibility -->
        </head>
        
        <body>
          <script src="https://code.jquery.com/jquery-3.5.1.min.js"></script>
          <script
            src="https://www.paypal.com/sdk/js?client-id=${sClientID}">
          </script>
          Thank you ${this.sNumber} for your ${this.sItem} order of $${this.sTotal_Price}.
          <div id="paypal-button-container"></div>
    
          <script>
            paypal.Buttons({
                createOrder: function(data, actions) {
                  // This function sets up the details of the transaction, including the amount and line item details.
                  return actions.order.create({
                    purchase_units: [{
                      amount: {
                        value: '${this.sTotal_Price}'
                      }
                    }]
                  });
                },
                onApprove: function(data, actions) {
                  // This function captures the funds from the transaction.
                  return actions.order.capture().then(function(details) {
                    // This function shows a transaction success message to your buyer.
                    $.post(".", details, ()=>{
                      window.open("", "_self");
                      window.close(); 
                    });
                  });
                }
            
              }).render('#paypal-button-container');
            // This function displays Smart Payment Buttons on your web page.
          </script>
        
        </body>
            
        `);
    
      }
}