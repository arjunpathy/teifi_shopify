import { Modal, Banner, List, BlockStack } from "@shopify/polaris";

const ErrorMessage = ({ userErrors, setUserErrors, title, tone }) => {
  return userErrors.length ? (
    <Modal
      open={userErrors.length}
      onClose={() => setUserErrors([])}
      title={title}
      tone={tone}
      instant={false}
    >
      <Modal.Section>
        <BlockStack>
          <Banner title="Reasons for failure" tone={tone}>
            <List type="bullet">
              {userErrors.map((error, id) => {
                return <List.Item key={id}>{error.message}</List.Item>;
              })}
            </List>
          </Banner>
        </BlockStack>
      </Modal.Section>
    </Modal>
  ) : null;
};

export default ErrorMessage;
