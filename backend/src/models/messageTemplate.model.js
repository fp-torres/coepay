export default (sequelize, DataTypes) => {
  const MessageTemplate = sequelize.define(
    "MessageTemplate",
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
      name: {
        type: DataTypes.STRING(120),
        allowNull: false,
      },
      event_type: {
        type: DataTypes.STRING(60),
        allowNull: false,
      },
      subject: {
        type: DataTypes.STRING(180),
        allowNull: true,
      },
      body: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      enabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      tableName: "message_templates",
      timestamps: true,
      underscored: true,
      indexes: [
        {
          name: "message_templates_user_channel_event_idx",
          fields: ["user_id", "channel", "event_type"],
        },
      ],
    }
  );

  return MessageTemplate;
};
