import {
  Modal,
  BlockStack,
  Form,
  FormLayout,
  TextField,
} from "@shopify/polaris";

const CustomerModal = ({
  active,
  action,
  customer,
  errors,
  tagsString,
  handleSubmit,
  handleInputChange,
  handleModalChange,
}) => {
  return (
    <Modal
      open={active}
      onClose={handleModalChange}
      instant={false}
      title={
        action === "Update" ? "Update existing customer" : "Create new customer"
      }
      primaryAction={{
        content: action,
        onAction: handleSubmit,
        submit: true,
        accessibilityLabel: action + " customer",
      }}
      secondaryActions={[
        {
          content: "Cancel",
          onAction: handleModalChange,
          accessibilityLabel: "Cancel",
        },
      ]}
    >
      <Modal.Section>
        <BlockStack>
          <Form>
            <FormLayout>
              <TextField
                label="First name"
                value={customer.firstName}
                onChange={(val) => handleInputChange(val, "firstName")}
                error={errors.firstName}
                requiredIndicator
              />
              <TextField
                label="Last name"
                value={customer.lastName}
                onChange={(val) => handleInputChange(val, "lastName")}
                error={errors.lastName}
                requiredIndicator
              />
              <TextField
                type="email"
                label="Email"
                value={customer.email}
                onChange={(val) => handleInputChange(val, "email")}
                error={errors.email}
                requiredIndicator
                autoComplete="email"
              />
              <TextField
                type="tel"
                label="Phone"
                value={customer.phone}
                onChange={(val) => handleInputChange(val, "phone")}
                error={errors.phone}
                helpText="Enter a valid phone number, including the country code (e.g., +31 555555555)."
              />
              <TextField
                label="Tags"
                value={tagsString}
                onChange={(val) => handleInputChange(val, "tags")}
                helpText="Enter each tags separated by commas ( , ) (e.g., TAG1,TAG2)."
              />
            </FormLayout>
          </Form>
        </BlockStack>
      </Modal.Section>
    </Modal>
  );
};

export default CustomerModal;
