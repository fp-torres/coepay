import { Devedor } from "../models/initModels.js";
import { calcularJurosCompostos } from "../utils/juros.js";
export const listarDevedores = async (req, res) => {
  try {
    const userId = Number(req.query.user_id || req.query.userId); // pega query e garante número
    if (isNaN(userId)) return res.status(400).json({ message: "userId inválido" });

    const devedores = await Devedor.findAll({
      where: { user_id: userId },
      order: [["createdAt", "DESC"]],
    });

    const devedoresComJuros = devedores.map((d) => {
      const valorAtual = (d.status !== "paga" && d.taxa_juros && d.tipo_juros)
        ? calcularJurosCompostos(d.valor, d.taxa_juros, d.tipo_juros, d.data_vencimento)
        : d.valor;
      return { ...d.toJSON(), valor_atual: valorAtual };
    });

    res.json(devedoresComJuros);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao buscar devedores" });
  }
};

export const criarDevedor = async (req, res) => {
  try {
    // console.log("req.body recebido:", req.body);

    // Criar instância manualmente para inspecionar hooks
    const devedorInstance = Devedor.build(req.body);
    // console.log("Antes do hook beforeCreate:", devedorInstance.toJSON());

    // Forçar execução do hook antes de salvar
    await devedorInstance.save();
    // console.log("Depois de salvar:", devedorInstance.toJSON());

    res.json(devedorInstance);
  } catch (err) {
    // console.error("ERRO ao criar devedor:", err);
    res.status(500).json({ message: "Erro ao cadastrar devedor" });
  }
};


export const buscarPorHash = async (req, res) => {
  try {
    const { hash } = req.params;
    const devedor = await Devedor.findOne({ where: { hash } });
    if (!devedor) return res.status(404).json({ message: "Cobrança não encontrada" });

    const valorAtual = (devedor.status !== "paga" && devedor.taxa_juros)
      ? calcularJurosCompostos(devedor.valor, devedor.taxa_juros, devedor.tipo_juros, devedor.data_vencimento)
      : devedor.valor;

    res.json({ ...devedor.toJSON(), valor_atual: valorAtual });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao buscar cobrança" });
  }
};

export const excluirDevedor = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Devedor.destroy({ where: { id } });
    if (!result) return res.status(404).json({ message: "Cobrança não encontrada" });
    res.json({ message: "Cobrança excluída com sucesso" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao excluir cobrança" });
  }
};

export const marcarComoPaga = async (req, res) => {
  try {
    const { id } = req.params;
    const { comprovante_url } = req.body;

    const devedor = await Devedor.findByPk(id);
    if (!devedor) return res.status(404).json({ message: "Cobrança não encontrada" });

    devedor.pago = true;
    devedor.status = "paga";
    devedor.pago_em = new Date();
    devedor.comprovante_url = comprovante_url || null; // ⚡ aqui garantimos null se não vier

    await devedor.save();

    // Retorna a cobrança atualizada
    res.json(devedor);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao atualizar cobrança" });
  }
};

