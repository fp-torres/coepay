export default (sequelize, DataTypes) => {
  const MessageLog = sequelize.define(
    "MessageLog",
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
      channel: {
        type: DataTypes.STRING(30),
        allowNull: false,
      },
      recipient: {
        type: DataTypes.STRING(180),
        allowNull: false,
      },
      charge_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      customer_name: {
        type: DataTypes.STRING(150),
        allowNull: true,
      },
      subject: {
        type: DataTypes.STRING(180),
        allowNull: true,
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING(30),
        allowNull: false,
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
      tableName: "message_logs",
      timestamps: true,
      underscored: true,
      indexes: [
        {
          name: "message_logs_user_channel_idx",
          fields: ["user_id", "channel"],
        },
      ],
    }
  );

  return MessageLog;
};
