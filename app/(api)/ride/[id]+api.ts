import pool from "@/lib/db";

export async function GET(request: Request, { id }: { id: string }) {
  if (!id)
    return Response.json({ error: "Missing required fields" }, { status: 400 });

  try {
    const response = await pool.query(
      `SELECT
          rides.ride_id,
          rides.origin_address,
          rides.destination_address,
          rides.origin_latitude,
          rides.origin_longitude,
          rides.destination_latitude,
          rides.destination_longitude,
          rides.ride_time,
          rides.fare_price,
          rides.payment_status,
          rides.created_at,
          'driver', json_build_object(
              'driver_id', drivers.id,
              'first_name', drivers.first_name,
              'last_name', drivers.last_name,
              'profile_image_url', drivers.profile_image_url,
              'car_image_url', drivers.car_image_url,
              'car_seats', drivers.car_seats,
              'rating', drivers.rating
          ) AS driver 
      FROM 
          rides
      INNER JOIN
          drivers ON rides.driver_id = drivers.id
      WHERE 
          rides.user_id = $1
      ORDER BY 
          rides.created_at DESC`,
      [id]
    );

    return Response.json({ data: response.rows });
  } catch (error) {
    console.error("Error fetching recent rides:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
