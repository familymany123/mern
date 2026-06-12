const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = require("../app/models/user.model");
require("dotenv").config();
const getMongoDbUri = require("../app/config/mongodbUri");

const dbURI = getMongoDbUri();

const adminUser = {
  fullname: "Admin Demo",
  address: "Ho Chi Minh City",
  phone: "0900000001",
  email: "admin@swiggi.local",
  username: "admin",
  role: "admin",
  status: true,
};

async function main() {
  await mongoose.connect(dbURI);

  const password = await bcrypt.hash("Admin12345", 10);
  await User.findOneAndUpdate(
    { username: adminUser.username },
    {
      $set: {
        ...adminUser,
        password,
        updated_at: new Date(),
      },
      $setOnInsert: {
        created_at: new Date(),
      },
    },
    { upsert: true, new: true }
  );

  await mongoose.disconnect();

  console.log("Admin user is ready.");
  console.log("Username: admin");
  console.log("Password: Admin12345");
}

main().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
