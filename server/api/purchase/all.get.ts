import db from "@/models/index.js";
import { UserRole } from "~/types";

export default defineEventHandler(async (event) => {
  if (!event.context.user || !event.context.user.role) {
    throw createError({
      statusCode: 403,
      statusMessage: "validations.not-authorized",
    });
  }

  return db.Purchases.findAll({
    ...(![UserRole.SUPERADMIN].includes(event.context.user.role)
      ? {
          where: { shopId: event.context.user.shopId },
        }
      : {}),
    include: ["createdByUser", "updatedByUser", "shop", "supplier"],
    order: [["date", "DESC"]],
  });
});
