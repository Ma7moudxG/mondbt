import { Handler, Context, APIGatewayProxyEvent } from "@netlify/functions";
import { supabaseAdmin } from "./utils/supabaseAdminClient";

export interface Excuse {
  id: string;
  student_id: number;
  excuse_date_g: string;
  excuse_date_h: string;
  status_en: "PENDING" | "APPROVED" | "REJECTED";
  status_ar: "قيد المراجعة" | "مقبول" | "مرفوض";
  type: string;
  reason_id: number;
  created_at?: string;
  remarks_ar: string;
  remarks_en: string;
}

const handler: Handler = async (
  event: APIGatewayProxyEvent,
  context: Context
) => {
  if (event.httpMethod !== "PATCH") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const excuseId = event.path.split("/").pop();

  if (!excuseId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Excuse ID is required." }),
    };
  }

  try {
    const { status_en, status_ar, remarks_en = "", remarks_ar = "" } = JSON.parse(event.body || "{}");

    // Validate
    if (
      !["PENDING", "APPROVED", "REJECTED"].includes(status_en) ||
      !["قيد المراجعة", "مقبول", "مرفوض"].includes(status_ar)
    ) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid status_en or status_ar provided." }),
      };
    }

    const updateData = {
      status_en,
      status_ar,
      remarks_en,
      remarks_ar,
    };

    console.log(`[updateExcuseStatus] Updating excuse ${excuseId} with:`, updateData);

    const { data, error } = await supabaseAdmin
      .from("excuses")
      .update(updateData)
      .eq("id", excuseId)
      .select()
      .single();

    if (error) {
      console.error("[updateExcuseStatus] Supabase error:", error);
      return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }

    if (!data) {
      return { statusCode: 404, body: JSON.stringify({ error: "Excuse not found." }) };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    };
  } catch (err) {
    console.error("[updateExcuseStatus] Unexpected error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Server error: ${(err as Error).message}` }),
    };
  }
};

export { handler };
