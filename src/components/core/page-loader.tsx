'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import { styled, keyframes } from '@mui/material/styles';

// Animation keyframes for 3D stacking effect
const stackAnimation = keyframes`
  0% {
    transform: translateY(0) rotateX(0deg) rotateY(0deg);
    opacity: 0.8;
  }
  25% {
    transform: translateY(-10px) rotateX(15deg) rotateY(5deg);
    opacity: 1;
  }
  50% {
    transform: translateY(-20px) rotateX(30deg) rotateY(10deg);
    opacity: 0.9;
  }
  75% {
    transform: translateY(-10px) rotateX(15deg) rotateY(5deg);
    opacity: 1;
  }
  100% {
    transform: translateY(0) rotateX(0deg) rotateY(0deg);
    opacity: 0.8;
  }
`;

const pulseAnimation = keyframes`
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }
`;

// Styled components
const LoaderOverlay = styled(Box)(() => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999,
  backdropFilter: 'blur(4px)',
}));

const LoaderContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '2rem',
  perspective: '1000px',
});

const LogoContainer = styled(Box)({
  animation: `${pulseAnimation} 2s ease-in-out infinite`,
  marginBottom: '1rem',
});

const StackContainer = styled(Box)({
  position: 'relative',
  width: '80px',
  height: '80px',
  transformStyle: 'preserve-3d',
});

const StackBox = styled(Box)<{ delay: number }>(({ delay }) => ({
  position: 'absolute',
  width: '60px',
  height: '20px',
  backgroundColor: '#1976d2',
  borderRadius: '4px',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
  animation: `${stackAnimation} 2s ease-in-out infinite`,
  animationDelay: `${delay}s`,
  transformOrigin: 'center center',
  
  '&:nth-of-type(1)': {
    backgroundColor: '#1976d2',
    bottom: '0px',
    left: '10px',
  },
  '&:nth-of-type(2)': {
    backgroundColor: '#1565c0',
    bottom: '20px',
    left: '10px',
  },
  '&:nth-of-type(3)': {
    backgroundColor: '#0d47a1',
    bottom: '40px',
    left: '10px',
  },
}));

const LoadingText = styled(Box)(() => ({
  color: '#666',
  fontSize: '14px',
  fontWeight: 500,
  textAlign: 'center',
  marginTop: '1rem',
}));

interface PageLoaderProps {
  isVisible: boolean;
  message?: string;
}

export function PageLoader({ isVisible, message = 'Signing you in...' }: PageLoaderProps): React.JSX.Element | null {
  if (!isVisible) return null;

  return (
    <LoaderOverlay>
      <LoaderContainer>
        <LogoContainer>
          <img
            src="/assets/logo-emblem.png"
            alt="Logo"
            style={{
              width: '60px',
              height: '60px',
              objectFit: 'contain',
            }}
          />
        </LogoContainer>
        
        <StackContainer>
          <StackBox delay={0} />
          <StackBox delay={0.2} />
          <StackBox delay={0.4} />
        </StackContainer>
        
        <LoadingText>{message}</LoadingText>
      </LoaderContainer>
    </LoaderOverlay>
  );
}
