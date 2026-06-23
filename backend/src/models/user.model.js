import bcrypt from "bcryptjs";

export default (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.INTEGER,     
        autoIncrement: true,        
        primaryKey: true,             
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(150),
        allowNull: false,
        validate: {
          isEmail: true,
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      google_id: {
        type: DataTypes.STRING(120),
        allowNull: true,
      },
      avatar_url: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      auth_provider: {
        type: DataTypes.STRING(30),
        allowNull: false,
        defaultValue: "email",
      },
      pix: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: "users",
      timestamps: false,
      indexes: [
        {
          name: "users_email_unique",
          unique: true,
          fields: ["email"],
        },
        {
          name: "users_google_id_unique",
          unique: true,
          fields: ["google_id"],
        },
      ],
      hooks: {
        beforeCreate: async (user) => {
          if (user.password) {
            user.password = await bcrypt.hash(user.password, 10);
          }
        },
        beforeUpdate: async (user) => {
          if (user.changed("password")) {
            user.password = await bcrypt.hash(user.password, 10);
          }
        },
      },
    }
  );

  User.prototype.validPassword = async function (password) {
    return bcrypt.compare(password, this.password);
  };

  return User;
};
