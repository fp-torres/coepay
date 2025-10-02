interface MotivationalBannerProps {
  message: string;
}

export const MotivationalBanner = ({ message }: MotivationalBannerProps) => {
  return (
    <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-3">
      <div className="text-center animate-pulse">
        <p className="font-medium">{message}</p>
      </div>
    </div>
  );
};
