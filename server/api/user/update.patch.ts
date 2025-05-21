import db from "@/models/index.js";
import Sequelize from "sequelize";
import { UserRole } from "~/types";

interface Payload {
  id: number;
  firstName: string;
  lastName: string;
  role: UserRole;
  shopId: number;
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

  if (
    ![UserRole.SUPERADMIN].includes(event.context.user.role) &&
    body.role === UserRole.SUPERADMIN
  ) {
    throw createError({
      statusCode: 403,
      statusMessage: "validations.not-authorized",
    });
  }

  const shopId = [UserRole.SUPERADMIN].includes(event.context.user.role)
    ? body.shopId
    : event.context.user.shopId;

  const user = await db.Users.findOne({
    where: { id: body.id },
    attributes: ["id"],
    paranoid: false,
  });

  if (!user) {
    throw createError({
      statusCode: 400,
      statusMessage: "validations.something-wrong",
    });
  }

  try {
    return await user.update({
      firstName: body.firstName,
      lastName: body.lastName,
      role: body.role,
      shopId: body.role !== UserRole.SUPERADMIN ? shopId : undefined,
      city: body.city,
      address: body.address,
      tel: body.tel,
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
