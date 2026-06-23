export default (sequelize, DataTypes) => {
  const EmailTemplate = sequelize.define(
    "EmailTemplate",
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
      template_type: {
        type: DataTypes.STRING(40),
        allowNull: false,
      },
      subject: {
        type: DataTypes.STRING(180),
        allowNull: false,
      },
      body: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      tableName: "email_templates",
      timestamps: true,
      indexes: [
        {
          name: "email_templates_user_type_unique",
          unique: true,
          fields: ["user_id", "template_type"],
        },
      ],
    }
  );

  return EmailTemplate;
};
