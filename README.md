# Exchange Converter service
Small node.js service that converts X transactions into EUR. Uses Koa.js
1. Gets original transactions from the Transactions service endpoint (example requet and response below)
2. Uses https://www.exchangeratesapi.io/ API to get exchange rates
3. Convert transactions. The conversion result has no more than 4 decimal points, and is float type.
4. Post converted transactions as array of objects to Process transactions endpoint (example requet and response below)


#Endpoints

#Transaction service endpoint
GET https://7np770qqk5.execute-api.eu-west-1.amazonaws.com/prod/get-transaction
**Example response**
`
    {
      "createdAt": "2018-01-11T15:15:25.305Z",
      "currency": "ZAR",
      "amount": 867,
      "exchangeUrl": "https://api.exchangeratesapi.io/Y-M-D?base=EUR",
      "checksum": "7d91707809bec3b88947638155de1b88300dd8481970be7abc505b734d90ab79"
    }
`
#Process transactions endpoint
POST https://7np770qqk5.execute-api.eu-west-1.amazonaws.com/prod/process-transactions
**Example request payload:**
`
{
  "transactions": [
    {
      "createdAt": "2018-01-11T15:15:25.305Z",
      "currency": "ZAR",
      "amount": 867,
      "convertedAmount": 57.8988,
      "checksum": "7d91707809bec3b88947638155de1b88300dd8481970be7abc505b734d90ab79"
    }
  ]
}
`
#Expected response
`
{
  "success": true,
  "passed": 1,
  "failed": 0
}
`