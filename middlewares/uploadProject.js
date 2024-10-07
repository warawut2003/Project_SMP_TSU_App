const multer = require('multer');
const fs = require('fs');
const path = require('path'); // ต้องแน่ใจว่ามีการ import path ด้วย

const storage = multer.diskStorage({
    destination: function (req,file,cb) {
        const uploadDir = '/Project/system_recruitment_TSU_SMP/uploads/ProjectFile';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename : function (req,file,cb){
        const decodedFileName = Buffer.from(file.originalname, 'latin1').toString('utf8');
        cb(null,decodedFileName);
    }
})
const upload = multer({storage})

module.exports = upload;