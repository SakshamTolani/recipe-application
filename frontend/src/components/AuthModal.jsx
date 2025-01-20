import React, { memo } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react';
import AuthForm from './AuthForm';

const AuthModal = memo(({ isOpen, onClose, isLoginMode, onSubmit, isLoading, switchMode }) => (
  <Modal isOpen={isOpen} onClose={onClose} isCentered>
    <ModalOverlay backdropFilter="blur(4px)" />
    <ModalContent mx={4}>
      <ModalHeader>
        {isLoginMode ? 'Login to Recipe Finder' : 'Create Account'}
      </ModalHeader>
      <ModalCloseButton />
      <ModalBody pb={6}>
        <AuthForm
          isLoginMode={isLoginMode}
          onSubmit={onSubmit}
          isLoading={isLoading}
          switchMode={switchMode}
        />
      </ModalBody>
    </ModalContent>
  </Modal>
));

export default AuthModal;