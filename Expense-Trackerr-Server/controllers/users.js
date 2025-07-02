const User = require("../model/user");
const Category = require("../model/category");
const People = require("../model/people");
const Transaction = require("../model/transaction");
const RecuringTransaction = require("../model/recuringTransaction");
const Notification = require('../model/notification');
const Budget = require('../model/budget');
const mongoose = require("mongoose");

// Utility function to generate unique IDs
function generateUniqueId() {
  const randomString1 = Math.random().toString(36).substring(2, 8);
  const randomString2 = Math.random().toString(36).substring(2, 8);
  const randomNumber = Math.floor(Math.random() * 100);
  return `Ru-${randomString1}${randomNumber}${randomString2}`;
}

// Add a new user
async function addUser(req, res) {
  try {
    const uniqueId = generateUniqueId();

    const defaultSpent = await Category.create({
      hexColor: "#707070",
      name: "Others",
      sign: "-",
      type: "Spent",
    });
    const defaultEarned = await Category.create({
      hexColor: "#0328fc",
      name: "Salary",
      sign: "+",
      type: "Earned",
    });

    const defaultPeople = await People.create({
      name: "Person Name",
      relation: "relation",
      contact: 9999988888
    })

    // Create the new user with the default category
    const userData = {
      ...req.body,
      userId: uniqueId,
      categories: [defaultSpent, defaultEarned],
      people: [defaultPeople]
    };

    const newUser = await User.create(userData);
    res.status(201).json(newUser);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Failed to create user" });
  }
}

// Get all users
async function getAllUsers(req, res) {
  try {
    const users = await User.find(); // Fetch all users from the database
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
}

// Get a user by their unique ID
async function getUserById(req, res) {
  try {
    const { id } = req.params;

    const user = await User.findOne({ userId: id });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    console.log("Backend: Returning user data, userImage length:", user.userImage ? user.userImage.length : 0);
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
}

// Edit a user's data
async function editUser(req, res) {
  try {
    const { id } = req.params; // User's unique ID
    const updatedData = req.body; // Data to update

    const user = await User.findOneAndUpdate({ userId: id }, updatedData, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
}

async function deleteUser(req, res) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const user = await User.findOne({ userId: id }).session(session);

    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ error: "User not found" });
    }

    const transactionIds = user.transactions.map(t => t._id);
    const recurringTransactionIds = user.recuringTransactions.map(rt => rt._id);
    const categoryIds = user.categories.map(c => c._id);
    const peopleIds = user.people.map(p => p._id);
    const notificationIds = user.notifications.map(n => n._id);
    const budgetIds = user.budgets.map(b => b._id);
    const trashIds = user.trash.map(t => t._id);

    // Delete all related documents
    await Transaction.deleteMany({ _id: { $in: transactionIds } }).session(session);
    await RecuringTransaction.deleteMany({ _id: { $in: recurringTransactionIds } }).session(session);
    await Category.deleteMany({ _id: { $in: categoryIds } }).session(session);
    await People.deleteMany({ _id: { $in: peopleIds } }).session(session);
    await Notification.deleteMany({ _id: { $in: notificationIds } }).session(session);
    await Budget.deleteMany({ _id: { $in: budgetIds } }).session(session);

    // Delete user
    await User.findOneAndDelete({ userId: id }).session(session);

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ message: "User and all related data deleted successfully" });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
}

// Upload profile image and store base64 in DB
async function uploadProfileImage(req, res) {
  try {
    const { id } = req.params;
    const { image } = req.body; // base64 string
    console.log('Uploading profile image for user:', id);
    console.log('Image data length:', image ? image.length : 0);
    
    if (!image) {
      return res.status(400).json({ error: 'No image provided' });
    }

    // Update user with base64 image
    const user = await User.findOneAndUpdate(
      { userId: id },
      { userImage: image },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('Profile image updated successfully for user:', id);
    console.log('Image data type:', typeof image);
    console.log('Image data starts with:', image ? image.substring(0, 50) + '...' : 'No image');
    res.status(200).json({ userImage: image });
  } catch (error) {
    console.error('Error uploading profile image:', error);
    res.status(500).json({ error: 'Failed to upload profile image' });
  }
}

module.exports = { addUser, getAllUsers, getUserById, editUser, deleteUser, uploadProfileImage };
