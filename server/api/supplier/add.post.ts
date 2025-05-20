import db from "@/models/index.js";
import Sequelize from "sequelize";

interface Payload {
  company: string;
  city: string;
  address: string;
  tel: string;
}

export default defineEventHandler(async (event) => {
  if (!event.context.user) {
    throw createError({
      statusCode: 403,
      statusMessage: "validations.not-authorized",
    });
  }

  const body: Payload = await readBody(event);

  try {
    return await db.Suppliers.create({
      company: body.company,
      city: body.city,
      address: body.address,
      tel: body.tel,
      createdBy: event.context.user.id,
      updatedBy: event.context.user.id,
    });
  } catch (error: any) {
    if (error instanceof Sequelize.ValidationError) {
      throw createError({
        statusCode: 400,
        statusMessage: "validations.wrong",
        data: error.errors.map((item) => item.message),
      });
    }
    throw createError({
      statusCode: 400,
      statusMessage: "validations.something-wrong",
    });
  }
});
