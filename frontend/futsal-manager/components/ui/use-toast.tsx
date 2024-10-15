'use client';

import styled from 'styled-components';
import { useState } from 'react';

const ToastContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
`;

const Toast = styled.div`
  background-color: #333;
  color: white;
  padding: 15px;
  border-radius: 5px;
  margin-bottom: 10px;
  opacity: ${({ isVisible }) => (isVisible ? 1 : 0)};
  transition: opacity 0.3s ease-in-out;
`;

const ToastMessage = styled.p`
  margin: 0;
`;

const ToastButton = styled.button`
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
`;

export interface Toast {
  id: number;
  message: { title: string; description: string };
  duration: number;
}

function useToast() {
  const [toasts, setToasts] = useState<Array<Toast>>([]);

  const showToast = (
    message: { title: string; description: string },
    duration = 3000
  ) => {
    const id = Date.now();
    setToasts((prevToasts: Array<Toast>) => [
      ...prevToasts,
      { id, message, duration } as Toast,
    ]);

    const timeoutId = setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
    }, duration);

    return () => clearTimeout(timeoutId);
  };

  return { showToast, toasts };
}

const ToastProvider = ({ children }: HTMLDivElement) => {
  const { showToast, toasts } = useToast();

  return (
    <ToastContainer>
      {toasts.map((toast) => (
        <Toast key={toast.id} isVisible={true}>
          <ToastMessage>
            <div>
              <h3>{toast.message.title}</h3>
              <span>{toast.message.description}</span>
            </div>
          </ToastMessage>
          <ToastButton onClick={() => showToast(toast.message, 0)}>
            X
          </ToastButton>
        </Toast>
      ))}
      {children}
    </ToastContainer>
  );
};

export { ToastProvider, useToast };
