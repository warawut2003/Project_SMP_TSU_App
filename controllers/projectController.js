const  connection  = require("../db.config");

exports.createProject = async (req, res) => {
        const {  project_name, project_start_date, project_expiration_date, project_file, admin_id_FK } = req.body;


        

        // ตรวจสอบความครบถ้วนของข้อมูล
        if (!project_name || !project_start_date || !project_expiration_date ||!project_file ||!admin_id_FK ) {
            return res.status(400).send('Missing required fields');
        }

        try {
            // สร้างรหัสโครงการใหม่
            const [rows] = await connection.query('SELECT project_id FROM PROJECTS ORDER BY project_id DESC LIMIT 1');
            let newProjectId = 'A0001';
            if (rows.length > 0) {
                let lastProjectId = rows[0].project_id;

                let lastLetterPart = lastProjectId.substring(0, 1);
                let lastNumberPart = parseInt(lastProjectId.substring(1), 10);

                if (lastNumberPart < 9999) {
                    lastNumberPart += 1;
                } else {
                    lastNumberPart = 1;
                    if (lastLetterPart < 'Z') {
                        lastLetterPart = String.fromCharCode(lastLetterPart.charCodeAt(0) + 1);
                    } else {
                        throw new Error('Reached maximum ID value');
                    }
                }

                newProjectId = `${lastLetterPart}${lastNumberPart.toString().padStart(4, '0')}`;
            }

            // แทรกข้อมูลลงในฐานข้อมูล
            await connection.execute(`INSERT INTO projects (project_id, project_name, project_file, project_start_date, project_expiration_date, admin_id_FK) VALUES (?, ?, ?, ?, ?, ?);`,
                [
                    newProjectId, project_name, project_file, project_start_date, project_expiration_date, admin_id_FK
                ]
            );

            console.log("Successfully added");
            res.status(201).send('Successfully added');

        } catch (err) {
            console.error(err);
            res.status(500).send('An error occurred adding');
        }
    };

exports.deleteProject = async (req, res) => {
    const { project_id } = req.params;

    if (!project_id) {
        return res.status(400).send('Project ID is required');
    }

    try {
        
        // Step 3: Get associated users based on project_id_fk
        const [userRows] = await connection.execute('SELECT User_id FROM users WHERE project_id_fk = ?', [project_id]);

        if (userRows.length > 0) {
            for (const user of userRows) {
                const userId = user.User_id;
                // Delete the user from the database
                await connection.execute('DELETE FROM users WHERE User_id = ?', [userId]);
            }
        }

        // Step 4: Delete the project itself
        const [result] = await connection.execute('DELETE FROM projects WHERE project_id = ?', [project_id]);

        if (result.affectedRows === 0) {
            return res.status(404).send('Project not found');
        }

        console.log("Project and associated users deleted successfully");
        res.status(200).send('Project and associated users deleted successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('An error occurred while deleting the project and users');
    }
};

exports.updateProject = async (req, res) => {
    const { project_id } = req.params;
    const { project_name, project_file, project_start_date,project_expiration_date,admin_id_FK } = req.body;

    if (!project_id) {
        return res.status(400).send('Project ID is required');
    }

    try {
        // ทำการอัปเดตข้อมูลโครงการในฐานข้อมูล
        const [result] = await connection.execute(
            `UPDATE projects SET project_name = ?, project_start_date = ?, project_expiration_date = ?, project_file = ?,admin_id_FK =? WHERE project_id = ?`,
            [project_name, project_start_date, project_expiration_date,project_file ,admin_id_FK , project_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).send('Project not found');
        }

        console.log("Successfully updated");
        res.status(200).send('Successfully updated');
    } catch (err) {
        console.error(err);
        res.status(500).send('An error occurred while updating');
    }
};
exports.getProject = async (req, res) => {
    const { project_id } = req.params;

    if (!project_id) {
        return res.status(400).send('Project ID is required');
    }

    try {
        const [rows] = await connection.execute(
            'SELECT * FROM projects WHERE project_id = ?' ,
            [project_id]
        );

        if (rows.length === 0) {
            return res.status(404).send('Project not found');
        }

        res.status(200).json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('An error occurred while retrieving the project');
    }
}
exports.getProjects = async (req, res) => {
    try {
        const [rows] = await connection.execute('SELECT * FROM projects ORDER BY project_id DESC');

        if (rows.length === 0) {
            return res.status(404).send('No projects found');
        }

        res.status(200).json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('An error occurred while retrieving projects');
    }
}

exports.nonEndProject = async(req, res) => {
    try {
        const [projects] = await connection.query(`
            SELECT project_id, project_name, project_start_date, project_expiration_date, project_file
            FROM projects 
            WHERE project_expiration_date > NOW()
            ORDER BY project_start_date DESC
        `);
        res.json(projects);
    } catch (err) {
        console.error('Error fetching projects:', err);
        res.status(500).send('Error fetching projects.');
    }
};



