// Calcula juros simples: M = C * (1 + i * n)
export const calcularJurosSimples = (valorInicial, taxa, tipo, dataVencimento, dataReferencia = new Date()) => {
  const hoje = new Date(dataReferencia);
  const vencimento = new Date(dataVencimento);

  if (hoje <= vencimento) return valorInicial;

  const diferencaMs = hoje - vencimento;
  const diasVencido = Math.floor(diferencaMs / (1000 * 60 * 60 * 24));

  if (diasVencido <= 0) return valorInicial;

  let periodos;
  if (tipo === "diario") {
    periodos = diasVencido;
  } else if (tipo === "mensal") {
    periodos = diasVencido / 30;
  } else if (tipo === "anual") {
    periodos = diasVencido / 365;
  } else {
    periodos = 0;
  }

  if (periodos === 0) return valorInicial;

  const taxaDecimal = parseFloat(taxa) / 100;
  return valorInicial * (1 + taxaDecimal * periodos);
};

// Calcula juros compostos: M = C * (1 + i)^n
export const calcularJurosCompostos = (valorInicial, taxa, tipo, dataVencimento, dataReferencia = new Date()) => {
  const hoje = new Date(dataReferencia);
  const vencimento = new Date(dataVencimento);

  if (hoje <= vencimento) return valorInicial;

  const diferencaMs = hoje - vencimento;
  const diasVencido = Math.floor(diferencaMs / (1000 * 60 * 60 * 24));

  if (diasVencido <= 0) return valorInicial;

  let periodos;
  if (tipo === "diario") {
    periodos = diasVencido;
  } else if (tipo === "mensal") {
    periodos = Math.floor(diasVencido / 30);
  } else if (tipo === "anual") {
    periodos = Math.floor(diasVencido / 365);
  } else {
    periodos = 0;
  }

  if (periodos === 0) return valorInicial;

  const taxaDecimal = parseFloat(taxa) / 100;
  return valorInicial * Math.pow(1 + taxaDecimal, periodos);
};

// Função principal que decide qual método usar
export const calcularJuros = (valorInicial, taxa, tipo, metodoCalculo, dataVencimento, dataReferencia = new Date()) => {
  if (metodoCalculo === "simples") {
    return calcularJurosSimples(valorInicial, taxa, tipo, dataVencimento, dataReferencia);
  } else {
    return calcularJurosCompostos(valorInicial, taxa, tipo, dataVencimento, dataReferencia);
  }
};
