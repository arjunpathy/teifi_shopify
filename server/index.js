const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
app.use(express.json());
app.use(cors());

const SHOPIFY_API_URL = process.env.SHOPIFY_API_URL;
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const tagValue = '42';
const headers = {
  'Content-Type': 'application/json',
  'X-Shopify-Access-Token': ACCESS_TOKEN
};
require('dotenv').config()

// Create Customer
app.post('/customers', async (req, res) => {

  const customer = req.body;
  if (!customer.tags.includes(tagValue)) customer.tags.push(tagValue); //any customer created through this application is tagged with '42'
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
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

  try {
    const response = await axios({
      url: SHOPIFY_API_URL,
      method: 'POST',
      headers,
      data: JSON.stringify({ query })
    });
    res.send(response.data);
  } catch (error) {
    console.error(error.response ? error.response.data : error.message);
    res.status(500).send({ error: 'Failed to create customer' });
  }
});

// Get Customers
app.get('/customers', async (req, res) => {
  const { first = 10, cursor } = req.query;
  const query = `
     {
        customers(first: ${first}, ${cursor ? `after: "${cursor}"` : ''}) {
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
    const response = await axios({
      url: SHOPIFY_API_URL,
      method: 'POST',
      headers,
      data: JSON.stringify({ query })
    });

    const customerData = response.data.data.customers;
    let formattedCustomerData = await formatCustomers(customerData);
    res.send({
      customers: formattedCustomerData,
      pageInfo: customerData.pageInfo
    });

  } catch (error) {
    console.error(error.response ? error.response.data : error.message);
    res.status(500).send({ error: 'Failed to fetch customers' });
  }
});

let formatCustomers = (data) => {
  let customers = [];
  data.edges.forEach(customer => {
    const customerId = customer.node.id.split('/').pop();
    customer.node.id = customerId || null;
    customers.push(customer.node);
  });
  // return customers.reverse();
  return customers;
}

// Update Customer
app.put('/customers/:id', async (req, res) => {

  const id = `gid://shopify/Customer/${req.params.id}`
  const { firstName, lastName, email, tags, phone } = req.body;

  if (!tags.includes(tagValue)) tags.push(tagValue) //any customer updated through this application is also tagged with '42'

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
          }
          userErrors {
            field
            message
          }
        }
      }
    `;
  try {
    const response = await axios({
      url: SHOPIFY_API_URL,
      method: 'POST',
      headers,
      data: JSON.stringify({ query })
    });
    res.send(response.data);
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
    const response = await axios({
      url: SHOPIFY_API_URL,
      method: 'POST',
      headers,
      data: JSON.stringify({ query })
    });
    res.send(response.data);
  } catch (error) {
    console.error(error.response ? error.response.data : error.message);
    res.status(500).send({ error: 'Failed to delete customer' });
  }
});

app.listen(3030, () => {
  console.log('Server running on port 3030');
});
