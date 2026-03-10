/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Plus, Trash2, Trophy, RotateCcw, UserPlus, Save, ChevronRight, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Player {
  id: string;
  name: string;
  scores: number[];
}

export default function App() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [gameStarted, setGameStarted] = useState(false);

  const addPlayer = () => {
    if (newPlayerName.trim()) {
      setPlayers([...players, { id: crypto.randomUUID(), name: newPlayerName.trim(), scores: [] }]);
      setNewPlayerName('');
    }
  };

  const removePlayer = (id: string) => {
    setPlayers(players.filter(p => p.id !== id));
  };

  const addRound = () => {
    setPlayers(players.map(p => {
      const lastScore = p.scores.length > 0 ? p.scores[p.scores.length - 1] : 0;
      return { ...p, scores: [...p.scores, lastScore] };
    }));
  };

  const updateScore = (playerId: string, roundIndex: number, score: number) => {
    setPlayers(players.map(p => {
      if (p.id === playerId) {
        const newScores = [...p.scores];
        newScores[roundIndex] = score;
        return { ...p, scores: newScores };
      }
      return p;
    }));
  };

  const resetGame = () => {
    if (confirm('Weet je zeker dat je het spel wilt resetten? Alle scores gaan verloren.')) {
      setPlayers(players.map(p => ({ ...p, scores: [] })));
      setGameStarted(false);
    }
  };

  const totals = useMemo(() => {
    return players.map(p => ({
      ...p,
      total: p.scores.reduce((sum, s) => sum + s, 0)
    }));
  }, [players]);

  const winner = useMemo(() => {
    if (totals.length === 0) return null;
    const eligible = totals.filter(t => t.total >= 50);
    if (eligible.length === 0) return null;
    return eligible.reduce((prev, current) => (prev.total > current.total) ? prev : current);
  }, [totals]);

  const roundsCount = players[0]?.scores.length || 0;

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-zinc-900 p-3 rounded-2xl shadow-lg shadow-zinc-900/20">
              <Building2 className="text-white" size={32} />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-zinc-900">Metropolis</h1>
              <p className="text-zinc-500">Score Tracker</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={resetGame}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50 transition-colors shadow-sm"
            >
              <RotateCcw size={18} />
              Reset
            </button>
          </div>
        </header>

        {!gameStarted && players.length < 10 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200 mb-8"
          >
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <UserPlus size={20} />
              Spelers toevoegen
            </h2>
            <div className="flex gap-2">
              <input
                type="text"
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addPlayer()}
                placeholder="Naam van de speler..."
                className="flex-1 px-4 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all"
              />
              <button
                onClick={addPlayer}
                className="bg-zinc-900 text-white px-6 py-2 rounded-xl font-medium hover:bg-zinc-800 transition-colors"
              >
                Voeg toe
              </button>
            </div>

            <div className="mt-6 space-y-2">
              <AnimatePresence>
                {players.map((player) => (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl border border-zinc-100"
                  >
                    <span className="font-medium">{player.name}</span>
                    <button
                      onClick={() => removePlayer(player.id)}
                      className="text-zinc-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {players.length >= 2 && (
              <button
                onClick={() => setGameStarted(true)}
                className="w-full mt-6 bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
              >
                Start Spel
                <ChevronRight size={20} />
              </button>
            )}
          </motion.div>
        )}

        {gameStarted && (
          <div className="space-y-8">
            {/* Score Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-zinc-50 border-bottom border-zinc-200">
                      <th className="p-4 text-left font-semibold text-zinc-500 uppercase text-xs tracking-wider border-r border-zinc-200 sticky left-0 bg-zinc-50 z-10">Ronde</th>
                      {players.map(player => (
                        <th key={player.id} className="p-4 text-center min-w-[120px]">
                          <div className="flex flex-col items-center gap-1">
                            <span className="font-bold text-zinc-900">{player.name}</span>
                            {winner?.id === player.id && (
                              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                                <Trophy size={10} /> Winnaar
                              </span>
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: roundsCount }).map((_, roundIdx) => (
                      <tr key={roundIdx} className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50/50 transition-colors">
                        <td className="p-4 font-mono text-zinc-400 text-sm border-r border-zinc-200 sticky left-0 bg-white z-10">
                          R{roundIdx + 1}
                        </td>
                        {players.map(player => (
                          <td key={player.id} className="p-2">
                            <input
                              type="number"
                              value={player.scores[roundIdx] || ''}
                              onChange={(e) => updateScore(player.id, roundIdx, parseInt(e.target.value) || 0)}
                              className="w-full text-center py-2 bg-transparent focus:outline-none font-medium text-lg"
                              placeholder="0"
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                    <tr className="bg-zinc-900 text-white font-bold">
                      <td className="p-4 border-r border-zinc-800 sticky left-0 bg-zinc-900 z-10">TOTAAL</td>
                      {totals.map(p => (
                        <td key={p.id} className="p-4 text-center text-xl">
                          {p.total}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="p-4 bg-zinc-50 border-t border-zinc-200">
                <button
                  onClick={addRound}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-white border border-zinc-200 rounded-xl text-zinc-900 font-semibold hover:bg-zinc-100 transition-colors shadow-sm"
                >
                  <Plus size={20} />
                  Nieuwe Ronde Toevoegen
                </button>
              </div>
            </div>

            {/* Winner Announcement */}
            {winner && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-emerald-600 text-white p-8 rounded-3xl shadow-xl shadow-emerald-600/30 flex flex-col items-center text-center gap-4"
              >
                <div className="bg-white/20 p-4 rounded-full">
                  <Trophy size={48} className="text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-black uppercase tracking-tight">Gefeliciteerd!</h2>
                  <p className="text-emerald-100 text-lg mt-1">
                    <span className="font-bold text-white">{winner.name}</span> heeft gewonnen met <span className="font-bold text-white">{winner.total}</span> punten!
                  </p>
                </div>
              </motion.div>
            )}

            {/* Instructions if no winner yet */}
            {!winner && gameStarted && (
              <div className="bg-zinc-100 p-4 rounded-xl text-center text-zinc-500 text-sm">
                De winnaar wordt bekend gemaakt zodra iemand minstens 50 punten heeft behaald.
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!gameStarted && players.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
            <div className="bg-zinc-100 p-6 rounded-full mb-4">
              <UserPlus size={48} />
            </div>
            <p className="text-lg">Voeg spelers toe om te beginnen</p>
          </div>
        )}
      </div>
    </div>
  );
}
