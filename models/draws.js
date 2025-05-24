"use strict";
import { Model } from "sequelize";
export default (sequelize, DataTypes) => {
  class Draws extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models["Draws"].belongsTo(models["Users"], {
        foreignKey: "createdBy",
        as: "createdByUser",
      });
      models["Draws"].belongsTo(models["Users"], {
        foreignKey: "updatedBy",
        as: "updatedByUser",
      });
      models["Draws"].belongsTo(models["Shops"], {
        foreignKey: "shopId",
        as: "shop",
      });
    }
  }

  Draws.init(
    {
      date: DataTypes.DATEONLY,
      cashAmount: DataTypes.DOUBLE(10, 2),
      totalAmount: DataTypes.DOUBLE(10, 2),
      systemAmount: DataTypes.DOUBLE(10, 2),
      comment: DataTypes.TEXT,
      shopId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Draws",
    },
  );
  return Draws;
};
