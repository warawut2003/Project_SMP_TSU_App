const multer = require('multer');
const fs = require('fs');
const path = require('path'); // ต้องแน่ใจว่ามีการ import path ด้วย
const moment = require('moment-timezone');

const storage = multer.diskStorage({
    destination: function (req,file,cb) {

        // ดึงรหัสผู้สมัครจาก req.params.id
        const userId = req.params.id;
        

        //path สำหรับเก็บไฟล์โดยใช้รหัสผู้สมัคร
        const uploadDir = path.join(__dirname, '..', 'uploads', 'User', 'documents', userId); 
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename : function (req,file,cb){
        const thaiTime = moment().tz('Asia/Bangkok').format('YYYYMMDD_HHmmss');
        cb(null, thaiTime +'-'+ req.params.id + path.extname(file.originalname));

    }
})
const uploadFile = multer({storage})

module.exports = uploadFile;