require('dotenv').config({ path: '../server/.env.local' });

const express = require('express');
const cors = require('cors');
const app = express();
app.use(express.json());
app.use(cors());
const { fetchShopifyData, formatCustomers } = require('./utils/serverUtils');

const TAG_VALUE = '42';
const PAGINATION_LIMIT = 5;

// Create Customer
app.post('/customers', async (req, res) => {

  const customer = req.body;
  if (!customer.tags.includes(TAG_VALUE)) customer.tags.push(TAG_VALUE); //any customer created through this application is tagged with '42'
  const query = `
      mutation {
        customerCreate(input: {
          firstName: "${customer.firstName}",
          lastName: "${customer.lastName}",
          email: "${customer.email}",
          tags: ${JSON.stringify(customer.tags)},
          phone: "${customer.phone}",
        }) {
          customer {
            id
            firstName
            lastName
            email
            tags
            phone
            image{
                id
                url
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

  try {
    const data = await fetchShopifyData(query);
    res.send(data);
  } catch (error) {
    console.error(error.response ? error.response.data : error.message);
    res.status(500).send({ error: 'Failed to create customer' });
  }
});

// Get Customers
app.get('/customers', async (req, res) => {
  const { limit = PAGINATION_LIMIT, direction = 'forward', cursor = '' } = req.query;

  let queryString = (direction === 'forward')
    ? `first: ${limit}${cursor ? `, after: "${cursor}"` : ''}, reverse: true`
    : `last: ${limit}${cursor ? `, before: "${cursor}"` : ''}, reverse: true`;
  const query = `
     {
        customers(${queryString}) {
          edges {
            node {
              id
              firstName
              lastName
              email
              tags
              phone
              image{
                id
                url
              }
            }
          }
          pageInfo {
            hasNextPage
            hasPreviousPage
            startCursor
            endCursor
          }
        }
      }
    `;
  try {
    const data = await fetchShopifyData(query);
    let formattedCustomerData = await formatCustomers(data.customers);
    res.send({
      customers: formattedCustomerData,
      pageInfo: data.customers.pageInfo
    });
  } catch (error) {
    console.error(error.response ? error.response.data : error.message);
    res.status(500).send({ error: 'Failed to fetch customers' });
  }
});

// Update Customer
app.put('/customers/:id', async (req, res) => {

  const id = `gid://shopify/Customer/${req.params.id}`
  const { firstName, lastName, email, tags, phone } = req.body;

  if (!tags.includes(TAG_VALUE)) tags.push(TAG_VALUE) //any customer updated through this application is also tagged with '42'

  const query = `
      mutation {
        customerUpdate( 
        input: {
          id: "${id}",
          firstName: "${firstName}",
          lastName: "${lastName}",
          email: "${email}",
          tags: ${JSON.stringify(tags)},
          phone: "${phone}",
        }) {
          customer {
            id
            firstName
            lastName
            email
            tags
            phone
            image{
                id
                url
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `;
  try {
    const data = await fetchShopifyData(query);
    res.send(data);
  } catch (error) {
    console.error(error.response ? error.response.data : error.message);
    res.status(500).send({ error: 'Failed to update customer' });
  }
});

// Delete Customer
app.delete('/customers/:id', async (req, res) => {

  const id = `gid://shopify/Customer/${req.params.id}`

  const query = `
      mutation {
        customerDelete( 
        input: {
          id: "${id}",
        }) {
          shop {
          id
        }
          userErrors {
            field
            message
          }
        }
      }
    `;
  try {
    const data = await fetchShopifyData(query);
    res.send(data);
  } catch (error) {
    console.error(error.response ? error.response.data : error.message);
    res.status(500).send({ error: 'Failed to delete customer' });
  }
});

const serverPort = process.env.SHOPIFY_SERVER_PORT;
app.listen(serverPort, () => {
  console.log('Server running on ', serverPort);
});
