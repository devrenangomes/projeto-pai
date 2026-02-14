import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import EmployeeTable from './EmployeeTable';

describe('EmployeeTable', () => {
    const mockSheet = {
        id: '1',
        name: 'Test Sheet',
        columns: ['Name', 'Role', 'Status'],
        data: [
            { id: 1, Name: 'John Doe', Role: 'Developer', Status: 'Active' },
            { id: 2, Name: 'Jane Smith', Role: 'Designer', Status: 'Inactive' }
        ]
    };

    const defaultProps = {
        activeSheet: mockSheet,
        filteredData: mockSheet.data,
        sortConfig: { key: null, direction: 'asc' },
        onSort: vi.fn(),
        editingId: null,
        onEditClick: vi.fn(),
        onSaveEdit: vi.fn(),
        onDeleteRow: vi.fn(),
        editFormData: {},
        setEditFormData: vi.fn()
    };

    it('should render table headers correctly', () => {
        render(<EmployeeTable {...defaultProps} />);

        expect(screen.getByText('Name')).toBeInTheDocument();
        expect(screen.getByText('Role')).toBeInTheDocument();
        expect(screen.getByText('Status')).toBeInTheDocument();
    });

    it('should render data rows correctly', () => {
        render(<EmployeeTable {...defaultProps} />);

        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        // Check status rendering (badges)
        expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('should call onEditClick when edit button is clicked', () => {
        render(<EmployeeTable {...defaultProps} />);

        // Find all edit buttons (using Lucide icon implies internal implementation, but we can look for button role)
        // Actually, buttons have no text, just icons. We can add aria-labels to buttons in next refactor for better a11y, 
        // but for now let's try to query by role row and then button.
        const rows = screen.getAllByRole('row');
        // Row 0 is header, Row 1 is John Doe
        const editButton = rows[1].querySelector('button'); // First button is edit

        fireEvent.click(editButton);
        expect(defaultProps.onEditClick).toHaveBeenCalledWith(mockSheet.data[0]);
    });

    it('should show input fields when in editing mode', () => {
        render(<EmployeeTable {...defaultProps} editingId={1} editFormData={mockSheet.data[0]} />);

        const inputs = screen.getAllByRole('textbox');
        expect(inputs).toHaveLength(3); // Name, Role, Status
        expect(inputs[0]).toHaveValue('John Doe');
    });
});
