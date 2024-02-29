const GA_ENDPOINT = "https://www.google-analytics.com/mp/collect";
const MEASUREMENT_ID = `G-5F4Y35MFBZ`;
const API_SECRET = `ni9H17IASviLVAlUXXifiA`;
const SESSION_EXPIRATION_IN_MIN = 30;

async function getOrCreateSessionId() {
  // Store session in memory storage
  let { sessionData } = await chrome.storage.session.get("sessionData");
  // Check if session exists and is still valid
  const currentTimeInMs = Date.now();
  if (sessionData && sessionData.timestamp) {
    // Calculate how long ago the session was last updated
    const durationInMin = (currentTimeInMs - sessionData.timestamp) / 60000;
    // Check if last update lays past the session expiration threshold
    if (durationInMin > SESSION_EXPIRATION_IN_MIN) {
      // Delete old session id to start a new session
      sessionData = null;
    } else {
      // Update timestamp to keep session alive
      sessionData.timestamp = currentTimeInMs;
      await chrome.storage.session.set({ sessionData });
    }
  }
  if (!sessionData) {
    // Create and store a new session
    sessionData = {
      session_id: currentTimeInMs.toString(),
      timestamp: currentTimeInMs.toString(),
    };
    await chrome.storage.session.set({ sessionData });
  }
  return sessionData.session_id;
}

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
              session_id: await getOrCreateSessionId(),
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
              session_id: await getOrCreateSessionId(),
              page_title: page,
              action_title: interaction,
            },
          },
        ],
      }),
    }
  );
};
