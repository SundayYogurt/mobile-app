
import React, { useEffect, useState } from "react";
import PinkGraph from "../components/PinkGraph";
import { weightAlert } from "../utils/weightAlert";
import { success } from "../utils/alert";
import BabyTable from "../components/BabyTable";
const Weight = () => {
      
  const [data, setData] = useState([]);
  const [birthWeight] = useState(3200); // mock birth weight (g), locked

  useEffect(() => {
    setData([
      { name: "วันที่ 1", weight: 60, weightLost: 10+"%" },
      { name: "วันที่ 2", weight: 70, weightLost: 10+"%"  },
      { name: "วันที่ 3", weight: 45, weightLost: 10+"%"  },
      { name: "วันที่ 4", weight: 85, weightLost: 10+"%"  },
      { name: "วันที่ 5", weight: 65, weightLost: 10+"%"  },
      { name: "วันที่ 6", weight: 60, weightLost: 10+"%" },
      { name: "วันที่ 7", weight: 70, weightLost: 10+"%"  },
      { name: "วันที่ 8", weight: 45, weightLost: 10+"%"  },
      { name: "วันที่ 9", weight: 85, weightLost: 10+"%"  },
      { name: "วันที่ 10", weight: 65, weightLost: 10+"%"  },
      { name: "วันที่ 11", weight: 60, weightLost: 10+"%" },
      { name: "วันที่ 12", weight: 70, weightLost: 10+"%"  },
      { name: "วันที่ 13", weight: 45, weightLost: 10+"%"  },
      { name: "วันที่ 14", weight: 85, weightLost: 10+"%"  },

    ]);
  }, []);

  const onWeightClick = async () => {
    const result = await weightAlert({ title: "น้ำหนักทารก", birthWeight, lockBirth: true });
    if (result) {
      success(`Saved weight\nBirth: ${birthWeight} g\nCurrent: ${result.currentWeight} g`);
    }
  };
  return (
    <div className="w-full flex flex-col items-center justify-center mt-10 relative z-10 gap-6 px-6 max-w-[440px] mx-auto">
      <button
        onClick={onWeightClick}
        className="btn rounded-xl bg-[#F5D8EB] text-xl font-light w-full"
      >
        เพิ่มน้ำหนักทารก
      </button>
      <BabyTable
        columns={["วันที่", "น้ำหนัก", "น้ำหนักที่ลด(%)"]}
        data={data}
      />
      <div className="w-full text-sm text-gray-600">
        Birth weight (mock): {birthWeight} g
      </div>

      <PinkGraph
        data={data}
        lines={[{ dataKey: "weight", color: "#FF66C4", label: "น้ำหนัก (g)" }]}
      />

      <h1>น้ำหนักอยู่ในเกณฑ์ที่ดีมาก</h1>
      <p></p>
      <div>
        <img src="/assets/weight/weight.jpg"></img>
      </div>
    </div>
  );
};

export default Weight;
