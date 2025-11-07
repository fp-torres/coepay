import { Devedor } from "../models/initModels.js";

export const webhookPSP = async (req, res) => {
  try {
    const { cobrancaId, pagoEm } = req.body;

    if (!cobrancaId) {
      return res.status(400).json({ message: "ID da cobrança é obrigatório" });
    }

    const cobranca = await Devedor.findByPk(cobrancaId);

    if (!cobranca) {
      return res.status(404).json({ message: "Cobrança não encontrada" });
    }

    await cobranca.update({
      pago: true,
      pago_em: pagoEm || new Date(),
      status: "paga",
    });

    console.log(`Cobrança ${cobrancaId} marcada como paga via webhook`);
    res.status(200).json({ message: "Cobrança atualizada com sucesso", cobranca });
  } catch (err) {
    console.error("Erro ao processar webhook do PSP:", err);
    res.status(500).json({ message: "Erro ao atualizar cobrança" });
  }
};
