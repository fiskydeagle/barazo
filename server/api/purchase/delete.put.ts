import db from "@/models/index.js";
import Sequelize from "sequelize";
import { UserRole } from "~/types";

interface Payload {
  id: number;
}

export default defineEventHandler(async (event) => {
  if (!event.context.user || !event.context.user.role) {
    throw createError({
      statusCode: 403,
      statusMessage: "validations.not-authorized",
    });
  }

  const body: Payload = await readBody(event);

  const purchase = await db.Purchases.findOne({
    where: { id: body.id },
    attributes: ["id", "shopId", "createdBy"],
  });

  if (!purchase) {
    throw createError({
      statusCode: 400,
      statusMessage: "validations.something-wrong",
    });
  }

  if (
    ![UserRole.SUPERADMIN].includes(event.context.user.role) &&
    (purchase.dataValues.shopId !== event.context.user.shopId ||
      (![UserRole.SUPERADMIN, UserRole.ADMIN].includes(
        event.context.user.role,
      ) &&
        purchase.dataValues.createdBy !== event.context.user.id))
  ) {
    throw createError({
      statusCode: 403,
      statusMessage: "validations.not-authorized",
    });
  }

  try {
    return await purchase.destroy({ force: true });
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
