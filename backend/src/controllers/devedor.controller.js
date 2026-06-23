import { Devedor } from "../models/initModels.js";
import { calcularJuros } from "../utils/juros.js";
import { Op } from "sequelize";
import { v4 as uuidv4 } from "uuid";

const maxRecurrenceOccurrences = 24;

const addDays = (date, days) => {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
};

const addMonths = (date, months) => {
  const nextDate = new Date(date);
  const originalDay = nextDate.getDate();
  nextDate.setMonth(nextDate.getMonth() + months);

  if (nextDate.getDate() < originalDay) {
    nextDate.setDate(0);
  }

  return nextDate;
};

const addRecurrenceInterval = ({ baseDate, type, interval = 1, unit = "dias", occurrence }) => {
  if (type === "semanal") return addDays(baseDate, 7 * occurrence);
  if (type === "mensal") return addMonths(baseDate, occurrence);
  if (type === "anual") return addMonths(baseDate, 12 * occurrence);

  const safeInterval = Math.max(Number(interval || 1), 1) * occurrence;

  if (unit === "semanas") return addDays(baseDate, safeInterval * 7);
  if (unit === "meses") return addMonths(baseDate, safeInterval);

  return addDays(baseDate, safeInterval);
};

const buildRecurringCharges = (basePayload, firstCharge, recurrenceGroupId) => {
  const type = basePayload.recorrencia_tipo || "unica";
  if (type === "unica") return [];

  const baseDueDate = new Date(basePayload.data_vencimento);
  const requestedQuantity = Number(basePayload.recorrencia_quantidade || 6);
  const quantity = Math.min(Math.max(requestedQuantity, 1), maxRecurrenceOccurrences);
  const recurrenceUntil = basePayload.recorrencia_ate ? new Date(basePayload.recorrencia_ate) : null;
  const charges = [];

  if (type === "data_personalizada") {
    if (!basePayload.recorrencia_data_personalizada) return [];

    const customDate = new Date(basePayload.recorrencia_data_personalizada);
    if (customDate <= baseDueDate) return [];

    return [
      {
        ...basePayload,
        data_vencimento: customDate,
        recorrencia_grupo_id: recurrenceGroupId,
        recorrencia_ordem: 2,
        recorrencia_status: "ativa",
      },
    ];
  }

  for (let occurrence = 1; occurrence <= quantity; occurrence += 1) {
    const nextDueDate = addRecurrenceInterval({
      baseDate: baseDueDate,
      type,
      interval: basePayload.recorrencia_intervalo,
      unit: basePayload.recorrencia_unidade,
      occurrence,
    });

    if (recurrenceUntil && nextDueDate > recurrenceUntil) break;

    charges.push({
      ...basePayload,
      data_vencimento: nextDueDate,
      recorrencia_grupo_id: recurrenceGroupId,
      recorrencia_ordem: firstCharge.recorrencia_ordem + occurrence,
      recorrencia_status: "ativa",
    });
  }

  return charges;
};

const sanitizeChargePayload = (payload) => {
  const sanitized = { ...payload };
  delete sanitized.recorrencia_quantidade;
  return sanitized;
};

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
      const temJuros = d.taxa_juros && d.tipo_juros;

      let valorAtual = d.valor;
      if (temJuros) {
        const metodoCalculo = d.metodo_calculo || "composto";
        if (d.status === "paga" && d.pago_em) {
          valorAtual = calcularJuros(d.valor, d.taxa_juros, d.tipo_juros, metodoCalculo, d.data_vencimento, d.pago_em);
        } else if (d.status !== "paga") {
          valorAtual = calcularJuros(d.valor, d.taxa_juros, d.tipo_juros, metodoCalculo, d.data_vencimento);
        }
      }

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

    const temJuros = devedor.taxa_juros && devedor.tipo_juros;

    let valorAtual = devedor.valor;
    if (temJuros) {
      const metodoCalculo = devedor.metodo_calculo || "composto";
      if (devedor.status === "paga" && devedor.pago_em) {
        valorAtual = calcularJuros(
          devedor.valor,
          devedor.taxa_juros,
          devedor.tipo_juros,
          metodoCalculo,
          devedor.data_vencimento,
          devedor.pago_em
        );
      } else if (devedor.status !== "paga") {
        valorAtual = calcularJuros(
          devedor.valor,
          devedor.taxa_juros,
          devedor.tipo_juros,
          metodoCalculo,
          devedor.data_vencimento
        );
      }
    }

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
      const temJuros = d.taxa_juros && d.tipo_juros;

      let valorAtual = d.valor;
      if (temJuros) {
        const metodoCalculo = d.metodo_calculo || "composto";
        if (d.status === "paga" && d.pago_em) {
          valorAtual = calcularJuros(d.valor, d.taxa_juros, d.tipo_juros, metodoCalculo, d.data_vencimento, d.pago_em);
        } else if (d.status !== "paga") {
          valorAtual = calcularJuros(d.valor, d.taxa_juros, d.tipo_juros, metodoCalculo, d.data_vencimento);
        }
      }
      return { ...d.toJSON(), valor_atual: Number(valorAtual.toFixed(2)) };
    });

    res.json(devedoresComJuros);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao buscar devedores" });
  }
};

