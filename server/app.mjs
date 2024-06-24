import express from "express";
import connectionPool from "./utils/db.mjs";

const app = express();
const port = 4001;

app.use(express.json());

app.get("/test", (req, res) => {
  return res.json("Server API is working 🚀");
});

app.get("/assignments", async (req, res) => {
  try {
    const result = await connectionPool.query("SELECT * FROM assignments");
    return res.status(200).json({ data: result.rows });
  } catch {
    return res.status(500).json({
      message: "Server could not read assignment because database connection",
    });
  }
});

app.get("/assignments/:assignmentId", async (req, res) => {
  const assignmentId = req.params.assignmentId;
  let result;
  try {
    result = await connectionPool.query(
      `SELECT * FROM assignments WHERE assignment_id = $1`,
      [assignmentId]
    );
  } catch {
    return res.status(500).json({
      message: "Server could not read assignment because database connection",
    });
  }

  if (!result.rows[0]) {
    return res
      .status(404)
      .json({ message: "Server could not find a requested assignment" });
  }

  return res.status(200).json({ data: result.rows[0] });
});

app.post("/assignments", async (req, res) => {
  const createdAssignment = { ...req.body };
  if (
    !createdAssignment.title ||
    !createdAssignment.content ||
    !createdAssignment.category
  ) {
    return res.status(400).json({
      message:
        "Server could not create post because there are missing data from client",
    });
  }
  try {
    await connectionPool.query(
      `INSERT INTO assignments (title, content, category, user_id)
      values ($1, $2, $3, $4)`,
      [
        createdAssignment.title,
        createdAssignment.content,
        createdAssignment.category,
        createdAssignment.user_id,
      ]
    );
    return res.status(201).json({ message: "Created post successfully" });
  } catch {
    return res.status(500).json({
      message: "Server could not create post because database connection",
    });
  }
});

app.put("/assignments/:assignmentId", async (req, res) => {
  const assignmentId = req.params.assignmentId;
  const updatedAssignment = { ...req.body, updated_at: new Date() };
  try {
    const result = await connectionPool.query(
      `SELECT * FROM assignments WHERE assignment_id = $1`,
      [assignmentId]
    );
    if (!result.rows[0]) {
      return res.status(404).json({
        message: "Server could not find a requested assignment to update",
      });
    } else {
      await connectionPool.query(
        `
        UPDATE assignments
        SET title = $2,
            content = $3,
            category = $4,
            updated_at = $5
        WHERE assignment_id = $1    
        `,
        [
          assignmentId,
          updatedAssignment.title,
          updatedAssignment.content,
          updatedAssignment.category,
          updatedAssignment.updated_at,
        ]
      );
      return res
        .status(200)
        .json({ message: "Updated assignment sucessfully" });
    }
  } catch {
    return res.status(500).json({
      message: "Server could not update assignment because database connection",
    });
  }
});

app.delete("/assignments/:assignmentId", async (req, res) => {
  const assignmentId = req.params.assignmentId;
  try {
    const result = await connectionPool.query(
      `SELECT * FROM assignments WHERE assignment_id = $1`,
      [assignmentId]
    );
    if (!result.rows[0]) {
      return res.status(404).json({
        message: "Server could not find a requested assignment to delete",
      });
    } else {
      await connectionPool.query(
        `DELETE FROM assignments
         WHERE assignment_id = $1`,
        [assignmentId]
      );
      return res
        .status(200)
        .json({ message: "Deleted assignment sucessfully" });
    }
  } catch {
    return res.status(500).json({
      message: "Server could not delete assignment because database connection",
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
