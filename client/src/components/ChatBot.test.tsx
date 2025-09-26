import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ChatBot from './ChatBot';

describe('ChatBot', () => {
  test('renders chatbot button when closed', () => {
    render(<ChatBot isOpen={false} onClose={() => {}} />);
    // Since isOpen is false, nothing should be rendered
    expect(screen.queryByText('Investor Properties NY')).not.toBeInTheDocument();
  });

  test('opens chatbot when isOpen is true', () => {
    render(<ChatBot isOpen={true} onClose={() => {}} />);
    expect(screen.getByText('Hello there!')).toBeInTheDocument();
  });

  test('shows form after clicking Start Chat', () => {
    render(<ChatBot isOpen={true} onClose={() => {}} />);
    const startButton = screen.getByText('Start Chat');
    fireEvent.click(startButton);
    expect(screen.getByText("Let's get started")).toBeInTheDocument();
  });
});