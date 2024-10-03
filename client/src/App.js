import { useState, useEffect, useCallback } from 'react';
import enTranslations from '@shopify/polaris/locales/en.json';
import { AppProvider, Avatar, Page, Card, Button, Tag, EmptyState, InlineStack, ResourceList, ResourceItem, Text } from '@shopify/polaris';
import CustomerModal from './components/CustomerModal';
import { EditIcon, DeleteIcon, PersonAddIcon } from '@shopify/polaris-icons';
import ErrorMessage from './components/ErrorMessage';
import DeleteConfirmationModal from './components/DeleteConfirmationModal';
import { isPossiblePhoneNumber, parsePhoneNumber } from 'libphonenumber-js'

const SHOPIFY_SERVER_URL = process.env.REACT_APP_SHOPIFY_SERVER_URL;
const PAGINATION_LIMIT = 5;
let paginationStack = [];
let pageNumber = 0;

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
  const [editFlag, setEditFlag] = useState(false)
  const [tagsString, setTagsString] = useState('');
  const [showDeleteConfirmation, setDeleteConfirmation] = useState(false);
  const [active, setActive] = useState(false);

  const [emptyStateMarkup, setEmptyStateMarkup] = useState(null)

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

    if (customer.phone && !isPossiblePhoneNumber(customer.phone))
      formErrors.phone = 'Enter a valid phone number.';

    setErrors(formErrors);

    // Return true if no errors
    return Object.keys(formErrors).length === 0;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    let [url, method] = editFlag ? [`${SHOPIFY_SERVER_URL}/customers/${customer.id}`, `PUT`] : [`${SHOPIFY_SERVER_URL}/customers`, `POST`];
    customer.phone = customer.phone || "";
    customer.tags = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag !== '');

    const options = {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customer),
    };

    await fetch(url, options)
      .then((response) => response.json())
      .then((resp) => {
        handleModalChange();
        let action = editFlag ? "Update" : "Create";
        let fieldName = `customer${action}`;

        if (resp[fieldName].userErrors.length) {
          setUserErrors([...resp[fieldName].userErrors]);
        }
        else {
          clearCustomerForm();
          handlePagination('refresh');
        }
      }).catch((error) => console.error(error));
  };

  const fetchCustomers = async (direction, cursor = '', limit = PAGINATION_LIMIT) => {

    setIsLoading(true);
    if (!paginationStack[pageNumber])
      paginationStack[pageNumber] = [direction, cursor, limit];

    try {
      const response = await fetch(`${SHOPIFY_SERVER_URL}/customers?cursor=${cursor}&direction=${direction}&limit=${limit}`);
      const formattedResponse = await response.json();
      if (!formattedResponse || !formattedResponse.customers) {
        console.error('Invalid API response:', formattedResponse);
        return { customers: [], pageInfo: {} }; // Fallback to empty data
      }
      return formattedResponse;
    } catch (error) {
      console.error('Error fetching customers:', error);
      return { customers: [], pageInfo: {} }; // Fallback in case of error
    }
  };

  const resetList = (formattedResponse) => {
    if (formattedResponse && formattedResponse.customers) {
      setCustomerList(formattedResponse.customers);
    } else {
      console.error('Invalid data format received:', formattedResponse);
      setCustomerList([]); // Fallback to empty list in case of invalid data
    }
    if (formattedResponse && formattedResponse.pageInfo) {
      setPageInfo(formattedResponse.pageInfo);
    }
    setIsLoading(false);
  };


  const handlePagination = async (direction) => {
    if (direction === 'forward' && pageInfo.hasNextPage) {
      pageNumber++;
      const data = await fetchCustomers(direction, pageInfo.endCursor);
      resetList(data);
    } else if (direction === 'backward' && pageInfo.hasPreviousPage) {
      pageNumber--;
      const data = await fetchCustomers(direction, pageInfo.startCursor);
      resetList(data);
    }
    else if (direction === 'refresh') {
      const data = await fetchCustomers(paginationStack[pageNumber][0], paginationStack[pageNumber][1], paginationStack[pageNumber][2]);
      resetList(data);
    }
  };

  const handleCustomerCreate = () => {
    setActive(true); setEditFlag(false); clearCustomerForm(); setUserErrors([]);
  }

  const handleEdit = (customer) => {
    setEditFlag(true);
    setTagsString(customer.tags.join(', ').toUpperCase());
    setCustomer(customer);
    setActive(true);
    setUserErrors([])
  }

  const handleDelete = (customer) => {
    setDeleteConfirmation(true);
    setCustomer(customer);
  }

  const deleteCustomer = (customer) => {
    handleDeleteConfirmation();
    fetch(`${SHOPIFY_SERVER_URL}/customers/${customer.id}`, { method: 'DELETE' })
      .then((response) => response.json())
      .then(async () => {
        if (customerList.length === 1 && pageInfo.hasPreviousPage)
          pageNumber--;
        handlePagination('refresh');
      })
      .catch((error) => console.error(error));
  };

  const clearCustomerForm = () => {
    setCustomer({ id: '', firstName: '', lastName: '', email: '', phone: '', tags: [] });
    setTagsString("");
  }

  const handleModalChange = useCallback(() => { setActive(!active); clearCustomerForm(); setErrors({}); }, [active]);
  const handleDeleteConfirmation = useCallback(() => setDeleteConfirmation(!showDeleteConfirmation), [showDeleteConfirmation]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchCustomers('forward');
      resetList(data);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (customerList.length === 0) {
      const markup = <EmptyState
        heading="No customers found"
        action={{ content: 'Add customer', onAction: handleCustomerCreate, icon: PersonAddIcon }}
        image="https://cdn.shopify.com/s/files/1/2376/3301/products/emptystate-files.png"
      />
      setEmptyStateMarkup(markup);
    }
  }, [customerList])

  return (
    <AppProvider i18n={enTranslations}>
      <Page title="Customers">
        <ErrorMessage userErrors={userErrors} setUserErrors={setUserErrors} tone='critical' title={editFlag ? "Customer update failed" : "Customer creation failed"} />
        <DeleteConfirmationModal isOpen={showDeleteConfirmation} handleChange={handleDeleteConfirmation} customer={customer} tone='critical' deleteCustomer={deleteCustomer} />
        <Card>
          <ResourceList
            showHeader
            resourceName={{ singular: 'customer', plural: 'customers' }}
            emptyState={emptyStateMarkup}
            items={customerList}
            alternateTool={<Button icon={PersonAddIcon} onClick={handleCustomerCreate}>Add customer</Button>}
            pagination={{
              hasPrevious: pageInfo?.hasPreviousPage || false,
              onPrevious: () => { handlePagination('backward') },
              hasNext: pageInfo?.hasNextPage || false,
              onNext: () => { handlePagination('forward') },
            }}
            loading={isLoading}
            renderItem={(customer) => {
              const { id, firstName, lastName, email, phone, image } = customer;
              const media = <Avatar customer source={image?.url} size="lg" alt="" name={firstName} />;
              const shortcutActions = [{ icon: EditIcon, onClick: () => { handleEdit(customer) }, variant: "plain", accessibilityLabel: "Edit customer" }, { icon: DeleteIcon, onClick: () => { handleDelete(customer) }, tone: "critical", variant: "plain", accessibilityLabel: "Delete customer" }];

              return (
                <ResourceItem id={id} media={media} accessibilityLabel={`View details for ${firstName} ${lastName}`} shortcutActions={shortcutActions}  >
                  <Text variant="bodyMd" fontWeight="bold" as="h3">{firstName} {lastName}</Text>
                  <div>{email}</div>
                  <div>{phone && parsePhoneNumber(phone).formatInternational()}</div>
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

        <CustomerModal active={active} action={editFlag ? "Update" : "Save"} customer={customer} tagsString={tagsString} handleModalChange={handleModalChange} handleSubmit={handleSubmit} handleInputChange={handleInputChange} errors={errors} />
      </Page>
    </AppProvider>
  );
}

export default App;
