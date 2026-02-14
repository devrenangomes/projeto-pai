import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useSheets } from './useSheets';

describe('useSheets Hook', () => {
    // Mock window.confirm and alert
    beforeEach(() => {
        global.confirm = vi.fn(() => true);
        global.alert = vi.fn();
    });

    it('should initialize with default data', () => {
        const { result } = renderHook(() => useSheets());

        expect(result.current.sheets).toHaveLength(1);
        expect(result.current.activeSheetId).toBe('default');
        expect(result.current.activeSheet.name).toBe('Funcionários Padrão');
    });

    it('should create a new empty sheet', () => {
        const { result } = renderHook(() => useSheets());

        act(() => {
            result.current.createEmptySheet();
        });

        expect(result.current.sheets).toHaveLength(2);
        expect(result.current.activeSheet.name).toBe('Nova Lista');
    });

    it('should delete a sheet', () => {
        const { result } = renderHook(() => useSheets());

        // Create one first so we can delete one
        act(() => {
            result.current.createEmptySheet();
        });

        const newSheetId = result.current.activeSheetId;

        act(() => {
            result.current.deleteSheet(newSheetId);
        });

        expect(result.current.sheets).toHaveLength(1);
        expect(global.confirm).toHaveBeenCalled();
    });

    it('should add a new row', () => {
        const { result } = renderHook(() => useSheets());
        const initialLength = result.current.activeSheet.data.length;

        act(() => {
            result.current.addNewRow();
        });

        expect(result.current.activeSheet.data).toHaveLength(initialLength + 1);
        expect(result.current.editingId).not.toBeNull(); // Should start editing immediately
    });

    it('should update sheet settings (rename and columns)', () => {
        const { result } = renderHook(() => useSheets());

        const newSettings = {
            name: 'Renamed Sheet',
            columns: [
                { original: 'Nome', current: 'Nome Completo' },
                { original: 'Cargo', current: 'Cargo' }
                // Removed other columns
            ]
        };

        act(() => {
            result.current.updateSheetSettings(newSettings);
        });

        expect(result.current.activeSheet.name).toBe('Renamed Sheet');
        expect(result.current.activeSheet.columns).toEqual(['Nome Completo', 'Cargo']);
        // Check data persistence
        expect(result.current.activeSheet.data[0]['Nome Completo']).toBe('Ana Silva');
    });
});
