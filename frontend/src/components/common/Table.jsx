import React, { useState, useEffect } from 'react';
import Pagination from './Pagination';
import Loader from './Loader';

/**
 * Reusable table component with sorting, pagination, and selection
 */
const Table = ({
  columns = [],
  data = [],
  isLoading = false,
  pagination = true,
  totalItems = 0,
  itemsPerPage = 10,
  currentPage = 1,
  onPageChange,
  onSortChange,
  sortable = true,
  selectable = false,
  onSelectionChange,
  emptyMessage = 'Tidak ada data',
  stickyHeader = false,
  dense = false,
  striped = true,
  bordered = true,
  hoverEffect = true,
  rounded = true,
  containerClassName = '',
  tableClassName = '',
  thClassName = '',
  tdClassName = '',
  trClassName = '',
  footerClassName = '',
  className = '',
  expandableRows = false,
  expandedRowId = null,
  renderExpandedRow = null,
}) => {
  // Local state for sorting and selection
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [selectedRows, setSelectedRows] = useState([]);
  const [localData, setLocalData] = useState([]);
  const [localCurrentPage, setLocalCurrentPage] = useState(currentPage);
  const [localItemsPerPage, setLocalItemsPerPage] = useState(itemsPerPage);

  // Update local data when props change
  useEffect(() => {
    setLocalData(data);
  }, [data]);

  // Update pagination state when props change
  useEffect(() => {
    setLocalCurrentPage(currentPage);
  }, [currentPage]);

  useEffect(() => {
    setLocalItemsPerPage(itemsPerPage);
  }, [itemsPerPage]);

  // Handle sort column click
  const handleSort = (columnKey) => {
    if (!sortable) return;

    const column = columns.find(col => col.key === columnKey);
    if (column?.sortable === false) return;

    let direction = 'asc';
    if (sortField === columnKey) {
      direction = sortDirection === 'asc' ? 'desc' : 'asc';
    }

    setSortField(columnKey);
    setSortDirection(direction);

    if (onSortChange) {
      onSortChange(columnKey, direction);
    } else {
      // Perform local sorting if no external handler
      const sortedData = [...localData].sort((a, b) => {
        const aValue = a[columnKey];
        const bValue = b[columnKey];

        if (aValue === null || aValue === undefined) return direction === 'asc' ? -1 : 1;
        if (bValue === null || bValue === undefined) return direction === 'asc' ? 1 : -1;

        if (typeof aValue === 'string') {
          return direction === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        return direction === 'asc' ? aValue - bValue : bValue - aValue;
      });

      setLocalData(sortedData);
    }
  };

  // Handle select all rows
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = localData.map(row => row.id);
      setSelectedRows(allIds);
      if (onSelectionChange) onSelectionChange(allIds);
    } else {
      setSelectedRows([]);
      if (onSelectionChange) onSelectionChange([]);
    }
  };

  // Handle select single row
  const handleSelectRow = (rowId) => {
    let newSelectedRows;

    if (selectedRows.includes(rowId)) {
      newSelectedRows = selectedRows.filter(id => id !== rowId);
    } else {
      newSelectedRows = [...selectedRows, rowId];
    }

    setSelectedRows(newSelectedRows);
    if (onSelectionChange) onSelectionChange(newSelectedRows);
  };

  // Handle page change
  const handlePageChange = (page) => {
    setLocalCurrentPage(page);
    if (onPageChange) onPageChange(page);
  };

  // Style classes
  const tableClasses = `
    min-w-full divide-y divide-gray-200
    ${bordered ? 'border border-gray-200' : ''}
    ${rounded ? 'rounded-lg overflow-hidden' : ''}
    ${tableClassName}
  `;

  const theadClasses = `
    bg-gray-50
    ${stickyHeader ? 'sticky top-0 z-10' : ''}
  `;

  const thClasses = `
    px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider
    ${dense ? 'px-4 py-2' : ''}
    ${sortable ? 'cursor-pointer hover:bg-gray-100' : ''}
    ${thClassName}
  `;

  const tdClasses = `
    px-6 py-4 whitespace-nowrap
    ${dense ? 'px-4 py-2 text-sm' : ''}
    ${tdClassName}
  `;

  const trClasses = `
    ${striped ? 'even:bg-gray-50' : ''}
    ${hoverEffect ? 'hover:bg-gray-100' : ''}
    ${trClassName}
  `;

  const visibleColumns = columns.filter(col => !col.hideOnMobile);

  // If loading, show spinner
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader size="large" withText text="Loading data..." />
      </div>
    );
  }

  // Calculate pagination
  const totalPages = Math.ceil(totalItems / localItemsPerPage);
  const startIndex = (localCurrentPage - 1) * localItemsPerPage;
  const endIndex = startIndex + localItemsPerPage;
  
  // Use slice for client-side pagination only if no onPageChange handler
  const displayData = onPageChange ? localData : localData.slice(startIndex, endIndex);

  return (
    <div className={`shadow overflow-hidden border-b border-gray-200 ${containerClassName} ${className}`}>
      <div className="overflow-x-auto">
        <table className={tableClasses}>
          <thead className={theadClasses}>
            <tr>
              {/* Selection checkbox column */}
              {selectable && (
                <th className={thClasses} scope="col">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                      onChange={handleSelectAll}
                      checked={selectedRows.length > 0 && selectedRows.length === localData.length}
                      indeterminate={selectedRows.length > 0 && selectedRows.length < localData.length}
                    />
                  </div>
                </th>
              )}

              {/* Table headers */}
              {visibleColumns.map((column, index) => (
                <th
                  key={index}
                  className={thClasses}
                  onClick={() => column.sortable !== false && handleSort(column.key || column.accessor)}
                  scope="col"
                  style={{ width: column.width }}
                >
                  <div className="flex items-center">
                    {column.header}
                    
                    {/* Sort indicator */}
                    {sortable && column.sortable !== false && sortField === (column.key || column.accessor) && (
                      <span className="ml-2">
                        {sortDirection === 'asc' ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {displayData.length === 0 ? (
              <tr>
                <td
                  colSpan={visibleColumns.length + (selectable ? 1 : 0)}
                  className="px-6 py-4 text-center text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              displayData.map((row, rowIndex) => (
                <React.Fragment key={row._id || row.id || `row-${rowIndex}`}>
                  <tr className={trClasses}>
                    {/* Selection checkbox */}
                    {selectable && (
                      <td className={tdClasses}>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                            onChange={() => handleSelectRow(row._id || row.id)}
                            checked={selectedRows.includes(row._id || row.id)}
                          />
                        </div>
                      </td>
                    )}

                    {/* Row cells */}
                    {visibleColumns.map((column, colIndex) => (
                      <td 
                        key={`${row._id || row.id || rowIndex}-${column.key || column.accessor}`} 
                        className={tdClasses}
                      >
                        {column.render ? column.render(row) : column.cell ? column.cell(row) : row[column.accessor]}
                      </td>
                    ))}
                  </tr>
                  
                  {/* Expanded row content */}
                  {expandableRows && expandedRowId === (row._id || row.id) && renderExpandedRow && (
                    <tr>
                      <td colSpan={visibleColumns.length + (selectable ? 1 : 0)} className="p-0">
                        {renderExpandedRow(row)}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className={`px-6 py-3 bg-white border-t border-gray-200 ${footerClassName}`}>
          <Pagination
            currentPage={localCurrentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
};

export default Table;