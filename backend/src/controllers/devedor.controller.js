import { Devedor } from "../models/initModels.js";
import { calcularJurosCompostos } from "../utils/juros.js";
import express from "express";


export const listarTodosDevedores = async (req, res) => {
  try {
    // 🔹 Busca todos os registros na tabela Devedor
    const devedores = await Devedor.findAll({
      order: [["createdAt", "DESC"]],
    });

    if (!devedores.length) {
      return res.json([]); // retorna lista vazia, caso não tenha devedores
    }

    // 🔹 Adiciona cálculo de juros se aplicável
    const devedoresComJuros = devedores.map((d) => {
      const precisaDeJuros = d.status !== "paga" && d.taxa_juros && d.tipo_juros;

      const valorAtual = precisaDeJuros
        ? calcularJurosCompostos(d.valor, d.taxa_juros, d.tipo_juros, d.data_vencimento)
        : d.valor;

      return {
        ...d.toJSON(),
        valor_atual: Number(valorAtual.toFixed(2)),
      };
    });

    // 🔹 Retorna a lista completa
    res.json(devedoresComJuros);
  } catch (err) {
    console.error("Erro ao buscar todos os devedores:", err);
    res.status(500).json({ message: "Erro ao buscar devedores" });
  }
};


export const buscarDevedorPorId = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({ message: "ID inválido." });
    }

    // 🔹 Busca o devedor pelo ID
    const devedor = await Devedor.findByPk(id);

    if (!devedor) {
      return res.status(404).json({ message: "Devedor não encontrado." });
    }

    // 🔹 Calcula o valor atualizado com juros (se aplicável)
    const precisaDeJuros =
      devedor.status !== "paga" && devedor.taxa_juros && devedor.tipo_juros;

    const valorAtual = precisaDeJuros
      ? calcularJurosCompostos(
          devedor.valor,
          devedor.taxa_juros,
          devedor.tipo_juros,
          devedor.data_vencimento
        )
      : devedor.valor;

    // 🔹 Retorna o objeto com o campo `valor_atual`
    res.json({
      ...devedor.toJSON(),
      valor_atual: Number(valorAtual.toFixed(2)),
    });
  } catch (err) {
    console.error("Erro ao buscar devedor por ID:", err);
    res.status(500).json({ message: "Erro ao buscar devedor." });
  }
};

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

