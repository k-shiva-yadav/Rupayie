const express = require('express');
const router = express.Router();

// Import controller functions
const { addUser, getAllUsers, getUserById, editUser, deleteUser, uploadProfileImage } = require('../controllers/users');

// Route to get all posts
router.route('/').get(getAllUsers).post(addUser)

router.route('/:id').get(getUserById).put(editUser).delete(deleteUser)

router.route('/:id/upload-profile-image').post(uploadProfileImage)

module.exports = router;