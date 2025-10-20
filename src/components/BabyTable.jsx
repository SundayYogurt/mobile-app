import React from "react";

// columns can be strings or objects { key, label }
export default function BabyTable({ columns = [], data = [] }) {
  const cols = columns.map((c) =>
    typeof c === "string" ? { key: c, label: c } : c
  );
  return (
    <div className="overflow-x-auto w-full max-w-[600px] mx-auto mt-5">
      <table className="table-auto w-full border-collapse border border-pink-200 text-center rounded-lg overflow-hidden">
        <thead className="bg-pink-100 text-pink-600 font-semibold">
          <tr>
            {cols.map((col, i) => (
              <th key={i} className="border border-pink-200 px-4 py-2">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((row, i) => (
              <tr key={i} className="hover:bg-pink-50">
                {cols.map((col, j) => (
                  <td key={j} className="border border-pink-200 px-4 py-2">
                    {row?.[col.key]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={cols.length}
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

