import React from "react";
import { Modal, Banner, Text } from "@shopify/polaris";

const DeleteConfirmationModal = ({
  isOpen,
  handleChange,
  customer,
  tone,
  deleteCustomer,
}) => {
  return (
    <Modal
      title={`Delete ${customer.firstName} ${customer.lastName}?`}
      tone={tone}
      destructive={true}
      open={isOpen}
      onClose={handleChange}
      instant={false}
      primaryAction={{
        content: "Delete customer",
        destructive: true,
        onAction: () => {deleteCustomer(customer);},
      }}
      secondaryActions={[
        {
          content: "Cancel",
          onAction: handleChange,
        },
      ]}
    >
      <Modal.Section>
        <Banner tone={tone}>
          <Text as="p">
            Are you sure you want to delete the customer{" "}
            <Text as="span" fontWeight="bold">
              {customer.firstName} {customer.lastName}?
            </Text>
          </Text>
          <Text as="p">This cannot be undone. </Text>
        </Banner>
      </Modal.Section>
    </Modal>
  );
};

export default DeleteConfirmationModal;
