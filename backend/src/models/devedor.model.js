import { v4 as uuidv4 } from "uuid";

export default (sequelize, DataTypes) => {
  const Devedor = sequelize.define(
    "Devedor",
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
      nome: { type: DataTypes.STRING(120), allowNull: false },
      email: { type: DataTypes.STRING, allowNull: true },
      telefone: { type: DataTypes.STRING, allowNull: true },
      valor: { type: DataTypes.FLOAT, allowNull: false },
      data_vencimento: { type: DataTypes.DATE, allowNull: false },
      taxa_juros: { type: DataTypes.FLOAT, allowNull: true },
      tipo_juros: { type: DataTypes.STRING, allowNull: true }, // diario, mensal, anual
      metodo_calculo: { type: DataTypes.STRING, defaultValue: "composto" }, // simples ou composto
      descricao: { type: DataTypes.TEXT, allowNull: true },
      whatsapp_devedor: { type: DataTypes.STRING, allowNull: true },
      pix_cobranca: { type: DataTypes.STRING, allowNull: true },
      status: {
        type: DataTypes.ENUM("ativa", "vencida", "paga"),
        defaultValue: "ativa",
      },
      hash: { type: DataTypes.STRING, allowNull: false, unique: true },
      link: { type: DataTypes.STRING, allowNull: false },
      pago: { type: DataTypes.BOOLEAN, defaultValue: false },
      pago_em: { type: DataTypes.DATE, allowNull: true },
      comprovante_url: { type: DataTypes.STRING, allowNull: true },
    },
    {
      tableName: "devedores",
      timestamps: true,
      hooks: {
        beforeValidate: (devedor, options) => {
          // Garante que hash e link existam antes da validação
          if (!devedor.hash) devedor.hash = uuidv4();
          if (!devedor.link) devedor.link = `/cobranca/${devedor.hash}`;
        },
        beforeCreate: (devedor, options) => {
          const hoje = new Date();
          const vencimento = new Date(devedor.data_vencimento);
          devedor.status = hoje > vencimento ? "vencida" : "ativa";
        },
      },
    }
  );

  return Devedor;
};
