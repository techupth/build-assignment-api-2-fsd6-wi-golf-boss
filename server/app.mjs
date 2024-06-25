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
    const result = await connectionPool.query(`SELECT * FROM assignments`);
    return res.status(200).json({
      data: result.rows,
    });
  } catch {
    return res.status(500).json({
      message: "Server could not create post because database connection",
    });
  }
});

app.get("/assignments/:assignmentId", async (req, res) => {
  try {
    const assignmentIdFromClient = req.params.assignmentId;

    const result = await connectionPool.query(
      `SELECT * FROM assignments WHERE assignment_id=$1`,
      [assignmentIdFromClient]
    );

    if (result.rowCount > 0) {
      return res.status(200).json({
        data: result.rows[0],
      });
    } else {
      return res
        .status(404)
        .json({ message: "Server could not find a requested assignment" });
    }
  } catch {
    return res.status(500).json({
      message: "Server could not create post because database connection",
    });
  }
});

app.put("/assignments/:assignmentId", async (req, res) => {
  const assignmentIdFromClient = req.params.assignmentId;

  const updateAssignment = {
    ...req.body,
    updated_at: new Date(),
  };

  try {
    const result = await connectionPool.query(
      `UPDATE assignments 
       SET title=$2, content=$3, category=$4, updated_at=$5 
       WHERE assignment_id=$1`,
      [
        assignmentIdFromClient,
        updateAssignment.title,
        updateAssignment.content,
        updateAssignment.category,
        updateAssignment.updated_at,
      ]
    );

    if (result.rowCount > 0) {
      return res
        .status(200)
        .json({ message: "Updated assignment successfully" });
    } else {
      return res.status(404).json({
        message: "Server could not find the requested assignment to update",
      });
    }
  } catch {
    return res.status(500).json({
      message:
        "Server could not update the assignment because of a database connection issue",
    });
  }
});

app.delete("/assignments/:assignmentId", async (req, res) => {
  const assignmentIdFromClient = req.params.assignmentId;

  try {
    const result = await connectionPool.query(
      `DELETE FROM assignments WHERE assignment_id=$1`,
      [assignmentIdFromClient]
    );

    if (result.rowCount > 0) {
      return res
        .status(200)
        .json({ message: "Deleted assignment successfully" });
    } else {
      return res.status(404).json({
        message: "Server could not find the requested assignment to delete",
      });
    }
  } catch (error) {
    return res.status(500).json({
      message:
        "Server could not delete the assignment because of a database connection issue",
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
