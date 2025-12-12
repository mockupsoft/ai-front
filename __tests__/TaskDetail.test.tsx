import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TaskDetail } from '@/components/TaskDetail';
import * as hooks from '@/lib/hooks';
import * as wsProvider from '@/components/WebSocketProvider';
import * as api from '@/lib/api';

// Mock dependencies
jest.mock('@/lib/hooks');
jest.mock('@/components/WebSocketProvider');
jest.mock('@/lib/api');
jest.mock('next/navigation', () => ({
    useParams: () => ({ id: '1' })
}));

// Mock syntax highlighter to avoid issues
jest.mock('react-syntax-highlighter', () => ({
    Prism: ({ children }: any) => <pre>{children}</pre>
}));

const mockTask = {
    id: '1',
    name: 'Task 1',
    status: 'waiting_approval',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
    currentRunId: 'run1',
};

const mockRun = {
    id: 'run1',
    taskId: '1',
    status: 'waiting_approval',
    plan: 'Mock Plan',
    logs: [],
    artifacts: [],
    createdAt: '2023-01-01T00:00:00Z',
};

describe('TaskDetail', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (hooks.useTask as jest.Mock).mockReturnValue({
            task: mockTask,
            isLoading: false,
            mutate: jest.fn(),
        });
        (hooks.useRun as jest.Mock).mockReturnValue({
            run: mockRun,
            isLoading: false,
            mutate: jest.fn(),
        });
        (wsProvider.useWebSocket as jest.Mock).mockReturnValue({
            lastMessage: null,
            isConnected: true,
        });
    });

    it('renders task detail and plan', () => {
        render(<TaskDetail taskId="1" />);
        expect(screen.getByText('Task 1')).toBeInTheDocument();
        expect(screen.getByText('WAITING APPROVAL')).toBeInTheDocument();
        expect(screen.getByText('Mock Plan')).toBeInTheDocument();
    });

    it('approves plan when button is clicked', async () => {
        (api.approvePlan as jest.Mock).mockResolvedValue({});
        const mutateTaskMock = jest.fn();
        const mutateRunMock = jest.fn();
        (hooks.useTask as jest.Mock).mockReturnValue({
            task: mockTask,
            isLoading: false,
            mutate: mutateTaskMock,
        });
        (hooks.useRun as jest.Mock).mockReturnValue({
            run: mockRun,
            isLoading: false,
            mutate: mutateRunMock,
        });

        render(<TaskDetail taskId="1" />);
        
        const approveButton = screen.getByText('Approve Plan');
        fireEvent.click(approveButton);

        await waitFor(() => {
            expect(api.approvePlan).toHaveBeenCalledWith('1', 'run1');
            expect(mutateTaskMock).toHaveBeenCalled();
            expect(mutateRunMock).toHaveBeenCalled();
        });
    });
});
