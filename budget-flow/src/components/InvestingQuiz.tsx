"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, RefreshCw, Trophy } from "lucide-react";

interface Question {
    id: number;
    question: string;
    options: string[];
    correctAnswer: number; // index of correct option
    explanation: string;
}

const QUESTIONS: Question[] = [
    {
        id: 1,
        question: "Which of the following typically offers the highest potential return over the long term?",
        options: ["Savings Account", "Government Bonds", "Stock Market Index Funds", "Under your mattress"],
        correctAnswer: 2,
        explanation: "Stocks have historically outperformed other asset classes over long periods (10+ years), despite higher short-term volatility."
    },
    {
        id: 2,
        question: "What is the main advantage of 'Dollar Cost Averaging'?",
        options: ["You buy more shares when prices are low", "It guarantees a profit", "It eliminates all risk", "You only buy when the market is up"],
        correctAnswer: 0,
        explanation: "By investing a fixed amount regularly, you naturally buy more shares when prices are low and fewer when prices are high, lowering your average cost per share."
    },
    {
        id: 3,
        question: "How does inflation affect your savings over time?",
        options: ["It increases your purchasing power", "It decreases your purchasing power", "It has no effect", "It makes your money worth more"],
        correctAnswer: 1,
        explanation: "Inflation reduces the value of money over time. If your savings earn less interest than the inflation rate, you are effectively losing purchasing power."
    },
    {
        id: 4,
        question: "What is a diversified portfolio?",
        options: ["Investing only in technology stocks", "Keeping all money in cash", "Spreading investments across different asset classes", "Buying stocks from only one country"],
        correctAnswer: 2,
        explanation: "Diversification means spreading your investments across various assets (stocks, bonds, real estate, etc.) to reduce risk. 'Don't put all your eggs in one basket.'"
    }
];

export default function InvestingQuiz() {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [score, setScore] = useState(0);
    const [showExplanation, setShowExplanation] = useState(false);
    const [quizCompleted, setQuizCompleted] = useState(false);

    const handleOptionSelect = (index: number) => {
        if (selectedOption !== null) return; // prevent changing answer
        setSelectedOption(index);
        setShowExplanation(true);

        if (index === QUESTIONS[currentQuestionIndex].correctAnswer) {
            setScore(score + 1);
        }
    };

    const handleNext = () => {
        if (currentQuestionIndex < QUESTIONS.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedOption(null);
            setShowExplanation(false);
        } else {
            setQuizCompleted(true);
        }
    };

    const handleRestart = () => {
        setCurrentQuestionIndex(0);
        setSelectedOption(null);
        setScore(0);
        setShowExplanation(false);
        setQuizCompleted(false);
    };

    if (quizCompleted) {
        return (
            <div className="bg-bg-card border border-border-main rounded-xl p-8 text-center h-full flex flex-col items-center justify-center">
                <div className="bg-accent-yellow/10 p-4 rounded-full mb-4 animate-bounce">
                    <Trophy className="w-12 h-12 text-accent-yellow" />
                </div>
                <h2 className="text-2xl font-bold text-text-primary mb-2">Quiz Completed!</h2>
                <p className="text-text-secondary mb-6">
                    You scored <span className="font-bold text-accent-green">{score}</span> out of <span className="font-bold">{QUESTIONS.length}</span>
                </p>

                <div className="w-full bg-bg-secondary rounded-full h-3 mb-8 overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-1000 ${score === QUESTIONS.length ? "bg-accent-green" :
                                score >= QUESTIONS.length / 2 ? "bg-accent-yellow" : "bg-accent-red"
                            }`}
                        style={{ width: `${(score / QUESTIONS.length) * 100}%` }}
                    />
                </div>

                <p className="text-sm text-text-secondary mb-6 italic">
                    {score === QUESTIONS.length ? "Perfect! You're an investing pro." :
                        score >= QUESTIONS.length / 2 ? "Great job! Keep learning." :
                            "Good effort! Review the basics and try again."}
                </p>

                <button
                    onClick={handleRestart}
                    className="flex items-center gap-2 px-6 py-2 bg-text-primary text-bg-main rounded-lg font-semibold hover:bg-text-secondary transition-colors"
                >
                    <RefreshCw className="w-4 h-4" />
                    Retake Quiz
                </button>
            </div>
        );
    }

    const currentQuestion = QUESTIONS[currentQuestionIndex];

    return (
        <div className="bg-bg-card border border-border-main rounded-xl p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-text-primary">Test Your Knowledge</h2>
                <span className="text-sm font-medium text-text-secondary bg-bg-secondary px-2 py-1 rounded">
                    Question {currentQuestionIndex + 1}/{QUESTIONS.length}
                </span>
            </div>

            <div className="flex-1">
                <h3 className="text-md font-medium text-text-primary mb-4 min-h-[3.5rem]">
                    {currentQuestion.question}
                </h3>

                <div className="space-y-3">
                    {currentQuestion.options.map((option, index) => {
                        let buttonStyle = "border-border-main hover:bg-bg-secondary";
                        let icon = null;

                        if (selectedOption !== null) {
                            if (index === currentQuestion.correctAnswer) {
                                buttonStyle = "bg-accent-green/10 border-accent-green text-accent-green";
                                icon = <CheckCircle2 className="w-5 h-5 text-accent-green" />;
                            } else if (index === selectedOption) {
                                buttonStyle = "bg-accent-red/10 border-accent-red text-accent-red";
                                icon = <XCircle className="w-5 h-5 text-accent-red" />;
                            } else {
                                buttonStyle = "border-border-main opacity-50 cursor-not-allowed";
                            }
                        }

                        return (
                            <button
                                key={index}
                                onClick={() => handleOptionSelect(index)}
                                disabled={selectedOption !== null}
                                className={`w-full text-left p-3 rounded-lg border transition-all flex items-center justify-between ${buttonStyle}`}
                            >
                                <span className={selectedOption !== null && index === currentQuestion.correctAnswer ? "font-medium" : ""}>
                                    {option}
                                </span>
                                {icon}
                            </button>
                        );
                    })}
                </div>

                {showExplanation && (
                    <div className="mt-6 p-4 bg-bg-secondary/30 rounded-lg animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <p className="text-sm font-medium text-text-primary mb-1">
                            {selectedOption === currentQuestion.correctAnswer ? "Correct!" : "Incorrect"}
                        </p>
                        <p className="text-sm text-text-secondary">
                            {currentQuestion.explanation}
                        </p>

                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={handleNext}
                                className="px-4 py-2 bg-accent-blue text-white rounded-lg font-medium hover:bg-accent-blue/90 transition-colors shadow-lg shadow-accent-blue/20"
                            >
                                {currentQuestionIndex < QUESTIONS.length - 1 ? "Next Question" : "See Results"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
