
import React, { useState, useEffect, useMemo } from 'react';
import Layout from './components/Layout.tsx';
import TopicSelector from './components/TopicSelector.tsx';
import WeightageSelector from './components/WeightageSelector.tsx';
import DifficultySelector from './components/DifficultySelector.tsx';
import TestConfigurator from './components/TestConfigurator.tsx';
import TestScreen from './components/TestScreen.tsx';
import ResultView from './components/ResultView.tsx';
import RevisionSlides from './components/RevisionSlides.tsx';
import Auth from './components/Auth.tsx';
import AdminDashboard from './components/AdminDashboard.tsx';
import HistoryView from './components/HistoryView.tsx';
import Settings from './components/Settings.tsx';
import { generateQuestionBatch, generateRevisionContent } from './services/geminiService.ts';
import { db } from './services/db.ts';
import { AppState, TestConfig, Question, UserAnswer, TestResult, TopicDistribution, RevisionData, User } from './types.ts';

const App: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [allTests, setAllTests] = useState<TestResult[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('apti_session');
    return saved ? JSON.parse(saved) : null;
  });

  const refreshData = async () => {
    try {
      const fetchedUsers = await db.users.find();
      setUsers(fetchedUsers);
      const fetchedTests = await db.tests.find();
      setAllTests(fetchedTests);
    } catch (e) {
      console.error("Local data access error:", e);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  useEffect(() => {
    if (currentUser && !currentUser.isAdmin) {
      const interval = setInterval(async () => {
        const user = await db.users.findOne({ id: currentUser.id });
        if (user && user.status === 'blocked') {
          handleLogout();
          alert('Access Denied: Your account has been restricted by an administrator.');
        }
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    if (currentUser) localStorage.setItem('apti_session', JSON.stringify(currentUser));
    else localStorage.removeItem('apti_session');
  }, [currentUser]);

  const [state, setState] = useState<AppState>(currentUser ? AppState.HOME : AppState.LOGIN);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [showRevision, setShowRevision] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [config, setConfig] = useState<TestConfig>({
    topics: [],
    weightageMode: 'Equal',
    topicWeightages: [],
    difficulty: 'Mixed',
    difficultySplit: { easy: 33, medium: 34, hard: 33 },
    questionCount: 10,
    durationInMinutes: 10
  });

  const [questions, setQuestions] = useState<Question[]>([]);
  const [revisionData, setRevisionData] = useState<RevisionData[]>([]);
  const [answers, setAnswers] = useState<UserAnswer[]>([]);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentAITask, setCurrentAITask] = useState("Initializing Intelligence Engine...");

  useEffect(() => {
    if (config.topics.length > 0) {
      const perTopic = Math.floor(100 / config.topics.length);
      const remainder = 100 % config.topics.length;
      const newWeights = config.topics.map((t, i) => ({
        topic: t,
        percentage: perTopic + (i < remainder ? 1 : 0)
      }));
      setConfig(prev => ({ ...prev, topicWeightages: newWeights }));
    }
  }, [config.topics.length]);

  const calculateFinalDistribution = (): TopicDistribution[] => {
    const total = config.questionCount;
    let distributed = 0;
    const dist = config.topicWeightages.map((w, idx) => {
      let count = 0;
      if (idx === config.topicWeightages.length - 1) {
        count = total - distributed;
      } else {
        count = Math.round((w.percentage / 100) * total);
      }
      distributed += count;
      return { name: w.topic, count };
    });
    return dist;
  };

  const handleLogin = async (email: string, pass: string) => {
    try {
      const user = await db.users.findOne({ email, password: pass });
      if (!user) {
        setAuthError('Invalid credentials');
        return;
      }
      if (user.status === 'blocked') {
        setAuthError('Account restricted by administrator');
        return;
      }
      setCurrentUser(user);
      setState(user.isAdmin ? AppState.ADMIN_DASHBOARD : AppState.HOME);
      setAuthError(null);
    } catch (err: any) {
      setAuthError("Login failed.");
    }
  };

  const handleRegister = async (email: string, fullName: string, gender: string, pass: string) => {
    try {
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        fullName,
        gender,
        password: pass,
        status: 'approved',
        isAdmin: false,
        createdAt: Date.now()
      };
      await db.users.insertOne(newUser);
      setCurrentUser(newUser);
      setState(AppState.HOME);
      setAuthError(null);
      refreshData();
    } catch (err: any) {
      setAuthError(err.message || "Registration failed.");
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setState(AppState.LOGIN);
  };

  const handleUpdateUserStatus = async (id: string, status: User['status']) => {
    await db.users.updateOne(id, { status });
    refreshData();
  };

  const handleDeleteUser = async (id: string) => {
    await db.users.deleteOne(id);
    refreshData();
  };

  const handleDeleteTest = async (date: number) => {
    await db.tests.deleteOne(date);
    refreshData();
  };

  const handleStartTest = async () => {
    setState(AppState.LOADING);
    setQuestions([]);
    setError(null);
    setIsGenerating(true);
    setIsReady(false);

    const distribution = calculateFinalDistribution();
    const difficultyContext = config.difficulty === 'Custom'
      ? `Easy: ${config.difficultySplit.easy}%, Medium: ${config.difficultySplit.medium}%, Hard: ${config.difficultySplit.hard}%`
      : config.difficulty;

    // To prevent token limit issues, we chunk the generation into groups of 5 questions
    const CHUNK_SIZE = 5;
    const flatList: { topic: string, count: number }[] = [];

    distribution.forEach(d => {
      let remaining = d.count;
      while (remaining > 0) {
        const take = Math.min(remaining, CHUNK_SIZE);
        flatList.push({ topic: d.name, count: take });
        remaining -= take;
      }
    });

    // Grouping these into optimal batch requests
    const batches: { topic: string, count: number }[][] = [];
    let currentBatch: { topic: string, count: number }[] = [];
    let currentBatchSize = 0;

    flatList.forEach(item => {
      if (currentBatchSize + item.count > CHUNK_SIZE) {
        batches.push(currentBatch);
        currentBatch = [item];
        currentBatchSize = item.count;
      } else {
        currentBatch.push(item);
        currentBatchSize += item.count;
      }
    });
    if (currentBatch.length > 0) batches.push(currentBatch);

    const processBatches = async () => {
      for (let i = 0; i < batches.length; i++) {
        setCurrentAITask(`Batch Synthesis ${i + 1}/${batches.length}: ${batches[i].map(b => b.topic).join(', ')}...`);
        const batchQuestions = await generateQuestionBatch(batches[i], difficultyContext);
        setQuestions(prev => [...prev, ...batchQuestions]);
      }
    };

    try {
      await processBatches();
      setCurrentAITask("Finalizing Session Parameters...");
      setTimeout(() => {
        setIsGenerating(false);
        setIsReady(true);
      }, 800);
    } catch (err) {
      console.error(err);
      setIsGenerating(false);
      setIsReady(true);
      setError("AI generation partially completed.");
    }
  };

  const handleBeginTesting = () => {
    setShowRevision(false);
    setState(AppState.TESTING);
  };

  const handleFinishTest = async (userAnswers: UserAnswer[], timeSpentSeconds: number) => {
    setAnswers(userAnswers);
    let correctCount = 0;
    const evaluatedQuestions = questions.slice(0, userAnswers.length);
    userAnswers.forEach((ans, idx) => {
      if (idx < evaluatedQuestions.length && ans.selectedOptionIndex === evaluatedQuestions[idx].correctIndex) {
        correctCount++;
      }
    });

    const result: TestResult = {
      score: correctCount,
      totalQuestions: evaluatedQuestions.length,
      correctCount,
      incorrectCount: evaluatedQuestions.length - correctCount,
      accuracy: evaluatedQuestions.length > 0 ? Math.round((correctCount / evaluatedQuestions.length) * 100) : 0,
      timeSpent: timeSpentSeconds,
      date: Date.now(),
      userId: currentUser?.id || 'guest'
    };

    try {
      await db.tests.insertOne(result);
      refreshData();
    } catch (err) {
      console.error("Failed to save test result:", err);
      // We still show the result to the user even if saving failed
    }

    setTestResult(result);
    setState(AppState.RESULT);
  };

  const reset = () => {
    setQuestions([]);
    setAnswers([]);
    setTestResult(null);
    setRevisionData([]);
    setIsReady(false);
    setState(AppState.HOME);
    setShowRevision(false);
  };

  const userTests = useMemo(() => allTests.filter(t => t.userId === currentUser?.id), [allTests, currentUser]);
  const generationProgress = Math.round((questions.length / config.questionCount) * 100);

  const headerContent = (
    <div className="flex items-center gap-6">
      {currentUser && (
        <>
          <nav className="hidden md:flex items-center gap-4">
            {currentUser.isAdmin ? (
              <button onClick={() => setState(AppState.ADMIN_DASHBOARD)} className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-smooth">Dashboard</button>
            ) : (
              <>
                <button onClick={() => setState(AppState.HOME)} className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-smooth">Home</button>
                <button onClick={() => setState(AppState.HISTORY)} className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-smooth">History</button>
              </>
            )}
            <button onClick={() => setState(AppState.SETTINGS)} className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-smooth">Settings</button>
          </nav>
          <div className="h-4 w-[1px] bg-gray-200 hidden md:block"></div>
          <button onClick={handleLogout} className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-700 transition-smooth">Logout</button>
        </>
      )}
    </div>
  );

  return (
    <Layout headerContent={headerContent}>
      {state === AppState.LOGIN && (
        <Auth isRegister={false} onLogin={handleLogin} onRegister={handleRegister} switchToRegister={() => setState(AppState.REGISTER)} switchToLogin={() => setState(AppState.LOGIN)} error={authError} />
      )}
      {state === AppState.REGISTER && (
        <Auth isRegister={true} onLogin={handleLogin} onRegister={handleRegister} switchToRegister={() => setState(AppState.REGISTER)} switchToLogin={() => setState(AppState.LOGIN)} error={authError} />
      )}

      {state === AppState.ADMIN_DASHBOARD && (
        <AdminDashboard users={users} tests={allTests} onUpdateStatus={handleUpdateUserStatus} onDeleteUser={handleDeleteUser} onDeleteTest={handleDeleteTest} />
      )}

      {state === AppState.HISTORY && <HistoryView tests={userTests} onBack={() => setState(AppState.HOME)} />}

      {state === AppState.SETTINGS && <Settings onUpdatePassword={async (o, n) => {
        try {
          await db.users.updateOne(currentUser!.id, { password: n });
          refreshData();
          return true;
        } catch (e) { return false; }
      }} onBack={() => setState(currentUser?.isAdmin ? AppState.ADMIN_DASHBOARD : AppState.HOME)} />}

      {state === AppState.HOME && (
        <div className="flex flex-col items-center text-center space-y-10 py-12 animate-in fade-in duration-1000">
          <div className="relative">
            <div className="absolute -inset-1 bg-black/5 rounded-sm blur-2xl opacity-10"></div>
            <div className="w-16 h-16 bg-black rounded-sm flex items-center justify-center relative shadow-xl">
              <span className="text-white text-3xl font-black">A</span>
            </div>
          </div>
          <div className="space-y-4 max-w-2xl">
            <h1 className="text-6xl md:text-7xl font-black tracking-tight text-gray-900 leading-tight uppercase">PreAptiAI</h1>
            <p className="text-sm md:text-base text-gray-400 font-bold uppercase tracking-[0.4em]">Welcome Back, {currentUser?.fullName || 'User'}</p>
          </div>
          <div className="flex gap-4">
            <button onClick={() => setState(AppState.SETUP_TOPICS)} className="px-12 py-3 bg-black text-white rounded-sm font-bold text-sm uppercase tracking-widest shadow-xl hover:translate-y-[-1px] transition-smooth">Start Session</button>
            <button onClick={() => setState(AppState.HISTORY)} className="px-8 py-3 bg-white text-black border border-gray-200 rounded-sm font-bold text-sm uppercase tracking-widest hover:border-black transition-smooth">My Progress</button>
          </div>
        </div>
      )}

      {state === AppState.SETUP_TOPICS && (
        <TopicSelector
          selectedTopics={config.topics}
          onChange={(topics) => setConfig({ ...config, topics })}
          onNext={() => {
            generateRevisionContent(config.topics).then(data => setRevisionData(data));
            setState(AppState.SETUP_WEIGHTAGE);
          }}
        />
      )}

      {state === AppState.SETUP_WEIGHTAGE && (
        <WeightageSelector topics={config.topics} mode={config.weightageMode} weightages={config.topicWeightages} onChange={(mode, weights) => setConfig({ ...config, weightageMode: mode, topicWeightages: weights })} onBack={() => setState(AppState.SETUP_TOPICS)} onNext={() => setState(AppState.SETUP_DIFFICULTY)} />
      )}

      {state === AppState.SETUP_DIFFICULTY && (
        <DifficultySelector difficulty={config.difficulty} split={config.difficultySplit} onChange={(difficulty, split) => setConfig({ ...config, difficulty, difficultySplit: split })} onBack={() => setState(AppState.SETUP_WEIGHTAGE)} onNext={() => setState(AppState.SETUP_CONFIG)} />
      )}

      {state === AppState.SETUP_CONFIG && (
        <>
          <TestConfigurator questionCount={config.questionCount} duration={config.durationInMinutes} onChange={(count, dur) => setConfig({ ...config, questionCount: count, durationInMinutes: dur })} onBack={() => setState(AppState.SETUP_DIFFICULTY)} onStart={handleStartTest} />
          {error && <p className="text-red-500 text-center mt-6 text-[10px] font-black uppercase">{error}</p>}
        </>
      )}

      {state === AppState.LOADING && (
        <div className="flex items-center justify-center min-h-[70vh] w-full px-4 animate-in fade-in zoom-in-95 duration-700">
          <div className="bg-white border border-gray-100 shadow-2xl rounded-sm overflow-hidden p-8 md:p-16 w-full max-w-5xl">
            <div className="flex flex-col md:flex-row items-center justify-between gap-12 md:gap-20">
              {/* Progress Left Info */}
              <div className="space-y-6 text-center md:text-left flex-grow">
                <div className="flex items-center gap-3 justify-center md:justify-start">
                  <span className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.25em] rounded-full border ${isReady ? 'bg-green-50 border-green-200 text-green-600' : 'bg-black text-white border-black'}`}>
                    {isReady ? 'Ready to Start' : 'AI Parallel Batching Active'}
                  </span>
                </div>
                <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tighter leading-[0.85] text-gray-900">
                  {isReady ? 'Synthesized' : 'Accelerating'}
                </h2>
                <div className="flex items-center gap-3 justify-center md:justify-start py-2">
                  <div className={`w-3 h-3 rounded-full ${isReady ? 'bg-green-500' : 'bg-blue-500 animate-pulse'}`}></div>
                  <p className="text-sm font-black text-gray-400 uppercase tracking-widest">
                    {currentAITask}
                  </p>
                </div>
              </div>

              <div className="relative w-48 h-48 md:w-56 md:h-56 flex items-center justify-center shrink-0">
                <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full transform -rotate-90">
                  <circle
                    cx="50" cy="50" r="45"
                    stroke="currentColor" strokeWidth="8"
                    fill="transparent"
                    className="text-gray-50"
                  />
                  <circle
                    cx="50" cy="50" r="45"
                    stroke="currentColor" strokeWidth="8"
                    fill="transparent"
                    strokeDasharray="282.7"
                    strokeDashoffset={282.7 - (282.7 * generationProgress) / 100}
                    strokeLinecap="round"
                    className={`${isReady ? 'text-green-500' : 'text-black'} transition-all duration-700 ease-in-out`}
                  />
                </svg>

                <div className="flex flex-col items-center justify-center text-center z-10">
                  {isReady ? (
                    <span className="text-5xl font-black text-green-500 animate-in zoom-in duration-500">✓</span>
                  ) : (
                    <>
                      <span className="text-5xl font-black tracking-tighter tabular-nums leading-none">
                        {generationProgress}%
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-2">
                        Synced
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-16 border-t border-gray-100 mt-16">
              <div className="space-y-6">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">Knowledge Domains</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {config.topics.map((topic) => {
                    const topicWeight = config.topicWeightages.find(w => w.topic === topic)?.percentage || 0;
                    const currentCount = questions.filter(q => q.topic === topic).length;
                    const targetCount = Math.round((topicWeight / 100) * config.questionCount);
                    const isDone = currentCount >= targetCount;

                    return (
                      <div key={topic} className={`px-5 py-4 border rounded-sm flex items-center justify-between transition-all duration-500 ${isDone ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-100 shadow-sm'}`}>
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className={`w-2 h-2 shrink-0 rounded-full ${isDone ? 'bg-green-500' : 'bg-gray-300 animate-pulse'}`}></div>
                          <span className={`text-[10px] font-black uppercase tracking-widest truncate ${isDone ? 'text-green-800' : 'text-gray-500'}`}>
                            {topic}
                          </span>
                        </div>
                        <span className={`text-[9px] font-black ${isDone ? 'text-green-600' : 'text-gray-300'}`}>{currentCount}/{targetCount}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col justify-center space-y-8 bg-gray-50/50 p-10 rounded-sm border border-gray-100">
                {isReady ? (
                  <div className="text-center space-y-8 animate-in fade-in slide-in-from-bottom-2">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest leading-relaxed">
                      Architecture validation complete. Batch processing enabled the fast-lane delivery of your test.
                    </p>
                    <button
                      onClick={handleBeginTesting}
                      className="w-full py-5 bg-black text-white rounded-sm font-black text-sm uppercase tracking-[0.4em] transition-smooth shadow-2xl hover:translate-y-[-3px] active:scale-95"
                    >
                      Begin Assessment
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-500">
                        <span>Mastery Resource Synthesis</span>
                        <span>{revisionData.length > 0 ? 'Verified' : 'Processing'}</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                        <div className={`h-full bg-black transition-all duration-1000 ${revisionData.length > 0 ? 'w-full' : 'w-1/3 animate-pulse'}`}></div>
                      </div>
                    </div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest text-center italic">
                      Tip: Revision slides are ready. We're just finishing the question set.
                    </p>
                    <button
                      onClick={() => setShowRevision(true)}
                      disabled={revisionData.length === 0}
                      className={`w-full py-4 bg-white border border-gray-200 rounded-sm font-black text-[10px] uppercase tracking-widest transition-smooth shadow-md ${revisionData.length === 0 ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:border-black text-black hover:bg-gray-50'
                        }`}
                    >
                      {revisionData.length === 0 ? 'Synchronizing Mastery Data...' : 'Open Revision Slides'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showRevision && revisionData.length > 0 && (
        <RevisionSlides data={revisionData} onClose={() => setShowRevision(false)} isReady={isReady} onStartTest={handleBeginTesting} />
      )}

      {state === AppState.TESTING && (
        <TestScreen questions={questions} targetTotal={config.questionCount} isGenerating={isGenerating} durationMinutes={config.durationInMinutes} onFinish={handleFinishTest} />
      )}

      {state === AppState.RESULT && testResult && (
        <ResultView questions={questions} answers={answers} result={testResult} onRestart={reset} />
      )}
    </Layout>
  );
};

export default App;
