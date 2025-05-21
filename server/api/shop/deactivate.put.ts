import db from "@/models/index.js";
import Sequelize from "sequelize";
import { UserRole } from "~/types";

interface Payload {
  id: number;
}

export default defineEventHandler(async (event) => {
  if (
    !event.context.user ||
    !event.context.user.role ||
    ![UserRole.SUPERADMIN].includes(event.context.user.role)
  ) {
    throw createError({
      statusCode: 403,
      statusMessage: "validations.not-authorized",
    });
  }

  const body: Payload = await readBody(event);

  const shop = await db.Shops.findOne({
    where: { id: body.id },
    attributes: ["id", "updatedBy"],
    paranoid: false,
  });

  if (!shop) {
    throw createError({
      statusCode: 400,
      statusMessage: "validations.something-wrong",
    });
  }

  try {
    await shop.destroy();

    await db.Users.destroy({
      where: { shopId: shop.dataValues.id },
    });

    return await shop.update({
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
