
import { GoogleGenAI } from "@google/genai";
import { HiddenTarget, ElementData } from "../types";
import { PERIODIC_TABLE } from "../constants";

// Initialize Gemini
// Note: In a production environment, this should be proxied through a backend
// to avoid exposing the key. For this demo, we assume process.env.API_KEY is available.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getSmartHint = async (
  targets: HiddenTarget[],
  hitElements: number[],
  missedElements: number[]
): Promise<string> => {
  if (!process.env.API_KEY) {
    return "Configure sua API Key para receber dicas inteligentes do Professor Gemini.";
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
      atomicNumber: e.number
    };
  });

  const prompt = `
    Você é um professor de química excêntrico narrando um jogo de Caça aos Elementos na Tabela Periódica.
    
    Contexto do Jogo:
    - O jogador precisa encontrar 3 elementos químicos específicos escondidos no tabuleiro.
    - O jogador já tentou alguns lugares e errou.
    
    Elementos Restantes (Alvos Secretos):
    ${JSON.stringify(hiddenLocations, null, 2)}
    
    Sua tarefa:
    Escolha UM dos elementos restantes e dê uma dica CURTA e MISTERIOSA sobre ele.
    NÃO diga o nome do elemento diretamente.
    
    Use propriedades como:
    - Família/Grupo (ex: "Um gás nobre", "Um metal alcalino")
    - Período (ex: "Está nas linhas de cima", "Um elemento pesado")
    - Camada de Valência (ex: "Termina em p5")
    - Estado físico ou aplicação real.
    
    Exemplo de dica: "Estou procurando um metal que adora reagir violentamente com água." ou "O alvo é um gás que faz sua voz ficar fina."
    
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
  if (!process.env.API_KEY) {
    return "Curiosidade não disponível: API Key não configurada.";
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
