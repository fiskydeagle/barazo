import db from "@/models/index.js";
import Sequelize from "sequelize";
import { type Supplier, UserRole } from "~/types";

interface Payload {
  id: number;
  date: string;
  amount: number;
  isDeclared: boolean;
  isOutside: boolean;
  invoiceNumber?: string;
  comment?: string;
  shopId: string;
  supplier: string;
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

  let supplier: Supplier;

  try {
    const supplierResponse = await db.Suppliers.findOne({
      where: {
        company: body.supplier,
      },
      attributes: ["id", "company"],
    });

    if (supplierResponse) {
      supplier = supplierResponse.dataValues;
    } else {
      const newSupplier = await db.Suppliers.create({
        company: body.supplier,
      });

      supplier = newSupplier.dataValues;
    }
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

  const purchase = await db.Purchases.findOne({
    where: { id: body.id },
    attributes: ["id"],
  });

  if (!purchase) {
    throw createError({
      statusCode: 400,
      statusMessage: "validations.something-wrong",
    });
  }

  try {
    return await purchase.update({
      ...([UserRole.SUPERADMIN, UserRole.ADMIN].includes(
        event.context.user.role,
      )
        ? { date: date }
        : {}),
      amount: body.amount,
      isDeclared: body.isDeclared,
      isOutside: body.isOutside,
      invoiceNumber: body.invoiceNumber || undefined,
      comment: body.comment || undefined,
      shopId: shopId,
      supplierId: supplier.id,
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
