import pool from "@/lib/db";

export async function GET(request: Request) {
  try {
    const response = await pool.query('SELECT * FROM drivers');

    return Response.json({ data: response.rows });
  } catch (error) {
    console.error("Error fetching drivers:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
