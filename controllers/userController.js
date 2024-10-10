const  connection  = require("../db.config");




const generateUserId = async () => {
    const [rows] = await connection.query('SELECT User_id FROM users ORDER BY User_id DESC LIMIT 1');
    let newUserId = 'A001';
    if (rows.length > 0) {
        let lastUserId = rows[0].User_id;
        let lastLetterPart = lastUserId.substring(0, 1);
        let lastNumberPart = parseInt(lastUserId.substring(1), 10);

        if (lastNumberPart < 999) {
            lastNumberPart += 1;
        } else {
            lastNumberPart = 1;
            if (lastLetterPart < 'Z') {
                lastLetterPart = String.fromCharCode(lastLetterPart.charCodeAt(0) + 1);
            } else {
                throw new Error('Reached maximum ID value');
            }
        }

        newUserId = `${lastLetterPart}${lastNumberPart.toString().padStart(3, '0')}`;
    }

    return newUserId;
};

exports.CreateUser = async (req, res) => {
    try {
        // สร้าง user_id ใหม่
        const newUserId = await generateUserId();
        

        // เพิ่ม user_id ไปยัง req เพื่อใช้ใน middleware
        req.User_id = newUserId;

            const { National_ID, User_prefix, User_Fname, User_Lname, User_gender, User_Date_Birth, User_age, phone_num, User_email, User_status, project_id_fk,User_Image,User_file } = req.body;

            if (!National_ID || !User_prefix || !User_Fname || !User_Lname || !User_gender || !User_Date_Birth
                || !User_age || !phone_num || !User_email || !User_status || !User_Image || !User_file || !project_id_fk ||!User_Image||!User_file) {
                return res.status(400).send('Missing required fields');
            }

            const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

            try {
                await connection.execute(`INSERT INTO users(User_id, National_ID, User_prefix, User_Fname, User_Lname, User_gender, User_Date_Birth, User_age, User_phone_num, User_email, User_status, User_Image, User_file, created_at, update_at, project_id_fk) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
                    [
                        newUserId, National_ID, User_prefix, User_Fname, User_Lname, User_gender, User_Date_Birth, User_age, phone_num, User_email, User_status, User_Image, User_file, now, now, project_id_fk
                    ]
                );

                console.log("Insert successfully");
                res.status(201).send('User registered successfully');

            } catch (err) {
                res.status(500).json({ message: err.message });
            }
    } catch (err) {
        res.status(500).send('An error occurred: ' + err.message);
    }
};

exports.getUsers = async(req,res) =>{

    connection.execute('SELECT * FROM users;')
        
            .then((result) => {
        
               var rawData = result[0];
        
               
               res.status(200).json(rawData);
               
        
            }).catch((err) => {
        
               console.log(err);
        
               res.end();
        
            });
}

exports.getUser = async(req,res) =>{
    const National_ID = req.params.id;
    //const projectID = req.query.project_id;
    const { projectID } = req.body;

    try {
        const [rows] = await connection.execute(`
            SELECT 
                u.User_id, 
                u.User_prefix, 
                u.User_Fname, 
                u.User_Lname, 
                u.User_gender, 
                u.User_Date_Birth, 
                u.User_age, 
                u.User_phone_num, 
                u.User_email, 
                u.User_status, 
                u.User_Image, 
                u.User_file, 
                p.project_name
            FROM 
                users u 
            INNER JOIN 
                projects p ON u.project_id_fk = p.project_id 
            WHERE 
                u.National_ID = ? AND u.project_id_fk =?`, [National_ID,projectID]);
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

exports.UpdateUser =  async(req,res) =>{
    const {User_Flie} = req.body
    
    const now = new Date().toISOString().slice(0,19).replace('T', ' ');
    connection.execute("UPDATE users SET User_status=?, User_file=?, update_at=? WHERE User_id=?",
        ['รอการตรวจสอบ',User_Flie, now, req.params.id]
    ).then(() =>{
        console.log('Update Successfully');
        res.status(200).send("Update Successfully.");
    }).catch((err) => {
        console.log(err);
        res.status(500).send("Error updating user.");
    });
}





exports.DeleteUser = async(req,res) =>{
    connection.execute("DELETE FROM users WHERE User_id =?;",
        [req.params.id]
    ).then(() =>{
        console.log('Delete Successfully');
    }).catch((err) =>{
        console.log(err);
    });
    res.status(200).send("Delete Successfully.");
    res.end();
}