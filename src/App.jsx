import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import EmployeeTable from './components/employee/EmployeeTable';
import EmployeeSettings from './components/employee/EmployeeSettings';
import ExportModal from './components/employee/ExportModal';
import Auth from './components/auth/Auth';
import { ImageImporter } from './components/features/ImageImporter';
import { useSheets } from './hooks/useSheets';
import { useSheetFilters } from './hooks/useSheetFilters';
import { exportToExcel, exportToPDF, exportToCSV } from './utils/exportUtils';

const App = () => {
    // Auth State
    const [session, setSession] = useState(null);
    const [loadingSession, setLoadingSession] = useState(true);

    // Logic & State Hooks
    const {
        sheets,
        activeSheet,
        activeSheetId,
        setActiveSheetId,
        createEmptySheet,
        deleteSheet,
        importCSV,
        updateSheetSettings,
        addNewRow,
        deleteRow,
        editingId,
        editFormData,
        setEditFormData,
        startEditing,
        saveEdit,
        setEditingId,
        isLoading
    } = useSheets(session);

    const {
        searchTerm,
        setSearchTerm,
        sortConfig,
        handleSort,
        filteredData
    } = useSheetFilters(activeSheet);

    // UI State
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isImageImporterOpen, setIsImageImporterOpen] = useState(false);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoadingSession(false);
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        setSession(null);
    };

    // Handlers involving UI state or composite actions
    const handleExport = (format, theme) => {
        const { data, columns, name } = activeSheet;
        const filename = name.replace(/[^a-z0-9]/gi, '_').toLowerCase();

        if (format === 'csv') {
            exportToCSV(data, columns, filename);
        } else if (format === 'xlsx') {
            exportToExcel(data, columns, filename);
        } else if (format === 'pdf') {
            exportToPDF(data, columns, name, theme);
        }
    };

    const handleDeleteRowWrapper = (rowId) => {
        // If we are canceling an edit for a row effectively
        if (editingId === rowId) {
            setEditingId(null);
        }
        deleteRow(rowId);
    };

    const handleImportList = (listName, listData) => {
        createEmptySheet(listName, listData);
        setIsImageImporterOpen(false);
    };

    if (loadingSession) {
        return (
            <div className="flex items-center justify-center h-screen bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
            </div>
        );
    }

    if (!session) {
        return <Auth />;
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden relative">

            {/* Configuration Modal */}
            <EmployeeSettings
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                activeSheet={activeSheet}
                onSave={updateSheetSettings}
                onDelete={() => {
                    const success = deleteSheet(activeSheetId);
                    if (success) setIsSettingsOpen(false);
                }}
            />

            <ExportModal
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                onExport={handleExport}
                activeSheetName={activeSheet.name}
            />

            {/* Sidebar */}
            <Sidebar
                sheets={sheets}
                activeSheetId={activeSheetId}
                setActiveSheetId={setActiveSheetId}
                onCreateSheet={createEmptySheet}
                onDeleteSheet={deleteSheet}
                onImportCSV={importCSV}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                onSignOut={handleSignOut}
                user={session.user}
            />

            {isImageImporterOpen && (
                <ImageImporter
                    onComplete={handleImportList}
                    onCancel={() => setIsImageImporterOpen(false)}
                />
            )}

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-full overflow-hidden w-full relative">
                <Header
                    activeSheet={activeSheet}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    onOpenSettings={() => setIsSettingsOpen(true)}
                    onExportClick={() => setIsExportModalOpen(true)}
                    onAddNewRow={addNewRow}
                    onMenuClick={() => setIsSidebarOpen(true)}
                    onCameraClick={() => setIsImageImporterOpen(true)}
                />

                <EmployeeTable
                    activeSheet={activeSheet}
                    filteredData={filteredData}
                    sortConfig={sortConfig}
                    onSort={handleSort}
                    editingId={editingId}
                    onEditClick={startEditing}
                    onSaveEdit={saveEdit}
                    onDeleteRow={handleDeleteRowWrapper}
                    editFormData={editFormData}
                    setEditFormData={setEditFormData}
                />
            </main>
        </div>
    );
};

export default App;
