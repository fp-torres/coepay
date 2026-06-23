import bcrypt from "bcrypt";
import crypto from "crypto";
import { User } from "../models/initModels.js";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo";

const userResponse = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  pix: user.pix,
  avatar_url: user.avatar_url,
  auth_provider: user.auth_provider,
});

const getFrontendUrl = () => process.env.FRONTEND_PUBLIC_URL || "http://localhost:8080";

const getGoogleConfig = () => ({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackUrl: process.env.GOOGLE_CALLBACK_URL || "http://localhost:3000/auth/google/callback",
});

const getStateSecret = () =>
  process.env.GOOGLE_OAUTH_STATE_SECRET ||
  process.env.GOOGLE_CLIENT_SECRET ||
  "coepay-local-google-oauth";

const base64UrlEncode = (value) =>
  Buffer.from(value).toString("base64url");

const base64UrlDecode = (value) =>
  Buffer.from(value, "base64url").toString("utf8");

const signStatePayload = (payload) =>
  crypto.createHmac("sha256", getStateSecret()).update(payload).digest("base64url");

const createOAuthState = () => {
  const payload = base64UrlEncode(
    JSON.stringify({
      nonce: crypto.randomBytes(16).toString("hex"),
      ts: Date.now(),
    })
  );

  return `${payload}.${signStatePayload(payload)}`;
};

const validateOAuthState = (state) => {
  const [payload, signature] = String(state || "").split(".");
  if (!payload || !signature) return false;

  const expectedSignature = signStatePayload(payload);
  if (signature.length !== expectedSignature.length) return false;

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    return false;
  }

  const parsed = JSON.parse(base64UrlDecode(payload));
  const maxAgeMs = 10 * 60 * 1000;
  return Date.now() - parsed.ts <= maxAgeMs;
};

const redirectWithGoogleError = (res, message) => {
  const url = new URL("/login", getFrontendUrl());
  url.searchParams.set("google_error", message);
  return res.redirect(url.toString());
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user)
      return res.status(401).json({ message: "Usuário não encontrado" });

    const validPassword = await bcrypt.compare(password, user.password);
//     console.log({
//   email,
//   plain: password,
//   hashed: user.password,
//   valid: await bcrypt.compare(password, user.password)
// });
    if (!validPassword)
      return res.status(401).json({ message: "Senha incorreta" });

    res.json({
      ...userResponse(user),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro no servidor" });
  }
};

export const googleLogin = async (_req, res) => {
  const { clientId, callbackUrl } = getGoogleConfig();

  if (!clientId) {
    return res.status(500).json({ message: "GOOGLE_CLIENT_ID não configurado." });
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: callbackUrl,
    response_type: "code",
    scope: "openid email profile",
    state: createOAuthState(),
    prompt: "select_account",
  });

  return res.redirect(`${GOOGLE_AUTH_URL}?${params.toString()}`);
};

export const googleCallback = async (req, res) => {
  const { code, state, error } = req.query;
  const { clientId, clientSecret, callbackUrl } = getGoogleConfig();

  if (error) {
    return redirectWithGoogleError(res, "Login com Google cancelado.");
  }

  if (!clientId || !clientSecret) {
    return redirectWithGoogleError(res, "Google OAuth não configurado no backend.");
  }

  try {
    if (!code || !validateOAuthState(state)) {
      return redirectWithGoogleError(res, "Retorno do Google inválido. Tente novamente.");
    }

    const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code: String(code),
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: callbackUrl,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok) {
      console.error("Erro ao trocar code do Google:", tokenData);
      return redirectWithGoogleError(res, "Não foi possível validar o login com Google.");
    }

    const profileResponse = await fetch(GOOGLE_USERINFO_URL, {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const profile = await profileResponse.json();
    if (!profileResponse.ok || !profile.email || !profile.sub) {
      console.error("Erro ao buscar perfil Google:", profile);
      return redirectWithGoogleError(res, "Não foi possível obter seus dados do Google.");
    }

    if (profile.email_verified === false) {
      return redirectWithGoogleError(res, "Seu e-mail Google precisa estar verificado.");
    }

    let user = await User.findOne({ where: { google_id: profile.sub } });

    if (!user) {
      user = await User.findOne({ where: { email: profile.email } });
    }

    if (user) {
      await user.update({
        google_id: user.google_id || profile.sub,
        avatar_url: profile.picture || user.avatar_url,
        auth_provider: user.auth_provider === "email" ? "google" : user.auth_provider,
      });
    } else {
      user = await User.create({
        name: profile.name || profile.email.split("@")[0],
        email: profile.email,
        password: crypto.randomBytes(32).toString("hex"),
        pix: null,
        google_id: profile.sub,
        avatar_url: profile.picture || null,
        auth_provider: "google",
      });
    }

    const url = new URL("/login", getFrontendUrl());
    url.searchParams.set("google_user", base64UrlEncode(JSON.stringify(userResponse(user))));
    return res.redirect(url.toString());
  } catch (err) {
    console.error("Erro no login com Google:", err);
    return redirectWithGoogleError(res, "Erro no servidor ao autenticar com Google.");
  }
};

export const signup = async (req, res) => {
  try {
    const { name, email, password, pix } = req.body;

    await User.create({
      name,
      email,
      password, // <-- senha pura, o model vai hashear
      pix,
    });

    res.json({ message: "Cadastro realizado com sucesso!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro no servidor" });
  }
};

// 🔹 Atualizar dados do usuário
export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, pix } = req.body;

  try {
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    await user.update({ name, email, pix });

    res.json({
      ...userResponse(user),
    });
  } catch (err) {
    console.error("Erro ao atualizar usuário:", err);
    res.status(500).json({ message: "Erro ao atualizar usuário" });
  }
};

export const buscarUsuarioPorId = async (id) => {
  try {
    const user = await User.findByPk(id);
    if (!user) return null;
    return {
      ...userResponse(user),
    };
  } catch (err) {
    console.error("Erro ao buscar usuário:", err);
    throw err;
  }
};

// Atualizar senha do usuário
export const updatePassword = async (req, res) => {
  const { id } = req.params;
  const { oldPassword, newPassword } = req.body;

  try {
    // Buscar o usuário
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    // Verificar se a senha antiga confere
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Senha atual incorreta" });
    }

    // Atualizar no banco — sem hashear manualmente
    await user.update({ password: newPassword }); // 🔹 o hook fará o hash automático

    res.json({ message: "Senha atualizada com sucesso!" });
  } catch (err) {
    console.error("Erro ao atualizar senha:", err);
    res.status(500).json({ message: "Erro ao atualizar senha" });
  }
};
