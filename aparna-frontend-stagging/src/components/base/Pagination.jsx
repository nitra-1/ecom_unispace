import React from 'react';
import Link from 'next/link';

const Pagination = ({ currentPage, totalPages }) => {
  const prevPage = currentPage - 1;
  const nextPage = currentPage + 1;

  // Calculate the range of page numbers to display
  const rangeStart = Math.max(currentPage - 2, 1);
  const rangeEnd = Math.min(rangeStart + 2, totalPages);

  return (
    <nav className="main_nav ">
      <ul className="pagination">
        {prevPage > 0 && (
          <li className="page-item">
            <Link href={`/?page=${prevPage}`} className="page-link">
            <i className='m-icon m-icon-prev'></i>
            </Link>
          </li>
        )}

        {rangeStart > 1 && (
          <li className="page-item">
            <Link href={`/?page=1`} className="page-link">
              1
            </Link>
          </li>
        )}

        {rangeStart > 2 && (
          <li className="page-item">
            <span className="page-link">...</span>
          </li>
        )}

        {Array.from({ length: rangeEnd - rangeStart + 1 }, (_, index) => {
          const pageNumber = rangeStart + index;
          return (
            <li
              className={`page-item${currentPage === pageNumber ? ' active' : ''}`}
              key={pageNumber}
            >
              <Link href={`/?page=${pageNumber}`} className="page-link">
                {pageNumber}
              </Link>
            </li>
          );
        })}

        {rangeEnd < totalPages - 1 && (
          <li className="page-item">
            <span className="page-link">...</span>
          </li>
        )}

        {rangeEnd < totalPages && (
          <li className="page-item">
            <Link href={`/?page=${totalPages}`} className="page-link">
             {totalPages}
            </Link>
          </li>
        )}

        {nextPage <= totalPages && (
          <li className="page-item">
            <Link href={`/?page=${nextPage}`} className="page-link">
              <i className='m-icon m-icon-next'></i>
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Pagination;
