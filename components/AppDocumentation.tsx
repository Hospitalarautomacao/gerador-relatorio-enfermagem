import React from 'react';

const DocSection: React.FC<{ title: string; icon: string; color: string; children: React.ReactNode }> = ({ title, icon, color, children }) => (
  <div className="mb-6 last:mb-0">
    <h3 className={`text-sm font-bold uppercase tracking-wider mb-3 flex items-center ${color}`}>
      <i className={`fas ${icon} mr-2`}></i>
      {title}
    </h3>
    <div className="grid grid-cols-1 gap-3">
      {children}
    </div>
  </div>
);

const DocItem: React.FC<{ title: string; description: string; icon: string }> = ({ title, description, icon }) => (
  <div className="flex items-start p-3 bg-slate-50 border border-slate-200 rounded-lg hover:bg-white hover:shadow-sm transition-all duration-200">
    <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 mr-3 flex-shrink-0">
      <i className={`fas ${icon} text-sm`}></i>
    </div>
    <div>
      <h4 className="font-bold text-slate-800 text-sm">{title}</h4>
      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{description}</p>
    </div>
  </div>
);

const AppDocumentation: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="bg-cyan-50 border border-cyan-100 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-bold text-cyan-800 mb-2">
          <i className="fas fa-map mr-2"></i>
          Mapa do Sistema
        </h2>
        <p className="text-sm text-cyan-700">
          Bem-vindo à documentação integrada. Abaixo você encontra a estrutura completa do aplicativo e a função de cada módulo.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
            <DocSection title="Fluxo de Enfermagem" icon="fa-user-nurse" color="text-cyan-600">
                <DocItem 
                    title="Identificação" 
                    icon="fa-id-card-clip" 
                    description="Cadastro inicial do paciente, dados demográficos, alergias e dados do profissional responsável." 
                />
                <DocItem 
                    title="Anamnese" 
                    icon="fa-book-medical" 
                    description="Histórico clínico detalhado, sugestão de CID via IA e avaliação inicial da dor." 
                />
                <DocItem 
                    title="Avaliações Clínicas" 
                    icon="fa-notes-medical" 
                    description="O coração do sistema. Contém Sinais Vitais (com gráficos), Balanço Hídrico, Nutrição, Medicação, Procedimentos e Checklist de Segurança." 
                />
                <DocItem 
                    title="Escalas Padronizadas" 
                    icon="fa-chart-bar" 
                    description="Ferramentas de cálculo automático para Braden (LPP), Morse (Queda), PPS (Paliativo), ABEMID e NEAD." 
                />
            </DocSection>

            <DocSection title="Ferramentas de Apoio" icon="fa-toolbox" color="text-indigo-600">
                <DocItem 
                    title="Gerenciador de Estoque" 
                    icon="fa-boxes-stacked" 
                    description="Controle de materiais e medicamentos com baixa automática ao registrar consumo no relatório." 
                />
                <DocItem 
                    title="Exames e Laudos" 
                    icon="fa-vial" 
                    description="Registro e acompanhamento de resultados laboratoriais e de imagem do paciente." 
                />
                <DocItem 
                    title="Histórico de Medicação" 
                    icon="fa-clock-rotate-left" 
                    description="Linha do tempo visual de todos os medicamentos administrados nos relatórios anteriores." 
                />
            </DocSection>
        </div>

        <div>
            <DocSection title="Inteligência Artificial (Gemini)" icon="fa-robot" color="text-fuchsia-600">
                <DocItem 
                    title="Aprimoramento de Texto" 
                    icon="fa-wand-magic-sparkles" 
                    description="Reescrita técnica do relatório final para linguagem formal e padronizada." 
                />
                <DocItem 
                    title="Análise de Sinais Vitais" 
                    icon="fa-heart-pulse" 
                    description="Interpretação clínica de tendências (ex: piora hemodinâmica) baseada nos dados vitais." 
                />
                <DocItem 
                    title="Hub de Integração AI (Novo)" 
                    icon="fa-microchip" 
                    description="Exporte o Prompt do Sistema e o Schema JSON para integrar com Agentes GPT, Claude ou APIs externas." 
                />
                <DocItem 
                    title="SBAR (Passagem de Plantão)" 
                    icon="fa-comments" 
                    description="Geração de resumo estruturado (Situation, Background, Assessment, Recommendation) para troca de turno." 
                />
            </DocSection>

            <DocSection title="Administração & Dados" icon="fa-shield-alt" color="text-slate-600">
                <DocItem 
                    title="Trilha de Auditoria" 
                    icon="fa-file-signature" 
                    description="Registro imutável de todas as alterações feitas nos prontuários para segurança legal." 
                />
                <DocItem 
                    title="Portal da Família" 
                    icon="fa-users" 
                    description="Visão simplificada e humanizada do estado do paciente para familiares." 
                />
                <DocItem 
                    title="Conexão Banco de Dados" 
                    icon="fa-database" 
                    description="Configuração híbrida: permite uso offline (Navegador) ou sincronização em nuvem via Supabase." 
                />
            </DocSection>
        </div>
      </div>
    </div>
  );
};

export default AppDocumentation;