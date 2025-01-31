import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';



const Pagination = ({ tasksPerPage, totalTasks, paginate, currentPage }) => {
    const pageNumbers = [];

    for (let i = 1; i <= Math.ceil(totalTasks / tasksPerPage); i++) {
        pageNumbers.push(i);
    }

    return (
        <nav className="d-flex justify-content-end mt-3">
            <ul className="pagination">
                {pageNumbers.map(number => (
                    <li key={number} className={`page-item ${number === currentPage ? 'active' : ''}`}>
                        <a
                            onClick={() => paginate(number)}
                            className="page-link"
                            href="#"
                            style={{ color: number === currentPage ? '#fff' : '', backgroundColor: number === currentPage ? '#ff8c42' : '' }}
                        >
                            {number}
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    );
};

export default Pagination;