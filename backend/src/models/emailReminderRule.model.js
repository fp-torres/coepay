export default (sequelize, DataTypes) => {
  const EmailReminderRule = sequelize.define(
    "EmailReminderRule",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      trigger_type: {
        type: DataTypes.STRING(40),
        allowNull: false,
      },
      channel: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: "email",
      },
      days_offset: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      specific_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      repeat_interval_days: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      tableName: "email_reminder_rules",
      timestamps: true,
      indexes: [
        {
          name: "email_reminder_rules_user_active_idx",
          fields: ["user_id", "active"],
        },
      ],
    }
  );

  return EmailReminderRule;
};
