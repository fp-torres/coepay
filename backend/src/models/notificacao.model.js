export default (sequelize, DataTypes) => {
  const NotificacaoLida = sequelize.define(
    "NotificacaoLida",
    {
      user_id: {
        type: DataTypes.INTEGER, // 👈 trocado de UUID para INTEGER
        allowNull: false,
        primaryKey: true,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      cobranca_id: {
        type: DataTypes.INTEGER, // 👈 trocado de UUID para INTEGER
        allowNull: false,
        primaryKey: true,
        references: {
          model: "devedores",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "notificacoes_lidas",
      timestamps: false,
      indexes: [
        {
          unique: true,
          fields: ["user_id", "cobranca_id"],
        },
      ],
    }
  );

  NotificacaoLida.associate = (models) => {
    NotificacaoLida.belongsTo(models.User, { foreignKey: "user_id" });
    NotificacaoLida.belongsTo(models.Devedor, { foreignKey: "cobranca_id" });
  };

  return NotificacaoLida;
};
