const customFetch = async (url, options = {}) => {
  // 1. Retrieve the token from storage
  const token = localStorage.getItem("accessToken");

  // 2. Initialize headers if they don't exist
  options.headers = {
    "Content-Type": "application/json",
    ...options.headers, // Preserves any headers passed specifically to this request
  };

  // 3. Inject the Bearer token if available
  if (token) {
    options.headers["Authorization"] = `Bearer ${token}`;
  }

  // 4. Execute the native fetch
  const response = await fetch(url, options);

  // Optional: Handle global errors here (e.g., 401 Unauthorized / Token Expired)
  if (response.status === 401) {
    console.error("Token expired or invalid. Redirecting to login...");
    // Handle token refresh logic or logout here
  }

  return response;
};

// --- How to use it anywhere in your app ---
// You don't have to manually pass the token anymore!
customFetch("https://example.com")
  .then((res) => res.json())
  .then((data) => console.log(data));
