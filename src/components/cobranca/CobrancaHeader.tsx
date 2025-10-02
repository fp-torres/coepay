interface CobrancaHeaderProps {
  nomeDevedor: string;
}

export const CobrancaHeader = ({ nomeDevedor }: CobrancaHeaderProps) => {
  return (
    <div className="text-center mb-6">
      <h1 className="text-3xl font-bold text-orange-600 mb-2">
        Olá, {nomeDevedor}! 👋
      </h1>
      <p className="text-muted-foreground">
        Você possui uma cobrança pendente
      </p>
    </div>
  );
};
