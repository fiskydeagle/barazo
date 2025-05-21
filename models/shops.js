"use strict";
import { Model } from "sequelize";
export default (sequelize, DataTypes) => {
  class Shops extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models["Shops"].belongsTo(models["Users"], {
        foreignKey: "createdBy",
        as: "createdByUser",
      });
      models["Shops"].belongsTo(models["Users"], {
        foreignKey: "updatedBy",
        as: "updatedByUser",
      });
    }
  }

  Shops.init(
    {
      name: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Shops",
      paranoid: true,
    }
  );
  return Shops;
};
