import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Info, Check, X } from 'lucide-react';

// Mock stat definitions - replace with your actual imports
const statDefinitions = {
  traditional: [
    { name: 'par', label: 'Par', type: 'number', inputMode: 'numeric', pattern: '[3-5]', tooltip: 'Par for this hole (3-5)' },
    { name: 'hole_score', label: 'Score', type: 'number', inputMode: 'numeric', pattern: '[1-9][0-9]?', tooltip: 'Your score for this hole' },
    { name: 'putts', label: 'Putts', type: 'number', inputMode: 'numeric', pattern: '[0-9]', tooltip: 'Number of putts' },
  ],
  longGame: [
    { name: 'fairway_hit', label: 'Fairway', type: 'switch', tooltip: 'Hit fairway in regulation', isRelevantForRed: true },
    { name: 'gir', label: 'GIR', type: 'switch', tooltip: 'Green in regulation', isRelevantForRed: true },
  ],
  shortGame: [
    { name: 'sand_save', label: 'Sand Save', type: 'switch', tooltip: 'Got up and down from bunker' },
    { name: 'scramble', label: 'Scramble', type: 'switch', tooltip: 'Made par without GIR' },
  ]
};

// Sample data
const initialHoles = Array.from({ length: 18 }, (_, i) => ({
  played: true,
  par: i % 2 === 0 ? 4 : 3,
  hole_score: 0,
  putts: 0,
  fairway_hit: false,
  gir: false,
  sand_save: false,
  scramble: false,
}));

