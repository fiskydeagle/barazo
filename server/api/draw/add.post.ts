import db from "@/models/index.js";
import Sequelize from "sequelize";
import { UserRole } from "~/types";
import { format } from "date-fns";

interface Payload {
  date: string;
  cashAmount: number;
  totalAmount: number;
  totalNetAmount: number;
  plusMinus: number;
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

  try {
    return await db.Draws.create({
      date: format(date, "yyyy-MM-dd HH:mm"),
      cashAmount: body.cashAmount,
      totalAmount: body.totalAmount,
      totalNetAmount: body.totalNetAmount,
      plusMinus: body.plusMinus,
      systemAmount: body.systemAmount,
      comment: body.comment || undefined,
      shopId: shopId,
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
