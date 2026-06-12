function getMongoDbUri() {
  const dbURI = process.env.MONGODB_URI;

  if (!dbURI) {
    throw new Error("MONGODB_URI is required. Configure the Atlas connection string before starting the app.");
  }

  if (dbURI.includes("localhost") || dbURI.includes("127.0.0.1")) {
    throw new Error("Local MongoDB connections are disabled. Use the Atlas MONGODB_URI.");
  }

  return dbURI;
}

module.exports = getMongoDbUri;
