import { useState, useCallback } from 'react';

interface ModalState {
  isOpen: boolean;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
}

interface InputModalState extends ModalState {
  defaultValue?: string;
  placeholder?: string;
  inputType?: 'text' | 'number';
  onSubmit?: (value: string) => void;
}

export function useModal() {
  const [alertState, setAlertState] = useState<ModalState>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  });

  const [confirmState, setConfirmState] = useState<ModalState>({
    isOpen: false,
    title: '',
    message: '',
    type: 'warning',
    onConfirm: () => {}
  });

  const [inputState, setInputState] = useState<InputModalState>({
    isOpen: false,
    title: '',
    message: '',
    defaultValue: '',
    placeholder: '',
    inputType: 'text',
    onSubmit: () => {}
  });

  // Alert modal (replaces alert())
  const showAlert = useCallback((
    message: string,
    title: string = 'Notice',
    type: 'info' | 'success' | 'warning' | 'error' = 'info'
  ) => {
    setAlertState({
      isOpen: true,
      title,
      message,
      type
    });
  }, []);

  const closeAlert = useCallback(() => {
    setAlertState(prev => ({ ...prev, isOpen: false }));
  }, []);

  // Confirm modal (replaces confirm())
  const showConfirm = useCallback((
    message: string,
    onConfirm: () => void,
    title: string = 'Confirm',
    type: 'info' | 'success' | 'warning' | 'error' = 'warning',
    confirmText: string = 'Confirm',
    cancelText: string = 'Cancel'
  ) => {
    setConfirmState({
      isOpen: true,
      title,
      message,
      type,
      onConfirm,
      confirmText,
      cancelText
    });
  }, []);

  const closeConfirm = useCallback(() => {
    setConfirmState(prev => ({ ...prev, isOpen: false }));
  }, []);

  // Input modal (replaces prompt())
  const showInput = useCallback((
    message: string,
    onSubmit: (value: string) => void,
    title: string = 'Input',
    defaultValue: string = '',
    placeholder: string = '',
    inputType: 'text' | 'number' = 'text'
  ) => {
    setInputState({
      isOpen: true,
      title,
      message,
      defaultValue,
      placeholder,
      inputType,
      onSubmit
    });
  }, []);

  const closeInput = useCallback(() => {
    setInputState(prev => ({ ...prev, isOpen: false }));
  }, []);

  return {
    // Alert
    alertState,
    showAlert,
    closeAlert,
    
    // Confirm
    confirmState,
    showConfirm,
    closeConfirm,
    
    // Input
    inputState,
    showInput,
    closeInput
  };
}

