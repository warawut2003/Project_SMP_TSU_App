const express = require('express');
const router = express.Router();

const uploadFile = require('../middlewares/updateFile');

const {CreateUser,getUser,getUsers,UpdateUser,DeleteUser} = require("../controllers/userController");


router.post("/", async(req,res)=>{
    res.sendStatus(404);
});



router.post("/create",CreateUser);
router.get("/",getUsers);
router.get("/:id",getUser);
router.put("/upload/:id",uploadFile.single('User_Flie'),UpdateUser);
router.delete("/delete/:id",DeleteUser)

module.exports = router;