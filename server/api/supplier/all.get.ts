import db from "@/models/index.js";

interface Payload {
  paranoid?: string | boolean;
}

export default defineEventHandler(async (event) => {
  if (!event.context.user) {
    throw createError({
      statusCode: 403,
      statusMessage: "validations.not-authorized",
    });
  }

  const query: Payload = await getQuery(event);
  query.paranoid = query.paranoid === "true";

  return db.Suppliers.findAll({
    include: ["createdByUser", "updatedByUser"],
    paranoid: query.paranoid,
  });
});
