const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const createUser = async () => {
  const name = process.argv[2] || 'Prince Upadhyay';
  const email = process.argv[3];
  const password = process.argv[4] || 'password123';
  const role = process.argv[5] || 'Admin';

  if (!email) {
    console.log('Usage: node create-user.js <name> <email> <password> <role>');
    process.exit(1);
  }

  try {
    if (!process.env.MONGODB_URI) {
      console.error('Error: MONGODB_URI is not set in backend/.env');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB Atlas...');

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      console.log(`Error: User with email "${email}" already exists.`);
      process.exit(1);
    }

    const user = await User.create({
      name,
      email,
      password,
      role
    });

    console.log(`Successfully created new user:`);
    console.log(`Name: ${user.name}`);
    console.log(`Email: ${user.email}`);
    console.log(`Role: ${user.role}`);
    process.exit(0);
  } catch (error) {
    console.error('Error creating user:', error);
    process.exit(1);
  }
};

createUser();
