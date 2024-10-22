import React, { useMemo, useState } from "react";

const Table = ({ columns, data, itemsPerPage = 10 }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [sortColumn, setSortColumn] = useState(null);
    const [sortDirection, setSortDirection] = useState('asc');
  
    const sortedData = useMemo(() => {
      if (sortColumn) {
        return [...data].sort((a, b) => {
          const aValue = columns.find(col => col.name === sortColumn)?.selector(a) ?? '';
          const bValue = columns.find(col => col.name === sortColumn)?.selector(b) ?? '';
  
          if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
          if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
          return 0;
        });
      }
      return data;
    }, [data, sortColumn, sortDirection, columns]);
  
    const paginatedData = useMemo(() => {
      const startIndex = (currentPage - 1) * itemsPerPage;
      return sortedData.slice(startIndex, startIndex + itemsPerPage);
    }, [sortedData, currentPage, itemsPerPage]);
  
    const totalPages = Math.ceil(data.length / itemsPerPage);
  
    const handleSort = (columnName) => {
      if (sortColumn === columnName) {
        setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
      } else {
        setSortColumn(columnName);
        setSortDirection('asc');
      }
    };
  
    return (
      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-blue-500 text-white uppercase text-sm leading-normal">
              {columns.map((column) => (
                <th
                  key={column.name}
                  className={`py-3 px-6 text-left ${column.sortable ? 'cursor-pointer hover:bg-blue-600' : ''}`}
                  onClick={() => column.sortable && handleSort(column.name)}
                >
                  {column.name}
                  {sortColumn === column.name && (
                    <span className="ml-1">
                      {sortDirection === 'asc' ? '▲' : '▼'}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm ">
            {paginatedData.map((row, index) => (
              <tr key={index} className="border-b border-gray-200 hover:bg-gray-100">
                {columns.map((column) => (
                  <td key={column.name} className={`py-3 px-6 text-left whitespace-nowrap ${column.name==='Status' && 'capitalize'}`}>
                    {column.selector(row) || 'N/A'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-between items-center mt-4 p-2 bg-gray-100 rounded-b-lg">
          <div className="text-sm">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, data.length)} of {data.length} entries
          </div>
          <div>
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-l disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-r disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    );
  };

export default Table