interface CobrancaHeaderProps {
  isPago: boolean;
  mensagem: React.ReactNode;
}

export const CobrancaHeader = ({ isPago, mensagem }: CobrancaHeaderProps) => {
  return (
    <div
      className={`text-white py-3 ${
        isPago
          ? 'bg-gradient-to-r from-green-500 to-green-700'
          : 'bg-gradient-to-r from-orange-500 to-red-500'
      }`}
    >
      <div className="text-center animate-pulse">
        <p className="font-medium">{mensagem}</p>
      </div>
    </div>
  );
};
