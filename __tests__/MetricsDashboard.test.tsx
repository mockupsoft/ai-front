import React from 'react';
import { render, screen } from '@testing-library/react';
import { MetricsDashboard } from '@/components/MetricsDashboard';
import * as hooks from '@/lib/hooks';
import * as wsProvider from '@/components/WebSocketProvider';

// Mock dependencies
jest.mock('@/lib/hooks');
jest.mock('@/components/WebSocketProvider');
// Mock Recharts to avoid complex rendering in tests or use a resize observer mock
jest.mock('recharts', () => {
    const OriginalModule = jest.requireActual('recharts');
    return {
        ...OriginalModule,
        ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    };
});

describe('MetricsDashboard', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (hooks.useMetrics as jest.Mock).mockReturnValue({
            metrics: [{ latency: 10, cacheHits: 50, throughput: 100, timestamp: 1000 }],
            isLoading: false,
        });
        (wsProvider.useWebSocket as jest.Mock).mockReturnValue({
            lastMessage: null,
            isConnected: true,
        });
    });

    it('renders initial metrics', () => {
        render(<MetricsDashboard />);
        // 10.00 ms
        expect(screen.getByText('10.00')).toBeInTheDocument(); 
        // 50 %
        expect(screen.getByText('50')).toBeInTheDocument();
    });

    it('updates metrics on WS message', () => {
        const { rerender } = render(<MetricsDashboard />);
        
        // initial state
        expect(screen.getByText('10.00')).toBeInTheDocument();

        // simulate WS update
        (wsProvider.useWebSocket as jest.Mock).mockReturnValue({
            lastMessage: {
                type: 'metrics_update',
                payload: { latency: 20, cacheHits: 60, throughput: 200, timestamp: 2000 }
            },
            isConnected: true,
        });

        rerender(<MetricsDashboard />);
        
        expect(screen.getByText('20.00')).toBeInTheDocument();
        expect(screen.getByText('60')).toBeInTheDocument();
    });
});
