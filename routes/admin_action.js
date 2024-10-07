const express = require('express'); 

const upload = require('../middlewares/uploadProject');


const {admin_UpdateUser,admin_getUsers,admin_getUser,admin_DeleteUser,} = require('../controllers/actionAdminContrller');
const {createProject,updateProject,getProject,getProjects,deleteProject} = require("../controllers/projectController");

const authenticateToken = require("../middlewares/auth");

const router = express.Router();


router.put('/update/user/:id',authenticateToken, admin_UpdateUser);
router.get('/get/users/:project_id',authenticateToken,admin_getUsers);
router.get('/get/user/:user_id',authenticateToken,admin_getUser);

router.delete('/delete/user/:id',authenticateToken, admin_DeleteUser);



router.post("/create/project",authenticateToken,upload.single('ProjectFile'),createProject);
router.delete("/delete/project/:project_id",authenticateToken,deleteProject);
router.put("/update/project/:project_id",authenticateToken,upload.single('ProjectFile'), updateProject);
router.get("/project/:project_id",authenticateToken, getProject);
router.get("/projects",authenticateToken, getProjects);

module.exports = router;