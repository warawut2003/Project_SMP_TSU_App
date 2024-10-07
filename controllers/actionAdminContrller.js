const  connection  = require("../db.config");
const path = require('path'); // เพิ่มบรรทัดนี้เพื่อเรียกใช้งานโมดูล path
const fs = require('fs');



exports.admin_getUsers = async(req,res)=>{
    const project_id = req.params.project_id;

     connection.execute('SELECT User_id, User_Fname, User_Lname, User_phone_num, User_email  FROM users WHERE project_id_fk = ? ORDER BY User_id DESC', [project_id]).then((result) => {
        
        var rawData = result[0];
        res.send(rawData);  
     
         }).catch((err) => {
            console.log(err);
            res.end();
     
         });

}

exports.admin_UpdateUser =  async(req,res) =>{
    const {User_status,admin_id} = req.body;
    const now = new Date().toISOString().slice(0,19).replace('T', ' ');

    connection.execute("UPDATE users SET User_status=? ,admin_id_FK =? ,update_at=? WHERE User_id=?",
        [User_status ,admin_id ,now ,req.params.id]
    ).then(() =>{
        console.log('Update Successfully');
        res.status(200).send("Update Successfully.");
    }).catch((err) => {
        console.log(err);
        res.status(500).send("Error updating user.");
    });
}

exports.admin_getUser = async(req,res)=>{
    const id = req.params.user_id;

    try {
        const [rows] = await connection.execute('SELECT User_id, National_ID, User_prefix, User_Fname, User_Lname, User_gender, User_Date_Birth, User_age, User_phone_num, User_email, User_status, User_Image, User_file, project_id_fk  FROM users WHERE User_id  = ?', [id]);
        if (rows.length > 0) {
            res.status(200).json(rows[0]);
        } else {
            res.status(404).send('User not found');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Error retrieving user');
    }
}

exports.admin_DeleteUser = async (req, res) => {
    const userId = req.params.id;

    if (!userId) {
        return res.status(400).send('User ID is required');
    }

    try {
        
        const [rows] = await connection.execute('SELECT User_Image,User_file FROM users WHERE User_id  = ?', [userId]);


        if (rows.affectedRows === 0) {
            return res.status(404).send('users not found');
        }


        // Define paths for documents and images

        const documentFolderPath = path.join('uploads', 'User','documents',userId);  // Parent folder for the user
        const imagesFolderPath = path.join('uploads', 'User','images',userId);  // Parent folder for the user


        // Delete the user from the database
        await connection.execute("DELETE FROM users WHERE User_id = ?;", [userId]);

        // Delete the user document folder if it exists


        await deleteDirectory(documentFolderPath);

        await deleteDirectory(imagesFolderPath);

        console.log('Delete Successfully');
        res.status(200).send("Delete Successfully.");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error deleting user.");
    }
};



// Function to delete a directory and its contents
const deleteDirectory = (dirPath) => {
    return new Promise((resolve, reject) => {
        fs.rm(dirPath, { recursive: true, force: true }, (err) => {
            if (err) reject(err);
            resolve();
        });
    });
};