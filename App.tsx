
import React, { useState, useEffect } from 'react';
import { ElementData, GameStatus, HiddenTarget, LogEntry, PlayerId, PlayerState, TurnResult } from './types';
import { PERIODIC_TABLE, MAX_TURNS } from './constants';
import PeriodicTable from './components/PeriodicTable';
import { playSound } from './services/soundService';
import { getSmartHint, getEducationalFact } from './services/geminiService';
import { Activity, Beaker, Trophy, Target, Eye, User, ArrowRight, Heart, CheckCircle, AlertOctagon, Lightbulb, BookOpen, Clock, X, Atom } from 'lucide-react';

const TARGET_COUNT = 3; // Number of hidden elements to find

const App: React.FC = () => {
  const [status, setStatus] = useState<GameStatus>('names');
  const [activePlayerId, setActivePlayerId] = useState<PlayerId>('p1');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  
  // Players State
  const [p1State, setP1State] = useState<PlayerState>({ id: 'p1', name: 'Player 1', targets: [], shots: [], hits: [], misses: [], consecutiveMisses: 0, turnCount: 0, activeHint: null });
  const [p2State, setP2State] = useState<PlayerState>({ id: 'p2', name: 'Player 2', targets: [], shots: [], hits: [], misses: [], consecutiveMisses: 0, turnCount: 0, activeHint: null });
  const [p1NameInput, setP1NameInput] = useState("");
  const [p2NameInput, setP2NameInput] = useState("");

  // Targeting & UI State
  const [selectedTarget, setSelectedTarget] = useState<ElementData | null>(null);
  const [targetingInput, setTargetingInput] = useState("");
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [inputError, setInputError] = useState(false);
  
  // Feedback & Reveal State
  const [revealTimer, setRevealTimer] = useState<number>(0);
  const [isViewingOwnFleet, setIsViewingOwnFleet] = useState(false);
  const [turnResult, setTurnResult] = useState<TurnResult | null>(null);

  // Educational & Hint State
  const [showFactModal, setShowFactModal] = useState<string | null>(null);
  const [factLoading, setFactLoading] = useState(false);
  const [hintLoading, setHintLoading] = useState(false);

  // Helper to get opponent state
  const getOpponentState = (playerId: PlayerId) => playerId === 'p1' ? p2State : p1State;
  const setOpponentState = (playerId: PlayerId, newState: PlayerState) => playerId === 'p1' ? setP2State(newState) : setP1State(newState);
  const getCurrentState = (playerId: PlayerId) => playerId === 'p1' ? p1State : p2State;
  const setCurrentState = (playerId: PlayerId, newState: PlayerState) => playerId === 'p1' ? setP1State(newState) : setP2State(newState);

  // --- NAVIGATION BLOCKING ---
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Block navigation if game is in progress
      if (status === 'playing' || status === 'turn_start' || status === 'feedback' || status === 'p1_reveal' || status === 'p2_reveal') {
        e.preventDefault();
        e.returnValue = ''; // Required for Chrome
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [status]);

  // --- SETUP & INIT ---

  const handleNamesSubmit = () => {
    playSound('click');
    if (p1NameInput.trim() && p2NameInput.trim()) {
      setP1State(prev => ({ ...prev, name: p1NameInput }));
      setP2State(prev => ({ ...prev, name: p2NameInput }));
      playSound('start');
      initGame();
    }
  };

  const generateHiddenElements = (owner: PlayerId): HiddenTarget[] => {
    const targets: HiddenTarget[] = [];
    const usedIndices = new Set<number>();

    while (targets.length < TARGET_COUNT) {
      const idx = Math.floor(Math.random() * PERIODIC_TABLE.length);
      if (!usedIndices.has(idx)) {
        usedIndices.add(idx);
        targets.push({
          id: `${owner}-target-${idx}`,
          element: PERIODIC_TABLE[idx],
          isFound: false
        });
      }
    }
    return targets;
  };

  const initGame = () => {
    setP1State(prev => ({ ...prev, targets: generateHiddenElements('p1'), shots: [], hits: [], misses: [], consecutiveMisses: 0, turnCount: 0, activeHint: null }));
    setP2State(prev => ({ ...prev, targets: generateHiddenElements('p2'), shots: [], hits: [], misses: [], consecutiveMisses: 0, turnCount: 0, activeHint: null }));
    setLogs([]);
    setActivePlayerId('p1');
    setStatus('p1_reveal'); 
  };

  const handleGameOver = (reason: 'found_all' | 'max_turns') => {
    playSound('win');
    setStatus('game_over');
  };

  // --- REVEAL PHASE LOGIC ---
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (revealTimer > 0) {
      interval = setInterval(() => {
        setRevealTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [revealTimer]);

  const startReveal = () => {
    playSound('click');
    setRevealTimer(5);
    setIsViewingOwnFleet(true);
  };

  const closeReveal = () => {
    playSound('click');
    setIsViewingOwnFleet(false);
    setRevealTimer(0);
    // If we are in the initial setup phase
    if (status === 'p1_reveal') setStatus('p2_reveal');
    else if (status === 'p2_reveal') {
      setActivePlayerId('p1');
      setStatus('turn_start');
    }
  };

  // --- GAMEPLAY LOGIC ---

  const startTurn = async () => {
    playSound('click');
    
    // Update Turn Count
    const currentUser = getCurrentState(activePlayerId);
    const newTurnCount = currentUser.turnCount + 1;

    // Check Max Turns
    if (newTurnCount > MAX_TURNS) {
      handleGameOver('max_turns');
      return;
    }
    
    // Check Hint Schedule: ONLY on EVEN rounds (2, 4, 6, 8, 10)
    // AND check error condition: every 3 cumulative errors
    const isEvenRound = newTurnCount % 2 === 0;
    
    const shouldTriggerHint = isEvenRound;

    if (shouldTriggerHint) {
       setHintLoading(true);
       
       const opponent = getOpponentState(activePlayerId);
       // Fetch new hint based on TARGETS
       const hint = await getSmartHint(opponent.targets, currentUser.hits, currentUser.misses);
       
       // Update state with new turn count AND new hint
       setCurrentState(activePlayerId, { 
         ...currentUser, 
         turnCount: newTurnCount,
         activeHint: hint,
         consecutiveMisses: 0 // Reset errors as a courtesy or keep them? Resetting makes sense.
       });
       
       setHintLoading(false);
    } else {
       // CLEAR hint from previous rounds if not triggering a new one
       setCurrentState(activePlayerId, { 
         ...currentUser, 
         turnCount: newTurnCount,
         activeHint: null 
       });
    }

    setStatus('playing');
  };

  const handleElementClick = (element: ElementData) => {
    if (status !== 'playing') return;
    
    // Check if trying to shoot where already shot
    const currentUser = getCurrentState(activePlayerId);
    if (currentUser.shots.includes(element.number)) return;

    playSound('click');
    setSelectedTarget(element);
    setTargetingInput("");
    setInputError(false);
    setAttemptsLeft(3); // Reset attempts
  };

  const handleAttackSubmit = () => {
    if (!selectedTarget) return;

    const normalizedInput = targetingInput.trim().toLowerCase();
    const correctValence = selectedTarget.valence.toLowerCase();
    
    // 1. Check Answer
    if (normalizedInput === correctValence) {
      // CORRECT ANSWER: Process the shot
      processShot(selectedTarget);
    } else {
      // WRONG ANSWER
      const newAttempts = attemptsLeft - 1;
      setAttemptsLeft(newAttempts);
      
      if (newAttempts > 0) {
         setInputError(true);
         playSound('error');
         
         // Increment error count for the hint system (even if we don't use it for immediate trigger right now)
         const currentUser = getCurrentState(activePlayerId);
         setCurrentState(activePlayerId, { ...currentUser, consecutiveMisses: currentUser.consecutiveMisses + 1 });
         
      } else {
         // NO ATTEMPTS LEFT: Turn Lost
         setSelectedTarget(null);
         playSound('miss'); // Fail sound
         setTurnResult({
           type: 'lost_turn',
           element: selectedTarget,
           message: `Você errou a valência (${selectedTarget.valence}) 3 vezes e perdeu a vez.`
         });
         
         // Increment consecutive misses
         const currentUser = getCurrentState(activePlayerId);
         setCurrentState(activePlayerId, { ...currentUser, consecutiveMisses: currentUser.consecutiveMisses + 1 });
         
         setStatus('feedback');
      }
    }
  };

  const processShot = async (target: ElementData) => {
    const currentUser = getCurrentState(activePlayerId);
    const opponent = getOpponentState(activePlayerId);
    
    // Check if hit a target
    const targetHitIndex = opponent.targets.findIndex(t => t.element.number === target.number);
    const isHit = targetHitIndex !== -1;
    
    let newOpponentTargets = [...opponent.targets];
    
    if (isHit) {
      // Mark target as found
      newOpponentTargets[targetHitIndex] = { ...newOpponentTargets[targetHitIndex], isFound: true };
      
      playSound('hit');
      addLog(`Encontrou ${target.symbol}!`, 'hit', activePlayerId);
      
      const foundCount = newOpponentTargets.filter(t => t.isFound).length;
      
      setTurnResult({
        type: 'hit',
        element: target,
        message: `ELEMENTO ENCONTRADO! (${foundCount}/${TARGET_COUNT})`
      });

      // Reset consecutive misses on hit
      setCurrentState(activePlayerId, {
        ...currentUser,
        shots: [...currentUser.shots, target.number],
        hits: [...currentUser.hits, target.number],
        consecutiveMisses: 0 
      });

      // Fetch educational fact
      setFactLoading(true);
      const fact = await getEducationalFact(target);
      setShowFactModal(fact);
      setFactLoading(false);

    } else {
      playSound('miss');
      addLog(`Errou em ${target.symbol}.`, 'miss', activePlayerId);
      setTurnResult({
        type: 'miss',
        element: target,
        message: 'Nenhum elemento escondido aqui.'
      });
      
      // Increment consecutive misses on miss
      setCurrentState(activePlayerId, {
        ...currentUser,
        shots: [...currentUser.shots, target.number],
        misses: [...currentUser.misses, target.number],
        consecutiveMisses: currentUser.consecutiveMisses + 1
      });
    }

    // Update Opponent Data
    setOpponentState(activePlayerId, { ...opponent, targets: newOpponentTargets });

    setSelectedTarget(null);
    setStatus('feedback'); 
  };

  const handleFeedbackConfirm = () => {
    playSound('click');
    // Check Win Condition (Find 3 Targets)
    const opponent = getOpponentState(activePlayerId);
    const allFound = opponent.targets.every(t => t.isFound);
    
    if (allFound) {
      handleGameOver('found_all');
    } else {
      // Pass Turn
      setActivePlayerId(prev => prev === 'p1' ? 'p2' : 'p1');
      setStatus('turn_start');
      setTurnResult(null);
      setShowFactModal(null); // Clear fact if any
    }
  };

  const addLog = (message: string, type: LogEntry['type'], player: PlayerId) => {
    setLogs(prev => [{ id: Date.now().toString(), message, type, player }, ...prev].slice(10));
  };

  const getActivePlayerName = () => getCurrentState(activePlayerId).name;

  // --- RENDERERS ---

  // 1. Name Input Screen (Stylized Cover)
  if (status === 'names') {
    return (
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-[#0b1121] to-black flex items-center justify-center p-6 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/20 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="relative bg-slate-900/60 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-[0_0_60px_-15px_rgba(6,182,212,0.3)] max-w-lg w-full text-center space-y-8 z-10 animate-in fade-in zoom-in-95 duration-500">
          
          {/* Header Icon */}
          <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
            <div className="absolute inset-0 bg-cyan-500/30 blur-xl rounded-full animate-pulse"></div>
            <Beaker className="w-20 h-20 text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)] relative z-10" />
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-500 drop-shadow-[0_2px_10px_rgba(6,182,212,0.5)]">
              Batalha Química
            </h1>
            <p className="text-blue-200/80 font-medium tracking-wide">
              Encontre os 3 elementos escondidos
            </p>
          </div>

          <div className="space-y-5 text-left">
             <div className="group">
               <label className="block text-xs font-bold text-cyan-500 uppercase tracking-widest mb-2 ml-1">Jogador 1</label>
               <input 
                 type="text" 
                 value={p1NameInput}
                 onChange={e => setP1NameInput(e.target.value)}
                 className="w-full bg-slate-950/80 border border-slate-700 rounded-xl p-4 text-white focus:border-cyan-500 focus:shadow-[0_0_20px_rgba(6,182,212,0.2)] focus:outline-none transition-all placeholder:text-slate-600 font-semibold"
                 placeholder="Digite seu codinome..."
               />
             </div>
             <div className="group">
               <label className="block text-xs font-bold text-pink-500 uppercase tracking-widest mb-2 ml-1">Jogador 2</label>
               <input 
                 type="text" 
                 value={p2NameInput}
                 onChange={e => setP2NameInput(e.target.value)}
                 className="w-full bg-slate-950/80 border border-slate-700 rounded-xl p-4 text-white focus:border-pink-500 focus:shadow-[0_0_20px_rgba(236,72,153,0.2)] focus:outline-none transition-all placeholder:text-slate-600 font-semibold"
                 placeholder="Digite seu codinome..."
               />
             </div>
          </div>
          
          <button 
            onClick={handleNamesSubmit}
            disabled={!p1NameInput.trim() || !p2NameInput.trim()}
            className="w-full py-5 bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 disabled:opacity-50 disabled:grayscale text-white font-black text-lg uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(8,145,178,0.4)] hover:shadow-[0_0_30px_rgba(34,211,238,0.6)] transition-all transform active:scale-95 border border-white/10"
          >
            Começar Batalha
          </button>
          
          <div className="pt-6 border-t border-white/5 mt-6">
             <p className="text-xl md:text-2xl font-black uppercase tracking-widest text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.8)] animate-pulse">
                Feito por Robson Filho
             </p>
          </div>
        </div>
      </div>
    );
  }

  // 2. Initial Reveals
  if (status === 'p1_reveal' || status === 'p2_reveal') {
    const player = status === 'p1_reveal' ? 'p1' : 'p2';
    const isReady = revealTimer > 0;
    
    return (
      <div className="fixed inset-0 bg-slate-950 z-50 flex flex-col items-center justify-center p-4">
        {isReady ? (
           <div className="w-full h-full flex flex-col">
              <div className="flex justify-between items-center mb-4 px-4">
                <h2 className="text-2xl font-bold text-white">Memorize seus Elementos: {getCurrentState(player).name}</h2>
                <div className="text-4xl font-mono font-bold text-yellow-400 animate-pulse">{revealTimer}s</div>
              </div>
              <div className="flex-grow overflow-auto border border-slate-700 rounded-xl bg-slate-800 p-2">
                 <PeriodicTable 
                    onElementClick={() => {}} 
                    hits={[]} misses={[]}
                    targets={getCurrentState(player).targets} // Show targets
                    disabled={true}
                 />
              </div>
           </div>
        ) : (
           <div className="text-center space-y-6 max-w-md">
             <div className="bg-slate-800 p-6 rounded-full inline-block mb-4 shadow-lg ring-2 ring-blue-500">
               <Eye className="w-16 h-16 text-blue-400" />
             </div>
             <h2 className="text-3xl font-bold text-white">{getCurrentState(player).name}</h2>
             <p className="text-slate-400">
               Você terá 5 segundos para memorizar onde seus 3 elementos secretos estão.
             </p>
             <button 
               onClick={startReveal}
               className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg transition-transform active:scale-95 text-xl flex items-center justify-center gap-2"
             >
               <Eye className="w-6 h-6" /> Visualizar Meus Elementos
             </button>
             <div className="h-4"></div>
             <button 
                onClick={closeReveal}
                className="w-full py-3 border border-slate-600 hover:bg-slate-800 text-slate-300 font-medium rounded-lg transition-colors"
              >
                Continuar
             </button>
           </div>
        )}
      </div>
    );
  }

  // 3. Turn Transition (Pass Device)
  if (status === 'turn_start') {
    return (
      <div className="fixed inset-0 bg-slate-900 z-50 flex items-center justify-center p-6">
           <div className="max-w-md w-full text-center space-y-6 animate-in zoom-in-95 duration-300">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto shadow-2xl ${activePlayerId === 'p1' ? 'bg-blue-600 shadow-blue-500/30' : 'bg-red-600 shadow-red-500/30'}`}>
                 <User className="w-10 h-10 text-white" />
              </div>
              
              <h2 className="text-3xl font-bold text-white">Vez de {getActivePlayerName()}</h2>
              <p className="text-slate-400">
                Passe o dispositivo para <strong>{getActivePlayerName()}</strong>.<br/>
                Não deixe o oponente ver a tela!
              </p>
              
              <button 
                onClick={startTurn}
                className={`w-full py-4 font-bold rounded-xl text-white shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 ${activePlayerId === 'p1' ? 'bg-blue-600 hover:bg-blue-500' : 'bg-red-600 hover:bg-red-500'}`}
              >
                Sou {getActivePlayerName()} <ArrowRight className="w-5 h-5" />
              </button>
           </div>
        </div>
    );
  }

  // 4. Feedback Screen (Hit/Miss/Lost)
  if (status === 'feedback' && turnResult) {
    const isGood = turnResult.type === 'hit';
    const isBad = turnResult.type === 'miss';
    const isLost = turnResult.type === 'lost_turn';

    let bgColor = "bg-slate-900";
    let icon = <Activity />;
    
    if (isGood) { bgColor = "bg-green-900/90"; icon = <CheckCircle className="w-24 h-24 text-green-400 animate-bounce" />; }
    if (isBad) { bgColor = "bg-slate-800/95"; icon = <X className="w-24 h-24 text-slate-400" />; }
    if (isLost) { bgColor = "bg-red-900/90"; icon = <AlertOctagon className="w-24 h-24 text-red-400 animate-pulse" />; }

    return (
      <div className={`fixed inset-0 z-50 flex items-center justify-center p-6 ${bgColor} backdrop-blur-md overflow-y-auto`}>
         {/* Fireworks Effect */}
         {isGood && (
           <div className="absolute inset-0 pointer-events-none overflow-hidden">
             <div className="firework"></div>
             <div className="firework" style={{top: '20%', left: '80%'}}></div>
             <div className="firework" style={{top: '60%', left: '20%'}}></div>
           </div>
         )}
         
         <div className="text-center space-y-6 animate-in zoom-in-90 duration-300 max-w-lg w-full my-auto z-10">
            <div className="flex justify-center">{icon}</div>
            <div>
              <h2 className="text-4xl font-black text-white mb-4 uppercase tracking-wider">
                {isGood ? "ENCONTRADO!" : isBad ? "NÃO É AQUI!" : "VEZ PERDIDA"}
              </h2>
              <p className="text-xl text-white/80 max-w-xs mx-auto leading-relaxed">
                {turnResult.message}
              </p>
            </div>

            {/* Educational Fact Modal Inside Feedback */}
            {isGood && showFactModal && (
               <div className="bg-white/10 p-6 rounded-xl border border-white/20 text-left backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h4 className="flex items-center gap-2 text-yellow-300 font-bold mb-2">
                    <BookOpen className="w-5 h-5" /> Você sabia?
                  </h4>
                  <p className="text-white text-sm leading-relaxed">
                     {showFactModal}
                  </p>
               </div>
            )}
            
            {isGood && factLoading && (
               <div className="text-white/50 text-sm animate-pulse">Consultando a enciclopédia química...</div>
            )}

            <button 
              onClick={handleFeedbackConfirm}
              className="px-10 py-4 bg-white text-slate-900 font-bold rounded-full hover:scale-105 transition-transform shadow-xl text-lg"
            >
              Continuar
            </button>
         </div>
      </div>
    );
  }

  // 5. Game Over
  if (status === 'game_over') {
    const p1Score = p1State.hits.length;
    const p2Score = p2State.hits.length;
    let winner = null;
    let message = "";

    if (p1Score > p2Score) {
      winner = p1State.name;
      message = "Venceu por pontuação!";
    } else if (p2Score > p1Score) {
      winner = p2State.name;
      message = "Venceu por pontuação!";
    } else {
      // Draw
      message = "Empate técnico! Ambos são mestres da química.";
    }

    // Override if someone found all 3 (Instant Win logic already handled by setting winner implicitly via found_all check, but here is strictly score based for timeout)
    // If reason was 'found_all', the last player who moved triggered it and won.
    // We can just rely on hits count because finding all 3 = 3 hits, which is max score.
    
    return (
      <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
           <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-8 text-center shadow-2xl">
              <Trophy className="w-20 h-20 text-yellow-400 mx-auto mb-6 animate-bounce" />
              {winner ? (
                <>
                  <h2 className="text-4xl font-bold text-white mb-2">VITÓRIA!</h2>
                  <p className="text-2xl text-indigo-400 font-semibold mb-6">
                    {winner} {message}
                  </p>
                </>
              ) : (
                <>
                  <h2 className="text-4xl font-bold text-white mb-2">EMPATE!</h2>
                  <p className="text-xl text-slate-400 mb-6">{message}</p>
                </>
              )}
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                 <div className={`p-4 rounded-lg ${p1Score > p2Score ? 'bg-blue-900/50 border border-blue-500' : 'bg-slate-800'}`}>
                    <p className="text-xs text-slate-500 uppercase">{p1State.name}</p>
                    <p className="text-xl font-mono">{p1Score}/{TARGET_COUNT}</p>
                 </div>
                 <div className={`p-4 rounded-lg ${p2Score > p1Score ? 'bg-red-900/50 border border-red-500' : 'bg-slate-800'}`}>
                    <p className="text-xs text-slate-500 uppercase">{p2State.name}</p>
                    <p className="text-xl font-mono">{p2Score}/{TARGET_COUNT}</p>
                 </div>
              </div>
              <button 
                onClick={() => { playSound('click'); setStatus('names'); }}
                className="w-full py-3 bg-white text-slate-900 font-bold rounded-lg hover:bg-slate-200 transition-colors"
              >
                Jogar Novamente
              </button>
           </div>
        </div>
    );
  }

  // --- MAIN GAME SCREEN (PLAYING) ---

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans overflow-hidden">
      
      <header className={`p-4 shadow-lg z-20 border-b transition-colors ${activePlayerId === 'p1' ? 'bg-blue-950/50 border-blue-900' : 'bg-red-950/50 border-red-900'}`}>
          <div className="container mx-auto flex justify-between items-center">
             <div className="flex items-center gap-3">
               <div className={`p-2 rounded-lg ${activePlayerId === 'p1' ? 'bg-blue-600' : 'bg-red-600'}`}>
                 <User className="w-6 h-6 text-white" />
               </div>
               <div>
                 <h1 className="text-xl font-bold text-white leading-tight">Vez de {getActivePlayerName()}</h1>
                 <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span>Procurando: {TARGET_COUNT - getCurrentState(activePlayerId).hits.length} elementos</span>
                    <span className="w-1 h-1 bg-slate-500 rounded-full"></span>
                    <span className="flex items-center gap-1 text-yellow-500 font-mono">
                       <Clock className="w-3 h-3" />
                       Rodada {getCurrentState(activePlayerId).turnCount}/{MAX_TURNS}
                    </span>
                 </div>
               </div>
             </div>
             <button 
                onClick={() => { playSound('click'); setIsViewingOwnFleet(true); setRevealTimer(5); }}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg"
             >
                <Eye className="w-4 h-4" /> Ver Meus Elementos
             </button>
          </div>
        </header>

      {/* Main Board */}
      <main className="flex-grow container mx-auto p-4 flex flex-col lg:flex-row gap-6 overflow-hidden relative">
           
           {/* In-Game Reveal Modal (Overlay) */}
           {isViewingOwnFleet && (
             <div className="absolute inset-0 z-40 bg-slate-900/95 backdrop-blur flex flex-col items-center justify-center p-4 rounded-xl border border-slate-700">
                <div className="flex justify-between items-center w-full max-w-4xl mb-2">
                   <h3 className="text-xl font-bold text-indigo-400">Seus Elementos Secretos ({getActivePlayerName()})</h3>
                   {revealTimer > 0 ? (
                      <span className="text-3xl font-mono text-yellow-400">{revealTimer}s</span>
                   ) : (
                      <button onClick={() => { playSound('click'); setIsViewingOwnFleet(false); setRevealTimer(0); }} className="text-white underline">Fechar</button>
                   )}
                </div>
                <div className="flex-grow w-full overflow-auto bg-slate-950 rounded border border-slate-800 p-2">
                   <PeriodicTable 
                      onElementClick={() => {}}
                      hits={[]} misses={[]}
                      targets={getCurrentState(activePlayerId).targets} // Show own targets
                      disabled={true}
                   />
                </div>
                {revealTimer === 0 && (
                   <button onClick={() => { playSound('click'); setIsViewingOwnFleet(false); }} className="mt-4 px-6 py-2 bg-slate-700 text-white rounded">Fechar</button>
                )}
             </div>
           )}

           <div className="flex-grow flex flex-col gap-2 overflow-hidden">
              <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
                 <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Scanner de Elementos</span>
                 <div className="flex gap-4 text-xs">
                    <span className="flex items-center gap-1"><div className="w-3 h-3 bg-green-600 rounded-sm"></div> Encontrado</span>
                    <span className="flex items-center gap-1"><div className="w-3 h-3 bg-slate-700 border border-slate-500 rounded-sm"></div> Vazio</span>
                 </div>
              </div>
              
              <div className="flex-grow overflow-auto border border-slate-800 rounded-xl bg-slate-900 shadow-2xl relative">
                  <PeriodicTable 
                    onElementClick={handleElementClick}
                    hits={getCurrentState(activePlayerId).hits}
                    misses={getCurrentState(activePlayerId).misses}
                    disabled={false}
                  />
              </div>

              {/* NEW: Hint Section Below Table */}
              {(getCurrentState(activePlayerId).activeHint || hintLoading) && (
                 <div className="bg-slate-900 border border-yellow-700/50 p-4 rounded-xl mt-2 flex flex-col relative overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex items-center gap-2 mb-2">
                       <Lightbulb className="w-5 h-5 text-yellow-500" />
                       <h3 className="text-sm font-bold text-yellow-500 uppercase tracking-widest">DICA DE ELEMENTO</h3>
                    </div>
                    <div className="bg-yellow-950/20 p-3 rounded border border-yellow-900/30 min-h-[60px] flex items-center">
                       {hintLoading ? (
                           <span className="text-yellow-500/50 text-sm animate-pulse">Decodificando propriedades...</span>
                       ) : (
                           <p className="text-yellow-100 text-sm">
                              {getCurrentState(activePlayerId).activeHint}
                           </p>
                       )}
                    </div>
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-yellow-500/10 to-transparent pointer-events-none"></div>
                 </div>
              )}
           </div>

           {/* Sidebar Info */}
           <aside className="w-full lg:w-72 flex flex-col gap-4 shrink-0">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex-grow">
                 <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Atom className="w-4 h-4" /> Elementos Encontrados
                 </h3>
                 <div className="space-y-4 mb-6">
                    {/* P1 Progress */}
                    <div>
                       <div className="flex justify-between text-xs mb-1">
                          <span className="text-blue-400 font-bold">{p1State.name}</span>
                          <span className="text-slate-400">{p1State.targets.filter(t => t.isFound).length}/{TARGET_COUNT}</span>
                       </div>
                       <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                             className="h-full bg-blue-600 transition-all duration-500"
                             style={{ width: `${(p1State.targets.filter(t => t.isFound).length / TARGET_COUNT) * 100}%` }}
                          ></div>
                       </div>
                    </div>
                    {/* P2 Progress */}
                    <div>
                       <div className="flex justify-between text-xs mb-1">
                          <span className="text-red-400 font-bold">{p2State.name}</span>
                          <span className="text-slate-400">{p2State.targets.filter(t => t.isFound).length}/{TARGET_COUNT}</span>
                       </div>
                       <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                             className="h-full bg-red-600 transition-all duration-500"
                             style={{ width: `${(p2State.targets.filter(t => t.isFound).length / TARGET_COUNT) * 100}%` }}
                          ></div>
                       </div>
                    </div>
                 </div>

                 <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2 border-t border-slate-800 pt-4">
                    <Activity className="w-4 h-4" /> Histórico
                 </h3>
                 <div className="space-y-2 max-h-[200px] overflow-y-auto font-mono text-xs">
                    {logs.map(log => (
                      <div key={log.id} className={`p-2 rounded border-l-2 ${log.player === 'p1' ? 'border-blue-500 bg-blue-900/10' : 'border-red-500 bg-red-900/10'}`}>
                         <span className="font-bold opacity-70">{log.player === 'p1' ? p1State.name : p2State.name}:</span> {log.message}
                      </div>
                    ))}
                    {logs.length === 0 && <span className="text-slate-600 italic">Nenhum disparo ainda.</span>}
                 </div>
              </div>
           </aside>
      </main>

      {/* Targeting Modal */}
      {selectedTarget && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
           <div className="bg-slate-900 border border-slate-600 rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
             {/* Header without Close button */}
             <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-center items-center">
               <h3 className="text-lg font-bold text-white flex items-center gap-2">
                 <Target className="w-5 h-5 text-red-500" /> SISTEMA DE ANÁLISE
               </h3>
             </div>
             <div className="p-6 space-y-6">
                <div className="flex justify-center gap-2 mb-2">
                  {[1, 2, 3].map(i => (
                     <Heart key={i} className={`w-6 h-6 ${i <= attemptsLeft ? 'text-red-500 fill-red-500' : 'text-slate-700'}`} />
                  ))}
                </div>
                <div className="text-center text-sm text-slate-400">
                   {attemptsLeft} tentativas de calibração
                </div>

                <div className="flex items-center gap-4">
                   <div className={`w-16 h-16 rounded-lg flex items-center justify-center border-2 ${activePlayerId === 'p1' ? 'bg-blue-900 border-blue-500' : 'bg-red-900 border-red-500'}`}>
                      <span className="text-3xl font-bold text-white">{selectedTarget.symbol}</span>
                   </div>
                   <div>
                      <p className="text-sm text-slate-400 uppercase">Analisando Elemento</p>
                      <p className="text-xl font-semibold">{selectedTarget.name}</p>
                   </div>
                </div>
                <div>
                   <label className="block text-sm text-slate-300 mb-2">Digite a camada mais energética (ex: 3d5):</label>
                   <input 
                      autoFocus
                      type="text"
                      value={targetingInput}
                      onChange={(e) => { setTargetingInput(e.target.value); setInputError(false); }}
                      onKeyDown={(e) => e.key === 'Enter' && handleAttackSubmit()}
                      className={`w-full bg-slate-950 border ${inputError ? 'border-red-500' : 'border-slate-700'} rounded p-3 text-white font-mono uppercase text-lg`}
                      placeholder="?"
                   />
                   {inputError && <p className="text-red-400 text-xs mt-2 animate-pulse">Incorreto! Tente novamente.</p>}
                </div>
                {/* Footer without Cancel button */}
                <div className="flex justify-center">
                   <button onClick={handleAttackSubmit} className="w-full px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded shadow-lg transition-transform active:scale-95">CONFIRMAR ANÁLISE</button>
                </div>
             </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default App;
