import db from "@/models/index.js";
import Sequelize from "sequelize";
import { UserRole } from "~/types";

interface Payload {
  id: number;
  date: string;
  cashAmount: number;
  totalAmount: number;
  systemAmount: number;
  comment?: string;
  shopId: string;
}

export default defineEventHandler(async (event) => {
  if (!event.context.user || !event.context.user.role) {
    throw createError({
      statusCode: 403,
      statusMessage: "validations.not-authorized",
    });
  }

  const body: Payload = await readBody(event);

  const date = [UserRole.SUPERADMIN, UserRole.ADMIN].includes(
    event.context.user.role,
  )
    ? new Date(body.date)
    : new Date();

  const shopId = [UserRole.SUPERADMIN].includes(event.context.user.role)
    ? body.shopId
    : event.context.user.shopId;

  const draw = await db.Draws.findOne({
    where: { id: body.id },
    attributes: ["id"],
  });

  if (!draw) {
    throw createError({
      statusCode: 400,
      statusMessage: "validations.something-wrong",
    });
  }

  try {
    return await draw.update({
      ...([UserRole.SUPERADMIN, UserRole.ADMIN].includes(
        event.context.user.role,
      )
        ? { date: date }
        : {}),
      cashAmount: body.cashAmount,
      totalAmount: body.totalAmount,
      systemAmount: body.systemAmount,
      comment: body.comment || undefined,
      shopId: shopId,
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
