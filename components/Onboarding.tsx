import React, { useState } from 'react';
import { TEXTBOOKS } from '../constants';
import { BookOpen, GraduationCap, Check } from 'lucide-react';

interface OnboardingProps {
  onComplete: (grade: number, textbookId: string) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [selectedBook, setSelectedBook] = useState<string | null>(null);

  const handleNext = () => {
    if (step === 1 && selectedGrade) {
      setStep(2);
    } else if (step === 2 && selectedBook && selectedGrade) {
      onComplete(selectedGrade, selectedBook);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-full p-6 bg-sky-50 animate-fadeIn">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border-4 border-blue-100">
        
        {/* Progress Dots */}
        <div className="flex justify-center gap-2 mb-8">
          <div className={`h-3 w-3 rounded-full ${step === 1 ? 'bg-blue-500' : 'bg-blue-200'}`} />
          <div className={`h-3 w-3 rounded-full ${step === 2 ? 'bg-blue-500' : 'bg-blue-200'}`} />
        </div>

        {step === 1 && (
          <>
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                <GraduationCap size={40} />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Con đang học lớp mấy?</h2>
              <p className="text-gray-500">Chọn lớp để thầy Rùa tìm bài học phù hợp nhé!</p>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
              {[1, 2, 3, 4, 5].map((grade) => (
                <button
                  key={grade}
                  onClick={() => setSelectedGrade(grade)}
                  className={`aspect-square rounded-2xl text-2xl font-bold flex flex-col items-center justify-center border-4 transition-all ${
                    selectedGrade === grade 
                      ? 'border-blue-500 bg-blue-50 text-blue-600 shadow-lg scale-105' 
                      : 'border-gray-100 bg-gray-50 text-gray-400 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-xs font-normal text-gray-500 mb-1">Lớp</span>
                  {grade}
                </button>
              ))}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                <BookOpen size={40} />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Con học sách nào?</h2>
              <p className="text-gray-500">Chọn giáo trình trên lớp của con.</p>
            </div>

            <div className="flex flex-col gap-3 mb-8 max-h-60 overflow-y-auto">
              {TEXTBOOKS.map((book) => (
                <button
                  key={book.id}
                  onClick={() => setSelectedBook(book.id)}
                  className={`p-4 rounded-xl text-left border-2 flex items-center justify-between transition-all ${
                    selectedBook === book.id
                      ? 'border-green-500 bg-green-50 text-green-800 shadow-md'
                      : 'border-gray-100 hover:bg-gray-50 text-gray-600'
                  }`}
                >
                  <span className="font-bold">{book.name}</span>
                  {selectedBook === book.id && <Check size={20} className="text-green-500" />}
                </button>
              ))}
            </div>
          </>
        )}

        <button
          onClick={handleNext}
          disabled={step === 1 ? !selectedGrade : !selectedBook}
          className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-blue-200 disabled:opacity-50 hover:bg-blue-700 transition-colors"
        >
          {step === 1 ? 'Tiếp theo' : 'Bắt đầu học thôi!'}
        </button>

      </div>
    </div>
  );
};
