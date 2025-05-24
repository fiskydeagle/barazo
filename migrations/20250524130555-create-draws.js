"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Draws", {
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
      cashAmount: {
        allowNull: false,
        type: Sequelize.DOUBLE(10, 2),
      },
      totalAmount: {
        allowNull: false,
        type: Sequelize.DOUBLE(10, 2),
      },
      plusMinus: {
        allowNull: false,
        type: Sequelize.DOUBLE(10, 2),
      },
      systemAmount: {
        allowNull: false,
        type: Sequelize.DOUBLE(10, 2),
      },
      comment: {
        allowNull: true,
        type: Sequelize.TEXT,
      },
      shopId: {
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
    await queryInterface.dropTable("Draws");
  },
};
