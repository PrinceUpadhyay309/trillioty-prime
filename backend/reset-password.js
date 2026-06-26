const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const resetPassword = async () => {
  const email = process.argv[2];
  const newPassword = process.argv[3];

  if (!email || !newPassword) {
    console.log('Usage: node reset-password.js <email> <new_password>');
    process.exit(1);
  }

  try {
    if (!process.env.MONGODB_URI) {
      console.error('Error: MONGODB_URI is not set in backend/.env');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB Atlas...');

    const user = await User.findOne({ email });
    if (!user) {
      console.log(`User with email "${email}" not found.`);
      process.exit(1);
    }

    user.password = newPassword; // The pre-save hook in models/User.js will automatically hash it
    await user.save();
    
    console.log(`Successfully updated and encrypted password for: ${email}`);
    process.exit(0);
  } catch (error) {
    console.error('Error resetting password:', error);
    process.exit(1);
  }
};

resetPassword();
