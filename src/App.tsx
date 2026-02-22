/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  XCircle, 
  ChevronRight, 
  RotateCcw, 
  BookOpen, 
  Trophy,
  AlertCircle,
  Info,
  ExternalLink,
  GraduationCap,
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  Settings,
  Play,
  Edit3,
  Database
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Markdown from 'react-markdown';
import { defaultQuestions } from './data/questions';
import { Question, UserAnswer, QuestionBank, Difficulty, ExamType } from './types';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type View = 'splash' | 'selection' | 'quiz' | 'result' | 'editor';

const DEFAULT_BANK: QuestionBank = {
  id: 'default',
  name: '默认题库 (TOEFL & SAT)',
  questions: defaultQuestions
};

export default function App() {
  const [view, setView] = useState<View>('splash');
  const [banks, setBanks] = useState<QuestionBank[]>([DEFAULT_BANK]);
  const [selectedBankId, setSelectedBankId] = useState<string>('default');
  const [editingBank, setEditingBank] = useState<QuestionBank | null>(null);
  const [sessionQuestions, setSessionQuestions] = useState<Question[]>([]);
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  // Load banks from localStorage
  useEffect(() => {
    const savedBanks = localStorage.getItem('grammar_master_banks');
    if (savedBanks) {
      try {
        const parsed = JSON.parse(savedBanks);
        setBanks([DEFAULT_BANK, ...parsed]);
      } catch (e) {
        console.error("Failed to parse saved banks", e);
      }
    }
  }, []);

  const saveBanks = (newBanks: QuestionBank[]) => {
    const customBanks = newBanks.filter(b => b.id !== 'default');
    localStorage.setItem('grammar_master_banks', JSON.stringify(customBanks));
    setBanks(newBanks);
  };

  const currentBank = useMemo(() => {
    return banks.find(b => b.id === selectedBankId) || DEFAULT_BANK;
  }, [banks, selectedBankId]);

  const currentQuestion = useMemo(() => {
    return sessionQuestions[currentQuestionIndex] || currentBank.questions[currentQuestionIndex];
  }, [sessionQuestions, currentQuestionIndex, currentBank]);

  const score = useMemo(() => {
    return userAnswers.filter(a => a.isCorrect).length;
  }, [userAnswers]);

  const handleStartQuiz = (bankId: string) => {
    const bank = banks.find(b => b.id === bankId) || DEFAULT_BANK;
    
    // Shuffle questions and their options
    const shuffledQuestions = [...bank.questions]
      .sort(() => Math.random() - 0.5)
      .map(q => ({
        ...q,
        options: [...q.options].sort(() => Math.random() - 0.5)
      }));

    setSelectedBankId(bankId);
    // We need a way to store the session questions if we want them to stay shuffled
    // but not change the original bank. 
    // Let's add a state for sessionQuestions.
    setSessionQuestions(shuffledQuestions);
    
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsSubmitted(false);
    setUserAnswers([]);
    setIsFinished(false);
    setView('quiz');
  };

  const handleOptionSelect = (option: string) => {
    if (isSubmitted) return;
    setSelectedOption(option);
  };

  const handleSubmit = () => {
    if (!selectedOption || isSubmitted) return;
    
    const isCorrect = selectedOption === currentQuestion.correctAnswer;
    const newAnswer: UserAnswer = {
      questionId: currentQuestion.id,
      selectedOption,
      isCorrect
    };

    setUserAnswers([...userAnswers, newAnswer]);
    setIsSubmitted(true);
  };

  const handleNext = () => {
    if (currentQuestionIndex < sessionQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
      setIsSubmitted(false);
    } else {
      setView('result');
    }
  };

  const handleRestart = () => {
    setView('selection');
  };

  // Editor Functions
  const handleCreateBank = () => {
    const newBank: QuestionBank = {
      id: Date.now().toString(),
      name: '新题库',
      questions: [{
        id: '1',
        sentence: 'This is a [BLANK] sentence.',
        options: ['test', 'sample', 'demo', 'example'],
        correctAnswer: 'test',
        explanation: { rule: '', example: '', commonMistake: '' },
        difficulty: 'Beginner',
        category: 'General',
        examType: 'TOEFL'
      }]
    };
    setEditingBank(newBank);
    setView('editor');
  };

  const handleEditBank = (bank: QuestionBank) => {
    if (bank.id === 'default') return;
    setEditingBank(JSON.parse(JSON.stringify(bank))); // Deep clone
    setView('editor');
  };

  const handleSaveBank = () => {
    if (!editingBank) return;
    const existingIndex = banks.findIndex(b => b.id === editingBank.id);
    let newBanks: QuestionBank[];
    if (existingIndex >= 0) {
      newBanks = [...banks];
      newBanks[existingIndex] = editingBank;
    } else {
      newBanks = [...banks, editingBank];
    }
    saveBanks(newBanks);
    setView('selection');
  };

  const handleDeleteBank = (id: string) => {
    if (id === 'default') return;
    const newBanks = banks.filter(b => b.id !== id);
    saveBanks(newBanks);
  };

  const addQuestionToEditingBank = () => {
    if (!editingBank) return;
    const newQuestion: Question = {
      id: Date.now().toString(),
      sentence: 'New [BLANK] sentence.',
      options: ['', '', '', ''],
      correctAnswer: '',
      explanation: { rule: '', example: '', commonMistake: '' },
      difficulty: 'Intermediate',
      category: '',
      examType: 'TOEFL'
    };
    setEditingBank({
      ...editingBank,
      questions: [...editingBank.questions, newQuestion]
    });
  };

  const updateQuestionInEditingBank = (index: number, updates: Partial<Question>) => {
    if (!editingBank) return;
    const newQuestions = [...editingBank.questions];
    newQuestions[index] = { ...newQuestions[index], ...updates };
    setEditingBank({ ...editingBank, questions: newQuestions });
  };

  const removeQuestionFromEditingBank = (index: number) => {
    if (!editingBank || editingBank.questions.length <= 1) return;
    const newQuestions = editingBank.questions.filter((_, i) => i !== index);
    setEditingBank({ ...editingBank, questions: newQuestions });
  };

  // Views
  const renderSplash = () => (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl w-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row"
      >
        <div className="md:w-1/2 bg-indigo-600 p-12 text-white flex flex-col justify-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-10 left-10 w-40 h-40 border-4 border-white rounded-full" />
            <div className="absolute bottom-10 right-10 w-60 h-60 border-4 border-white rounded-full" />
          </div>
          <div className="relative z-10">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm">
              <GraduationCap size={40} />
            </div>
            <h1 className="text-4xl font-black mb-4 leading-tight">GrammarMaster</h1>
            <p className="text-indigo-100 text-lg mb-2">TOEFL & SAT Grammar Lab</p>
            <div className="h-1 w-12 bg-white/40 rounded-full mb-6" />
            <p className="text-indigo-50 leading-relaxed">
              通过情境化选择与即时反馈，强化复杂句法结构辨析能力，提升语法准确度。
            </p>
            <p className="text-indigo-200 text-sm mt-4 italic">
              Enhance your mastery of complex English syntax through contextual practice and instant expert feedback.
            </p>
          </div>
        </div>
        <div className="md:w-1/2 p-12 flex flex-col justify-center space-y-4">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">欢迎使用 / Welcome</h2>
          <button 
            onClick={() => setView('selection')}
            className="group w-full p-5 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all flex items-center justify-between shadow-lg shadow-indigo-100"
          >
            <div className="flex items-center gap-3">
              <Play size={24} fill="currentColor" />
              <span>开始练习 / Start</span>
            </div>
            <ChevronRight className="group-hover:translate-x-1 transition-transform" />
          </button>
          <button 
            onClick={() => setView('selection')} // Selection view handles both
            className="group w-full p-5 bg-white border-2 border-slate-100 text-slate-600 rounded-2xl font-bold text-lg hover:border-indigo-200 hover:text-indigo-600 transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <Database size={24} />
              <span>管理题库 / Banks</span>
            </div>
            <ChevronRight className="group-hover:translate-x-1 transition-transform" />
          </button>
          <div className="pt-6 border-t border-slate-100 mt-6">
            <p className="text-xs text-slate-400 text-center">
              Designed for advanced learners aiming for 100+ TOEFL or 1500+ SAT.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );

  const renderSelection = () => (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <button onClick={() => setView('splash')} className="text-slate-400 hover:text-indigo-600 flex items-center gap-2 mb-2 transition-colors">
              <ArrowLeft size={16} /> 返回首页
            </button>
            <h1 className="text-3xl font-black text-slate-900">选择题库 / Select Bank</h1>
          </div>
          <button 
            onClick={handleCreateBank}
            className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
          >
            <Plus size={20} /> 创建题库
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {banks.map(bank => (
            <motion.div 
              key={bank.id}
              whileHover={{ y: -5 }}
              className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200 group relative"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <Database size={24} />
                </div>
                {bank.id !== 'default' && (
                  <div className="flex gap-2">
                    <button onClick={() => handleEditBank(bank)} className="p-2 text-slate-300 hover:text-indigo-600 transition-colors">
                      <Edit3 size={18} />
                    </button>
                    <button onClick={() => handleDeleteBank(bank.id)} className="p-2 text-slate-300 hover:text-rose-600 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                )}
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">{bank.name}</h3>
              <p className="text-slate-400 text-sm mb-6">{bank.questions.length} 道题目 / Questions</p>
              <button 
                onClick={() => handleStartQuiz(bank.id)}
                className="w-full py-4 bg-slate-50 text-slate-900 rounded-2xl font-bold hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center gap-2"
              >
                <Play size={18} fill="currentColor" /> 开始练习
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderEditor = () => {
    if (!editingBank) return null;
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8 sticky top-0 bg-slate-50/80 backdrop-blur-md py-4 z-20">
            <div className="flex items-center gap-4">
              <button onClick={() => setView('selection')} className="p-3 bg-white rounded-2xl border border-slate-200 text-slate-400 hover:text-indigo-600 transition-all">
                <ArrowLeft size={20} />
              </button>
              <input 
                type="text" 
                value={editingBank.name}
                onChange={(e) => setEditingBank({ ...editingBank, name: e.target.value })}
                className="text-2xl font-black bg-transparent border-b-2 border-transparent focus:border-indigo-500 outline-none px-2 py-1"
                placeholder="题库名称"
              />
            </div>
            <button 
              onClick={handleSaveBank}
              className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
            >
              <Save size={20} /> 保存题库
            </button>
          </div>

          <div className="space-y-8 pb-20">
            {editingBank.questions.map((q, idx) => (
              <motion.div 
                key={q.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200 relative"
              >
                <div className="absolute -left-4 top-8 w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {idx + 1}
                </div>
                <button 
                  onClick={() => removeQuestionFromEditingBank(idx)}
                  className="absolute right-8 top-8 text-slate-300 hover:text-rose-600 transition-colors"
                >
                  <Trash2 size={20} />
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-4">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400">题目文本 (使用 [BLANK] 表示空格)</label>
                    <textarea 
                      value={q.sentence}
                      onChange={(e) => updateQuestionInEditingBank(idx, { sentence: e.target.value })}
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none h-32 resize-none"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400">选项 / Options</label>
                    <div className="grid grid-cols-2 gap-3">
                      {q.options.map((opt, optIdx) => (
                        <input 
                          key={optIdx}
                          type="text"
                          value={opt}
                          onChange={(e) => {
                            const newOpts = [...q.options];
                            newOpts[optIdx] = e.target.value;
                            updateQuestionInEditingBank(idx, { options: newOpts });
                          }}
                          className="p-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                          placeholder={`选项 ${optIdx + 1}`}
                        />
                      ))}
                    </div>
                    <div className="pt-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-emerald-500 block mb-2">正确答案 / Correct Answer</label>
                      <select 
                        value={q.correctAnswer}
                        onChange={(e) => updateQuestionInEditingBank(idx, { correctAnswer: e.target.value })}
                        className="w-full p-3 bg-emerald-50 border border-emerald-100 rounded-xl outline-none text-emerald-700 font-bold"
                      >
                        <option value="">选择正确答案</option>
                        {q.options.map(opt => opt && <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400">难度 / Difficulty</label>
                    <select 
                      value={q.difficulty}
                      onChange={(e) => updateQuestionInEditingBank(idx, { difficulty: e.target.value as Difficulty })}
                      className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400">考点分类 / Category</label>
                    <input 
                      type="text"
                      value={q.category}
                      onChange={(e) => updateQuestionInEditingBank(idx, { category: e.target.value })}
                      className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none"
                      placeholder="例如：非谓语动词"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400">考试类型 / Exam</label>
                    <select 
                      value={q.examType}
                      onChange={(e) => updateQuestionInEditingBank(idx, { examType: e.target.value as ExamType })}
                      className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none"
                    >
                      <option value="TOEFL">TOEFL</option>
                      <option value="SAT">SAT</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400">详解卡片内容 / Explanation</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <textarea 
                      placeholder="语法规则 (支持 Markdown)"
                      value={q.explanation.rule}
                      onChange={(e) => updateQuestionInEditingBank(idx, { explanation: { ...q.explanation, rule: e.target.value } })}
                      className="p-4 bg-slate-50 border border-slate-100 rounded-2xl h-32 resize-none text-sm"
                    />
                    <textarea 
                      placeholder="典型例句"
                      value={q.explanation.example}
                      onChange={(e) => updateQuestionInEditingBank(idx, { explanation: { ...q.explanation, example: e.target.value } })}
                      className="p-4 bg-slate-50 border border-slate-100 rounded-2xl h-32 resize-none text-sm"
                    />
                    <textarea 
                      placeholder="常见错误辨析"
                      value={q.explanation.commonMistake}
                      onChange={(e) => updateQuestionInEditingBank(idx, { explanation: { ...q.explanation, commonMistake: e.target.value } })}
                      className="p-4 bg-slate-50 border border-slate-100 rounded-2xl h-32 resize-none text-sm"
                    />
                  </div>
                </div>
              </motion.div>
            ))}

            <button 
              onClick={addQuestionToEditingBank}
              className="w-full py-6 border-2 border-dashed border-slate-200 rounded-[2rem] text-slate-400 hover:border-indigo-500 hover:text-indigo-600 transition-all flex items-center justify-center gap-2 font-bold"
            >
              <Plus size={24} /> 添加题目
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderQuiz = () => (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setView('selection')} className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="font-bold text-sm leading-tight">{currentBank.name}</h1>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">正在练习 / Practicing</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end mr-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">进度</span>
              <span className="text-sm font-black text-slate-700">{currentQuestionIndex + 1} / {sessionQuestions.length}</span>
            </div>
            <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-indigo-500"
                initial={{ width: 0 }}
                animate={{ width: `${((currentQuestionIndex + 1) / sessionQuestions.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Question */}
          <div className="lg:col-span-7 space-y-6">
            <motion.div 
              key={currentQuestion.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 p-8 md:p-12"
            >
              <div className="flex items-center gap-3 mb-8">
                <span className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                  currentQuestion.difficulty === 'Beginner' && "bg-emerald-100 text-emerald-700",
                  currentQuestion.difficulty === 'Intermediate' && "bg-amber-100 text-amber-700",
                  currentQuestion.difficulty === 'Advanced' && "bg-rose-100 text-rose-700"
                )}>
                  {currentQuestion.difficulty}
                </span>
                <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  {currentQuestion.category}
                </span>
                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  {currentQuestion.examType}
                </span>
              </div>

              <div className="mb-12 min-h-[120px] flex items-center">
                {renderSentence(currentQuestion.sentence, selectedOption, currentQuestion.correctAnswer, isSubmitted)}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {currentQuestion.options.map((option) => (
                  <button
                    key={option}
                    disabled={isSubmitted}
                    onClick={() => handleOptionSelect(option)}
                    className={cn(
                      "p-5 rounded-2xl border-2 text-lg font-semibold transition-all duration-200 text-center",
                      !isSubmitted && selectedOption === option && "border-indigo-500 bg-indigo-50 text-indigo-700 shadow-md",
                      !isSubmitted && selectedOption !== option && "border-slate-100 bg-slate-50 hover:border-slate-300 text-slate-600",
                      isSubmitted && option === currentQuestion.correctAnswer && "border-emerald-500 bg-emerald-50 text-emerald-700",
                      isSubmitted && selectedOption === option && option !== currentQuestion.correctAnswer && "border-rose-500 bg-rose-50 text-rose-700",
                      isSubmitted && option !== currentQuestion.correctAnswer && selectedOption !== option && "border-slate-100 bg-slate-50 text-slate-300 opacity-50"
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>

              <div className="mt-12 flex justify-between items-center">
                {!isSubmitted ? (
                  <button
                    disabled={!selectedOption}
                    onClick={handleSubmit}
                    className={cn(
                      "w-full py-5 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg",
                      selectedOption 
                        ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200" 
                        : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                    )}
                  >
                    提交答案 / Submit
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="w-full py-5 bg-slate-900 text-white rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-slate-200"
                  >
                    {currentQuestionIndex === sessionQuestions.length - 1 ? "查看最终评分" : "下一题 / Next"}
                    <ChevronRight size={20} />
                  </button>
                )}
              </div>
            </motion.div>
          </div>

          {/* Right Column: Feedback & Info */}
          <div className="lg:col-span-5 space-y-6">
            <AnimatePresence mode="wait">
              {isSubmitted ? (
                <motion.div
                  key="explanation"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden"
                >
                  <div className={cn(
                    "p-8 flex items-center gap-4",
                    selectedOption === currentQuestion.correctAnswer ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
                  )}>
                    {selectedOption === currentQuestion.correctAnswer ? (
                      <CheckCircle2 size={40} />
                    ) : (
                      <XCircle size={40} />
                    )}
                    <div>
                      <h3 className="font-bold text-2xl">
                        {selectedOption === currentQuestion.correctAnswer ? "回答正确！" : "回答错误"}
                      </h3>
                      <p className="text-white/80 text-sm">
                        正确答案是：<span className="font-bold underline">{currentQuestion.correctAnswer}</span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="p-8 space-y-8">
                    <section>
                      <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                        <Info size={14} /> 语法规则 / Grammar Rule
                      </h4>
                      <div className="text-slate-700 leading-relaxed bg-slate-50 p-6 rounded-2xl border border-slate-100 prose prose-slate prose-sm max-w-none">
                        <Markdown>{currentQuestion.explanation.rule}</Markdown>
                      </div>
                    </section>

                    <section>
                      <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                        <BookOpen size={14} /> 典型例句 / Example
                      </h4>
                      <p className="text-slate-700 italic font-serif border-l-4 border-indigo-200 pl-6 py-2 text-lg">
                        "{currentQuestion.explanation.example}"
                      </p>
                    </section>

                    <section>
                      <h4 className="text-xs font-bold uppercase tracking-widest text-rose-400 mb-4 flex items-center gap-2">
                        <AlertCircle size={14} /> 常见错误辨析 / Common Mistake
                      </h4>
                      <p className="text-slate-600 text-sm bg-rose-50/50 p-6 rounded-2xl border border-rose-100 leading-relaxed">
                        {currentQuestion.explanation.commonMistake}
                      </p>
                    </section>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white/50 border-2 border-dashed border-slate-200 rounded-[2.5rem] p-12 text-center flex flex-col items-center justify-center min-h-[500px]"
                >
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-6">
                    <BookOpen size={40} />
                  </div>
                  <h3 className="text-slate-500 font-bold text-xl mb-3">等待提交 / Waiting</h3>
                  <p className="text-slate-400 text-sm max-w-[240px] leading-relaxed">
                    选择一个选项并点击提交，即可查看详细的语法解析。
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );

  const renderResult = () => (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full bg-white rounded-[3rem] shadow-xl p-8 md:p-16 text-center"
      >
        <div className="mb-10 inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-indigo-100 text-indigo-600 rotate-3">
          <Trophy size={48} />
        </div>
        <h1 className="text-4xl font-black text-slate-900 mb-3">练习完成！</h1>
        <p className="text-slate-400 mb-10">你已完成 {currentBank.name} 的所有题目</p>
        
        <div className="flex justify-center items-baseline gap-3 mb-10">
          <span className="text-8xl font-black text-indigo-600 tracking-tighter">{score}</span>
          <span className="text-3xl text-slate-300 font-bold">/ {sessionQuestions.length}</span>
        </div>

        <p className="text-xl text-slate-700 mb-12 leading-relaxed font-medium px-4">
          {getEncouragement(score, sessionQuestions.length)}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="p-6 bg-slate-50 rounded-[2rem] text-left border border-slate-100">
            <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-4">
              <BookOpen size={20} className="text-indigo-500" />
              复习建议
            </h3>
            <ul className="text-sm text-slate-600 space-y-3">
              <li>• 重点关注本次练习中的错误考点</li>
              <li>• 尝试在写作中运用这些高级句式</li>
              <li>• 定期回顾详解卡片中的规则</li>
            </ul>
          </div>
          <div className="p-6 bg-slate-50 rounded-[2rem] text-left border border-slate-100">
            <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-4">
              <ExternalLink size={20} className="text-indigo-500" />
              进阶资源
            </h3>
            <div className="space-y-3">
              <a 
                href="https://www.ets.org/toefl/ibt/prepare/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-indigo-600 hover:underline flex items-center gap-1 font-medium"
              >
                TOEFL 官方备考资源中心 <ExternalLink size={12} />
              </a>
              <a 
                href="https://www.crimsoneducation.org/us/practice-tests/sat?gad_source=1&gad_campaignid=23326611822&gbraid=0AAAAADLRF7wU_r9X7Z7Ihklp9sd-dZ7nV&gclid=Cj0KCQiA7-rMBhCFARIsAKnLKtCwZkFx9AfsaaepzKOx9kArpBR49uo5b0H07ZI1AOjCArCLU7uvrjcaAtjaEALw_wcB" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-indigo-600 hover:underline flex items-center gap-1 font-medium"
              >
                Crimson Education SAT 模拟测试 <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <button
            onClick={handleRestart}
            className="flex-1 py-5 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-100"
          >
            <RotateCcw size={20} />
            返回题库选择
          </button>
          <button
            onClick={() => handleStartQuiz(selectedBankId)}
            className="flex-1 py-5 bg-slate-900 text-white rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
          >
            <Play size={20} fill="currentColor" />
            再次练习本库
          </button>
        </div>
      </motion.div>
    </div>
  );

  const renderSentence = (sentence: string, selected: string | null, correct: string | null, submitted: boolean) => {
    const parts = sentence.split('[BLANK]');
    return (
      <div className="text-2xl md:text-3xl font-medium leading-[1.6] text-slate-800">
        {parts[0]}
        <span 
          className={cn(
            "inline-block min-w-[140px] px-4 py-1 mx-2 border-b-4 transition-all duration-300 text-center",
            !selected && "border-slate-200 text-slate-300 italic text-xl",
            selected && !submitted && "border-indigo-500 text-indigo-600",
            submitted && selected === correct && "border-emerald-500 text-emerald-600 bg-emerald-50 rounded-t-xl",
            submitted && selected !== correct && "border-rose-500 text-rose-600 bg-rose-50 rounded-t-xl"
          )}
        >
          {selected || "点击选项填充"}
        </span>
        {parts[1]}
      </div>
    );
  };

  const getEncouragement = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage === 100) return "卓越！你已经完全掌握了这些复杂的语法结构。/ Excellent! You have mastered these complex structures.";
    if (percentage >= 80) return "太棒了！你的语法基础非常扎实，继续保持。/ Great job! Your grammar foundation is very solid.";
    if (percentage >= 60) return "做得好！你对大多数结构都有很好的理解。/ Well done! You have a good understanding.";
    return "继续努力！语法辨析需要不断的练习和积累。/ Keep practicing! Mastery takes time and repetition.";
  };

  return (
    <AnimatePresence mode="wait">
      {view === 'splash' && renderSplash()}
      {view === 'selection' && renderSelection()}
      {view === 'editor' && renderEditor()}
      {view === 'quiz' && renderQuiz()}
      {view === 'result' && renderResult()}
    </AnimatePresence>
  );
}
