import express from "express";
import connectionPool from "./utils/db.mjs";

const app = express();
const port = 4001;

app.use(express.json());

app.get("/test", (req, res) => {
  return res.json("Server API is working 🚀");
});

app.post("/assignments", async (req, res) => {
  const newAssignment = {
    ...req.body,
  };

  if (
    !newAssignment.title ||
    !newAssignment.content ||
    !newAssignment.category
  ) {
    return res.status(400).json({
      message:
        "Server could not create assignment because there are missing data from client",
    });
  }

  try {
    await connectionPool.query(
      `insert into assignments (title, content, category)
      values ($1, $2, $3)`,
      [newAssignment.title, newAssignment.content, newAssignment.category]
    );
  } catch {
    return res.status(500).json({
      message: "Server could not create assignment because database connection",
    });
  }

  return res.status(201).json({
    message: "Created assignment sucessfully",
  });
});

// ดูข้อมูลแบบทดสอบทั้งหมด
app.get("/assignments", async (req, res) => {
  let results;
  try {
    results = await connectionPool.query(
      `
      select * from assignments
      `
    );
  } catch {
    return res.status(500).json({
      message: "Server could not read assignment because database connection",
    });
  }
  return res.status(200).json({
    data: results.rows,
  });
});

// ดูข้อมูลแบบทดสอบอันเดียว
app.get("/assignments/:assignmentId", async (req, res) => {
  const assignmentsIdFromClient = req.params.assignmentId;

  let results;
  try {
    results = await connectionPool.query(
      `select * from assignments where assignment_id=$1`,
      [assignmentsIdFromClient]
    );
  } catch {
    return res.status(500).json({
      message: "Server could not read assignment because database connection",
    });
  }
  if (!results.rows[0]) {
    return res.status(404).json({
      message: `Server could not find a requested assignment (assignment id: ${assignmentsIdFromClient})`,
    });
  }

  return res.status(200).json({
    data: results.rows[0],
  });
});

// แก้ไขแบบทดสอบที่ได้เคยสร้างไว้
app.put("/assignments/:assignmentId", async (req, res) => {
  const assignmentsIdFromClient = req.params.assignmentId;
  const updateAssignment = { ...req.body, updated_at: new Date() };

  try {
    const checkResult = await connectionPool.query(
      `
      select *
      from assignments
      where assignment_id = $1
      `,
      [assignmentsIdFromClient]
    );
    if (!checkResult.rows[0]) {
      return res.status(404).json({
        message: "Server could not find a requested assignment to update",
      });
    }
    await connectionPool.query(
      `
      update assignments
      set title = $2,
          content = $3,
          category = $4,
          length = $5,
          status = $6,
          updated_at = $7
      where assignment_id = $1
      `,
      [
        assignmentsIdFromClient,
        updateAssignment.title,
        updateAssignment.content,
        updateAssignment.category,
        updateAssignment.length,
        updateAssignment.status,
        updateAssignment.updated_at,
      ]
    );
    return res.status(200).json({
      message: "Updated assignment sucessfully",
    });
  } catch {
    return res.status(500).json({
      message: "Server could not find a requested assignment to update",
    });
  }
});

// ลบแบบทดสอบที่ได้เคยสร้างไว้
app.delete("/assignments/:assignmentId", async (req, res) => {
  const assignmentsIdFromClient = req.params.assignmentId;

  try {
    const checkResult = await connectionPool.query(
      `
      select *
      from assignments
      where assignment_id = $1
      `,
      [assignmentsIdFromClient]
    );
    if (!checkResult.rows[0]) {
      return res.status(404).json({
        message: "Server could not find a requested assignment to delete",
      });
    }
    await connectionPool.query(
      `
      delete from assignments
      where assignment_id = $1
      `,
      [assignmentsIdFromClient]
    );
    return res.status(200).json({
      message: "Deleted assignment sucessfully",
    });
  } catch {
    return res.status(500).json({
      message: "Server could not delete assignment because database connection",
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
