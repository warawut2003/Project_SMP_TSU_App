const express = require('express');
const router = express.Router();

const {nonEndProject} = require("../controllers/projectController");
router.post("/", async(req,res)=>{
    res.sendStatus(404);
});
router.get("/latest",nonEndProject);


module.exports = router;