"use strict";
import { Model } from "sequelize";
export default (sequelize, DataTypes) => {
  class Purchases extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models["Purchases"].belongsTo(models["Users"], {
        foreignKey: "createdBy",
        as: "createdByUser",
      });
      models["Purchases"].belongsTo(models["Users"], {
        foreignKey: "updatedBy",
        as: "updatedByUser",
      });
      models["Purchases"].belongsTo(models["Shops"], {
        foreignKey: "shopId",
        as: "shop",
      });
      models["Purchases"].belongsTo(models["Suppliers"], {
        foreignKey: "supplierId",
        as: "supplier",
      });
    }
  }

  Purchases.init(
    {
      date: DataTypes.DATEONLY,
      amount: DataTypes.DOUBLE(10, 2),
      isDeclared: DataTypes.BOOLEAN,
      invoiceNumber: DataTypes.STRING,
      comment: DataTypes.TEXT,
      shopId: DataTypes.INTEGER,
      supplierId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Purchases",
    },
  );
  return Purchases;
};
