"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Purchases", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      date: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      amount: {
        allowNull: false,
        type: Sequelize.DOUBLE(10, 2),
      },
      isDeclared: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      isOutside: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      invoiceNumber: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      comment: {
        allowNull: true,
        type: Sequelize.TEXT,
      },
      shopId: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      supplierId: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      createdBy: {
        allowNull: true,
        type: Sequelize.INTEGER,
      },
      updatedBy: {
        allowNull: true,
        type: Sequelize.INTEGER,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Purchases");
  },
};
