const Koa = require('koa');
const request = require('request-promise');
const port = process.argv.slice(2)[0];
const nrOfTransactions = process.argv.slice(3)[0] || 100;
const app = new Koa();

const transactionsApiUrl = "https://7np770qqk5.execute-api.eu-west-1.amazonaws.com/prod";


app.use(async (ctx, next) => {

   ctx.transactions = [];
   for (var i=0; i < nrOfTransactions; i++) {
      ctx.transactions.push(convertTransactionAmount(ctx));
   }

   await Promise.all(ctx.transactions).then(transactions_data => {
      ctx.transactions = {transactions:transactions_data};
      // Call the next middleware
      return next();
   });

});

app.use(async (ctx, next) => {

   console.log("For debug");
   console.log(ctx.transactions);

   let resp = await sendData(ctx);
   ctx.body = resp;
});


function sendData(ctx) {

   options = {
      url: transactionsApiUrl + '/process-transactions',
      json: true,
      body: ctx.transactions
   };

   // This returns a promise when using request-promise
   return request.post(options);
}


async function convertTransactionAmount(ctx) {

   let getTransactioOptions = {
      url: transactionsApiUrl + '/get-transaction',
      json: true,
   };
   let resp = await request.get(getTransactioOptions);


   let exchangeRateUrl = await generateExchangeUrl(resp);
   resp.exchangeUrl = exchangeRateUrl;

   let ex_options = {
      url:     exchangeRateUrl,
      json: true,
   };
   let ex_resp = await request.get(ex_options);

   if(ex_resp.rates[resp.currency]){
      let ex_rate = ex_resp.rates[resp.currency];

      let convertedAmount = parseFloat((resp.amount/ex_rate).toFixed(4));
      // delete resp.exchangeUrl;
      resp.convertedRate = ex_rate;
      resp.convertedAmount = convertedAmount;

      return resp;
   } else {
      console.log("No rate found for: ");
      console.log(resp);
   }

}

function generateExchangeUrl(resp){

   let date = new Date(resp.createdAt);
   let month = date.getMonth()+1;
   let ymd = date.getFullYear()+"-"+month+"-"+date.getDate();

   return resp.exchangeUrl.replace("Y-M-D", ymd);
}

console.log(`Exchange converter listening on port ${port} converting ${nrOfTransactions} request at once.`);
app.listen(port || 3030);