export const criarDevedor = async (req, res) => {
  try {
    const recurrenceType = req.body.recorrencia_tipo || "unica";
    const recurrenceGroupId = recurrenceType !== "unica" ? uuidv4() : null;
    const basePayload = sanitizeChargePayload({
      ...req.body,
      recorrencia_tipo: recurrenceType,
      recorrencia_grupo_id: recurrenceGroupId,
      recorrencia_status: recurrenceType === "unica" ? "ativa" : "ativa",
      recorrencia_ordem: 1,
    });

    const devedorInstance = await Devedor.create(basePayload);
    const recurringCharges = buildRecurringCharges(req.body, devedorInstance, recurrenceGroupId).map((charge) =>
      sanitizeChargePayload(charge)
    );

    if (recurringCharges.length > 0) {
      await Devedor.bulkCreate(recurringCharges, {
        individualHooks: true,
        validate: true,
      });
    }

    res.json({
      ...devedorInstance.toJSON(),
      recorrencias_criadas: recurringCharges.length,
    });
  } catch (err) {
    console.error("ERRO ao criar devedor:", err);
    res.status(500).json({ message: "Erro ao cadastrar devedor" });
  }
};


export const buscarPorHash = async (req, res) => {
  try {
    const { hash } = req.params;
    const devedor = await Devedor.findOne({ where: { hash } });
    if (!devedor) return res.status(404).json({ message: "Cobrança não encontrada" });

    let valorAtual = devedor.valor;
    if (devedor.taxa_juros && devedor.tipo_juros) {
      const metodoCalculo = devedor.metodo_calculo || "composto";
      if (devedor.status === "paga" && devedor.pago_em) {
        valorAtual = calcularJuros(devedor.valor, devedor.taxa_juros, devedor.tipo_juros, metodoCalculo, devedor.data_vencimento, devedor.pago_em);
      } else if (devedor.status !== "paga") {
        valorAtual = calcularJuros(devedor.valor, devedor.taxa_juros, devedor.tipo_juros, metodoCalculo, devedor.data_vencimento);
      }
    }

    res.json({ ...devedor.toJSON(), valor_atual: Number(valorAtual.toFixed(2)) });
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

export const atualizarRecorrencia = async (req, res) => {
  const { grupoId } = req.params;
  const { status } = req.body;
  const allowedStatuses = ["ativa", "pausada", "cancelada"];

  if (!grupoId) {
    return res.status(400).json({ message: "Grupo de recorrência inválido." });
  }

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ message: "Status de recorrência inválido." });
  }

  try {
    const [updated] = await Devedor.update(
      { recorrencia_status: status },
      {
        where: {
          recorrencia_grupo_id: grupoId,
          pago: { [Op.ne]: true },
        },
      }
    );

    res.json({
      message: "Recorrência atualizada com sucesso.",
      updated,
    });
  } catch (err) {
    console.error("Erro ao atualizar recorrência:", err);
    res.status(500).json({ message: "Erro ao atualizar recorrência." });
  }
};
