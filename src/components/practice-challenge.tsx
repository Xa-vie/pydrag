'use client';

import { useState, useEffect } from 'react';
import { PracticeQuestion, getQuestionsByDifficulty } from '@/data/practice-questions';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFlowStore } from '@/store/use-flow-store';
import { Brain, Check, ChevronRight, Lightbulb, RefreshCw, Trophy } from 'lucide-react';

export default function PracticeChallenge() {
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [currentQuestion, setCurrentQuestion] = useState<PracticeQuestion | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [completedQuestions, setCompletedQuestions] = useState<string[]>([]);
  const [streak, setStreak] = useState(0);
  const [points, setPoints] = useState(0);
  const { createPage } = useFlowStore();

  // Load completed questions from localStorage on component mount
  useEffect(() => {
    const savedCompleted = localStorage.getItem('completedQuestions');
    const savedStreak = localStorage.getItem('challengeStreak');
    const savedPoints = localStorage.getItem('challengePoints');
    
    if (savedCompleted) {
      setCompletedQuestions(JSON.parse(savedCompleted));
    }
    
    if (savedStreak) {
      setStreak(parseInt(savedStreak, 10));
    }
    
    if (savedPoints) {
      setPoints(parseInt(savedPoints, 10));
    }
    
    generateRandomQuestion(difficulty);
  }, []);

  // Save completed questions to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('completedQuestions', JSON.stringify(completedQuestions));
  }, [completedQuestions]);

  // Save streak and points to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('challengeStreak', streak.toString());
    localStorage.setItem('challengePoints', points.toString());
  }, [streak, points]);

  const generateRandomQuestion = (selectedDifficulty: 'easy' | 'medium' | 'hard') => {
    const questions = getQuestionsByDifficulty(selectedDifficulty);
    
    // Filter out completed questions
    const availableQuestions = questions.filter(q => !completedQuestions.includes(q.id));
    
    // If all questions are completed, allow repeating
    const questionPool = availableQuestions.length > 0 ? availableQuestions : questions;
    
    if (questionPool.length > 0) {
      const randomIndex = Math.floor(Math.random() * questionPool.length);
      setCurrentQuestion(questionPool[randomIndex]);
      setShowHint(false);
    }
  };

  const handleDifficultyChange = (newDifficulty: 'easy' | 'medium' | 'hard') => {
    setDifficulty(newDifficulty);
    generateRandomQuestion(newDifficulty);
  };

  const handleStartChallenge = () => {
    // Create a new flow with the challenge name
    if (currentQuestion) {
      createPage(`Challenge: ${currentQuestion.title}`);
      
      // Calculate points based on difficulty
      const pointsMap = {
        'easy': 10,
        'medium': 25,
        'hard': 50
      };
      
      // Add to completed questions if not already completed
      if (!completedQuestions.includes(currentQuestion.id)) {
        setCompletedQuestions([...completedQuestions, currentQuestion.id]);
        
        // Update streak and points
        setStreak(streak + 1);
        setPoints(points + pointsMap[difficulty]);
      }
    }
  };

  const handleSkipChallenge = () => {
    generateRandomQuestion(difficulty);
    // Reset streak if skipping
    setStreak(0);
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'easy': return 'bg-green-500/10 text-green-500 border-green-500/30';
      case 'medium': return 'bg-amber-500/10 text-amber-500 border-amber-500/30';
      case 'hard': return 'bg-red-500/10 text-red-500 border-red-500/30';
      default: return 'bg-blue-500/10 text-blue-500 border-blue-500/30';
    }
  };

  const getStreakBadge = () => {
    if (streak >= 10) return '🔥 On Fire!';
    if (streak >= 5) return '🔥 Hot Streak!';
    if (streak >= 3) return '✨ Good Streak!';
    return null;
  };

  const streakBadge = getStreakBadge();

  return (
    <div className="w-full max-w-3xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-500" />
          <span className="font-medium">Points: {points}</span>
        </div>
        
        {streakBadge && (
          <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/30">
            {streakBadge} ({streak})
          </Badge>
        )}
      </div>
      
      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Practice Challenges
          </CardTitle>
          <CardDescription>
            Complete challenges to earn points and improve your flow-building skills
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs value={difficulty} onValueChange={(v) => handleDifficultyChange(v as 'easy' | 'medium' | 'hard')}>
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="easy" className="text-sm">Easy</TabsTrigger>
              <TabsTrigger value="medium" className="text-sm">Medium</TabsTrigger>
              <TabsTrigger value="hard" className="text-sm">Hard</TabsTrigger>
            </TabsList>
            
            <TabsContent value="easy" className="mt-0">
              {currentQuestion && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge className={getDifficultyColor('easy')}>Easy</Badge>
                    <h3 className="text-lg font-medium">{currentQuestion.title}</h3>
                  </div>
                  <p className="text-muted-foreground">{currentQuestion.description}</p>
                  
                  {showHint && currentQuestion.hint && (
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-md p-3 mt-2">
                      <div className="flex items-center gap-2 text-amber-500 font-medium mb-1">
                        <Lightbulb className="h-4 w-4" />
                        <span>Hint:</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{currentQuestion.hint}</p>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="medium" className="mt-0">
              {currentQuestion && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge className={getDifficultyColor('medium')}>Medium</Badge>
                    <h3 className="text-lg font-medium">{currentQuestion.title}</h3>
                  </div>
                  <p className="text-muted-foreground">{currentQuestion.description}</p>
                  
                  {showHint && currentQuestion.hint && (
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-md p-3 mt-2">
                      <div className="flex items-center gap-2 text-amber-500 font-medium mb-1">
                        <Lightbulb className="h-4 w-4" />
                        <span>Hint:</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{currentQuestion.hint}</p>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="hard" className="mt-0">
              {currentQuestion && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge className={getDifficultyColor('hard')}>Hard</Badge>
                    <h3 className="text-lg font-medium">{currentQuestion.title}</h3>
                  </div>
                  <p className="text-muted-foreground">{currentQuestion.description}</p>
                  
                  {showHint && currentQuestion.hint && (
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-md p-3 mt-2">
                      <div className="flex items-center gap-2 text-amber-500 font-medium mb-1">
                        <Lightbulb className="h-4 w-4" />
                        <span>Hint:</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{currentQuestion.hint}</p>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
        
        <CardFooter className="flex flex-col gap-3">
          <div className="flex items-center gap-2 w-full">
            <Button 
              variant="default" 
              className="flex-1 gap-2"
              onClick={handleStartChallenge}
            >
              <Check className="h-4 w-4" />
              Accept Challenge
            </Button>
            <Button 
              variant="outline" 
              className="flex-1 gap-2"
              onClick={() => setShowHint(!showHint)}
            >
              <Lightbulb className="h-4 w-4" />
              {showHint ? 'Hide Hint' : 'Show Hint'}
            </Button>
          </div>
          
          <Button 
            variant="ghost" 
            className="w-full text-muted-foreground gap-2"
            onClick={handleSkipChallenge}
          >
            <RefreshCw className="h-4 w-4" />
            Skip Challenge
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 