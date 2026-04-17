import { useEffect, useRef } from 'react';
import axiosInstance from '../api/axiosInstance';
import { toast } from 'react-hot-toast';

const useAutoSave = (attemptId, questionId, answer) => {
  const timeoutRef = useRef(null);
  const lastSavedRef = useRef({ questionId, answer });

  const performSave = async (qId, ans) => {
    if (!attemptId || !qId) return;
    try {
      await axiosInstance.post('/answers/save', {
        attemptId,
        questionId: qId,
        answer: ans
      });
      lastSavedRef.current = { questionId: qId, answer: ans };
    } catch (error) {
      console.error('Auto-save failed');
    }
  };

  useEffect(() => {
    // If we are switching away from a question that has unsaved changes, save it now
    const { questionId: prevQId, answer: prevAns } = lastSavedRef.current;
    
    if (prevQId && prevQId !== questionId && prevAns !== undefined) {
      performSave(prevQId, prevAns);
    }

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (answer !== undefined) {
      timeoutRef.current = setTimeout(() => {
        performSave(questionId, answer);
      }, 3000);
    }
    
    // Update the ref to track current state
    lastSavedRef.current = { questionId, answer };

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [answer, questionId, attemptId]);
};

export default useAutoSave;