const MobileGolfScorecard = () => {
  const [holes, setHoles] = useState(initialHoles);
  const [currentHole, setCurrentHole] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeNine, setActiveNine] = useState('front'); // 'front' or 'back'

  const getCurrentHoleData = () => holes[currentHole];
  const currentData = getCurrentHoleData();

  const handleChange = (field, value) => {
    setHoles(prev => {
      const updated = [...prev];
      updated[currentHole] = { ...updated[currentHole], [field]: value };
      return updated;
    });
  };

  const nextHole = () => {
    if (currentHole < holes.length - 1) {
      setCurrentHole(prev => prev + 1);
      if (currentHole === 8) setActiveNine('back');
    }
  };

  const prevHole = () => {
    if (currentHole > 0) {
      setCurrentHole(prev => prev - 1);
      if (currentHole === 9) setActiveNine('front');
    }
  };

  const goToHole = (index) => {
    setCurrentHole(index);
    setActiveNine(index < 9 ? 'front' : 'back');
  };

  const quickScore = (score) => {
    handleChange('hole_score', score);
  };

  const calculateRelativeToPar = () => {
    if (!currentData.hole_score || !currentData.par) return null;
    const diff = currentData.hole_score - currentData.par;
    if (diff === 0) return { label: 'Par', color: 'bg-gray-600' };
    if (diff === -2) return { label: 'Eagle', color: 'bg-yellow-500' };
    if (diff === -1) return { label: 'Birdie', color: 'bg-green-500' };
    if (diff === 1) return { label: 'Bogey', color: 'bg-orange-500' };
    if (diff >= 2) return { label: `+${diff}`, color: 'bg-red-500' };
    return null;
  };

  const scoreBadge = calculateRelativeToPar();

  const nineHoles = activeNine === 'front' ? holes.slice(0, 9) : holes.slice(9, 18);
  const startIndex = activeNine === 'front' ? 0 : 9;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      {/* Nine Selector */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => { setActiveNine('front'); setCurrentHole(0); }}
          className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
            activeNine === 'front' 
              ? 'bg-green-600 text-white shadow-lg' 
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          Front 9
        </button>
        <button
          onClick={() => { setActiveNine('back'); setCurrentHole(9); }}
          className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
            activeNine === 'back' 
              ? 'bg-green-600 text-white shadow-lg' 
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          Back 9
        </button>
      </div>

      {/* Hole Quick Selector */}
      <div className="grid grid-cols-9 gap-1 mb-4">
        {nineHoles.map((hole, idx) => {
          const holeNum = startIndex + idx;
          const isActive = currentHole === holeNum;
          const hasScore = hole.hole_score > 0;
          return (
            <button
              key={holeNum}
              onClick={() => goToHole(holeNum)}
              className={`py-2 rounded-lg text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-green-600 text-white scale-110 shadow-lg'
                  : hasScore
                  ? 'bg-green-200 text-green-800 hover:bg-green-300'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {holeNum + 1}
            </button>
          );
        })}
      </div>

      {/* Main Score Card */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white">
          <div className="flex justify-between items-center mb-2">
            <button
              onClick={prevHole}
              disabled={currentHole === 0}
              className="p-2 rounded-full hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div className="text-center">
              <div className="text-sm opacity-90">Hole</div>
              <div className="text-5xl font-bold">{currentHole + 1}</div>
            </div>
            <button
              onClick={nextHole}
              disabled={currentHole === holes.length - 1}
              className="p-2 rounded-full hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
          <div className="text-center text-sm opacity-90">
            Par {currentData.par}
          </div>
          {scoreBadge && (
            <div className="flex justify-center mt-3">
              <span className={`px-4 py-1 rounded-full text-sm font-semibold ${scoreBadge.color} text-white`}>
                {scoreBadge.label}
              </span>
            </div>
          )}
        </div>

        {/* Quick Score Buttons */}
        <div className="p-6 border-b">
          <div className="text-sm font-semibold text-gray-600 mb-3">Quick Score</div>
          <div className="grid grid-cols-5 gap-2">
            {[currentData.par - 2, currentData.par - 1, currentData.par, currentData.par + 1, currentData.par + 2].map(score => (
              <button
                key={score}
                onClick={() => quickScore(score)}
                className={`py-4 rounded-xl font-bold text-lg transition-all ${
                  currentData.hole_score === score
                    ? 'bg-green-600 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-95'
                }`}
              >
                {score}
              </button>
            ))}
          </div>
        </div>

        {/* Score Input */}
        <div className="p-6 border-b">
          <label className="block text-sm font-semibold text-gray-600 mb-2">
            Score
          </label>
          <input
            type="number"
            inputMode="numeric"
            value={currentData.hole_score || ''}
            onChange={(e) => handleChange('hole_score', parseInt(e.target.value) || 0)}
            className="w-full px-4 py-4 text-2xl font-bold text-center border-2 border-gray-200 rounded-xl focus:border-green-600 focus:outline-none transition-all"
            placeholder="0"
          />
        </div>

        {/* Putts */}
        <div className="p-6 border-b">
          <label className="block text-sm font-semibold text-gray-600 mb-2">
            Putts
          </label>
          <div className="grid grid-cols-6 gap-2">
            {[0, 1, 2, 3, 4, 5].map(num => (
              <button
                key={num}
                onClick={() => handleChange('putts', num)}
                className={`py-3 rounded-xl font-semibold transition-all ${
                  currentData.putts === num
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-95'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {/* Advanced Stats Toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full p-4 flex items-center justify-between text-gray-700 hover:bg-gray-50 transition-all"
        >
          <span className="font-semibold">Advanced Stats</span>
          <ChevronRight className={`w-5 h-5 transition-transform ${showAdvanced ? 'rotate-90' : ''}`} />
        </button>

        {/* Advanced Stats */}
        {showAdvanced && (
          <div className="p-6 bg-gray-50 space-y-4">
            {/* Long Game */}
            <div>
              <div className="text-xs font-semibold text-gray-500 mb-3 uppercase">Long Game</div>
              <div className="space-y-2">
                {statDefinitions.longGame.map(stat => (
                  <button
                    key={stat.name}
                    onClick={() => handleChange(stat.name, !currentData[stat.name])}
                    className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${
                      currentData[stat.name]
                        ? 'bg-green-600 text-white shadow-lg'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="font-semibold">{stat.label}</span>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      currentData[stat.name] ? 'bg-white/20' : 'bg-gray-200'
                    }`}>
                      {currentData[stat.name] ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <X className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Short Game */}
            <div>
              <div className="text-xs font-semibold text-gray-500 mb-3 uppercase">Short Game</div>
              <div className="space-y-2">
                {statDefinitions.shortGame.map(stat => (
                  <button
                    key={stat.name}
                    onClick={() => handleChange(stat.name, !currentData[stat.name])}
                    className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${
                      currentData[stat.name]
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="font-semibold">{stat.label}</span>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      currentData[stat.name] ? 'bg-white/20' : 'bg-gray-200'
                    }`}>
                      {currentData[stat.name] ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <X className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        <button
          onClick={prevHole}
          disabled={currentHole === 0}
          className="flex-1 bg-white text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-md"
        >
          Previous Hole
        </button>
        <button
          onClick={nextHole}
          disabled={currentHole === holes.length - 1}
          className="flex-1 bg-green-600 text-white py-4 rounded-xl font-semibold hover:bg-green-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-md"
        >
          Next Hole
        </button>
      </div>
    </div>
  );
};

export default MobileGolfScorecard;