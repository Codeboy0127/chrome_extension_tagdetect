const GA_ENDPOINT = "https://www.google-analytics.com/mp/collect";
const MEASUREMENT_ID = `G-5F4Y35MFBZ`;
const API_SECRET = `ni9H17IASviLVAlUXXifiA`;
const SESSION_EXPIRATION_IN_MIN = 30;
const DEFAULT_ENGAGEMENT_TIME_IN_MSEC = 100;

async function getOrCreateSessionId() {
  try {
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
} catch (error) {
  console.error("Error in getOrCreateSessionId:", error);
  return null; // Return a fallback value
}
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
  try {
  const result = await chrome.storage.local.get("clientId");
  let clientId = result.clientId;
  if (!clientId) {
    // Generate a unique client ID, the actual value is not relevant
    clientId = self.crypto.randomUUID();
    await chrome.storage.local.set({ clientId });
  }
  return clientId;
} catch (error) {
  console.error("Error in getOrCreateClientId:", error);
  return null; // Return a fallback value
}
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
              engagement_time_msec: DEFAULT_ENGAGEMENT_TIME_IN_MSEC,
              page_title: page,
              user_id: await getOrCreateClientId(),
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
              engagement_time_msec: DEFAULT_ENGAGEMENT_TIME_IN_MSEC,
              page_title: page,
              action_title: interaction,
              user_id: await getOrCreateClientId(),
            },
          },
        ],
      }),
    }
  );
};

export const trackTagImpressionEvent = async (tagName, pageUrl) => {
  try {
  const domainName = new URL(pageUrl).hostname; // Extract the domain name from the URL
  const payload = {
    client_id: await getOrCreateClientId(),
    events: [
      {
        name: "tag_impression",
        params: {
          session_id: await getOrCreateSessionId(),
          engagement_time_msec: DEFAULT_ENGAGEMENT_TIME_IN_MSEC,
          tag_name: tagName,
          domain_name: domainName,
          page_url: pageUrl,
          user_id: await getOrCreateClientId(),
        },
      },
    ],
  };
  // console.log("Sending request to Google Analytics:", {
  //   url: `${GA_ENDPOINT}?measurement_id=${MEASUREMENT_ID}&api_secret=${API_SECRET}`,
  //   payload,
  // });

    const response = await fetch(
      `${GA_ENDPOINT}?measurement_id=${MEASUREMENT_ID}&api_secret=${API_SECRET}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Check if the response has content before parsing
    // const text = await response.text();
    // if (text) {
    //   const jsonResponse = JSON.parse(text);
    //   // console.log("Google Analytics response:", jsonResponse);
    // } else {
    //   // console.log("Google Analytics response: No content");
    // }

    // if (response.headers.get("Content-Type")?.includes("application/json")) {
    //   const jsonResponse = await response.json();
    //   // console.log("Google Analytics response:", jsonResponse);
    // } else {
    //   // console.log("Google Analytics response: Non-JSON or empty response");
    // }
  } catch (error) {
    if (error.message.includes("Extension context invalidated")) {
      console.warn("Extension context invalidated. Skipping fetch.");
    } else {
      console.error("Error sending tag impression event:", error);
    }
  }
};

