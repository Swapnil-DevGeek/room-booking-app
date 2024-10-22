import React from "react";

function Sidebar({ sidebarOptions, activePage, onSelect }) {
  return (
    <aside className="w-64 bg-white h-screen p-6">
      <ul>
        {sidebarOptions.map((option, ind) => (
          <li
            key={ind}
            onClick={() => onSelect(option)}
            className={`mb-4 cursor-pointer px-4 py-3 rounded-md  ${
              activePage === option
                ? "bg-gray-200 text-black"
                : "hover:underline text-black"
            }`}
          >
            {option}
          </li>
        ))}
      </ul>
    </aside>
  );
}

export default Sidebar;
