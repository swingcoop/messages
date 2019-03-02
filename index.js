require('dotenv').config();

const dateformat = require('dateformat');
const Koa = require('koa');
const app = new Koa();

const { Pool, Client } = require('pg')
const connectionString = process.env.POSTGRESQL_MESSAGES;

function addDays(date, days) {
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

async function get(ctx) {
   const client = new Client({ connectionString });
   client.connect();

   var lastWeek = dateformat(addDays(new Date(), -7), 'yyyy-mm-dd');

   try {
      const messages = `
         SELECT data 
           FROM messages
          where data->>'endDate' > '${lastWeek}'
          order by data->>'startDate'`;

      var res = await client.query(messages);
      client.end();

      ctx.status = 200;
      ctx.body = res.rows;
   }
   catch (err) {
      client.end();
      ctx.throw(err);
   }
}

app.use(get);

app.listen(process.env.PORT || 5000);