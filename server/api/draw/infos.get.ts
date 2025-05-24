import db from "@/models/index.js";
import { UserRole } from "~/types";
import { format } from "date-fns";

interface Payload {
  date: string;
  shopId: string;
}

export default defineEventHandler(async (event) => {
  if (!event.context.user || !event.context.user.role) {
    throw createError({
      statusCode: 403,
      statusMessage: "validations.not-authorized",
    });
  }

  const query: Payload = await getQuery(event);

  const date = [UserRole.SUPERADMIN, UserRole.ADMIN].includes(
    event.context.user.role,
  )
    ? new Date(query.date)
    : new Date();

  const startOfDay = new Date(`${format(date, "yyyy-MM-dd")}T00:00:00.000Z`);
  const endOfDay = new Date(`${format(date, "yyyy-MM-dd")}T23:59:59.999Z`);

  const shopId = [UserRole.SUPERADMIN].includes(event.context.user.role)
    ? query.shopId
    : event.context.user.shopId;

  try {
    const purchases = await db.Purchases.findAll({
      where: {
        date: {
          [db.Sequelize.Op.between]: [startOfDay, endOfDay],
        },
        shopId: shopId,
      },
      include: ["createdByUser", "updatedByUser", "shop"],
      order: [["date", "DESC"]],
    });

    const draws = await db.Draws.findAll({
      where: {
        date: {
          [db.Sequelize.Op.between]: [startOfDay, endOfDay],
        },
        shopId: shopId,
      },
      include: ["createdByUser", "updatedByUser", "shop"],
      order: [["date", "DESC"]],
    });

    return {
      purchases: purchases,
      draws: draws,
    };
  } catch {
    return {
      purchases: [],
      draws: [],
    };
  }
});
