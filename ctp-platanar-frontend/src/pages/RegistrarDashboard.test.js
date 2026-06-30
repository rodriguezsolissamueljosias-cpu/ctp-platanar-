import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import RegistrarDashboard from './RegistrarDashboard';
import { gradeAPI } from '../utils/api';

jest.mock('../utils/api', () => ({
  studentAPI: {
    getByTeacher: jest.fn(() => Promise.resolve({ data: [] })),
    create: jest.fn(),
    delete: jest.fn(),
  },
  gradeAPI: {
    getAll: jest.fn(() => Promise.resolve({ data: [] })),
  },
  sectionAPI: {
    getAll: jest.fn(() => Promise.resolve({ data: [] })),
  },
}));

describe('RegistrarDashboard', () => {
  it('muestra las opciones de grado A y B cuando no hay grados disponibles', async () => {
    render(<RegistrarDashboard teacher={{ teacherId: 1, name: 'Ana' }} />);

    await waitFor(() => expect(gradeAPI.getAll).toHaveBeenCalled());

    const gradeSelect = screen.getByLabelText(/grado/i);
    const values = Array.from(gradeSelect.options).map((option) => option.value);

    expect(values).toContain('A');
    expect(values).toContain('B');
  });
});
