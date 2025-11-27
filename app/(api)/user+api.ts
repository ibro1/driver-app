import pool from "@/lib/db";

export async function POST(request: Request) {
    try {
        const { name, email, clerkId } = await request.json();

        if (!name || !email || !clerkId) {
            return Response.json(
                { error: "Missing required fields" },
                { status: 400 },
            );
        }

        const response = await pool.query(
            `INSERT INTO users (
        name, 
        email, 
        clerk_id
      ) 
      VALUES ($1, $2, $3)
      RETURNING *`,
            [name, email, clerkId]
        );

        return new Response(JSON.stringify({ data: response.rows[0] }), {
            status: 201,
        });
    } catch (error) {
        console.error("Error creating user:", error);
        return Response.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
