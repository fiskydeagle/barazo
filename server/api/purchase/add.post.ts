import db from "@/models/index.js";
import Sequelize from "sequelize";
import { UserRole, type Supplier } from "~/types";
import { format } from "date-fns";

interface Payload {
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

  try {
    return await db.Purchases.create({
      date: format(date, "yyyy-MM-dd HH:mm"),
      amount: body.amount,
      isDeclared: body.isDeclared,
      isOutside: body.isOutside,
      invoiceNumber: body.invoiceNumber || undefined,
      comment: body.comment || undefined,
      shopId: shopId,
      supplierId: supplier.id,
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
