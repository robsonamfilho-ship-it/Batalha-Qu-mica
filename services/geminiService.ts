
import { GoogleGenAI } from "@google/genai";
import { HiddenTarget, ElementData } from "../types";
import { PERIODIC_TABLE } from "../constants";

// Helper to safely get API Key without crashing in browsers where 'process' is undefined
const getApiKey = () => {
  try {
    // @ts-ignore
    if (typeof process !== 'undefined' && process.env) {
      // @ts-ignore
      return process.env.API_KEY || '';
    }
  } catch (e) {
    return '';
  }
  return '';
};

// Initialize Gemini safely
const ai = new GoogleGenAI({ apiKey: getApiKey() });

export const getSmartHint = async (
  targets: HiddenTarget[],
  hitElements: number[],
  missedElements: number[]
): Promise<string> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn("API Key missing. Hint skipped.");
    return "O sistema de comunicação está offline (API Key ausente).";
  }

  // Find remaining targets (elements not yet found)
  const remainingTargets = targets.filter(t => !t.isFound);

  if (remainingTargets.length === 0) return "Todos os elementos foram encontrados!";

  // Prepare context for the AI
  const hiddenLocations = remainingTargets.map(t => {
    const e = t.element;
    return {
      element: e.name,
      symbol: e.symbol,
      group: e.category,
      valence: e.valence,
      atomicNumber: e.number,
      period: e.row
    };
  });

  const prompt = `
    Você é um professor de química ajudando um estudante em um jogo.
    
    Contexto do Jogo:
    - O jogador precisa encontrar 3 elementos químicos escondidos.
    - O jogador precisa de uma dica para avançar.
    
    Elementos Restantes (Alvos Secretos):
    ${JSON.stringify(hiddenLocations, null, 2)}
    
    Sua tarefa:
    Escolha UM dos elementos restantes e dê uma dica ÚTIL e INTERESSANTE.
    
    Regras da Dica:
    1. NÃO diga o nome do elemento nem o símbolo.
    2. NÃO dê a coordenada exata (ex: "Linha 3, Coluna 2").
    3. Tente ser CLARO, facilitando um pouco mais para o jogador.
    
    Você PODE usar:
    - O nome da Família (ex: "É um Metal Alcalino", "É um Gás Nobre").
    - A localização aproximada (ex: "Está no topo da tabela", "É um metal de transição no centro").
    - Uma aplicação muito famosa (ex: "Usado em baterias de celular", "Essencial para ossos").
    - Uma propriedade física marcante.
    
    Exemplo de resposta boa: "Estou pensando em um metal alcalino muito usado em baterias recarregáveis."
    Exemplo de resposta boa: "Procure por um gás nobre que brilha quando eletrificado."
    
    Mantenha a resposta com no máximo 2 frases. Em Português do Brasil.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text?.trim() || "O sinal está fraco, não consegui formular uma dica.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "O radar químico está sofrendo interferência... Tente novamente mais tarde.";
  }
};

export const getEducationalFact = async (element: ElementData): Promise<string> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    return `O ${element.name} é um elemento fascinante!`;
  }

  const prompt = `
    Gere uma curiosidade educativa rápida sobre o elemento químico ${element.name} (${element.symbol}).
    Foque em uma aplicação prática interessante, um fato histórico ou uma propriedade notável.
    A resposta deve ser curta, direta e interessante para um jogo educativo.
    Máximo de 20 palavras. Em Português do Brasil.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text?.trim() || `O ${element.name} é um elemento fascinante!`;
  } catch (error) {
    console.error("Gemini Fact Error:", error);
    return `O ${element.name} (número atômico ${element.number}) é um elemento do grupo ${element.category}.`;
  }
};
