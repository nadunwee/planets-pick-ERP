let cachedSecret = null;
let warned = false;

const DEFAULT_SECRET = "planets-pick-dev-secret";

const getJwtSecret = () => {
  if (cachedSecret) {
    return cachedSecret;
  }

  const envSecret = process.env.SECRET || process.env.JWT_SECRET;
  if (envSecret) {
    cachedSecret = envSecret;
    return cachedSecret;
  }

  if (!warned) {
    console.warn(
      "JWT secret not configured; using development fallback. Configure SECRET in environment variables for production."
    );
    warned = true;
  }

  cachedSecret = DEFAULT_SECRET;
  return cachedSecret;
};

module.exports = { getJwtSecret };
