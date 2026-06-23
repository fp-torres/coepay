export default (sequelize, DataTypes) => {
  const WhatsAppSession = sequelize.define(
    "WhatsAppSession",
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
      phone: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },
      status: {
        type: DataTypes.STRING(30),
        allowNull: false,
        defaultValue: "DISCONNECTED",
      },
      session_key: {
        type: DataTypes.STRING(80),
        allowNull: false,
      },
      last_qr_code: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      last_qr_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      connected_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      disconnected_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "whatsapp_sessions",
      timestamps: true,
      underscored: true,
      indexes: [
        {
          name: "whatsapp_sessions_user_id_unique",
          unique: true,
          fields: ["user_id"],
        },
      ],
    }
  );

  return WhatsAppSession;
};
