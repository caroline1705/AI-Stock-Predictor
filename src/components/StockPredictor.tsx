import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Newspaper, 
  BarChart3, 
  BrainCircuit, 
  History,
  AlertCircle,
  Loader2,
  ChevronRight,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { predictStockPrice, PredictionResult } from '../services/geminiService';
import { DEFAULT_TRAINING_DATA } from '../constants';

const STOCKS = [
  { symbol: 'SPY', name: 'S&P 500 ETF' },
  { symbol: 'QQQ', name: 'Nasdaq 100 ETF' },
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'TSLA', name: 'Tesla, Inc.' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation' },
  { symbol: 'BTC', name: 'Bitcoin' },
];

export default function StockPredictor() {
  const [news, setNews] = useState('');
  const [selectedStock, setSelectedStock] = useState(STOCKS[0]);
  const [historicalContext, setHistoricalContext] = useState(DEFAULT_TRAINING_DATA);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isPredicting, setIsPredicting] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showContextInput, setShowContextInput] = useState(false);

  const handlePredict = async () => {
    if (!news.trim()) {
      setError('Please provide some news context.');
      return;
    }
    
    setIsPredicting(true);
    setError(null);
    try {
      const prediction = await predictStockPrice(news, selectedStock.symbol, historicalContext, date);
      setResult(prediction);
    } catch (err) {
      console.error(err);
      setError('Failed to generate prediction. Please try again.');
    } finally {
      setIsPredicting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#E4E3E0] text-[#141414] font-sans selection:bg-[#141414] selection:text-[#E4E3E0]">
      {/* Header */}
      <header className="border-b border-[#141414] p-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tighter uppercase italic font-serif">
            Stock News Predictor
          </h1>
          <p className="text-xs opacity-50 uppercase tracking-widest mt-1">
            Neural Analysis Engine v1.0 // 2021-2022 Contextual Training
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowContextInput(!showContextInput)}
            className="flex items-center gap-2 px-4 py-2 border border-[#141414] hover:bg-[#141414] hover:text-[#E4E3E0] transition-colors text-xs uppercase font-bold"
          >
            <History size={14} />
            {showContextInput ? 'Close Context' : 'Training Data'}
          </button>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-12 min-h-[calc(100vh-88px)]">
        {/* Left Panel: Input */}
        <div className="lg:col-span-5 border-r border-[#141414] p-8 flex flex-col gap-8">
          <section>
            <label className="block font-serif italic text-xs opacity-50 uppercase mb-4 tracking-widest">
              01. Select Asset & Date
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
              {STOCKS.map((stock) => (
                <button
                  key={stock.symbol}
                  onClick={() => setSelectedStock(stock)}
                  className={`p-4 border text-left transition-all ${
                    selectedStock.symbol === stock.symbol 
                    ? 'bg-[#141414] text-[#E4E3E0] border-[#141414]' 
                    : 'border-[#141414]/20 hover:border-[#141414]'
                  }`}
                >
                  <div className="font-mono text-lg font-bold">{stock.symbol}</div>
                  <div className="text-[10px] opacity-70 uppercase truncate">{stock.name}</div>
                </button>
              ))}
            </div>
            <input 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-transparent border border-[#141414] p-4 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-[#141414]"
            />
          </section>

          <section className="flex-1 flex flex-col">
            <label className="block font-serif italic text-xs opacity-50 uppercase mb-4 tracking-widest">
              02. Daily News Context
            </label>
            <textarea
              value={news}
              onChange={(e) => setNews(e.target.value)}
              placeholder="Paste news headlines, articles, or market summaries here..."
              className="flex-1 w-full bg-transparent border border-[#141414] p-4 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-[#141414] resize-none"
            />
          </section>

          <button
            onClick={handlePredict}
            disabled={isPredicting}
            className="w-full py-6 bg-[#141414] text-[#E4E3E0] font-bold uppercase tracking-[0.2em] hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-3 transition-all group"
          >
            {isPredicting ? (
              <>
                <Loader2 className="animate-spin" />
                Analyzing Market...
              </>
            ) : (
              <>
                <BrainCircuit size={20} className="group-hover:scale-110 transition-transform" />
                Generate Prediction
              </>
            )}
          </button>
        </div>

        {/* Right Panel: Output */}
        <div className="lg:col-span-7 bg-[#D9D8D5] p-8 overflow-y-auto">
          <AnimatePresence mode="wait">
            {showContextInput ? (
              <motion.div
                key="context"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="h-full flex flex-col"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-serif italic text-xl">Historical Training Context</h2>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setHistoricalContext(DEFAULT_TRAINING_DATA)}
                      className="text-[10px] border border-[#141414] px-2 py-1 hover:bg-[#141414] hover:text-[#E4E3E0] uppercase font-bold transition-colors"
                    >
                      Reset to Default
                    </button>
                    <span className="text-[10px] bg-[#141414] text-[#E4E3E0] px-2 py-1 uppercase font-bold">2021-2022 Data</span>
                  </div>
                </div>
                <p className="text-sm mb-4 opacity-70 leading-relaxed">
                  Provide overarching financial news stories and events from 2021-2022 to help the model recognize patterns.
                </p>
                <textarea
                  value={historicalContext}
                  onChange={(e) => setHistoricalContext(e.target.value)}
                  placeholder="Paste 2021-2022 historical data here..."
                  className="flex-1 w-full bg-transparent border border-[#141414] p-6 font-mono text-sm focus:outline-none"
                />
              </motion.div>
            ) : result ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col gap-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="border border-[#141414] p-6 bg-[#E4E3E0]">
                    <label className="text-[10px] uppercase font-bold opacity-50 tracking-widest mb-2 block">Opening Price</label>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-mono font-bold">${result.openingPrice.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="border border-[#141414] p-6 bg-[#E4E3E0]">
                    <label className="text-[10px] uppercase font-bold opacity-50 tracking-widest mb-2 block">Predicted Close</label>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-mono font-bold">${result.predictedClose.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="border border-[#141414] p-6 bg-[#E4E3E0] flex flex-col justify-between">
                    <div>
                      <label className="text-[10px] uppercase font-bold opacity-50 tracking-widest mb-2 block">Predicted Change</label>
                      <div className={`flex items-center gap-2 text-3xl font-bold font-mono ${
                        result.percentChange >= 0 ? 'text-emerald-700' : 'text-rose-700'
                      }`}>
                        {result.percentChange >= 0 ? '+' : ''}{result.percentChange.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border border-[#141414] p-6 bg-[#E4E3E0] flex flex-col justify-between">
                    <div>
                      <label className="text-[10px] uppercase font-bold opacity-50 tracking-widest mb-2 block">Market Sentiment</label>
                      <div className={`flex items-center gap-2 text-2xl font-bold uppercase italic font-serif ${
                        result.sentiment === 'bullish' ? 'text-emerald-700' : 
                        result.sentiment === 'bearish' ? 'text-rose-700' : 'text-slate-700'
                      }`}>
                        {result.sentiment === 'bullish' ? <TrendingUp /> : result.sentiment === 'bearish' ? <TrendingDown /> : <BarChart3 />}
                        {result.sentiment}
                      </div>
                    </div>
                  </div>
                  <div className="border border-[#141414] p-6 bg-[#E4E3E0] flex flex-col justify-end">
                    <div className="flex justify-between text-[10px] uppercase font-bold mb-1">
                      <span>Confidence Score</span>
                      <span>{(result.confidence * 100).toFixed(0)}%</span>
                    </div>
                    <div className="h-1 bg-[#141414]/10 w-full">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${result.confidence * 100}%` }}
                        className="h-full bg-[#141414]" 
                      />
                    </div>
                  </div>
                </div>

                <div className="border border-[#141414] p-8 bg-[#E4E3E0]">
                  <h3 className="font-serif italic text-xl mb-6 border-b border-[#141414]/10 pb-4">Analysis Reasoning</h3>
                  <div className="prose prose-sm max-w-none text-[#141414] leading-relaxed font-mono">
                    {result.reasoning}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border border-[#141414] p-6 bg-[#E4E3E0]">
                    <h4 className="text-[10px] uppercase font-bold opacity-50 tracking-widest mb-4">Key Impact Factors</h4>
                    <ul className="space-y-3">
                      {result.keyFactors.map((factor, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm font-mono">
                          <ChevronRight size={14} className="mt-1 shrink-0" />
                          {factor}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="border border-[#141414] p-6 bg-[#141414] text-[#E4E3E0]">
                    <h4 className="text-[10px] uppercase font-bold opacity-50 tracking-widest mb-4">Disclaimer</h4>
                    <p className="text-[10px] leading-relaxed opacity-70 uppercase">
                      This prediction is generated by an AI model for educational purposes only. 
                      Stock market investments carry high risk. Never make financial decisions 
                      based solely on AI predictions. Past performance is not indicative of future results.
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                <BarChart3 size={64} strokeWidth={1} />
                <p className="mt-4 uppercase tracking-[0.3em] text-sm font-bold">Awaiting Input Data</p>
                <p className="mt-2 text-xs italic font-serif">Configure parameters on the left to begin analysis</p>
              </div>
            )}
          </AnimatePresence>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="fixed bottom-8 right-8 bg-rose-100 border border-rose-900 text-rose-900 p-4 flex items-center gap-3 shadow-xl"
            >
              <AlertCircle size={20} />
              <span className="text-xs font-bold uppercase">{error}</span>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
