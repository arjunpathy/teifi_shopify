import './App.css';
import { useState, useEffect, useCallback } from 'react';
import enTranslations from '@shopify/polaris/locales/en.json';
import { AppProvider, Avatar, Page, Card, Button, Tag, InlineStack, ResourceList, ResourceItem, Text } from '@shopify/polaris';
import CustomerModal from './components/CustomerModal';
import { PlusIcon, EditIcon, DeleteIcon } from '@shopify/polaris-icons';
import ErrorMessage from './components/ErrorMessage';


const SHOPIFY_SERVER_URL = process.env.SHOPIFY_SERVER_URL || 'http://localhost:3030';

function App() {
  const [customer, setCustomer] = useState({
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    tags: [],
  });

  const [customerList, setCustomerList] = useState([]);
  const [userErrors, setUserErrors] = useState([]);
  const [pageInfo, setPageInfo] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [paginationStack, setPaginationStack] = useState({ next: [], previous: [] });
  const [editFlag, setEditFlag] = useState(false)
  const [tagsString, setTagsString] = useState('');

  const handleInputChange = (value, name) => {
    if (name === 'tags') {
      setTagsString(value.toUpperCase());
    } else {
      setCustomer({
        ...customer,
        [name]: value,
      });
    }
  };

  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });

  const validateForm = () => {
    let formErrors = {};

    if (!customer.firstName) {
      formErrors.firstName = 'First name is required.';
    }

    if (!customer.lastName) {
      formErrors.lastName = 'Last name is required.';
    }

    if (!customer.email) {
      formErrors.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(customer.email)) {
      formErrors.email = 'Email is not valid.';
    }

    if (customer.phone && !/^\+?(\d{1,3})?[-.\s]?(\(?\d{1,4}\)?)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{0,9}$/.test(customer.phone)) {
      formErrors.phone = 'Enter a valid phone number.';
    }

    setErrors(formErrors);

    // Return true if no errors
    return Object.keys(formErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }
    let [url, method] = editFlag ? [`${SHOPIFY_SERVER_URL}/customers/${customer.id}`, `PUT`] : [`${SHOPIFY_SERVER_URL}/customers`, `POST`];
    customer.phone = customer.phone || "";
    customer.tags = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag !== '')

    const options = {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customer),
    };
    fetch(url, options)
      .then((response) => response.json())
      .then((resp) => {
        handleModalChange();
        let fieldName = editFlag ? "customerUpdate" : "customerCreate";
        if (resp.data[fieldName].userErrors.length) {
          setUserErrors([...resp.data[fieldName].userErrors])
        } else {
          clearCustomer();
          fetchCustomers();
        }
      })
      .catch((error) => console.error(error));
  };

  const fetchCustomers = async (cursor = '') => {
    setIsLoading(true);
    const response = await fetch(`${SHOPIFY_SERVER_URL}/customers?cursor=${cursor}`);
    const formattedResponse = await response.json();
    setCustomerList(formattedResponse.customers);
    setPageInfo(formattedResponse.pageInfo);
    setIsLoading(false);

    if (cursor && formattedResponse.pageInfo.hasNextPage) {
      setPaginationStack((prevState) => ({
        next: [...prevState.next, formattedResponse.pageInfo.endCursor],
        previous: [...prevState.previous, cursor],
      }));
    }
  };

  const handleNextPage = () => {
    if (pageInfo.endCursor) fetchCustomers(pageInfo.endCursor);
  };

  const handlePreviousPage = () => {
    const prevCursor = paginationStack.previous.pop();
    if (prevCursor) fetchCustomers(prevCursor);
  };

  const handleEdit = (customer) => {
    setEditFlag(true);
    setTagsString(customer.tags.join(', ').toUpperCase());
    setCustomer(customer);
    setActive(true);
    setUserErrors([])
  }

  const handleDelete = (id) => {
    var answer = window.confirm("Delete customer ?");
    if (answer) {
      fetch(`${SHOPIFY_SERVER_URL}/customers/${id}`, { method: 'DELETE' })
        .then((response) => response.json())
        .then(() => { fetchCustomers() })
        .catch((error) => console.error(error));
    }
  }


  const clearCustomer = () => {
    setCustomer({ id: '', firstName: '', lastName: '', email: '', phone: '', tags: [] });
    setTagsString("");
  }

  const [active, setActive] = useState(false);
  const handleModalChange = useCallback(() => setActive(!active), [active]);

  useEffect(() => {
    fetchCustomers();
  }, []);

  return (
    <AppProvider i18n={enTranslations}>
      <Page title="Customers">
        <ErrorMessage userErrors={userErrors} dismissErrorMessage={() => setUserErrors([])} tone='critical' title={editFlag ? "Customer update failed" : "Customer creation failed"} />
        <Card>
          <ResourceList
            showHeader
            resourceName={{ singular: 'customer', plural: 'customers' }}
            items={customerList}
            alternateTool={<Button icon={PlusIcon} onClick={() => { setActive(true); setEditFlag(false); clearCustomer(); setUserErrors([]) }}>Add customer</Button>}
            pagination={{
              hasPrevious: pageInfo?.hasPreviousPage || false,
              onPrevious: handlePreviousPage,
              hasNext: pageInfo?.hasNextPage || false,
              onNext: handleNextPage,
            }}
            loading={isLoading}
            renderItem={(customer) => {
              const { id, firstName, lastName, email, phone, image } = customer;
              const media = <Avatar customer source={image?.url} size="lg" alt="" name={firstName} />;
              const shortcutActions = [{ icon: EditIcon, onClick: () => { handleEdit(customer) }, variant: "plain", accessibilityLabel: "Edit customer" }, { icon: DeleteIcon, onClick: () => { handleDelete(id) }, tone: "critical", variant: "plain", accessibilityLabel: "Delete customer" }];

              return (
                <ResourceItem id={id} media={media} accessibilityLabel={`View details for ${firstName}`} shortcutActions={shortcutActions}  >
                  <Text variant="bodyMd" fontWeight="bold" as="h3">{firstName} {lastName}</Text>
                  <div>{email}</div>
                  <div>{phone}</div>
                  {customer.tags.length > 0 && (
                    <InlineStack gap="200" alignment="center">
                      {customer.tags.map((tag) => (
                        <Tag key={tag} >{tag}</Tag>
                      ))}
                    </InlineStack>
                  )}
                </ResourceItem>
              );
            }}
          />
        </Card>

        <CustomerModal active={active} action={editFlag ? "Update" : "Save"} customer={customer} tagsString={tagsString} handleModalChange={handleModalChange} handleSubmit={handleSubmit} handleInputChange={handleInputChange} errors={errors} clearCustomer={clearCustomer} />
      </Page>
    </AppProvider>
  );
}

export default App;
