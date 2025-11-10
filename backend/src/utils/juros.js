export const calcularJurosCompostos = (valorInicial, taxa, tipo, dataVencimento, dataReferencia = new Date()) => {
  const hoje = new Date(dataReferencia);
  const vencimento = new Date(dataVencimento);

  if (hoje <= vencimento) return valorInicial;

  const diferencaMs = hoje - vencimento;
  const diasVencido = Math.floor(diferencaMs / (1000 * 60 * 60 * 24));

  if (diasVencido <= 0) return valorInicial;

  const periodos = tipo === "diario" ? diasVencido : Math.floor(diasVencido / 30);
  if (periodos === 0) return valorInicial;

  const taxaDecimal = parseFloat(taxa) / 100;
  return valorInicial * Math.pow(1 + taxaDecimal, periodos);
};
