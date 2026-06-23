export default (sequelize, DataTypes) => {
  const EmailNotificationLog = sequelize.define(
    "EmailNotificationLog",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      charge_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "devedores",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      trigger_key: {
        type: DataTypes.STRING(80),
        allowNull: false,
      },
      trigger_type: {
        type: DataTypes.STRING(40),
        allowNull: false,
      },
      recipient_email: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: "pending",
      },
      provider_message_id: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      error_message: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      sent_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "email_notification_logs",
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ["charge_id", "trigger_key"],
        },
      ],
    }
  );

  return EmailNotificationLog;
};
