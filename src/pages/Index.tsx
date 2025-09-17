// Update this page (the content is just a fallback if you fail to update the page)

const Index = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/20">
      <div className="text-center space-y-6 p-8">
        <h1 className="mb-4 text-5xl font-bold text-primary">CobrançaPag</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Sistema inteligente de cobrança de pagamentos
        </p>
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Gerencie suas cobranças de forma simples e eficiente
          </p>
          <a 
            href="/login" 
            className="inline-block bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
          >
            Começar Agora
          </a>
        </div>
      </div>
    </div>
  );
};

export default Index;
