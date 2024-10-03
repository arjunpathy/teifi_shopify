import { Modal, Banner, List, BlockStack } from "@shopify/polaris";

const ErrorMessage = ({ userErrors, setUserErrors, title, tone }) => {
  let bannerTitle =
    userErrors.length === 1 ? "Reason for failure" : "Reasons for failure";
  return userErrors.length ? (
    <Modal
      open={userErrors.length}
      onClose={() => setUserErrors([])}
      title={title +" failed"}
      tone={tone}
      instant={false}
    >
      <Modal.Section>
        <BlockStack>
          <Banner title={bannerTitle} tone={tone}>
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
