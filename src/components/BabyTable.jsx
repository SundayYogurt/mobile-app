import React from "react";

export default function BabyTable({ columns = [], data = [] }) {
  return (
    <div className="overflow-x-auto w-full max-w-[600px] mx-auto mt-5">
      <table className="table-auto w-full border-collapse border border-pink-200 text-center rounded-lg overflow-hidden">
        <thead className="bg-pink-100 text-pink-600 font-semibold">
          <tr>
            {columns.map((col, i) => (
              <th key={i} className="border border-pink-200 px-4 py-2">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((row, i) => (
              <tr key={i} className="hover:bg-pink-50">
                {Object.values(row).map((cell, j) => (
                  <td key={j} className="border border-pink-200 px-4 py-2">
                    {cell}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length}
                className="border border-pink-200 px-4 py-4 text-gray-400 italic"
              >
                ไม่มีข้อมูล
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
