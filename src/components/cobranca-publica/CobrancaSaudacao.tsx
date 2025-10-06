interface CobrancaSaudacaoProps {
  nomeDevedor: string;
  isPago: boolean;
}

export const CobrancaSaudacao = ({ nomeDevedor, isPago }: CobrancaSaudacaoProps) => {
  return (
    <div className="text-center mb-6">
      <h1
        className={`text-3xl font-bold mb-2 ${
          isPago ? 'text-green-600' : 'text-orange-600'
        }`}
      >
        Olá, {nomeDevedor}! 👋
      </h1>
      <p className={`font-medium ${
        isPago ? 'text-green-700' : 'text-muted-foreground'
      }`}>
        {isPago
          ? 'Você está em dia com suas cobranças!'
          : 'Você possui uma cobrança pendente'}
      </p>
    </div>
  );
};
