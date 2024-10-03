
const fetchShopifyData = async (query) => {

    const SHOPIFY_API_URL = process.env.SHOPIFY_API_URL;
    const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
    const headers = {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': ACCESS_TOKEN
    };

    try {
        const response = await fetch(SHOPIFY_API_URL, {
            method: 'POST',
            headers,
            body: JSON.stringify({ query })
        });

        const responseData = await response.json();

        // Handle potential user errors from Shopify API
        if (responseData.errors) {
            throw new Error(responseData.errors);
        }

        return responseData.data;
    } catch (error) {
        console.error(error.message);
        throw new Error('Shopify API request failed : ' + error.message);
    }
};


const formatCustomers = (data) => {
    let customers = [];
    data.edges.forEach(customer => {
        const customerId = customer.node.id.split('/').pop();
        customer.node.id = customerId || null;
        customers.push(customer.node);
    });
    return customers;
}

module.exports = { fetchShopifyData, formatCustomers };
