import db from "@/models/index.js";
import bcrypt from "bcrypt";
import Sequelize from "sequelize";
import { UserRole } from "~/types";

interface Payload {
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  shopId: string;
  password: string;
  city: string;
  address: string;
  tel: string;
}

export default defineEventHandler(async (event) => {
  if (
    !event.context.user ||
    !event.context.user.role ||
    ![UserRole.SUPERADMIN, UserRole.ADMIN].includes(event.context.user.role)
  ) {
    throw createError({
      statusCode: 403,
      statusMessage: "validations.not-authorized",
    });
  }

  const body: Payload = await readBody(event);
  const hashedPassword = await bcrypt.hash(body.password, 10);

  try {
    return await db.Users.create({
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      role: body.role,
      shopId: body.shopId,
      password: hashedPassword,
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
