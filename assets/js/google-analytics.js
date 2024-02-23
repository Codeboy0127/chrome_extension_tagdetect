const GA_ENDPOINT = "https://www.google-analytics.com/mp/collect";
const MEASUREMENT_ID = `G-5F4Y35MFBZ`;
const API_SECRET = `ni9H17IASviLVAlUXXifiA`;

/**
 * generate a unique identifier for a specific device/user, the client_id.
 * The id should stay the same, as long as the extension is installed on a user’s browser.
 * It can be an arbitrary string, but should be unique to the client. You can generate one by calling self.crypto.randomUUID().
 * Store the client_id in chrome.storage.local to make sure it stays the same as long as the extension is installed.
 *
 * Using chrome.storage.local requires the storage permission in your manifest file:
 *
 */
async function getOrCreateClientId() {
  const result = await chrome.storage.local.get("clientId");
  let clientId = result.clientId;
  if (!clientId) {
    // Generate a unique client ID, the actual value is not relevant
    clientId = self.crypto.randomUUID();
    await chrome.storage.local.set({ clientId });
  }
  return clientId;
}

export const pageSelectEvent = async (page) => {
  fetch(
    `${GA_ENDPOINT}?measurement_id=${MEASUREMENT_ID}&api_secret=${API_SECRET}`,
    {
      method: "POST",
      body: JSON.stringify({
        client_id: await getOrCreateClientId(),
        events: [
          {
            name: "page_view",
            params: {
              page_title: page,
            },
          },
        ],
      }),
    }
  );
};

export const pageInteractionEvent = async (page, interaction) => {
  fetch(
    `${GA_ENDPOINT}?measurement_id=${MEASUREMENT_ID}&api_secret=${API_SECRET}`,
    {
      method: "POST",
      body: JSON.stringify({
        client_id: await getOrCreateClientId(),
        events: [
          {
            name: "interaction",
            params: {
              page_title: page,
              action_title: interaction,
            },
          },
        ],
      }),
    }
  );
};
