import React from "react";
import { Modal, Banner, List } from "@shopify/polaris";

const ErrorMessage = ({ userErrors, dismissErrorMessage, title, tone }) => {
  return userErrors.length ? (
    <Modal>
      <Banner title={title} tone={tone} onDismiss={dismissErrorMessage}>
        <List type="bullet">
          {userErrors.map((error, id) => {
            return <List.Item key={id}>{error.message}</List.Item>;
          })}
        </List>
      </Banner>
    </Modal>
  ) : null;
};

export default ErrorMessage;
