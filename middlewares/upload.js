const multer = require('multer');
const path = require('path');
const fs = require('fs');
const moment = require('moment-timezone');

// สร้าง storage engine สำหรับจัดเก็บไฟล์เอกสารและภาพ
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const userId =  req.User_id  || 'unknown'; // ใช้ User_id หรือค่าอื่น ๆ เพื่อระบุโฟลเดอร์
        const dir = file.fieldname === 'User_file'
            ? path.join('uploads', 'User', 'documents', userId) // โฟลเดอร์สำหรับเอกสาร
            : path.join('uploads', 'User', 'images', userId);  // โฟลเดอร์สำหรับภาพ

        fs.mkdir(dir, { recursive: true }, (err) => {
            if (err) return cb(err);
            cb(null, dir);
        });
    },
    filename: function (req, file, cb) {
        const thaiTime = moment().tz('Asia/Bangkok').format('YYYYMMDD_HHmmss');
        cb(null, thaiTime +'-'+ req.User_id + path.extname(file.originalname)); // ใช้ timestamp เพื่อป้องกันชื่อไฟล์ซ้ำ
    }
});

// สร้าง multer instance สำหรับการจัดการหลายไฟล์
const upload = multer({ storage });

// middleware สำหรับการอัปโหลดเอกสารและภาพ
const uploadMiddleware = upload.fields([
    { name: 'User_file', maxCount: 1 }, // สำหรับเอกสาร
    { name: 'User_Image', maxCount: 1 }  // สำหรับภาพ
]);

module.exports = { uploadMiddleware };
