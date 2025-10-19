import React, { useEffect, useState } from "react";
import PinkGraph from "../components/PinkGraph";
import BabyTable from "../components/BabyTable";
import { countPerDayAlert } from "../utils/countAlert";
import { success } from "../utils/alert";

export const Poop = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    setData([
      { name: "Day 1", times: 3 },
      { name: "Day 2", times: 4 },
      { name: "Day 3", times: 2 },
      { name: "Day 4", times: 3 },
      { name: "Day 5", times: 2 },
      { name: "Day 6", times: 3 },
      { name: "Day 7", times: 4 },
      { name: "Day 8", times: 2 },
      { name: "Day 9", times: 3 },
      { name: "Day 10", times: 2 },
      { name: "Day 11", times: 3 },
      { name: "Day 12", times: 2 },
      { name: "Day 13", times: 3 },
      { name: "Day 14", times: 2 },
    ]);
  }, []);

  return (
    <div className="w-full flex flex-col items-center justify-center mt-10 relative z-10 gap-6 px-6 max-w-[440px] mx-auto">
      <button
        onClick={async () => {
          const res = await countPerDayAlert({
            title: "อุจจาระ",
            label: "จำนวนครั้งที่ลูกถ่ายอุจจาระ (ครั้ง/วัน)",
            placeholder: "เช่น 3",
          });
          if (res) {
            success(`บันทึกแล้ว\nอุจจาระ: ${res.count} ครั้ง/วัน`);
          }
        }}
        className="btn rounded-xl bg-[#F5D8EB] text-xl font-light w-full"
      >
        บันทึกจำนวนครั้งอุจจาระ
      </button>

      <BabyTable columns={["วัน", "จำนวนครั้ง/วัน"]} data={data} />
      <PinkGraph data={data} lines={[{ dataKey: "times", color: "#FF66C4", label: "จำนวนครั้ง/วัน" }]} />
    </div>
  );
};

