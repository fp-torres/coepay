export const uploadComprovantes = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "Nenhum arquivo enviado" });
    }

    const urls = req.files.map((file) => `/uploads/${file.filename}`);
    res.json({ urls });
  } catch (err) {
    console.error("Erro ao fazer upload:", err);
    res.status(500).json({ message: "Erro ao fazer upload dos comprovantes" });
  }
};
