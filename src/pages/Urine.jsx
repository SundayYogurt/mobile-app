import React, { useEffect, useState } from "react";
import PinkGraph from "../components/PinkGraph";
import BabyTable from "../components/BabyTable";
import { countPerDayAlert } from "../utils/countAlert";
import { success } from "../utils/alert";

const Urine = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    setData([
      { name: "Day 1", times: 6 },
      { name: "Day 2", times: 7 },
      { name: "Day 3", times: 4 },
      { name: "Day 4", times: 8 },
      { name: "Day 5", times: 6 },
      { name: "Day 6", times: 6 },
      { name: "Day 7", times: 7 },
      { name: "Day 8", times: 4 },
      { name: "Day 9", times: 8 },
      { name: "Day 10", times: 6 },
      { name: "Day 11", times: 6 },
      { name: "Day 12", times: 7 },
      { name: "Day 13", times: 4 },
      { name: "Day 14", times: 8 },
    ]);
  }, []);

  return (
    <div className="w-full flex flex-col items-center justify-center mt-10 relative z-10 gap-6 px-6 max-w-[440px] mx-auto">
      <button
        onClick={async () => {
          const res = await countPerDayAlert({
            title: "ปัสสาวะ",
            label: "จำนวนครั้งที่ลูกถ่ายปัสสาวะ (ครั้ง/วัน)",
            placeholder: "เช่น 6",
          });
          if (res) {
            success(`บันทึกแล้ว\nปัสสาวะ: ${res.count} ครั้ง/วัน`);
          }
        }}
        className="btn rounded-xl bg-[#F5D8EB] text-xl font-light w-full"
      >
        บันทึกจำนวนครั้งปัสสาวะ
      </button>

      <BabyTable columns={["วัน", "จำนวนครั้ง/วัน"]} data={data} />
      <PinkGraph data={data} lines={[{ dataKey: "times", color: "#FF66C4", label: "จำนวนครั้ง/วัน" }]} />
    </div>
  );
};

export default Urine;

