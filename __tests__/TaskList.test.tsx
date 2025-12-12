import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TaskList } from '@/components/TaskList';
import * as hooks from '@/lib/hooks';
import * as wsProvider from '@/components/WebSocketProvider';
import * as api from '@/lib/api';

// Mock dependencies
jest.mock('@/lib/hooks');
jest.mock('@/components/WebSocketProvider');
jest.mock('@/lib/api');
jest.mock('next/link', () => {
    return ({ children }: { children: React.ReactNode }) => {
        return children;
    }
});

const mockTasks = [
    {
        id: '1',
        name: 'Task 1',
        status: 'pending',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
    },
    {
        id: '2',
        name: 'Task 2',
        status: 'completed',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
    },
];

describe('TaskList', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (hooks.useTasks as jest.Mock).mockReturnValue({
            tasks: mockTasks,
            isLoading: false,
            mutate: jest.fn(),
        });
        (wsProvider.useWebSocket as jest.Mock).mockReturnValue({
            lastMessage: null,
            isConnected: true,
        });
    });

    it('renders task list', () => {
        render(<TaskList />);
        expect(screen.getByText('Task 1')).toBeInTheDocument();
        expect(screen.getByText('Task 2')).toBeInTheDocument();
        expect(screen.getByText('PENDING')).toBeInTheDocument();
        expect(screen.getByText('COMPLETED')).toBeInTheDocument();
    });

    it('triggers run when button is clicked', async () => {
        (api.triggerRun as jest.Mock).mockResolvedValue({});
        const mutateMock = jest.fn();
        (hooks.useTasks as jest.Mock).mockReturnValue({
            tasks: mockTasks,
            isLoading: false,
            mutate: mutateMock,
        });

        render(<TaskList />);
        
        const buttons = screen.getAllByTitle('Trigger Run');
        fireEvent.click(buttons[0]);

        await waitFor(() => {
            expect(api.triggerRun).toHaveBeenCalledWith('1');
            expect(mutateMock).toHaveBeenCalled();
        });
    });
});
